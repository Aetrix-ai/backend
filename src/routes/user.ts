import { Router } from "express";
import { achievementSchema, projectSchema, skillSchema, userSchema } from "../lib/schema";
import { Config } from "../config";
import logger from "../lib/logger";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const UserRouter: Router = Router();

/**
 USER AUTH ROUTES
  - Register (deprecated || left for backward compatibility)
  - Signup
  - Login
 */

/**
 * Depercated : Use signup route instead and separate profile routes for fetching and updating profile
 * use ../signup , ../profile/achievements , ../profile/certifications etc
 * User Registration
 */
UserRouter.post("/register", async (req, res) => {
  // long user onboarding proccess  for now
  const payload = userSchema.safeParse(req.body);
  if (!payload.success) {
    //@ts-ignore
    logger.warn(`Invalid user registration payload`, payload.error as any);
    return res.status(400).send(payload.error);
  }
  //verify email otp
  try {
    const id = await Config.PRISMA_CLIENT.user.create({
      data: {
        name: payload.data.name,
        email: payload.data.email,
        password: payload.data.password, // Note: In production, hash the password before storing usinhg bcrypt or similar
        role: payload.data.role,
        bio: payload.data.bio || "",
        avatar: payload.data.avatar || "",
        github: payload.data.github || "",
        linkedin: payload.data.linkedin || "",
        twitter: payload.data.twitter || "",
        resume: payload.data.resume || "",
      },
    });

    logger.info(`User registered with id: ${id} ${payload.data.email}`);
    return res.status(201).json({ id });
  } catch (error: any) {
    logger.error({ message: error }, `Error registering user:`);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 * User Signup
 */
UserRouter.post("/signup", async (req, res) => {
  // verify username email password only from schema
  const payload = userSchema.pick({ name: true, email: true, password: true, role: true }).safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, `Invalid user signup payload`);
    return res.status(400).send(payload.error);
  }
  try {
    // check if email already exists
    const existingUser = await Config.PRISMA_CLIENT.user.findUnique({
      where: { email: payload.data.email },
    });
    if (existingUser) {
      logger.warn(`Email already in use: ${payload.data.email}`);
      return res.status(409).send("Email already in use");
    }

    //create new user
    const hashPassword = bcrypt.hashSync(payload.data.password, Config.BCRYPT_SALT_ROUNDS);
    const newUser = await Config.PRISMA_CLIENT.user.create({
      data: {
        email: payload.data.email,
        password: hashPassword,
        name: payload.data.name, // Default name, can be updated later
        role: payload.data.role,
      },
    });

    logger.info(`User signed up with id: ${newUser.id} ${payload.data.email}`);
    return res.status(201).json({ id: newUser.id });
  } catch (error: any) {
    logger.error({ message: error }, `Error creating user:`);
    return res.status(500).send("Internal Server Error");
  }
});

/*
 * User Login
 */
UserRouter.post("/signin", async (req, res) => {
  const payload = userSchema.pick({ email: true, password: true }).safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, `Invalid user login payload`);
    return res.status(400).send(payload.error);
  }
  try {
    // fetch user from db
    const user = await Config.PRISMA_CLIENT.user.findUnique({
      where: { email: payload.data.email },
    });

    if (!user) {
      logger.warn(`User not found for email: ${payload.data.email}`);
      return res.status(401).send("Invalid email or password");
    }
    // verify password
    const verifyPassword = await bcrypt.compare(payload.data.password, user.password);
    if (!verifyPassword) {
      logger.warn(`Invalid credentials for email: ${payload.data.email}`);
      return res.status(401).send("Invalid email or password");
    }
    // generate jwt token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, Config.JWT.USER_JWT_SECRET, {
      expiresIn: "7d",
    });
    logger.info(`User logged in with id: ${user.id} ${payload.data.email}`);
    return res.status(200).json({ token });
  } catch (error: any) {
    logger.error({ message: error }, `Error logging in user:`);
    return res.status(500).send("Internal Server Error");
  }
});

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
  const payload = userSchema.partial().safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, `Invalid user profile update payload`);
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
        userId: userID,
        title: payload.data.title,
        description: payload.data.description,
        images: payload.data.images || [],
        date: payload.data.date,
      },
    });

    logger.info(`Created achievement for user id: ${userID}`);
    return res.status(201).json(achievement);
  } catch (error: any) {
    logger.error({ message: error }, `Error creating achievement:`);
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
 * USER PROJECT ROUTES
  - Add Project
  - Get Projects
  - Update Project
  - Delete Project
 */

/**
 * Get User Projects
 */
UserRouter.get("/profile/project", async (req, res) => {
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
  } catch (err) {
    logger.error({ message: err }, "Error creating project");
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
    await Config.PRISMA_CLIENT.projects.deleteMany({
      where: { id: projectID, userId: userID },
    });

    logger.info(`Deleted project id: ${projectID} for user id: ${userID}`);
    return res.status(200).send("Project deleted");
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
    await Config.PRISMA_CLIENT.projects.updateMany({
      where: { id: projectID, userId: userID },
      data,
    });
    logger.info(`Updated project id: ${projectID} for user id: ${userID}`);
    return res.status(200).send("Project Updated");
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
    await Config.PRISMA_CLIENT.skill.deleteMany({
      where: { id: skillID, userId: userID },
    });

    logger.info(`Deleted skill id: ${skillID} for user id: ${userID}`);
    return res.status(200).send("Skill deleted");
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
    await Config.PRISMA_CLIENT.skill.updateMany({
      where: { id: skillID, userId: userID },
      data,
    });
    logger.info(`Updated skill id: ${skillID} for user id: ${userID}`);
    return res.status(200).send("Skill Updated");
  } catch (error: any) {
    logger.error({ message: error }, `Error updating skill:`);
    return res.status(500).send("Internal Server Error");
  }
});
