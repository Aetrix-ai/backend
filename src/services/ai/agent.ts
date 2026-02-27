import { createDeepAgent, type FileData, DeepAgent } from "deepagents";
import { ChatAnthropic } from "@langchain/anthropic";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { Sandbox } from "e2b";
import { getSystemPrompt } from "./prompts/system.js";
import { MemorySaver } from "@langchain/langgraph";
import { Response } from "express";
import logger from "../../lib/logger.js";
import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";
import { Config } from "../../config.js";
import { getUserPrompt } from "./prompts/user.js";
export class Agent {
  // checkpoiner to save conversation history in memory
  // TODO: later use a new postgres , for fast forward  development, use in-memory checkpointer first
  private checkpointer: MemorySaver;
  private default_model: string = Config.AI.DEFAULT_MODEL
  private default_temperature = 0.3;
  private default_max_retries = 3;
  // skill files loaded from urls are strord here
  private skillsFiles: Record<string, FileData>;

  // urls of the skill files to be loaded
  private skillsUlrs: string[] = [
    "https://raw.githubusercontent.com/ashintv/aetrix-backend/master/src/services/ai/skills/navigate-codebase/SKILL.md",
    "https://raw.githubusercontent.com/ashintv/aetrix-backend/master/src/services/ai/skills/navigate-codebase/references/example.md",
    "https://raw.githubusercontent.com/ashintv/aetrix-backend/master/src/services/ai/skills/react-coding/SKILL.md",
    "https://raw.githubusercontent.com/ashintv/aetrix-backend/master/src/services/ai/skills/ui-styling/SKILL.md",
  ];

  //llm instance, currently using ChatAnthropic, can be easily switched to other llm by changing this instance
  //TODO: should have capabilit to chat with multiple llms, not just one, and should be able to switch between them based on the use case
 

  private ChatModels: string[] = Config.AI.AVIALBLE_MODELS

  private getLlmInstance(modelName: string) {
    if (!this.ChatModels.includes(modelName))
      throw Error(`[Invalid model selction] ${this.ChatModels}`);

    // if claude model retun
    if (modelName.includes("claude")) {
      return new ChatAnthropic({
        model: modelName,
        temperature: this.default_temperature,
        maxRetries: this.default_max_retries,
      });
    }

    return new ChatOllama({
      model: modelName,
      temperature: this.default_temperature,
      maxRetries: this.default_max_retries,
    });
  }

  // constructor to initialize the checkpointer and load the skill files from urls
  constructor() {
    this.checkpointer = new MemorySaver();
    this.skillsFiles = {};
    this.loadSkills();
  }

  /**
   * load skill files from urls and store them in skillsFiles object,
   * the key is the path of the skill file, and the value is the FileData object
   * created from the content of the skill file
   */
  private async loadSkills() {
    /**
     * create a FileData object from the content string
     * @param content
     * @returns
     */
    function createFileData(content: string): FileData {
      const now = new Date().toISOString();
      return {
        content: content.split("\n"),
        created_at: now,
        modified_at: now,
      };
    }

    for (const skillUrl of this.skillsUlrs) {
      const response = await fetch(skillUrl);
      const skillContent = await response.text();

      //example path name: /skills/navigate-codebase/SKILL.md
      const skillPath = skillUrl.split("ai").pop() || "unknown-skill.md";
      this.skillsFiles[skillPath] = createFileData(skillContent);
      logger.info(
        `Loaded skill file: ${skillPath}, content: ${skillContent.slice(0, 10)}...`,
      );
    }
  }

  /**
   * load skills from sandbox this
   * ensure sandbox skills arel loaded successfully before initializing the agent,
   * otherwise the agent will not be able to use the tools provided by the sandbox
   * @param sbx
   * @returns
   */
  private async getTools(sbx: Sandbox) {
    const client = new MultiServerMCPClient({
      mcpServers: {
        filesystem: {
          transport: "http",
          url: await sbx.getMcpUrl(),
          headers: {
            Authorization: (await sbx.getMcpToken()) || "",
          },
        },
      },
    });
    return await client.getTools();
  }

