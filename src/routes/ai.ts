import { Router } from "express";
import { aiRouterSchema } from "../lib/schema";
import logger from "../lib/logger";
import { AIservice } from "../services/ai/main";
export const AiRouter: Router = Router();

AiRouter.post("/", async (req, res) => {
  const payload = aiRouterSchema.parse(req.body);
  if (!payload) {
    logger.warn("Invalid input received in AI Router");
    return res.status(400).send({ error: "Invalid input" });
  }
  const startTime = Date.now();
  logger.info("AI request started at " + new Date(startTime).toISOString());
  const aiService = AIservice.getInstance();
  const result = await aiService.StarCoding(payload.prompt, {}, res);
  const endTime = Date.now();
  logger.info("AI request ended at " + new Date(endTime).toISOString());
  logger.info("AI request duration: " + (endTime - startTime) + "ms");
  res.json(result);
});
