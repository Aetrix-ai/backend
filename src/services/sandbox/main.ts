import Sandbox from "@e2b/code-interpreter";
import logger from "../../lib/logger.js";

export class SandboxService {
  /**
   * get a react sandbox by project id
   * returns sandbox id (from db)
   * @param projectid
   */
  async getReactSandBox(projectid: number): Promise<{ sandboxId: string; url: string; live: string }> {
    console.log("Getting React Sandbox for project:", projectid);
    const sbx = await Sandbox.create("aetrix-react-sandbox-dev");

    // run all setup commands

    // console.log("Setting up React Sandbox:", sbx.sandboxId);
    // const setupCommands = [
    //   "git clone https://github.com/Aetrix-ai/templates.git",
    //   "cd templates/react-starter && npm install",
    // ];
    // for (const cmd of setupCommands) {
    //   const result = await sbx.commands.run(cmd);
    //   logger.info({ cmd, result }, "Executed in sandbox");
    // }
    await sbx.commands.run("cd templates/react-starter && code-server --bind-addr 0.0.0.0:8080 --auth none . ", { background: true });

    // Start Vite dev server (long-running)
    await sbx.commands.run("cd templates/react-starter && npm run dev", {
      background: true,
    });

    const info = await sbx.getInfo();

    return {
      sandboxId: info.sandboxId,
      url: "http://" + (await sbx.getHost(5173)),
      live: "http://" + (await sbx.getHost(8080)),
    };
  }

  async closeAllSandboxes() {}

  /**
   * update a sandbox in database
   * @param id
   */
}
