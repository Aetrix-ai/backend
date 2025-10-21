import { createAgent, initChatModel, tool } from "langchain";
import { getEnrichPrompt, getEnrichSystemPrompt } from "./propmts";

export async function EnrichPrompt(prompt: string): Promise<string> {
  const model = await initChatModel("anthropic:claude-sonnet-4-5", { temperature: 0.5, timeout: 10, maxTokens: 1000 });
  const agent = createAgent({
    model,
    systemPrompt: getEnrichSystemPrompt(),
  });
  const EnrichPrompt = await agent.invoke({
    messages: [{ role: "user", content: getEnrichPrompt(prompt) }],
  });
  //TODO:
  // parse the response to get only the enriched text
  // create a function for that 
  return JSON.stringify(EnrichPrompt);
}
