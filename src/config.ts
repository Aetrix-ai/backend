import { config } from "dotenv";
import logger from "./lib/logger";
import { PrismaClient } from "@prisma/client";
config();
const prisma = new PrismaClient();

// TODO: move prisma client to separate file and import here
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

  IMAGEKIT_PRIVATE_KEY: string;
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
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || "",
};

//TODO: refactor and logic improvements needed
// reduce env no of variables

