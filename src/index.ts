import express from "express";
import cors from "cors";
import { Config, validateConfig } from "./config";
import logger from "./lib/logger";
import { pinoHttp } from "pino-http";

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
    logger.info("Configuration validation passed");
  } catch (error: any) {
    logger.error({ message: error.message }, "Configuration validation failed");
    process.exit(1); // Exit the process with failure
  }
});

