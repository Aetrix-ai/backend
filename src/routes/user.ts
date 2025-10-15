import { Router } from "express";
import { userLoginSchema, userRegisterSchema } from "../lib/schema";
import { Config } from "../config";
import logger from "../lib/logger";
import jwt from "jsonwebtoken";


export const UserRouter = Router();
const config = Config.getInstance();
UserRouter.post("/register", async (req, res) => {
  const payload = userRegisterSchema.safeParse(req.body);
  if (!payload.success) {
    logger.warn(`Invalid user registration payload`, payload.error as any);
    return res.status(400).send(payload.error);
  }

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
    const user = await config.prismaClient.user.findFirst({
      where: {
        email: payload.data.email,
        password: payload.data.password, // Note: In production, hash the password before comparing using bcrypt or similar
        // compare hashed password
        // for now its ok
      },
    });

    if (!user) {
      return res.status(401).send("Invalid email or password");
    }
    const token = jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET, {
      expiresIn: "5m",
    });

    // either in header or cookie
    // here we use cookie
    // in production, set secure: true
    // and sameSite: 'strict' or 'lax' based on your requirements
    // also consider setting httpOnly: true to prevent XSS attacks


    //read about cookie options here https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
    // res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=300; SameSite=Strict`);
    // in express docs https://expressjs.com/en/api.html#res.cookie
    res.cookie("token", token )
    return res.json({ token });
  } catch (error: any) {
    logger.error({ message: error }, `Error logging in user:`);
    return res.status(500).send("Internal Server Error");
  }
});
UserRouter.get("/profile", (req, res) => {
  res.send("User Profile");
});

UserRouter.put("/profile", (req, res) => {
  res.send("User Profile Updated");
});
