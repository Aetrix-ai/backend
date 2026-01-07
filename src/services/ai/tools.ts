import { Client } from "@modelcontextprotocol/sdk/client";
import { DynamicStructuredTool, Tool } from "langchain";
import { z, ZodTypeAny } from "zod";

/**
 * VERY SMALL JSON Schema → Zod converter
 * (enough for MCP tools)
 */
function jsonSchemaToZod(schema: any): ZodTypeAny {
  if (!schema || !schema.properties) {
    return z.object({});
  }

  const shape: Record<string, ZodTypeAny> = {};

  for (const [key, value] of Object.entries<any>(schema.properties)) {
    let zodType: ZodTypeAny = z.any();

    switch (value.type) {
      case "string":
        zodType = z.string();
        break;
      case "number":
        zodType = z.number();
        break;
      case "boolean":
        zodType = z.boolean();
        break;
      case "array":
        zodType = z.array(z.any());
        break;
      case "object":
        zodType = z.object({});
        break;
    }

    if (schema.required?.includes(key)) {
      shape[key] = zodType;
    } else {
      shape[key] = zodType.optional();
    }
  }

  return z.object(shape);
}

/**
 * Convert ALL MCP tools → LangChain tools
 */
export async function getTools(client: Client): Promise<DynamicStructuredTool[]> {
  const tools: DynamicStructuredTool[] = [];

  const mcpTools = await client.listTools();

  for (const mcpTool of mcpTools.tools) {
    const schema = jsonSchemaToZod(mcpTool.inputSchema);

    const tool = new DynamicStructuredTool({
      name: mcpTool.name,
      description: mcpTool.description ?? `MCP tool: ${mcpTool.name}`,
      schema,

      func: async (input: any) => {
        const result = await client.callTool({
          name: mcpTool.name,
          arguments: input ?? {},
        });

        // 🔑 Extract text safely
        const text = result;
        return text || "";
      },
    });

    tools.push(tool);
  }

  return tools;
}
