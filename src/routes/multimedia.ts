// handles multimedia uploads for projects and user avatars
// upload images to s3 bucket and return urls (minio)
// usinf aws sdk and minio for s3 compatible storage
import { Router } from "express";

const multimediaRouter = Router();


multimediaRouter.post("/upload/images", async (req, res) => {
  // handle image upload
  res.send("upload images");
});

multimediaRouter.post("/upload/videos", async (req, res) => {
  // handle video upload
  res.send("upload videos");
});
