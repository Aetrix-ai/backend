import { Router } from "express";
import { userLoginSchema, userRegisterSchema } from "../lib/schema";
import { Config } from "../config";
import logger from "../lib/logger";
import jwt from "jsonwebtoken";


export const UserRouter = Router();
const config = Config.getInstance();
UserRouter.post("/register", async (req, res) => {
  // long user onboarding proccess  for now 
  const payload = userRegisterSchema.safeParse(req.body);
  if (!payload.success) {
    logger.warn(`Invalid user registration payload`, payload.error as any);
    return res.status(400).send(payload.error);
  }
  //verify email otp
  try {
    const id = await config.prismaClient.user.create({
      data: {
        name: payload.data.name,
        email: payload.data.email,
        password: payload.data.password, // Note: In production, hash the password before storing usinhg bcrypt or similar
        role: payload.data.role,
        skills: payload.data.skills,
        bio: payload.data.bio || "",
        avatar: payload.data.avatar || "",
        github: payload.data.github || "",
        linkedin: payload.data.linkedin || "",
        twitter: payload.data.twitter || "",
        resume: payload.data.resume || "",
        achievements: payload.data.achievements || [],
        certifications: payload.data.certifications || [],
        techStack: payload.data.techStack || [],
      },
    });

    logger.info(`User registered with id: ${id} ${payload.data.email}`);
    return res.status(201).json({ id });
  } catch (error: any) {
    logger.error({ message: error }, `Error registering user:`);
    return res.status(500).send("Internal Server Error");
  }
});

UserRouter.post("/signin", async (req, res) => {
  const payload = userLoginSchema.safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, `Invalid user login payload`);
    return res.status(400).send(payload.error);
  }
  try {
    const user = await config.prismaClient.user.findUnique({
      where: { email: payload.data.email },
    });
    if (!user || user.password !== payload.data.password) {
      logger.warn(`Invalid credentials for email: ${payload.data.email}`);
      return res.status(401).send("Invalid email or password");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
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
    const user = await config.prismaClient.user.findUnique({
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




// shoul
UserRouter.put("/profile",async (req, res) => {
  const payload = userRegisterSchema.partial().safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, `Invalid user profile update payload`);
    return res.status(400).send(payload.error
  );  }
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
    await config.prismaClient.user.update({
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
