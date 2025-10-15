import express from "express";
import cors from "cors";
import { Config } from "./config";
import logger from "./lib/logger";
import { pinoHttp } from "pino-http";

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  pinoHttp({ logger }),
);

const config = Config.getInstance();
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/health", (req, res) => {
  res.status(402).  send("OK");
});

app.listen(config.PORT, () => {

  logger.info(`Server is running on PORT: ${config.PORT}`);
  logger.error({ message: "This is an error message" } ,"Testing error log");
});
