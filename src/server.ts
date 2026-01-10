import { Config, ValidateConfig } from "./config.js";
import app from "./index.js";
import { CleanUp } from "./kill.js";
import logger from "./lib/logger.js";

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
