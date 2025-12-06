import Sandbox from "@e2b/code-interpreter";
import logger from "../../lib/logger.js";
import { PrismaClient } from "@prisma/client";
export class SandboxService {
  private prisma: PrismaClient;
  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }
  /**
   * get a react sandbox by project id
   * returns sandbox id (from db)
   * @param projectid
   */
  async getReactSandBox(projectid: number): Promise<{ sandboxId: string; url: string }> {
    const sbx = await Sandbox.create();

    // run all setup commands
    const setupCommands = [
      "git clone https://github.com/Aetrix-ai/templates.git",
      "cd templates/react-starter && npm install",
    ];
    for (const cmd of setupCommands) {
      const result = await sbx.commands.run(cmd);
      logger.info({ cmd, result }, "Executed in sandbox");
    }

    // Start Vite dev server (long-running)
    await sbx.commands.run("cd templates/react-starter && npm run dev -- --host --port 5173", {
      background: true,
    });
    const info = await sbx.getInfo();
    this.prisma.projects.update({
      where: { id: projectid },
      data: { sandbox: info.sandboxId },
    });

    return { sandboxId: info.sandboxId, url: "http://" + (await sbx.getHost(5173)) };
  }

  async closeAllSandboxes() {}

  /**
   * update a sandbox in database
   * @param id
   */
}
``;
