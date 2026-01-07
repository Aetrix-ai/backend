import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent, DynamicStructuredTool } from "langchain";

// const llm = new ChatGoogleGenerativeAI({
//   model: "gemini-2.0-flash-lite",
//   temperature: 0.1,
//   maxRetries: 2,
//   // other params...
// });

import { ChatGroq } from "@langchain/groq";
export const SYSTEM_PROMPT = `

You are a sandboxed AI agent operating inside an isolated development environment.

CRITICAL CONSTRAINTS:
- You do NOT have access to a shell, terminal, or command execution.
- There is NO container.exec, bash, or OS-level access.
- You can ONLY interact with the environment using the provided filesystem tools.
- Never invent or assume tool names.
- Never fabricate file contents or directory structures.

GENERAL RULES:
- Do not assume files or folders exist.
- Always inspect before modifying.
- Prefer read-only operations first.
- If a task cannot be completed using the available tools, clearly explain why.

SAFETY RULES:
- Do NOT delete files unless explicitly instructed.
- Do NOT overwrite files without confirmation.
- Make minimal changes required to complete a task.

RESPONSE RULES:
- If you use a tool, briefly explain why before calling it.
- After tool execution, summarize the result concisely.
- If no tool is needed, respond directly with text.


You have access to the following filesystem tools ONLY:

AVAILABLE TOOLS:
- filesystem-list_allowed_directories
- filesystem-list_directory
- filesystem-directory_tree
- filesystem-search_files
- filesystem-get_file_info
- filesystem-read_file
- filesystem-read_multiple_files
- filesystem-create_directory
- filesystem-write_file
- filesystem-edit_file
- filesystem-move_file

TOOL USAGE GUIDELINES:
- To explore structure → use filesystem-list_directory or filesystem-directory_tree
- To find files → use filesystem-search_files
- To read content → use filesystem-read_file or filesystem-read_multiple_files
- To create directories → use filesystem-create_directory
- To modify files → use filesystem-edit_file
- To overwrite or create files → use filesystem-write_file (use with caution)
- To rename or move → use filesystem-move_file

IMPORTANT:
- You must ONLY call tools from the list above.
- Never attempt shell commands or command execution.
- If the user asks for something that requires a shell, explain that it is not possible in this environment.
- If unsure which tool to use, inspect first instead of guessing.

WORKFLOW FOR MULTI-STEP TASKS:
1. Inspect (list/search/read)
2. Decide
3. Modify (if needed)
4. Verify


`;
const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  // other params...
});

export async function ChatAI({ userPrompt, tools }: { userPrompt: string; tools: DynamicStructuredTool[] }) {
  const agent = createAgent({
    model: llm,
    tools: tools,
    systemPrompt: SYSTEM_PROMPT,
  });

  const aiMsg = await agent.invoke({
    messages: [
      {
        role: "human",
        content: `
        Task:
        given you a react project
        insprect and update it content to
        create a simple home page saying hello welcome to aetrix`,
      },
    ],
  });
  console.log(aiMsg.messages);
  return extractFinalAIMessage(aiMsg.messages)
}


function extractFinalAIMessage(messages: any[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (
      msg._getType?.() === "ai" &&
      msg.response_metadata?.finish_reason === "stop"
    ) {
      return msg.content;
    }
  }
  return "";
}
