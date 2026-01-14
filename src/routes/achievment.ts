import { Router } from "express";
import { achievementSchema } from "../lib/schema";
import logger from "../lib/logger";
import { prisma } from "../config";
import { ImageKitClient } from "../services/imagekit/client";
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
    await ImageKitClient.files.bulk.delete({ fileIds: result?.media.map((media) => media.fileId) || [] });

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
    let achievement;
    const newMedia = payload.data.media?.filter((media => !find.media.some(m => m.fileId === media.fileId)) ) || [];
    const mediaToDelete = find.media.filter((media) => !payload.data.media?.some(m => m.fileId === media.fileId));

    // Delete removed media from ImageKit
    if (mediaToDelete.length > 0) {
      await ImageKitClient.files.bulk.delete({ fileIds: mediaToDelete.map((media) => media.fileId) });

    }

    if (payload.data.title !== undefined || payload.data.description === undefined) {
      achievement = await prisma.achievement.update({
        where: { id: achievementID, userId: userID },
        data: {
          title: payload.data.title ? payload.data.title : find.title,
          description: payload.data.description ? payload.data.description : find.description,
          date: payload.data.date ? new Date(payload.data.date) : undefined,
          media:{
            create:
              [...newMedia.map((media) => ({
                fileId: media.fileId,
                type: media.type,
                url: media.url,
                additional: media.additional,
              }))],

            deleteMany: [...mediaToDelete.map((media) => ({ id: media.id }))],
          }
        },
      });
    }
    logger.info("updated achivement");
    logger.info(`Updated achievement id: ${achievementID} for user id: ${userID}`);
    return res.status(200).json({ message: "Achievement updated successfully", achievement });
  } catch (error: any) {
    console.log(error);
    logger.error({ message: error }, `Error updating achievement:`);
    return res.status(500).send("Internal Server Error");
  }
});
