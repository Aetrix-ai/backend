import express from "express";
import cors from "cors";
import { Config, permissions, validateConfig } from "./config";
import logger from "./lib/logger";
import { pinoHttp } from "pino-http";
import { adminRouter } from "./routes/admin";
import { UserRouter } from "./routes/user";
import { AiRouter } from "./routes/ai";
import { SandboxRouter } from "./routes/sandbox";
import { authRouter } from "./routes/auth";
import { userAuthMiddleware } from "./middlewares/auth";
import { mediaRouter } from "./routes/media";

/**
 * Initialize superadmin account if it doesn't exist
 * update if it exists
 */
async function InitSuperadmin() {
  try {
    const existingSuperadmin = await Config.PRISMA_CLIENT?.admin.findUnique({
      where: { email: Config.SUPERADMIN_EMAIL },
    });
    if (existingSuperadmin) {
      logger.warn("Superadmin already exists");
      logger.info("Updateing superadmin credentials");
      await Config.PRISMA_CLIENT?.admin.update({
        where: { email: Config.SUPERADMIN_EMAIL },
        data: {
          password: Config.SUPERADMIN_PASSWORD!,
          PERMISSIONS: Object.values(permissions),
          rank: 1,
        },
      });
      logger.info("Superadmin updated");
      return;
    }
    await Config.PRISMA_CLIENT?.admin.create({
      data: {
        email: Config.SUPERADMIN_EMAIL!,
        password: Config.SUPERADMIN_PASSWORD!,
        PERMISSIONS: Object.values(permissions),
        rank: 1,
      },
    });
    logger.info("Superadmin initialized");
  } catch (error) {
    logger.error({ message: "Failed to initialize superadmin", error }, "Superadmin initialization error");
  }
}

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
app.use("/sandbox", SandboxRouter);
app.use("/media", userAuthMiddleware, mediaRouter);
app.listen(Config.SERVER.PORT, () => {
  logger.info(`Server is running on PORT: ${Config.SERVER.PORT}`);
  logger.error(`===============================`);
  try {
    validateConfig(Config);
    if (Config.INIT_ADMIN === "true") {
      InitSuperadmin();
    }
    logger.info("Configuration validation passed");
  } catch (error: any) {
    logger.error({ message: error.message }, "Configuration validation failed");
    process.exit(1); // Exit the process with failure
  }
});
