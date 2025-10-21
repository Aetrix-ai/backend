import { createAgent, initChatModel, tool } from "langchain";
import {  getValidationPrompt, getValidationSystemPrompt } from "./propmts";

export async function ValidateUserPrompt(prompt: string): Promise<string> {
  const model = await initChatModel("anthropic:claude-sonnet-4-5", { temperature: 0.5, timeout: 10, maxTokens: 1000 });
  const agent = createAgent({
    model,
    systemPrompt: getValidationSystemPrompt(),
  });
  const EnrichPrompt = await agent.invoke({
    messages: [{ role: "user", content: getValidationPrompt(prompt)}],
  });
  //TODO:
  // parse the response to get only the enriched text
  // create a function for that 
  return JSON.stringify(EnrichPrompt);
}
