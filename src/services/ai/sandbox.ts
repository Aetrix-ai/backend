// create a sandboxed AI service

import { Sandbox } from "e2b";
import { redis } from "../../index.js";
import { Client } from "@modelcontextprotocol/sdk/client";

import logger from "../../lib/logger.js";
import { getTools } from "./tools.js";

type templates = "portfolio" | "next-playground" | "zero" | "event"

class SanBox {

  private Templates: Map<templates, string>

  constructor(templates: Map<templates, string>) {
    this.Templates = templates
  }

  /**
   * creates a sandbox with specified type and return id 
   *  - portfolio :  portfolio started templates
   *  - next-playground : next js starter 
   *  - zero : git clonable enviroment
   *  - event : event started templates
   * @param userID 
   * @param type 
   * @returns 
   */
  async buildTemplateSandbox(userID: string, type: templates): Promise<string | Error> {
    const template = this.Templates.get(type)

    if (!template) {
      return new Error("Invalid type")
    }

    const id = await this.createAISandbox(userID, template)

    return id
  }

  /**
   * clone a project to a 'zero' env and starts it

   * 
   * @param gitUrl 
   * @param sbx 
   */
  async buildCloneSandbox(gitUrl: string, sbx: Sandbox, commands: string[]) {
    const repoName = gitUrl.split("/").pop()?.replace(".git", "")

    if (!repoName) throw new Error("invalid git url")
    await sbx.commands.run(
      `git clone ${gitUrl}`,
      { timeoutMs: 120_000 }
    )

    for (const cmd of commands) {
      await sbx.commands.run(
        `cd ${repoName} && ${cmd}`,
        { timeoutMs: 300_000 }
      )
    }
  }
  /**
   * create an AI sandbox with a specified template, if the sandbox already exists it returns the existing one
   * @param userId 
   * @param template 
   * @returns 
   */
  private async createAISandbox(userId: string, template: string): Promise<string> {
    const sbxId = await redis.get(userId);
    if (sbxId) {
      logger.warn(`Sandbox already exists for user: ${userId} id: ${sbxId}`);
      return sbxId as string
    }

    const sbx = await Sandbox.create(template, {
      mcp: {
        filesystem: {
          paths: ["/home/user/e2b_scripts/portfolio-starter-vite"]
        },
      },

      envs: {
        GIT_TOKEN: process.env.GIT_TOKEN!,
        VITE_BACKEND_API_URL: "https://aetrix-backend-git-master-ashintvs-projects.vercel.app/public",
        VITE_USER_ID: "2" //TODO: change rhus to String(userId)
      },

      timeoutMs: 3_600_000,
    });

    const id = (await sbx.getInfo()).sandboxId;
    const result = await redis.set(userId, id, {
      ex: 3600, // Set TTL to 1 hour (3600 seconds)
    });
    logger.info("sandbox created with id: " + id);


    // await sbx.commands.run("code-server --bind-addr 0.0.0.0:8080 --auth none . ", {
    //   background: true,
    // });
    await this.NpmRunDev(sbx);

    logger.debug("Sandbox started with id: " + id);
    const currentDir = await sbx.commands.run("pwd");
    console.log("current dir: " + JSON.stringify(currentDir));

    const files = await sbx.commands.run("ls -la");
    console.log("files: " + JSON.stringify(files));

    logger.info("sandbox created with id: " + id);
    logger.info(`$visit ${sbx.getHost(5173)}`);
    logger.info("started projects (dev)");
    return id;
  }


  /**
   * runs npm run dev in the sandbox and wait for it to start by checking port 3000, this is specific for the portfolio template but can be used for any next js project
   * @param sbx 
   */
  async NpmRunDev(sbx: Sandbox) {
    const Startres = await sbx.commands.run("npm run dev", {
      background: true,
    });
    const Checkres = await sbx.commands.run(`
      until ss -tuln | grep -q ':5173'; do sleep 0.5; done
    `, { timeoutMs: 120_000 });
    logger.debug({ Checkres }, "Started next dev server in sandbox");
  }


  async connectToSandbox(userId: string): Promise<Sandbox | undefined> {
    const sbxid = await redis.get(userId);
    if (!sbxid) {
      logger.info("sandbox not exist for user: " + userId);
      return
    }
    const sbx = await Sandbox.connect(sbxid as string);
    return sbx
  }


  async killSandbox(userId: string) {
    const sbx = await this.connectToSandbox(userId)
    if (!sbx) return
    await sbx.kill();
    await redis.del(userId);
    logger.info("Sandbox killed for user: " + userId);
  }

}

export function sandbox() {

  const Templates: Map<templates, string> = new Map()
  Templates.set("portfolio", "aetrix-dev-portfolio")
  Templates.set("zero", "aetrix-dev-zero")
  return new SanBox(Templates)
}
