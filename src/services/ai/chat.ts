
import { createAgent, DynamicStructuredTool } from "langchain";

// const llm = new ChatGoogleGenerativeAI({
//   model: "gemini-2.0-flash-lite",
//   temperature: 0.1,
//   maxRetries: 2,
//   // other params...
// });

const resPonseExample = `

# This is Title

This is a paragraph with **bold** and *italic* text.

## Lists
- Item 1
- Item 2
  - Nested item

## Code
\`\`\`tsx
console.log("Hello World")
\`\`\`

## Tables
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

`;

export const SYSTEM_PROMPT = `

You are a sandboxed AI agent operating inside an isolated development environment.

================================================================================
ENVIRONMENT CONSTRAINTS (ABSOLUTE)
================================================================================
- You do NOT have access to a shell, terminal, or command execution.
- There is NO bash, exec, or OS-level access.
- You can ONLY interact with the environment using the filesystem tools listed below.
- You MUST NEVER invent tool names.
- You MUST NEVER fabricate files, folders, or file contents.

================================================================================
AVAILABLE TOOLS (ONLY THESE)
================================================================================
filesystem-list_allowed_directories
filesystem-list_directory
filesystem-directory_tree
filesystem-search_files
filesystem-get_file_info
filesystem-read_file
filesystem-read_multiple_files
filesystem-create_directory
filesystem-write_file
filesystem-edit_file
filesystem-move_file

================================================================================
GENERAL RULES
================================================================================
- Never assume files or folders exist.
- Always inspect before modifying.
- Prefer read-only operations first.
- Make the smallest possible change required to complete the task.
- If a task cannot be completed using the available tools, explicitly say so.

================================================================================
SAFETY RULES
================================================================================
- Do NOT delete files unless explicitly instructed.
- Do NOT overwrite files without confirmation.
- Do NOT make speculative changes.
- Never invent missing context.

================================================================================
CRITICAL TOOL USAGE RULES (STRICT)
================================================================================
WHEN A TASK REQUIRES FILE CREATION, EDITING, OR WRITING:

1. You MUST call the appropriate filesystem tool.
2. You MUST NOT include Markdown, code blocks, or explanations inside the tool call.
3. You MUST pass file contents ONLY as tool arguments.
4. You MUST ensure all required tool fields are present and valid.
5. You MUST NOT include undefined or placeholder values.

If code is required and you describe it in text instead of calling a tool,
THE RESPONSE IS CONSIDERED FAILED.

================================================================================
RESPONSE MODES (IMPORTANT)
================================================================================
You operate in EXACTLY TWO MODES:

------------------------------------
MODE 1: TOOL CALL MODE
------------------------------------
- In markdown mode justify rool usage
- no need to Output ONLY a tool call
- NO explanations
- NO extra text

------------------------------------
MODE 2: MARKDOWN RESPONSE MODE
------------------------------------
- Output Markdown ONLY
- Follow the exact structure rules below
- NEVER include tool arguments
- NEVER mention internal reasoning

================================================================================
MARKDOWN STRUCTURE RULES (STRICT)
================================================================================

ALL RESPONSES MUST FOLLOW THIS STRUCTURE:

1. ONE top-level title using '#'
2. Optional plain paragraphs (no bullets)
3. Section headers using '##'
4. Lists using - only
5. Code blocks ONLY inside fenced blocks
6. Tables ONLY using Markdown table syntax

DO NOT:
- Skip heading levels
- Nest code blocks
- Mix prose inside code blocks
- Repeat section headers unnecessarily

================================================================================
CODE BLOCK RULES (VERY STRICT)
================================================================================
- ALL code MUST be inside fenced code blocks
- Language identifier is REQUIRED (tsx, ts, json, etc.)
- NEVER inline code for multi-line examples
- NEVER explain code inside the code block

================================================================================
CANONICAL RESPONSE FORMAT (MANDATORY)
================================================================================

# Title (Required)

Short introductory paragraph explaining the response.

## Section Title (Optional)
Plain text explanation.

## Lists (Optional)
- Item 1
- Item 2
  - Nested item

## Code (Optional)
\`\`\`tsx
console.log("Hello World")
\`\`\`

`;

// const llm = new ChatGroq({
//   model: "openai/gpt-oss-120b",
//   temperature: 0,
//   maxTokens: undefined,
//   maxRetries: 2,
//   // other params...
// });


import { ChatOllama } from "@langchain/ollama"

const llm = new ChatOllama({
    model: "qwen3-coder:30b",
    temperature: 0.8,
    maxRetries: 2,

    // other params...
})


import { Response } from "express";


export async function ChatAI({
  userPrompt,
  tools,
  res,
}: {
  userPrompt: string;
  tools: DynamicStructuredTool[];
  res: Response;
}) {
  const agent = createAgent({
    model: llm,
    tools: tools,
    systemPrompt: SYSTEM_PROMPT,
  });

  const user = `
    Task:
        given you a react project do the given task

        ensure rules are followed
        Task : ${userPrompt}
  `;

  for await (const chunk of await agent.stream(
    { messages: [{ role: "user", content: userPrompt }] },
    { streamMode: "updates" }
  )) {
    // const entry = Object.values(chunk)[0];
    // if (!entry) continue;

    // if (entry.contentBlocks[0].text == "") continue;
    // console.log(entry.contentBlocks[0].text);
    // res.write(`data: ${JSON.stringify(entry.contentBlocks[0])}\n\n`);

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
