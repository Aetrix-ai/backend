import { Router } from "express";
import { aiRouterSchema } from "../lib/schema";

import { AIservice } from "../services/ai/main";
import { connectToSandbox, createAISandbox, killSandbox } from "../services/ai/sandbox";
import logger from "../lib/logger";
import { ChatAI } from "../services/ai/chat";
export const AiRouter: Router = Router();

AiRouter.post("/chat", async (req, res) => {
  try {
    const payload = aiRouterSchema.safeParse(req.body);
    if (!payload.success) {
      logger.warn("Invalid input received in AI Router");
      return res.status(400).send({ error: "Invalid input" });
    }
    const aiService = AIservice.getInstance();

    //@ts-ignore
    const userID = req.user.id;
    const Box = await connectToSandbox(userID);
    const aiREsp = await ChatAI({ userPrompt: payload.data.prompt, tools: Box!.tools })
    res.json({
      chat: aiREsp,
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      msg: "failed to delete sandbo",
    });
  }
});

AiRouter.get("/sandbox", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  const sbxId = await createAISandbox(userID);
  res.json({
    sandbox: sbxId,
  });
});

AiRouter.delete("/sanbox", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  try {
    await killSandbox(userID);
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
