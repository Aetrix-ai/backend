export const runtime = 'nodejs'

import { Router } from "express";
import logger from "../lib/logger.js";
import jwt from "jsonwebtoken";
export const mediaRouter: Router = Router();
import { z } from "zod";
import ImageKit from "@imagekit/nodejs";
import { Config } from "../config.js";
/**
 * provide media authorization token
 * for client to upload media to third-party services
 */

const ImagKitclient = new ImageKit({
  privateKey: Config.IMAGEKIT_PRIVATE_KEY,
});
//deprectated does not support vecel works fine on local
//it uses crypto (does not exist on vercel run time)
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

    const authenticationParameters = ImagKitclient.helper.getAuthenticationParameters(token);
    res.json(authenticationParameters);
  } catch (error) {
    console.log(error);
    logger.error({ error });
    res.status(500).json({ message: "Failed to get authorization parameters" });
  }
});

const uploadSchema = z.object({
  uploadPayload: z.object({
    fileName: z.string().min(2),
    tags: z.array(z.string().min(1)),
  }),
  publicKey: z.string().min(10),
});

mediaRouter.post("/authenticate-upload", (req, res) => {
  try {
    const parse = uploadSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        error: JSON.parse(parse.error.message),
      });
    }

    const token = jwt.sign(
      {
        //@ts-ignore
        fileName:`${req.user.id}/${parse.data.uploadPayload.fileName}`,
        tags: parse.data.uploadPayload.tags.join(","),
        useUniqueFileName: true,
      },
      Config.IMAGEKIT_PRIVATE_KEY,
      {
        expiresIn: 3500,
        header: {
          alg: "HS256",
          typ: "JWT",
          kid: parse.data.publicKey,
        },
      }
    );

    res.json({ token });
  } catch (error) {
    console.log(error);
    logger.error({ error });
    res.status(500).json({ message: "Failed to get authorization parameters" });
  }
});
