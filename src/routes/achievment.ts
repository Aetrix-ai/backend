import { Router } from "express";
import { achievementSchema } from "../lib/schema.js";
import logger from "../lib/logger.js";
import { prisma } from "../config.js";
import { ImageKitClient } from "../services/imagekit/client.js";
import { Media } from "@prisma/client";
import { makeTypedQueryFactory } from "@prisma/client/runtime/library";
export const achievementRouter: Router = Router();

/**
 * USER ACHIEVEMENT ROUTES
  - Add Achievement
  - Get Achievements
  - Delete Achievement
 */

/**
 * Add User Achievement
 */
achievementRouter.post("/", async (req, res) => {
  console.log("Add achievement request received:", req.body);
  const payload = achievementSchema.safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, `Invalid achievement payload`);
    return res.status(400).send(payload.error);
  }
  //@ts-ignore
  const userID = req.user.id;
  try {
    const achievement = await prisma.achievement.create({
      data: {
        title: payload.data.title,
        description: payload.data.description,
        date: new Date(payload.data.date),
        userId: userID,
        media: {
          create: [
            ...payload.data.media.map((media) => ({
              fileId: media.fileId,
              type: media.type,
              url: media.url,
              additional: media.additional,
            })),
          ],
        },
      },
    });

    logger.info(`Created achievement for user id: ${userID}`);
    return res.status(201).json(achievement);
  } catch (error: any) {
    logger.error(error, `Error creating achievement:`);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 * Get User Achievements
 */
achievementRouter.get("/", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId: userID },
      include: { media: true },
    });

    logger.info(`Fetched achievements for user id: ${userID}`);
    res.status(200).json(achievements);
    return;
  } catch (error: any) {
    logger.error({ message: error }, `Error fetching achievements:`);
    res.status(500).send("Internal Server Error");
    return;
  }
});

/**
 * Delete User Achievement
 */
achievementRouter.delete("/:id", async (req, res) => {
  const achievementID = parseInt(req.params.id, 10);
  if (isNaN(achievementID)) {
    logger.warn(`Invalid achievement ID: ${req.params.id}`);
    return res.status(400).send("Invalid achievement ID");
  }
  //@ts-ignore
  const userID = req.user.id;
  try {
    const result = await prisma.achievement.delete({
      where: { id: achievementID, userId: userID },
      include: { media: true },
    });
    await ImageKitClient.deleteMany(result.media);

    logger.info(`Deleted achievement id: ${achievementID} for user id: ${userID}`);
    return res.status(200).send("Achievement deleted");
  } catch (error: any) {
    logger.error({ ...error }, `Error deleting achievement:`);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 * Update User Achievement
 */
achievementRouter.put("/:id", async (req, res) => {
  const achievementID = parseInt(req.params.id, 10);
  if (isNaN(achievementID)) {
    logger.warn(`Invalid achievement ID: ${req.params.id}`);
    return res.status(400).send("Invalid achievement ID");
  }
  const payload = achievementSchema.partial().safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, `Invalid achievement update payload`);
    return res.status(400).send(payload.error);
  }
  //@ts-ignore
  const userID = req.user.id;

  try {
    const find = await prisma.achievement.findUnique({
      where: { id: achievementID, userId: userID },
      include: { media: true },
    });

    if (!find) {
      logger.warn(`Achievement id: ${achievementID} for user id: ${userID} not found`);
      return res.status(404).send("Achievement not found");
    }

    const {media} = await ImageKitClient.CompareAndDeleteMany(find.media, (payload.data.media as Media[]) || []);

    const achievement = await prisma.achievement.update({
      where: { id: achievementID, userId: userID },
      data: {
        title: payload.data.title ? payload.data.title : find.title,
        description: payload.data.description ? payload.data.description : find.description,
        date: payload.data.date ? new Date(payload.data.date) : undefined,
        media: media,
      },
    });
    logger.info("updated achivement");
    logger.info(`Updated achievement id: ${achievementID} for user id: ${userID}`);
    return res.status(200).json({ message: "Achievement updated successfully", achievement });
  } catch (error: any) {
    console.log(error);
    logger.error({ message: error }, `Error updating achievement:`);
    return res.status(500).send("Internal Server Error");
  }
});
