import { Router } from "express";
import ImageKit from "@imagekit/nodejs";
import { Config } from "../config.js";
import logger from "../lib/logger.js";
import jwt from "jsonwebtoken";
export const mediaRouter: Router = Router();

/**
 * provide media authorization token
 * for client to upload media to third-party services
 */

const client = new ImageKit({
  privateKey: Config.IMAGEKIT_PRIVATE_KEY,
});

mediaRouter.get("/authenticate-upload", (req, res) => {
  try {
    //@ts-ignore
    const user = req.user.id;
    const token = jwt.sign(
      {
        user: user,
        type: "media",
      },
      Config.JWT.USER_JWT_SECRET
    );

    const authenticationParameters = client.helper.getAuthenticationParameters(token);
    res.json(authenticationParameters);
  } catch (error) {
    console.log(error);
    logger.error({ error });
    res.status(500).json({ message: "Failed to get authorization parameters" });
  }
});
