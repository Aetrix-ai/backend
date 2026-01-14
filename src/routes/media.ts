import { Router } from "express";
import logger from "../lib/logger.js";
import jwt from "jsonwebtoken";
export const mediaRouter: Router = Router();
import { z } from "zod";
import ImageKit from "@imagekit/nodejs";
import { Config, prisma } from "../config.js";
import { ImageKitClient } from "../services/imagekit/client.js";
import { MediaSchema } from "../lib/schema.js";

/**
 *  provide media authorization token
 *  for client to upload media to third-party services

  Note:
 [

  since vercel serverless functions dont crypto module the below route will not be available on vecel deployments
  but will work on traditional nodejs deployments
  for vercel deployments (dev) , another workaround service is provided

  ]
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

mediaRouter.delete("/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "File ID is required" });
    }

    const media = await prisma.media.delete({ where: { id: parseInt(req.params.id, 10) } });
    await ImageKitClient.delete(media.fileId);

    logger.info(`Deleted media file: ${req.params.id}`);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    logger.error({ error }, "Error deleting media file");
    res.status(500).json({ message: "Failed to delete file" });
  }
});

mediaRouter.post("/", async (req, res) => {
  try {
    const parse = MediaSchema.safeParse(req.body);
    if (!parse.success) {
      logger.warn("Invalid media data");
      return res.status(400).json({ message: "Invalid media data", errors: parse.error.message });
    }
    const { fileId, type, url, additional } = parse.data;
    const media = await prisma.media.create({
      data: {
        fileId,
        type,
        url,
        additional: additional || null,
      },
    });

    logger.info(`Created media with id: ${media.id}`);
    res.status(201).json(media);
  } catch (error) {
    logger.error({ error }, "Error creating media");
    res.status(500).json({ message: "Failed to create media" });
  }
});

mediaRouter.put("/:id", async (req, res) => {
  try {
    const mediaId = parseInt(req.params.id, 10);
    if (isNaN(mediaId)) {
      return res.status(400).json({ message: "Invalid media ID" });
    }

    const parse = MediaSchema.safeParse(req.body);
    if (!parse.success) {
      logger.warn("Invalid media data");
      return res.status(400).json({ message: "Invalid media data", errors: parse.error.message });
    }
    const { fileId, type, url, additional } = parse.data;

    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: {
        fileId,
        type,
        url,
        additional: additional || null,
      },
    });

    logger.info(`Updated media with id: ${updatedMedia.id}`);
    res.json(updatedMedia);
  } catch (error) {
    logger.error({ error }, "Error updating media");
    res.status(500).json({ message: "Failed to update media" });
  }
});

mediaRouter.delete("/fileid/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "File ID is required" });
    }

    const media = await prisma.media.deleteMany({ where: { fileId: req.params.id } });
    if (media.count === 0) {
      return res.status(404).json({ message: "Media not found" });
    }
    await ImageKitClient.files.delete(req.params.id);

    logger.info(`Deleted media file: ${req.params.id}`);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    logger.error({ error }, "Error deleting media file");
    res.status(500).json({ message: "Failed to delete file" });
  }
});
