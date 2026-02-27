// create a sandboxed AI service

import { Sandbox } from "e2b";
import { redis } from "../../index.js";

import logger from "../../lib/logger.js";

export type templates = "portfolio" | "play-ground" | "event";
type templatesMetadata ={
   alias: string,
   pathname: string
}
class SanBox {
  private Templates: Map<templates, templatesMetadata>;
  constructor(templates: Map<templates,templatesMetadata>) {
    this.Templates = templates;
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
  async buildTemplateSandbox(
    userID: string,
    type: templates,
  ): Promise<string | Error> {
    const template = this.Templates.get(type);

    if (!template) {
      return new Error("Invalid type");
    }

    const id = await this.createAISandbox(userID, template);
    return id;
  }

  getAvlTemplates ():string[]{
    return this.Templates.keys().toArray()
  }

  /**
   * create an AI sandbox with a specified template, if the sandbox already exists it returns the existing one
   * @param userId
   * @param template
   * @returns
   */
  private async createAISandbox(
    userId: string,
    template: templatesMetadata,
  ): Promise<string> {
    const sbxId = await redis.get(userId);
    if (sbxId) {
      logger.warn(`Sandbox already exists for user: ${userId} id: ${sbxId}`);
      return sbxId as string;
    }


    const sbx = await Sandbox.create(template.alias, {
      mcp: {
        filesystem: {
          paths: [`/home/user/e2b_scripts/${template.pathname}`],
        },
      },

      envs: {
        GIT_TOKEN: process.env.GIT_TOKEN!,
        VITE_BACKEND_API_URL:
          "https://aetrix-backend-git-master-ashintvs-projects.vercel.app/public",
        VITE_USER_ID: "2", //TODO: change rhus to String(userId)
      },

      timeoutMs: 3_600_000,
    });

    const id = (await sbx.getInfo()).sandboxId;
    const result = await redis.set(userId, id, {
      ex: 3600, // Set TTL to 1 hour (3600 seconds)
    });
    logger.info("sandbox created with id: " + id);

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
  async NpmRunDev(sbx: Sandbox): Promise<string | Error> {
    let Std: string = "";
    let Stderr: string = "";
    try {
      const logStd = (data: string) => {
        Std = data;
      };

      const logStderr = (data: string) => {
        Stderr = data;
      };

      const Startres = await sbx.commands.run(
        "npm run dev -- --port 5173 --strictPort",
        {
          background: true,
          onStderr: logStderr,
          onStdout: logStd,
        },
      );

      const Checkres = await sbx.commands.run(
        `until ss -tuln | grep -q ':5173'; do sleep 0.5; done`,
        { timeoutMs: 120_000 },
      );

      logger.info("started vite dev");
    } catch (e) {
      console.log(e);
      logger.info("already running");
    } finally {
      if (Stderr && Stderr.includes("Port 5173 is already in use")) {
        Stderr = "";
        Std = "Started dev react dev server on port 5173 successfully";
      }
      if (Stderr) {
        logger.error(`Error starting dev server: ${Stderr}`);
        return new Error(`Error starting dev server: ${Stderr}`);
      }

      logger.info(`Dev server output: ${Std}`);
      return Std;
    }
  }

  async connectToSandbox(userId: string): Promise<Sandbox | undefined> {
    const sbxid = await redis.get(userId);
    if (!sbxid) {
      logger.info("sandbox not exist for user: " + userId);
      return;
    }
    const sbx = await Sandbox.connect(sbxid as string);
    return sbx;
  }

  async killSandbox(userId: string) {
    const sbx = await this.connectToSandbox(userId);
    if (!sbx) return;
    await sbx.kill();
    await redis.del(userId);
    logger.info("Sandbox killed for user: " + userId);
  }
}

export function sandbox() {
  const Templates: Map<templates, templatesMetadata> = new Map();
  Templates.set("portfolio", {
    alias:"aetrix-dev-portfolio",
    pathname: "portfolio-starter-vite",
  });
  Templates.set("play-ground", {
    alias:"aetrix-dev-playground",
    pathname: "play-ground-vite",
  });
  return new SanBox(Templates);
}
