import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true, // Enable colors 🌈
      translateTime: true, // Show readable time
      levelFirst: true, // Show level (INFO, ERROR, etc.) first
    },
   // only log sta
  },
});

export default logger;
