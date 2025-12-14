import { Router } from "express";
export const SandboxRouter: Router = Router();
import "dotenv/config";
import { Sandbox } from "@e2b/code-interpreter";
import logger from "../lib/logger";
import { Config } from "../config";
import { SandboxService } from "../services/sandbox/main";
import { SandBoxSchema } from "../lib/schema";

const sandboxService = new SandboxService();

SandboxRouter.post("/", async (req, res) => {
  try {
  
    const sbx = await sandboxService.getReactSandBox(1);
    res.status(200).json({ ...sbx });
  } catch (err: any) {
    logger.error(err, "Sandbox error");
    res.status(500).json({ cause: "asfd", error: err.message });
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
