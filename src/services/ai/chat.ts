
import { createAgent, DynamicStructuredTool } from "langchain";

import { ChatOllama } from "@langchain/ollama"

const llm = new ChatOllama({
    model: "qwen3-coder:30b",
    temperature: 0.8,
    maxRetries: 2,

    // other params...
})


import { Response } from "express";
import { getSystemPrompt } from "./prompts/system";
import { getUserPromt } from "./prompts/user";


export async function ChatAI({
  userPrompt,
  tools,
  res,
}: {
  userPrompt: string;
  tools: DynamicStructuredTool[];
  res: Response;
}) {


  const toolsString =""

  tools.forEach((tool , i)=>{
    toolsString + `\n\n ${i+1} -tool: ${tool.name} : ${tool.description}\n`
  })


  tools.forEach((tool, i) => {
    
  })
  const agent = createAgent({
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
