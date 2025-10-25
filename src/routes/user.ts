import { Router } from "express";
import { achievementSchema, userSchema } from "../lib/schema";
import { Config } from "../config";
import logger from "../lib/logger";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const UserRouter = Router();

/**
 * Depercated : Use signup route instead and separate profile routes for fetching and updating profile
 * use ../signup , ../profile/achievements , ../profile/certifications etc
 * User Registration
 */
UserRouter.post("/register", async (req, res) => {
  // long user onboarding proccess  for now
  const payload = userSchema.safeParse(req.body);
  if (!payload.success) {
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


UserRouter.post("/signup", async (req, res) => {
  // verify username email password only from schema
  const payload = userSchema.pick({name: true, email: true, password: true, role: true }).safeParse(req.body);
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
    const verifyPassword = await bcrypt.compare(payload.data.password, user.password );
    if (!verifyPassword) {
      logger.warn(`Invalid credentials for email: ${payload.data.email}`);
      return res.status(401).send("Invalid email or password");
    }
    // generate jwt token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      Config.JWT.USER_JWT_SECRET,
      { expiresIn: "7d" }
    );
    logger.info(`User logged in with id: ${user.id} ${payload.data.email}`);
    return res.status(200).json({ token });

  } catch (error: any) {
    logger.error({ message: error }, `Error logging in user:`);
    return res.status(500).send("Internal Server Error");
  }
});


UserRouter.get("/profile",async (req, res) => {
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

UserRouter.put("/profile",async (req, res) => {
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
      data
    });
    logger.info(`Updated profile for user id: ${userID}`);
    return res.status(200).send("User Profile Updated");
  } catch (error: any) {
    logger.error({ message: error }, `Error updating user profile:`);
    return res.status(500).send("Internal Server Error");
  }
});

UserRouter.post("/profile/achievements", async (req, res) => {
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


UserRouter.get("/profile/achievements", async (req, res) => {
  //@ts-ignore
  const userID = req.user.id;
  try {
    const achievements = await Config.PRISMA_CLIENT.achievement.findMany({
      where: { userId: userID },
    });

    logger.info(`Fetched achievements for user id: ${userID}`);
    return res.status(200).json(achievements);
  } catch (error: any) {
    logger.error({ message: error }, `Error fetching achievements:`);
    return res.status(500).send("Internal Server Error");
  }
});


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


