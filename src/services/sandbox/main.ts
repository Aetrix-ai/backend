import { waitForPort } from "e2b";
import Sandbox from "@e2b/code-interpreter";
import logger from "../../lib/logger.js";

export class SandboxService {
  /**
   * get a react sandbox by project id
   * returns sandbox id (from db)
   * @param projectid
   */
  async getNewSandBox(projectid: number): Promise<{ sandboxId: string; url: string; live: string }> {
    // create a 1 hout sandbox an
    const sbx = await Sandbox.create("aetrix-react-sandbox-dev", {
      timeoutMs: 3_600_000,
    });

    await sbx.commands.run("cd templates/react-starter && code-server --bind-addr 0.0.0.0:8080 --auth none . ", {
      background: true,
    });

    // Start Vite dev server (long-running)
    const response = await sbx.commands.run("cd templates/react-starter && npx vite dev --port 5173", {
      background: true,
    });
    const response2 = await sbx.commands.run(`
      until ss -tuln | grep -q ':5173'; do sleep 0.5; done
    `);
    logger.debug({ response }, "Started Vite dev server in sandbox");
    const info = await sbx.getInfo();

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
