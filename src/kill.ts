import { Sandbox } from "e2b";
import logger from "./lib/logger";
import redis from "./services/redis/redis";

export async function CleanUp() {
  try {
    logger.info("Killing sandboxes..");
    const sandboxes = await Sandbox.list();
    const list = await sandboxes.nextItems();
    for (const sbx of list) {
      logger.info(`Stopping:, ${sbx.sandboxId}`);
      const conn = await Sandbox.connect(sbx.sandboxId);
      await conn.kill();
    }

    logger.info("clearing redis");
    const keys = await redis.keys("*");
    if (keys.length == 0){
      logger.info("redis is empty nothing to clean")
      return
    }
    const del = await redis.del(...keys);
    for (const key of keys) {
      logger.info(`Deleted from redis [key] : [${key}]`);
    }
  } catch (e) {
    logger.error(e);
  }
}


