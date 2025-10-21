import { createAgent, initChatModel, tool } from "langchain";
import { getTechStackSelectionPrompt, getTechStackSelectionSystemPrompt } from "./propmts";
import z from "zod";
import logger from "../../../lib/logger";


export async function selectTeckStack(prompt: string): Promise<string []> {
  const techStack = ["react" , "nextjs"]  
  let selectedStack: null | string = null;
  // IS THIS A CORREBT APPROACH TO INIT THE MODEL EACH TIME ?
  const model = await initChatModel("anthropic:claude-sonnet-4-5", { temperature: 0.5, timeout: 10, maxTokens: 1000 });
  const selectStack = tool(
    ({stack}: {stack: string}) => {``
      selectedStack = stack;
      return `Selected tech stack is ${selectedStack}`;
    },
    {
      name: "Tech Stack Saver",
      description: "Save the selected tech stack.",
      schema: z.object({
        stack: z.string().describe("The selected tech stack")
      })
    }
  );
  const agent = createAgent({
    model: model,
    systemPrompt: getTechStackSelectionSystemPrompt(),
    tools: [selectStack],
  })

  const response = await agent.invoke({
    messages: [{ role: "user", content: getTechStackSelectionPrompt(prompt , techStack)}],
  });
  if (!selectedStack) {
    logger.error("No tech stack selected by the agent.");
    throw new Error("Tech stack selection failed.");
  }
  const r_prompt = `${prompt} you have to use the following tech stack : ${techStack.join(", ")}  `
  //TODO:
  // parse the response to get only the enriched text
  // create a function for that 
  return [r_prompt , JSON.stringify(response)];
}





