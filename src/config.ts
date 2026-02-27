import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import logger from "./lib/logger.js";
import ImageKit from "@imagekit/nodejs";

config();
export const prisma = new PrismaClient();

// TODO: move prisma client to separate file and import here
// Define the shape of the configuration object
interface ConfigI {
  ENV: string;
  PORT: number;
  DB_URI: string;
  JWT: {
    USER_JWT_SECRET: string;
    ADMIN_JWT_SECRET: string;
  };
  AI: {
    API_KEY: string;
    TEMPERATURE: number;
    MAX_RETRIES: number;
    AVIALBLE_MODELS: string[];
    DEFAULT_MODEL: string
  };

  BCRYPT_SALT_ROUNDS: number;
  IMAGEKIT_PRIVATE_KEY: string;
  IMAGEKIT_URL_ENDPOINT: string;
}

//configuration object
function LoadConfig(): ConfigI {
  if (process.env.NODE_ENV == "production") {
    return {
      ENV: process.env.NODE_ENV,
      PORT: parseInt(process.env.PORT || "3000"),
      DB_URI: process.env.DATABASE_URL!,
      JWT: {
        USER_JWT_SECRET: process.env.USER_JWT_SECRET!,
        ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET!,
      },
      AI: {
        API_KEY: process.env.OPENAI_API_KEY || "",
        TEMPERATURE: process.env.AI_TEMPERATURE
          ? parseFloat(process.env.AI_TEMPERATURE)
          : 0.4,
        MAX_RETRIES: process.env.MAX_RETRIES
          ? parseInt(process.env.MAX_RETRIES)
          : 2,
        AVIALBLE_MODELS: [
          "claude-opus-4-6",
          "claude-sonnet-4-6",
          "claude-haiku-4-5",
          "claude-sonnet-4-5",
          "claude-sonnet-4-0",
          "claude-3-haiku-20240307",
        ],
        DEFAULT_MODEL: process.env.MAX_RETRIES ||  "claude-3-haiku-20240307"
      },

      BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "5"),
      IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY!,
      IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT!,
    };
  }

  return {
    ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "3000"),

    DB_URI: process.env.DATABASE_URL || "",

    JWT: {
      USER_JWT_SECRET: process.env.USER_JWT_SECRET || "user_jwt_secret",
      ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || "admin_jwt_secret",
    },
    AI: {
      API_KEY: process.env.OPENAI_API_KEY || "",
      TEMPERATURE: process.env.AI_TEMPERATURE
        ? parseFloat(process.env.AI_TEMPERATURE)
        : 0.7,
      MAX_RETRIES: process.env.MAX_RETRIES
        ? parseInt(process.env.MAX_RETRIES)
        : 2,
      AVIALBLE_MODELS: [
        "claude-opus-4-6",
        "claude-sonnet-4-6",
        "claude-haiku-4-5",
        "claude-sonnet-4-5",
        "claude-sonnet-4-0",
        "claude-3-haiku-20240307",
        "qwen3-coder:30b",
        "qwen3-coder-next",
        "gpt-oss:20b",
      ], 
      DEFAULT_MODEL : process.env.DEFAULT_MODEL || "gpt-oss:20b"
    },

    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "5"),
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || "",
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT || "",
  };
}

export const Config: ConfigI = LoadConfig();

export function ValidateConfig(Config: ConfigI) {
  const ConfigSchema = z.object({
    PORT: z.number().min(3000, "Min : 3000").max(8080, "Max : 8080"),
    DB_URI: z.url("Invalid URI"),
    JWT: z.object({
      USER_JWT_SECRET: z.string().min(8, "Min 8 char"),
      ADMIN_JWT_SECRET: z.string().min(8, "Min 8 char"),
    }),
    BCRYPT_SALT_ROUNDS: z.number().min(5, "Min 5 roundes"),
    IMAGEKIT_PRIVATE_KEY: z.string().min(10, "Provide a valid key"),
  });
  const parse = ConfigSchema.safeParse(Config);

  if (Config.ENV == "production") {
    logger.warn("[ENV] [PRODUCTION]");
    if (parse.error) {
      throw new Error(`Env Error ${parse.error}`);
    }
  } else {
    logger.warn(`[ENV] [${Config.ENV}]`);
    if (parse.error) {
      logger.warn({ error: parse.error }, "Env varibales");
    }
  }
}
