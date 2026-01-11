
import { Router } from "express";
import logger from "../lib/logger.js";
import jwt from "jsonwebtoken";
export const mediaRouter: Router = Router();
import { z } from "zod";
import ImageKit from "@imagekit/nodejs";
import { Config } from "../config.js";
import { ImageKitClient } from "../services/imagekit/client.js";

/**
 *  provide media authorization token
 *  for client to upload media to third-party services

  Note:
 [ since vercel serverless functions dont crypto module the below route will not be available on vecel deployments
  but will work on traditional nodejs deployments
  for vercel deployments (dev) , another workaround service is provided ]
 */
// workound service : https://github.com/Aetrix-ai/services/tree/master/imagekit-auth with documentation
mediaRouter.get("/authenticate-upload", (req, res) => {
  try {
    //@ts-ignore

    const authenticationParameters = ImageKitClient.helper.getAuthenticationParameters();
    res.json(authenticationParameters);
  } catch (error) {
    console.log(error);
    logger.error({ error });
    res.status(500).json({ message: "Failed to get authorization parameters" });
  }
});

mediaRouter.delete("/delete/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "File ID is required" });
    }
    await ImageKitClient.delete(req.params.id);
    logger.info(`Deleted media file: ${req.params.id}`);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    logger.error({ error }, "Error deleting media file");
    res.status(500).json({ message: "Failed to delete file" });
  }
})
