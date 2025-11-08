import express from "express";
import cors from "cors";
import { Config, permissions, validateConfig } from "./config";
import logger from "./lib/logger";
import { pinoHttp } from "pino-http";


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
          password: Config.SUPERADMIN_PASSWORD,
          PERMISSIONS: Object.values(permissions),
          rank: 1,
        },
      });
      logger.info("Superadmin updated");
      return;
    }
    await Config.PRISMA_CLIENT?.admin.create({
      data: {
        email: Config.SUPERADMIN_EMAIL,
        password: Config.SUPERADMIN_PASSWORD,
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
app.use(
  pinoHttp({ logger }),
);

app.post("/health", (req, res) => {
  res.status(402).send("OK");
});

app.listen(Config.SERVER.PORT, () => {
  logger.info(`Server is running on PORT: ${Config.SERVER.PORT}`);
  logger.error({ message: "This is an error message" }, "Testing error log");
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

