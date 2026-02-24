
import { createAgent, DynamicStructuredTool } from "langchain";
import { Sandbox } from "e2b";
import { ChatOllama } from "@langchain/ollama"
import { ChatAnthropic } from "@langchain/anthropic"
import { createDeepAgent } from "deepagents";
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
})

import { Response } from "express";
import { getSystemPrompt } from "./prompts/system";
import { getUserPromt } from "./prompts/user";


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
          Authorization: await sbx.getMcpToken() || "",
        },  
      }
    }
  });
  const tools = await client.getTools();
  const toolsString = tools.map(tool => `- ${tool.name}: ${tool.description}`).join("\n")
  for (const tool of tools) {
    console.log(`Tool: ${tool.name}`);
  }
  const agent = createDeepAgent({
    model: llm,
    tools: tools,
    systemPrompt: getSystemPrompt(toolsString)
  });

  for await (const chunk of await agent.stream(
    { messages: [{ role: "user", content: getUserPromt(userPrompt) }] },
    { streamMode: "updates" }
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
          text: `using tool: ${content.messages[0]?.name}`
        }
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
