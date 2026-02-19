import { Router } from "express";
import { aiRouterSchema } from "../lib/schema.js";

import logger from "../lib/logger.js";
import { ChatAI } from "../services/ai/chat.js";
import { sandbox } from "../services/ai/sandbox.js";
export const AiRouter: Router = Router();


const SanBox = sandbox()
AiRouter.post("/chat", async (req, res) => {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders(); // important

  try {
    const payload = aiRouterSchema.safeParse(req.body);
    if (!payload.success) {
      logger.warn("Invalid input received in AI Router");
      return res.status(400).send({ error: "Invalid input" });
    }

    //@ts-ignore
    const userID = req.user.id;
    const Box = await SanBox.connectToSandbox(userID);
    if (!Box) {
      logger.warn(`No sandbox found for user: ${userID}`);
      return res.status(404).send({ error: "Sandbox not found" });
    }
    await ChatAI({ userPrompt: payload.data.prompt, sbx: Box, res });

    await SanBox.NpmRunDev(Box);
  } catch (err) {
    logger.error(err);
    if (!res.headersSent) {
      res.status(500).json({ msg: "chat error" });
    } else {
      res.end();
    }
  }
});

AiRouter.get("/sandbox", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  logger.info("Creating sandbox")
  const sbxId = await SanBox.buildTemplateSandbox(userID, "portfolio")
  logger.info(`Sandbox created with sbx: ${sbxId}`)
  res.json({
    sandbox: sbxId,
  });
});

AiRouter.delete("/sanbox", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  try {
    await SanBox.killSandbox(userID);
    res.json({
      msg: "Sandbox deleted successfully",
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      msg: "failed to delete sandbo",
    });
  }
});
