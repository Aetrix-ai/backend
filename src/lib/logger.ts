import pino from "pino";

const isLocal = process.env.NODE_ENV === "local";

const logger = !isLocal
  ? pino() // ✅ Vercel-safe
  : pino({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    });

export default logger;
