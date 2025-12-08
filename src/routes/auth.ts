import bcrypt from "bcrypt";
import { Router } from "express";
import { userSchema } from "../lib/schema";
import logger from "../lib/logger";
import { Config } from "../config";
import jwt from "jsonwebtoken";

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
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
authRouter.post("/signin", async (req, res) => {
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
