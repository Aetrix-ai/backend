import { Router } from "express";
import { achievementSchema, projectSchema, skillSchema, userSchema, userUpdateSchema } from "../lib/schema.js";
import { prisma } from "../config.js";
import logger from "../lib/logger.js";

import { ImageKitClient } from "../services/imagekit/client.js";


export const UserRouter: Router = Router();

/**
 * USER PROFILE ROUTES
  - Get Profile
  - Update Profile
  - Add Achievement
  - Get Achievements
  - Delete Achievement
  - Add Project
  - Get Projects
  - Update Project
  - Delete Project
  - ADD Skills
  - Get Skills
  - Update Skills
  - Delete Skills
 */

/**
 * Get User Profile
 */
UserRouter.get("/profile", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userID },
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    logger.info(`Fetched profile for user id: ${userID}`);
    return res.status(200).json(user);
  } catch (error: any) {
    logger.error({ message: error }, `Error fetching user profile:`);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 * Update User Profile
 */
UserRouter.put("/profile", async (req, res) => {
  console.log("Update profile request received:", req.body);
  const payload = userUpdateSchema.safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: JSON.parse(payload.error.message) }, `Invalid user profile update payload`);
    return res.status(400).json({ error: JSON.parse(payload.error.message) });
  }
  //@ts-ignore
  const userID = req.user.id;
  const data: Record<string, {}> = {};
  for (const key in payload.data) {
    const _key = key as keyof typeof payload.data;
    if (payload.data[_key] !== undefined) {
      data[_key as string] = payload.data[_key];
    }
  }
  try {
    await prisma.user.update({
      where: { id: userID },
      data,
    });
    logger.info(`Updated profile for user id: ${userID}`);
    return res.status(200).send("User Profile Updated");
  } catch (error: any) {
    logger.error({ message: error }, `Error updating user profile:`);
    return res.status(500).send("Internal Server Error");
  }
});




/**
 * USER SKILLS ROUTES
  - Add Skill
  - Get Skills
  - Update Skill
  - Delete Skill
 */

/**
 * Get User Skills
 */
UserRouter.get("/profile/skills", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  try {
    const skills = await prisma.skill.findMany({
      where: { userId: userID },
    });

    logger.info(`Fetched skills for user id: ${userID}`);
    res.status(200).json(skills);
    return;
  } catch (error: any) {
    logger.error({ message: error }, `Error fetching skills:`);
    res.status(500).send("Internal Server Error");
    return;
  }
});

/**
 * Add User Skill
 */
UserRouter.post("/profile/skills", async (req, res) => {
  //@ts-ignore
  const userId = req.user.id;
  const payload = skillSchema.safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, "Invalid skill payload");
    res.status(400).json({ error: "Invalid skill payload", details: payload.error });
    return;
  }
  try {
    const id = await prisma.skill.create({
      data: {
        name: payload.data.name,
        level: payload.data.level,
        userId: userId,
      },
    });
    res.status(201).json({ message: "Skill created successfully", id });
  } catch (err) {
    logger.error({ message: err }, "Error creating skill");
  }
});

/**
 * Delete User Skill
 */
UserRouter.delete("/profile/skills/:id", async (req, res) => {
  const skillID = parseInt(req.params.id, 10);
  if (isNaN(skillID)) {
    logger.warn(`Invalid skill ID: ${req.params.id}`);
    return res.status(400).send("Invalid skill ID");
  }
  //@ts-ignore
  const userID = req.user.id;
  try {
    const result = await prisma.skill.deleteMany({
      where: { id: skillID, userId: userID },
    });
    logger.info(`Deleted skill id: ${skillID} for user id: ${userID}`);
    return res.status(200).json({ message: "Skill deleted successfully", affectedRows: result.count });
  } catch (error: any) {
    logger.error({ message: error }, `Error deleting skill:`);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 * Update User Skill
 */
UserRouter.put("/profile/skills/:id", async (req, res) => {
  const skillID = parseInt(req.params.id, 10);
  if (isNaN(skillID)) {
    logger.warn(`Invalid skill ID: ${req.params.id}`);
    return res.status(400).send("Invalid skill ID");
  }
  const payload = skillSchema.partial().safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, `Invalid skill update payload`);
    return res.status(400).send(payload.error);
  }
  //@ts-ignore
  const userID = req.user.id;
  const data: Record<string, {}> = {};
  for (const key in payload.data) {
    const _key = key as keyof typeof payload.data;
    if (payload.data[_key] !== undefined) {
      data[_key as string] = payload.data[_key];
    }
  }
  try {
    const find = await prisma.skill.findUnique({
      where: { id: skillID, userId: userID },
    });

    if (!find) {
      logger.warn(`Skill id: ${skillID} for user id: ${userID} not found`);
      return res.status(404).json({ message: "Skill not found" });
    }

    const result = await prisma.skill.update({
      where: { id: skillID, userId: userID },
      data,
    });
    logger.info(`Updated skill id: ${skillID} for user id: ${userID}`);
    return res.status(200).json({ message: "Skill updated successfully", affectedRows: result });
  } catch (error: any) {
    logger.error(error, `Error updating skill:`);
    return res.status(500).send("Internal Server Error");
  }
});
