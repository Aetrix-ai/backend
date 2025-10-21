import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import logger from "./lib/logger";
config();

interface AIClientConfig {
  apiKey: string;
  provider: string;
  temperature?: number;
  maxTokens?: number;
}

export class Config {
  PORT: string;
  DB_URI: string;
  JWT_SECRET: string;
  prismaClient: PrismaClient;
  env: string;
  AI: AIClientConfig;
  private static instance: Config;

  constructor() {
    const PORT = process.env.PORT;
    const DB_URI = process.env.DATABASE_URL;
    const JWT_SECRET = process.env.JWT_SECRET;
    const prisma = new PrismaClient();
    const aiClient: AIClientConfig = {
      apiKey: process.env.OPENAI_API_KEY || "",
      provider: process.env.AI_PROVIDER || "openai",
      temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7,
      maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : 1500,
    };
    if (!this.validateAIConfig(aiClient)) {
      logger.error("AI Client not configured properly");
      throw new Error("AI Client not configured properly");
    }
    this.AI = aiClient;
    if (!PORT || !DB_URI || !JWT_SECRET) {
      logger.error(
        `Missing environment variables. Please check your .env file.[ ${!PORT ? "PORT" : ""},${
          !DB_URI ? "DB_URI" : ""
        },${!JWT_SECRET ? "JWT_SECRET" : ""} ]`
      );
      throw new Error("Missing environment variables. Please check your .env file.");
    }
    if (!prisma) {
      logger.error("Prisma Client not initialized");
      throw new Error("Prisma Client not initialized");
    }

    this.prismaClient = prisma;
    this.PORT = PORT;
    this.DB_URI = DB_URI;
    this.JWT_SECRET = JWT_SECRET;
    this.env = process.env.NODE_ENV || "development";
  }
  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private validateAIConfig(ai: AIClientConfig): boolean {
    if (ai.apiKey === "" || ai.provider === "") {
      logger.error("AI Client not configured properly");
      return false;
    }
    return true;
  }
}
