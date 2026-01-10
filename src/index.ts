import express from "express";
import cors from "cors";
import { Config, ValidateConfig } from "./config";
import logger from "./lib/logger";
import { adminRouter } from "./routes/admin";
import { UserRouter } from "./routes/user";
import { AiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth";
import { userAuthMiddleware } from "./middlewares/auth";
import { mediaRouter } from "./routes/media";
import { Redis } from "@upstash/redis";
import { CleanUp } from "./kill";
export const redis = Redis.fromEnv();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/health", (req, res) => {
  res.status(402).send("OK");
});

//handlers
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/user", userAuthMiddleware, UserRouter);
app.use("/ai", userAuthMiddleware, AiRouter); // TODO: separate ai router
app.use("/media", userAuthMiddleware, mediaRouter);


async function StartServer() {
  logger.info("Validating env")
  ValidateConfig(Config)
  if (process.env.FRESH_START == "true") {
    await CleanUp();
  }
  app.listen(Config.PORT, () => {
    logger.info(`Server is running on PORT: ${Config.PORT}`);
  });
}

StartServer()

