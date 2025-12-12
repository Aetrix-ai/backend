import e, { Router } from "express";
import { achievementSchema, projectSchema, skillSchema, userSchema, userUpdateSchema } from "../lib/schema";
import { Config } from "../config";
import logger from "../lib/logger";

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
    const user = await Config.PRISMA_CLIENT.user.findUnique({
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
    await Config.PRISMA_CLIENT.user.update({
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
 * USER ACHIEVEMENT ROUTES
  - Add Achievement
  - Get Achievements
  - Delete Achievement
 */

/**
 * Add User Achievement
 */
UserRouter.post("/profile/achievement", async (req, res) => {
  console.log("Add achievement request received:", req.body);
  const payload = achievementSchema.safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, `Invalid achievement payload`);
    return res.status(400).send(payload.error);
  }
  //@ts-ignore
  const userID = req.user.id;
  try {
    const achievement = await Config.PRISMA_CLIENT.achievement.create({
      data: {
        title: payload.data.title,
        description: payload.data.description,
        date: new Date(payload.data.date),
        userId: userID,
        images: payload.data.images,
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
UserRouter.get("/profile/achievement", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  try {
    const achievements = await Config.PRISMA_CLIENT.achievement.findMany({
      where: { userId: userID },
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
UserRouter.delete("/profile/achievements/:id", async (req, res) => {
  const achievementID = parseInt(req.params.id, 10);
  if (isNaN(achievementID)) {
    logger.warn(`Invalid achievement ID: ${req.params.id}`);
    return res.status(400).send("Invalid achievement ID");
  }
  //@ts-ignore
  const userID = req.user.id;
  try {
    await Config.PRISMA_CLIENT.achievement.deleteMany({
      where: { id: achievementID, userId: userID },
    });

    logger.info(`Deleted achievement id: ${achievementID} for user id: ${userID}`);
    return res.status(200).send("Achievement deleted");
  } catch (error: any) {
    logger.error({ message: error }, `Error deleting achievement:`);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 * Update User Achievement
 */
UserRouter.put("/profile/achievement/:id", async (req, res) => {
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
  const data: Record<string, {}> = {};
  for (const key in payload.data) {
    const _key = key as keyof typeof payload.data;
    if (payload.data[_key] !== undefined) {
      if (_key === "date") {
        data[_key] = new Date(payload.data[_key] as string);
      } else {
        data[_key as string] = payload.data[_key];
      }
    }
  }
  try {
    const find = await Config.PRISMA_CLIENT.achievement.findUnique({
      where: { id: achievementID, userId: userID },
    });

    if (!find) {
      logger.warn(`Achievement id: ${achievementID} for user id: ${userID} not found`);
      return res.status(404).json({ message: "Achievement not found" });
    }

    const result = await Config.PRISMA_CLIENT.achievement.update({
      where: { id: achievementID, userId: userID },
      data,
    });
    logger.info(`Updated achievement id: ${achievementID} for user id: ${userID}`);
    return res.status(200).json({ message: "Achievement updated successfully", achievement: result });
  } catch (error: any) {
    logger.error({ message: error }, `Error updating achievement:`);
    return res.status(500).send("Internal Server Error");
  }
});
/**
 * USER PROJECT ROUTES
  - Add Project
  - Get Projects
  - Update Project
  - Delete Project
 */

/**
 * Get User Projects
 */
UserRouter.get("/profile/projects", async (req, res) => {
  //@ts-ignore
  const userId = req.user.id;
  try {
    const projects = await Config.PRISMA_CLIENT.projects.findMany({
      where: { userId: userId },
    });

    res.json({
      message: "Projects fetched successfully",
      projects,
    });
  } catch (e) {
    logger.error({ message: e }, "Error fectching peoject");
    return;
  }
});

/**
 * Add User Project
 */
UserRouter.post("/profile/project", async (req, res) => {
  //@ts-ignore
  const userId = req.user.id;
  const payload = projectSchema.safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, "Invalid project payload");
    res.status(400).json({ error: "Invalid project payload", details: payload.error });
    return;
  }
  try {
    const id = await Config.PRISMA_CLIENT.projects.create({
      data: {
        title: payload.data.title,
        description: payload.data.description,
        demoLink: payload.data.demoLink || "",
        repoLink: payload.data.repoLink || "",
        techStack: payload.data.techStack || [],
        images: payload.data.images || [],
        videos: payload.data.videos || [],
        additionalInfo: payload.data.additionalInfo || "",
        userId: userId,
      },
    });
    res.status(201).json({ message: "Project created successfully", id });
  } catch (err) {
    logger.error({ message: err }, "Error creating project");
  }
});

/**
 * get a single User Project
 */
UserRouter.get("/profile/project/:id", async (req, res) => {
  const projectID = parseInt(req.params.id, 10);
  if (isNaN(projectID)) {
    logger.warn(`Invalid project ID: ${req.params.id}`);
    return res.status(400).send("Invalid project ID");
  }
  //@ts-ignore
  const userID = req.user.id;
  try {
    const project = await Config.PRISMA_CLIENT.projects.findUnique({
      where: { id: projectID, userId: userID },
    });

    if (!project) {
      logger.warn(`Project id: ${projectID} for user id: ${userID} not found`);
      return res.status(404).json({ message: "Project not found" });
    }

    logger.info(`Fetched project id: ${projectID} for user id: ${userID}`);
    return res.status(200).json(project);
  } catch (error: any) {
    logger.error({ message: error }, `Error fetching project:`);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 * Delete User Project
 */
UserRouter.delete("/profile/project/:id", async (req, res) => {
  const projectID = parseInt(req.params.id, 10);
  if (isNaN(projectID)) {
    logger.warn(`Invalid project ID: ${req.params.id}`);
    return res.status(400).send("Invalid project ID");
  }
  //@ts-ignore
  const userID = req.user.id;
  try {
    const result = await Config.PRISMA_CLIENT.projects.deleteMany({
      where: { id: projectID, userId: userID },
    });

    logger.info(`Deleted project id: ${projectID} for user id: ${userID}`);
    return res.status(200).json({ message: "Project deleted successfully", affectedRows: result.count });
  } catch (error: any) {
    logger.error({ message: error }, `Error deleting project:`);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 * Update User Project
 */
UserRouter.put("/profile/project/:id", async (req, res) => {
  const projectID = parseInt(req.params.id, 10);
  if (isNaN(projectID)) {
    logger.warn(`Invalid project ID: ${req.params.id}`);
    return res.status(400).send("Invalid project ID");
  }
  const payload = projectSchema.partial().safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, `Invalid project update payload`);
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
    const find = await Config.PRISMA_CLIENT.projects.findUnique({
      where: { id: projectID, userId: userID },
    });

    if (!find) {
      logger.warn(`Project id: ${projectID} for user id: ${userID} not found`);
      return res.status(404).json({ message: "Project not found" });
    }

    const result = await Config.PRISMA_CLIENT.projects.update({
      where: { id: projectID, userId: userID },
      data,
    });
    logger.info(`Updated project id: ${projectID} for user id: ${userID}`);
    return res.status(200).json({ message: "Project updated successfully", affectedRows: result });
  } catch (error: any) {
    logger.error({ message: error }, `Error updating project:`);
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
    const skills = await Config.PRISMA_CLIENT.skill.findMany({
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
    const id = await Config.PRISMA_CLIENT.skill.create({
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
    const result = await Config.PRISMA_CLIENT.skill.deleteMany({
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
    const find = await Config.PRISMA_CLIENT.skill.findUnique({
      where: { id: skillID, userId: userID },
    });

    if (!find) {
      logger.warn(`Skill id: ${skillID} for user id: ${userID} not found`);
      return res.status(404).json({ message: "Skill not found" });
    }

    const result = await Config.PRISMA_CLIENT.skill.update({
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
