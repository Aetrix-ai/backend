import { createAgent, initChatModel, tool, Tool } from "langchain";
import { z } from "zod";
import { getGenerateCodePrompt, getGenerateCodeSystemPrompt } from "./propmts";

interface Code {
  type: "code";
  filename: string;
  content: string;
  path: string;
}

interface ShellResult {
  type: "shell";
  command: string;
}

interface GeneratedResponse {
  results: (Code | ShellResult)[];
  message: string;
}

export async function GenerateCode(Prompt: string): Promise<GeneratedResponse> {
  const model = await initChatModel("anthropic:claude-sonnet-4-5", { temperature: 0.5, timeout: 10, maxTokens: 1000 });
  const results: (Code | ShellResult)[] = [];
  const CodeSaver = tool(
    ({ code }: { code: Code }) => {
      results.push({ ...code, type: "code" });
      return `Code ${code.filename} saved.`;
    },
    {
      name: "Code Saver",
      description: "Saves the code file.",
      schema: z.object({
        code: z.object({
          filename: z.string().describe("The name of the code file"),
          content: z.string().describe("The content of the code file"),
          path: z.string().describe("The path where the code file is saved"),
        }),
      }),
    }
  );

  const ShellExecutor = tool(
    async ({ command }: { command: string }) => {
      results.push({
        type: "shell",
        command: command,
      });
      return `Executed command: ${command}`;
    },
    {
      name: "Shell Executor",
      description: "Executes a shell command.",
      schema: z.object({
        command: z.string().describe("The shell command to execute"),
      }),
    }
  );

  const tools = [CodeSaver, ShellExecutor];
  const agent = createAgent({
    model,
    systemPrompt: getGenerateCodeSystemPrompt(),
    tools,
  });
  const EnrichPrompt = await agent.invoke({
    messages: [{ role: "user", content: getGenerateCodePrompt(Prompt) }],
  });

  return {
    results,
    message: EnrichPrompt.messages[0]!.content as string,
  };
}
