import express from "express";
import cors from "cors";
import { Config, ValidateConfig } from "./config.js";
import logger from "./lib/logger.js";
import { adminRouter } from "./routes/admin.js";
import { UserRouter } from "./routes/user.js";
import { AiRouter } from "./routes/ai.js";
import { authRouter } from "./routes/auth.js";
import { userAuthMiddleware } from "./middlewares/auth.js";
import { mediaRouter } from "./routes/media.js";
import { Redis } from "@upstash/redis";
import { CleanUp } from "./kill.js";
export const redis = Redis.fromEnv();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/health", (req, res) => {
  res.status(402).send("OK");
});

app.post("/internal/cleanup", async (req, res) => {
  await CleanUp();
  res.send("done");
});

//handlers
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/user", userAuthMiddleware, UserRouter);
app.use("/ai", userAuthMiddleware, AiRouter); // TODO: separate ai router
app.use("/media", userAuthMiddleware, mediaRouter);


export default app



