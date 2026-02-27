import { Router } from "express";
import { aiRouterSchema } from "../lib/schema.js";
import logger from "../lib/logger.js";
import { sandbox } from "../services/ai/sandbox.js";
export const AiRouter: Router = Router();
import { Agent } from "../services/ai/agent.js";

const agent = new Agent();
const SanBox = sandbox();

AiRouter.get("/models", (req, res) => {
  return res.json(agent.getAvialbleModels());
});

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
      res.write(
        `data: ${JSON.stringify({ model_request: "Invlaid request [parse error]" })}\n\n`,
      );
      return
    }

    //@ts-ignore
    const userID = req.user.id;
    const Box = await SanBox.connectToSandbox(userID);
    if (!Box) {
      logger.warn(`No sandbox found for user: ${userID}`);
      return res.write(
        `data: ${JSON.stringify({ error: "Failed to get a  AI sandbox" })}\n\n`,
      );
    }
    await agent.Invoke(Box, payload.data.prompt, res, payload.data.modelName);
    await SanBox.NpmRunDev(Box);
  } catch (err) {
    logger.error(err);
    res.write(
      `data: ${JSON.stringify({ error: "Failed to process AI request" })}\n\n`,
    );
  } finally {
    res.end();
  }
});

AiRouter.get("/sandbox", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  logger.info("Creating sandbox");
  const sbxId = await SanBox.buildTemplateSandbox(userID, "play-ground");
  logger.info(`Sandbox created with sbx: ${sbxId}`);
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

AiRouter.get("/restart", async (require, res)=>{
  //@ts-ignore
  const userID = req.user.id;

  const sbx =await SanBox.connectToSandbox(userID)

  if (!sbx){
    return res.status(401).json({
      "message": "Sandbox Not found"
    })
  }
  SanBox.NpmRunDev(sbx)

  res.json({
    "message": "restarted success fully"
  })
})
