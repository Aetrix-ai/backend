import { waitForPort } from "e2b";
import { Sandbox } from "e2b";
import logger from "../../lib/logger.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client";

// deprecated
export class SandboxService {





  /**
   * get a react sandbox by project id
   * returns sandbox id (from db)
   * @param projectid
   */
  async getNewSandBox(projectid: number): Promise<{ sandboxId: string; url: string; live: string }> {
    // create a 1 hout sandbox an
    const sbx = await Sandbox.create("aetrix-sandbox-dev", {
      mcp: {
        filesystem: {
          paths: ["/workspace"],
        },
      },
    });

    const info = await sbx.getInfo();

    console.log("Sandbox created successfully");
    console.log(`MCP URL: ${sbx.getMcpUrl()}`);

    const client = new Client({
      name: "e2b-mcp-client",
      version: "1.0.0",
    });

    const transport = new StreamableHTTPClientTransport(new URL(sbx.getMcpUrl()), {
      requestInit: {
        headers: {
          Authorization: `Bearer ${await sbx.getMcpToken()}`,
        },
      },
    });

    console.log("Connecting to MCP server...");
    await client.connect(transport);
    console.log("Connected to MCP server successfully");

    console.log("\nAvailable tools from custom template:");
    const tools = await client.listTools();

    if (tools.tools.length === 0) {
      console.log("No tools available from MCP server");
      console.log(`\nTotal tools available: ${tools.tools.length}`);
    } else {
      tools.tools.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.name}`);
        if (tool.description) {
          console.log(`   Description: ${tool.description}`);
        }
      });

      console.log(`\nTotal tools available: ${tools.tools.length}`);
    }
    await sbx.commands.run("cd templates/react-starter && code-server --bind-addr 0.0.0.0:8080 --auth none . ", {
      background: true,
    });

    // Start Vite dev server (long-running)
    const response = await sbx.commands.run("cd templates/react-starter && npx vite dev --port 5173", {
      background: true,
    });

    await client.close();
    return {
      sandboxId: info.sandboxId,
      url: "http://" + (await sbx.getHost(5173)),
      live: "http://" + (await sbx.getHost(8080)),
    };
  }

  async SandboxExists(sandboxId: string): Promise<boolean> {
    try {
      const sbx = await Sandbox.connect(sandboxId);
      return await sbx.isRunning();
    } catch (err) {
      logger.error(err, "Error checking sandbox existence");
      return false;
    }
  }

  async SandboxReset(sandboxId: string, projectId: number): Promise<string> {
    const sbx = await Sandbox.connect(sandboxId);
    if (await sbx.isRunning()) {
      return (await sbx.getInfo()).sandboxId;
    } else {
      return (await this.getNewSandBox(projectId)).sandboxId;
    }
  }

  async closeAllSandboxes() {}

  /**
   * update a sandbox in database
   * @param id
   */
}
