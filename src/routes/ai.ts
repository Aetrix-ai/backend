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
    await agent.Invoke(Box, payload.data.prompt, res, payload.data.modelName, () => SanBox.NpmRunDev(Box));

  } catch (err) {
    logger.error(err);
    res.write(
      `data: ${JSON.stringify({ error: "Failed to process AI request" })}\n\n`,
    );
  } finally {
    res.end();
  }
});




/**
 * special root for specialized templates
 */
AiRouter.get("/sandbox/:template", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  const template = req.params.template;
  const avialble = SanBox.getAvlTemplates()

  if (!avialble.includes(template)) {
    return res.status(404).json({
      "message": `invalid templates ${avialble}`
    })
  }

  try {
    logger.info(`Creating sandbox [${template}]`);
    const sbxId = await SanBox.buildTemplateSandbox(userID, template as any);
    logger.info(`Sandbox created with sbx: ${sbxId}`);
    res.json({
      sandbox: sbxId,
    });
  } catch (e) {
    res.status(404).json({
      message: "Unable to create template",
      err: e
    });
  }

});

AiRouter.delete("/sandbox", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  logger.info(`deleteing sandbox for user${userID}`);
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

AiRouter.get("/restart", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;

  const sbx = await SanBox.connectToSandbox(userID)

  if (!sbx) {
    return res.status(401).json({
      "message": "Sandbox Not found"
    })
  }
  SanBox.NpmRunDev(sbx)

  res.json({
    "message": "restarted success fully"
  })
})
