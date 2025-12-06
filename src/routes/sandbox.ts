import { Router } from "express";
export const SandboxRouter: Router = Router();
import "dotenv/config";
import { Sandbox } from "@e2b/code-interpreter";
import logger from "../lib/logger";
import { Config } from "../config";
import { SandboxService } from "../services/sandbox/main";
import { SandBoxSchema } from "../lib/schema";

const sandboxService = new SandboxService(Config.PRISMA_CLIENT);

SandboxRouter.post("/", async (req, res) => {
  try {
    const payload = SandBoxSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: payload.error });
    }
    // get spined up sandbox for the project
    const sbx = await sandboxService.getReactSandBox(payload.data.projectId);
    res.status(200).json({ ...sbx });
  } catch (err: any) {
    logger.error(err, "Sandbox error");
    res.status(500).json({ error: err.message });
  }
});

SandboxRouter.post("/close", async (_req, res) => {
  const pages = Sandbox.list();
  const sandboxes = await pages.nextItems();
  for (const sbx of sandboxes) {
    await Sandbox.kill(sbx.sandboxId);
    logger.info({ id: sbx.sandboxId }, "Sandbox killed");
  }
  res.status(200).json({ success: true });
});
