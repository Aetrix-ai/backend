import { Router } from "express";
import ImageKit from "@imagekit/nodejs";
import { Config } from "../config";
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
    const authenticationParameters = client.helper.getAuthenticationParameters();
    res.json(authenticationParameters);
  } catch (error) {
    res.status(500).json({ message: "Failed to get authorization parameters" });
  }
});