  private makeSafe<T extends { invoke: (...args: any[]) => Promise<any> }>(
    tool: T,
  ): T {
    return {
      ...tool,
      async invoke(
        input: Parameters<T["invoke"]>[0],
        config?: Parameters<T["invoke"]>[1],
      ) {
        try {
          const result = await tool.invoke(input, config);
          return result;
        } catch (err) {
          let errorMsg = "Unknown MCP error";
          if (
            err &&
            typeof err === "object" &&
            "message" in err &&
            typeof (err as any).message === "string"
          ) {
            errorMsg = (err as any).message;
          }
          return {
            success: false,
            error: errorMsg,
            recoverable: true,
          };
        }
      },
    } as T;
  }

  /**
   * initialize and agent with the llm, tools, system prompt and checkpointer,
   * the agent will be used to chat with the user, and use the tools provided by the sandbox to answer the user's questions
   * @param sbx \
   * @returns
   */
  private async initializeAgent(sbx: Sandbox , modelName: string): Promise<DeepAgent> {
    const tools = await this.getTools(sbx);
    const toolsString = tools.map((tool) => `- ${tool.name}`).join("\n");

    const safeTools = tools.map((tool) => this.makeSafe(tool));
    const agent = createDeepAgent({
      model: this.getLlmInstance(modelName),
      tools: safeTools,
      systemPrompt: getSystemPrompt(toolsString),
      checkpointer: this.checkpointer,
      skills: ["/skills/"],
    });
    return agent;
  }

  /**
   * creates a new thread id for chats
   * one thread per sandbox to maintain conversation context, the thread id is in the format of thread-{sandboxId}
   * the thread id is used by the checkpointer to save the conversation history, and to retrieve the conversation history when needed
   * the streamMode is set to "updates" to enable streaming of the agent's responses, so that the user can see the response as soon as it's generated,
   *  without waiting for the entire response to be generated
   * @param sbxid
   * @returns
   */
  private getConfig(sbxid: string): {
    configurable: {
      thread_id: string;
      streamMode: "updates";
    };
  } {
    return {
      configurable: {
        thread_id: `thread-${sbxid}`,
        streamMode: "updates",
      },
    };
  }
  /**
   * chat with the ai agent
   * it creates session for each sandbox,
   * for each sandbox history is maintained in a separate thread,
   * so that the conversation context is preserved for each sandbox,
   * it directly write the agent response to the response object passed in
   * as a steeam,
   * Make sure to set the response header "Content-Type" to "text/event-stream" before calling this function,
   * @param sbx
   * @param userPrompt
   * @param res
   */
  async Invoke(sbx: Sandbox, userPrompt: string, res: Response , modeName: string) {
    const sandboxInfo = await sbx.getInfo();
    logger.info(
      `Requesting  ai response for sandbox ${sandboxInfo.sandboxId} with prompt: ${userPrompt.slice(0, 20)}...`,
    );
    const agent = await this.initializeAgent(sbx , modeName);
    const config = this.getConfig(sandboxInfo.sandboxId);
    logger.info(
      `Agent : model - ${modeName}, thread - ${config.configurable.thread_id}`,
    );
    if (!this.skillsFiles) {
      await this.loadSkills();
    }
    logger.info(
      `Loaded skill files: ${Object.keys(this.skillsFiles).join(", ")}`,
    );
    logger.info(`Starting agent stream for sandbox ${sandboxInfo.sandboxId}`);
    for await (const chunk of await agent.stream(
      {
        messages: [{ role: "user", content: getUserPrompt(userPrompt) }],
        files: this.skillsFiles,
      },
      config,
    )) {
      const entry = Object.entries(chunk)[0];
      if (!entry) continue;
      const [key, value] = entry;
      console.log("type of value:", typeof value["messages"]);
      console.log(
        "keys of value:",
        (value && Object.keys(value)) || "no messages key",
      );
      console.log(
        "value content:",
        JSON.stringify(value).slice(0, 100) + "...",
      );
      res.write(`data: ${JSON.stringify({ [key]: value.messages })}\n\n`);
      logger.info(`Received chunk: ${key}`);
      // console.log(`Chunk content: ${JSON.stringify(value)}`); // Log the first 100 characters of the chunk content
    }
  }


  getAvialbleModels(){
    return {
      models: this.ChatModels,
      default: this.default_model
    }
  }
}
