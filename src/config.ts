
import { config } from "dotenv";
import logger from "./lib/logger";
import { PrismaClient } from "@prisma/client";
config();
const prisma = new PrismaClient();
// Define the shape of the configuration object
interface ConfigI {
  ENV: string;
  SERVER: {
    PORT: string;
  };
  DATABASE: {
    DB_URI: string;
  };
  JWT: {
    USER_JWT_SECRET: string;
    ADMIN_JWT_SECRET: string;
  };
  AI: {
    API_KEY: string;
    PROVIDER: string;
    TEMPERATURE: number;
    MAX_TOKENS: number;
  };
  PRISMA_CLIENT: typeof prisma;
  BCRYPT_SALT_ROUNDS: number;

  SUPERADMIN_EMAIL: string;
  SUPERADMIN_PASSWORD?: string;

  INIT_ADMIN: string;
}

//configuration object
export const Config: ConfigI = {
  ENV: process.env.NODE_ENV || "development",
  SERVER: {
    PORT: process.env.PORT || "3000",
  },
  DATABASE: {
    DB_URI: process.env.DATABASE_URL || "",
  },
  JWT: {
    USER_JWT_SECRET: process.env.USER_JWT_SECRET || "user_jwt_secret",
    ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || "admin_jwt_secret",
  },
  AI: {
    API_KEY: process.env.OPENAI_API_KEY || "",
    PROVIDER: process.env.AI_PROVIDER || "openai",
    TEMPERATURE: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7,
    MAX_TOKENS: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : 1500,
  },
  PRISMA_CLIENT: prisma,
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS) : 5,
  INIT_ADMIN: process.env.INIT_ADMIN || "false",
  SUPERADMIN_EMAIL: process.env.SUPERADMIN_EMAIL || "",
  SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD || "",
};

/**
 * Validate configuration object
 * @param Config
 */
export function validateConfig(Config: ConfigI) {
  if (Config.ENV === "development") {
    logger.warn("Running in development mode. Ensure this is not production!");
  } else {
    // production

    // verify port
    if (!Config.SERVER.PORT) {
      logger.error("Missing environment variable: PORT");
      throw new Error("Missing environment variable: PORT");
    }

    // verify database url
    if (!Config.DATABASE.DB_URI) {
      logger.error("Missing environment variable: DATABASE_URL");
      throw new Error("Missing environment variable: DATABASE_URL");
    }

    //verify database url
    if (!Config.DATABASE.DB_URI.startsWith("postgresql://")) {
      logger.error("DATABASE_URL must be a valid PostgreSQL connection string");
      throw new Error("DATABASE_URL must be a valid PostgreSQL connection string");
    }

    // verify jwt secrets
    if (!Config.JWT.USER_JWT_SECRET || !Config.JWT.ADMIN_JWT_SECRET) {
      logger.error("Missing environment variable: USER_JWT_SECRET");
      throw new Error("Missing environment variable: USER_JWT_SECRET");
    }

    // ensure  secret are not default values
    if (Config.JWT.USER_JWT_SECRET === "user_jwt_secret" || Config.JWT.ADMIN_JWT_SECRET === "admin_jwt_secret") {
      logger.error("JWT secrets must be changed from default values in production");
      throw new Error("JWT secrets must be changed from default values in production");
    }

    // verify ai api key
    if (!Config.AI.API_KEY) {
      logger.error("Missing environment variable: OPENAI_API_KEY");
      throw new Error("Missing environment variable: OPENAI_API_KEY");
    }

    //TODO: verify ai provider

    //prisma validation
    if (!Config.PRISMA_CLIENT) {
      logger.error("Prisma client not initialized");
      throw new Error("Prisma client not initialized");
    }

    if (Config.INIT_ADMIN === "true") {
      if (!Config.SUPERADMIN_EMAIL || !Config.SUPERADMIN_PASSWORD) {
        logger.error("Missing SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD for admin initialization");
        throw new Error("Missing SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD for admin initialization");
      }
    }
  }
}

export const permissions = {
  MANAGE_USERS: "MANAGE_DB", // add, remove, update users or any related data
  MANAGE_CONTENT: "MANAGE_CONTENT", // add, remove, update content
  VIEW_ANALYTICS: "VIEW_ANALYTICS",
  MANAGE_ADMINS: "MANAGE_ADMINS",

  // future permissions can be added here
  // MANAGE_DEPLOYEMENTS: "MANAGE_DEPLOYEMENTS",
};
