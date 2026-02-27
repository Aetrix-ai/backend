import express from "express";
import cors from "cors";
import { Config, ValidateConfig } from "./config.js";
import logger from "./lib/logger.js";
import { UserRouter } from "./routes/user.js";
import { AiRouter } from "./routes/ai.js";
import { authRouter } from "./routes/auth.js";
import { userAuthMiddleware } from "./middlewares/auth.js";
import { mediaRouter } from "./routes/media.js";
import { Redis } from "@upstash/redis";
import { CleanUp } from "./kill.js";
import jwt from "jsonwebtoken";
import { achievementRouter } from "./routes/achievment.js";
import { projectRouter } from "./routes/project.js";
import { publicRouter } from "./routes/public.js";
import { GitRouter } from "./routes/github.js";
export const redis = Redis.fromEnv();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>ImageKit Auth Service</title>
        <style>
          body {
            background: linear-gradient(135deg, #667eea, #764ba2);
            height: 100vh;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
            color: white;
            font-size: 2em;
          }
        </style>
        <a href="https://web-snowy-one-34.vercel.app/dashboard" >Follow the link</a>
      </head>
      <body>
        <div>API is alive</div>
      </body>
    </html>
  `);
});

app.get("/verify/secret/:type", async (req, res) => {
  const { type } = req.params;
  logger.info("generating JWT token for type: " + type);
  let token: string;
  if (type === "admin") {
    token = jwt.sign({ role: "admin", timestamp: Date.now() }, Config.JWT.ADMIN_JWT_SECRET, { expiresIn: "1h" });
  } else if (type === "user") {
    token = jwt.sign({ role: "user", timestamp: Date.now() }, Config.JWT.USER_JWT_SECRET, { expiresIn: "1h" });
  }
  else {
    return res.status(400).json({ message: "Invalid type" });
  }

  res.json({ token });

});

app.get("/kill", async (req, res) => {
  await CleanUp();
  res.send("Cleaned up");
});

//handlers
app.use("/auth", authRouter);

app.use("/user", userAuthMiddleware, UserRouter);
app.use("/user/achievement", userAuthMiddleware, achievementRouter);
app.use("/user/project", userAuthMiddleware, projectRouter);

app.use("/ai", userAuthMiddleware, AiRouter); // TODO: separate ai router
app.use("/media", mediaRouter);

app.use("/public", publicRouter)
app.use("/git", userAuthMiddleware, GitRouter)
export default app;
