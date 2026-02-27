/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use './agent.ts' instead.
 */

import { createAgent, DynamicStructuredTool } from "langchain";
import { Sandbox } from "e2b";
import { ChatOllama } from "@langchain/ollama";
import { ChatAnthropic } from "@langchain/anthropic";
import { createDeepAgent, type FileData } from "deepagents";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
// const llm = new ChatOllama({
//     model: "qwen3-coder:30b",
//     temperature: 0.8,
//     maxRetries: 2,

//     // other params...
// })

const llm = new ChatAnthropic({
  model: "claude-haiku-4-5",
  temperature: 0.8,
  maxRetries: 2,
});

import { MemorySaver } from "@langchain/langgraph";
import { Response } from "express";
import { getSystemPrompt } from "./prompts/system.js";
import { getUserPrompt } from "./prompts/user.js";

const checkpointer = new MemorySaver();

function createFileData(content: string): FileData {
  const now = new Date().toISOString();
  return {
    content: content.split("\n"),
    created_at: now,
    modified_at: now,
  };
}

export async function LoadSkills(): Promise<Record<string, FileData>> {
  const SKILL_URLS = [
    "https://raw.githubusercontent.com/ashintv/aetrix-backend/master/src/services/ai/skills/navigate-codebase/SKILL.md",
    "https://raw.githubusercontent.com/ashintv/aetrix-backend/master/src/services/ai/skills/navigate-codebase/references/example.md"
  ];

  const skillsFiles: Record<string, FileData> = {};

  for (const skillUrl of SKILL_URLS) {
    const response = await fetch(skillUrl);
    const skillContent = await response.text();

    //example path name: /skills/navigate-codebase/SKILL.md
    const skillPath = skillUrl.split("ai").pop() || "unknown-skill.md";
    skillsFiles[skillPath] = createFileData(skillContent);
    console.log(skillsFiles) // Log the first 200 characters of the skill content
  }
  return skillsFiles;
}


/**
 * @deprecated Use agent.ts/Agent class instead instead.
 */
export async function ChatAI({
  userPrompt,
  sbx,
  res,
}: {
  userPrompt: string;
  sbx: Sandbox;
  res: Response;
}) {
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
  const tools = await client.getTools();
  const toolsString = tools
    .map((tool) => `- ${tool.name}: ${tool.description}`)
    .join("\n");
  for (const tool of tools) {
    console.log(`Tool: ${tool.name}`);
  }
  const agent = createDeepAgent({
    model: llm,
    tools: tools,
    systemPrompt: getSystemPrompt(toolsString),
    checkpointer,
    skills: ["/skills/"],
  });

  const config = {
    configurable: {
      thread_id: `thread-${Date.now()}`,
    },
  };

  for await (const chunk of await agent.stream(
    {
      messages: [{ role: "user", content: getUserPrompt(userPrompt) }],
      files: await LoadSkills(),
    },
    {
      ...config,
      streamMode: "updates",
    },
  )) {
    const entry = Object.entries(chunk)[0];
    if (!entry) continue;
    const [step, content] = entry;

    switch (step) {
      case "tools":
        console.log("==================================================");
        console.log(content.messages[0]?.name);
        console.log(content.messages[0]?.content);
        const TOOLdata = {
          type: "tools",
          text: `using tool: ${content.messages[0]?.name}`,
        };
        res.write(`data: ${JSON.stringify(TOOLdata)}\n\n`);
      case "model_request":
        console.log("==================================================");
        console.log("message");
        console.log(content.messages[0]?.content);
        const MODELdata = {
          type: "model_request",
          text: content.messages[0]?.content,
        };
        res.write(`data: ${JSON.stringify(MODELdata)}\n\n`);
    }
  }

  res.write(`event: end\ndata: END\n\n`);
  res.end();
}


