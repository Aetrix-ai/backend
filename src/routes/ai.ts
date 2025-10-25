import { Router } from "express";
import { aiRouterSchema } from "../lib/schema";
import logger from "../lib/logger";
import { GeneratedResponse } from "../services/ai/pipeline";
export const AiRouter = Router();

AiRouter.post("/",async (req, res) => {
    // stream the response
    // redis path need to decide asap
    const payloard  = aiRouterSchema.parse(req.body);
    if (!payloard) {
        logger.warn("Invalid input received in AI Router");
        return res.status(400).send({ error: "Invalid input" });
    }
    const startTime = Date.now();
    logger.info("AI request started at " + new Date(startTime).toISOString());
    const result =await GeneratedResponse(payloard.prompt , res);
    const endTime = Date.now();
    logger.info("AI request ended at " + new Date(endTime).toISOString());
    logger.info("AI request duration: " + (endTime - startTime) + "ms");
    res.json(result);
});

