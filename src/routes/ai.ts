import { Router } from "express";
import { aiRouterSchema, InitializeScehma } from "../lib/schema";
import logger from "../lib/logger";
import { AIservice } from "../services/ai/main";
import { Config } from "../config";
export const AiRouter: Router = Router();

/**
 * create a entry in the database
 * return sandboxed environment details and project details
 */

AiRouter.post("/initializer", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  const payload = InitializeScehma.parse(req.body);
  if (!payload) {
    logger.warn("Invalid input received in AI Router");
    return res.status(400).send({ error: "Invalid input" });
  }
  try {
    const Response = await Config.PRISMA_CLIENT.aetrixProjects.create({
      data: {
        userId: userID,
        type: payload.type,
        title: payload.title,
      },
    });
    return res.status(200).send({ projectId: Response.id, message: "initialized successfully" });
  } catch (error) {
    logger.error("Error in AI initializer: " + error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

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
