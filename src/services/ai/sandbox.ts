// create a sandboxed AI service

import { Sandbox } from "e2b";
import { redis } from "../..";
import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import logger from "../../lib/logger";
import { getTools } from "./tools";

//crete a sandboxed AI service , checks if a sandbox already exists for the user in redis with a ttl of 1 hour
// store the id in redis with a ttl of 1 hour

export async function createAISandbox(userId: string): Promise<string> {
  const sbxId = await redis.get(userId);
  if (sbxId) {
    logger.warn(`Sandbox already exists for user: ${userId} id: ${sbxId}`);
    logger.debug("fix me");
  }

  const sbx = await Sandbox.create("aetrix-sandbox-dev", {
    mcp: {
      filesystem: {
        paths: ["/home/user/templates/react-starter"],
      },
    },
    timeoutMs: 3_600_000,
  });

  const id = (await sbx.getInfo()).sandboxId;

  logger.info("sandbox created with id: " + id);

  const result = await redis.set(userId, id, {
    ex: 3600, // Set TTL to 1 hour (3600 seconds)
  });

  await sbx.commands.run("cd templates/react-starter && code-server --bind-addr 0.0.0.0:8080 --auth none . ", {
    background: true,
  });
  console.log(await sbx.commands.run("pwd"));
  console.log(await sbx.commands.run("ls"));
  logger.info("start code server");
  await NpmRunDev(sbx);
  logger.info(`$visit ${sbx.getHost(5173)}`);
  logger.info("started projects (dev)");
  return id;
}

export async function killSandbox(userId: string) {
  const sbxId = await redis.get(userId);
  if (!sbxId) {
    logger.info("No sandbox found for user: " + userId);
    return;
  }

  const sbx = await Sandbox.connect(sbxId as string);
  await sbx.kill();
  await redis.del(userId);
  logger.info("Sandbox killed for user: " + userId);
}

export async function connectToSandbox(userId: string) {
  const sbxid = await redis.get(userId);
  if (!sbxid) {
    logger.info("sandbox not exist for user: " + userId);
    return;
  }

  const sbx = await Sandbox.connect(sbxid as string);

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

  await client.connect(transport);
  const tools = await getTools(client);
  logger.info(`MCP connection established to the sandbox - user:${userId} sandbox:${sbxid}`);
  logger.info("avialable tools");
  tools.map((tool, i) => {
    logger.info(`ToolNo :${i} Name: ${tool.name} \n ${tool.description}`);
  });
  return { sbx, client, tools };
}

export async function NpmRunDev(sbx: Sandbox) {
  const Startres = await sbx.commands.run("cd templates/react-starter && npx vite dev --port 5173", {
    background: true,
  });
  logger.debug({ Startres }, "Started Vite dev server in sandbox");
  const Checkres = await sbx.commands.run(`
      until ss -tuln | grep -q ':5173'; do sleep 0.5; done
    `);
  logger.debug({ Checkres }, "Started Vite dev server in sandbox");
  logger.info("Restarting react server");
}
