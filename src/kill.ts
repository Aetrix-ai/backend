import { Sandbox } from "e2b";
import logger from "./lib/logger";
import { config } from "dotenv";
config();
async function killSandbox() {
  try {
    const sandboxes = await Sandbox.list();
    const list = await sandboxes.nextItems();
    for (const sbx of list) {
      logger.info(`Stopping:, ${sbx.sandboxId}`);
      const conn = await Sandbox.connect(sbx.sandboxId);
      await conn.kill();
    }
  } catch (e) {
    logger.error(e);
  }
}

killSandbox();
