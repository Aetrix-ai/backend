import { createAgent, tool, Tool } from "langchain";
import { Response } from "express";
import logger from "../../lib/logger";
import { ChatOllama } from "@langchain/ollama";
import { getSystemPrompt } from "./prompts/generate";
import { getTools } from "./prompts/tools";

export class AIservice {
  private static instance: AIservice;

  private constructor() {}

  public static getInstance(): AIservice {
    if (!AIservice.instance) {
      AIservice.instance = new AIservice();
    }
    return AIservice.instance;
  }

  private OllamaModel() {
    return new ChatOllama({
      model: "llama3.2:latest",
      baseUrl: "http://localhost:11434",
      temperature: 0.4,
    });
  }

  private Stream(res: Response, data: string) {}

  private async Generate(tools: Tool[], Prompt: string): Promise<any> {
    try {
      const agent = createAgent({
        model: this.OllamaModel(),
        tools: [...tools],
      });
      const res = await agent.invoke({ messages: [{ role: "system", content: await getSystemPrompt() },{ role: "user", content: Prompt }] });
      logger.info({ res }, "AI Service Generated Response:");
      return this.extractText(res);
    } catch (error) {
      logger.error({ error }, "Error in AI Service Generate:");
      return null;
    }
  }

  async StarCoding(task: string, context: any, res: Response): Promise<any> {
    logger.info("Starting AI Service StarCoding process");
    logger.info("Task validated as a valid React development task");
    const code = await this.Generate(getTools(), task);
    if (!code) {
      logger.error("Failed to generate code in ");
      return "failed";
    }
    const parsesdCode = this.extractText(code);
    logger.info("Successfully generated plan in Stage 1");
    return parsesdCode;
  }

  private extractText(res: any): string {
    if (!res) return "";

    // LangGraph returning messages[]
    if (res.messages?.length > 0) {
      return res.messages[res.messages.length - 1].content;
    }

    // LangChain LLM returning content directly
    if (res.content) return res.content;

    // Raw string fallback
    if (typeof res === "string") return res;

    return JSON.stringify(res);
  }
}
