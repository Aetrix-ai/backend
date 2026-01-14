import { Router } from "express";
export const projectRouter: Router = Router();
import { projectSchema } from "../lib/schema.js";
import logger from "../lib/logger.js";
import { prisma } from "../config.js";
import { ImageKitClient } from "../services/imagekit/client.js";

projectRouter.get("/", async (req, res) => {
  //@ts-ignore
  const userId = req.user.id;
  try {
    const projects = await prisma.project.findMany({
      where: { userId: userId },
      include: {
        media: true,
      },
    });
    res.json({
      message: "Projects fetched successfully",
      projects,
    });
  } catch (e) {
    logger.error({ message: e }, "Error fectching peoject");
    return;
  }
});

projectRouter.post("/", async (req, res) => {
  //@ts-ignore
  const userId = req.user.id;
  const payload = projectSchema.safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, "Invalid project payload");
    res.status(400).json({ error: "Invalid project payload", details: payload.error });
    return;
  }
  try {
    const id = await prisma.project.create({
      data: {
        title: payload.data.title,
        description: payload.data.description,
        demoLink: payload.data.demoLink || "",
        repoLink: payload.data.repoLink || "",
        techStack: payload.data.techStack || [],
        additionalInfo: payload.data.additionalInfo || "",
        userId: userId,
        media: {
          create: [
            ...payload.data.media.map((media) => ({
              fileId: media.fileId,
              type: media.type,
              url: media.url,
              additional: media.additional,
            })),
          ],
        },
      },
    });
    res.status(201).json({ message: "Project created successfully", id });
  } catch (err) {
    logger.error({ message: err }, "Error creating project");
  }
});

projectRouter.get("/:id", async (req, res) => {
  const projectID = parseInt(req.params.id, 10);
  if (isNaN(projectID)) {
    logger.warn(`Invalid project ID: ${req.params.id}`);
    return res.status(400).send("Invalid project ID");
  }
  //@ts-ignore
  const userID = req.user.id;
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectID, userId: userID },
      include: { media: true },
    });

    if (!project) {
      logger.warn(`Project id: ${projectID} for user id: ${userID} not found`);
      return res.status(404).json({ message: "Project not found" });
    }

    logger.info(`Fetched project id: ${projectID} for user id: ${userID}`);
    return res.status(200).json(project);
  } catch (error: any) {
    logger.error({ message: error }, `Error fetching project:`);
    return res.status(500).send("Internal Server Error");
  }
});

projectRouter.delete("/:id", async (req, res) => {
  const projectID = parseInt(req.params.id, 10);
  if (isNaN(projectID)) {
    logger.warn(`Invalid project ID: ${req.params.id}`);
    return res.status(400).send("Invalid project ID");
  }
  //@ts-ignore
  const userID = req.user.id;

  try {
    const result = await prisma.project.delete({
      where: { id: projectID, userId: userID },
      include: { media: true },
    });

    await ImageKitClient.deleteMany(result.media);

    logger.info(`Deleted project id: ${projectID} for user id: ${userID}`);
    return res.status(200).json({ message: "Project deleted successfully", deleted: result });
  } catch (error: any) {
    logger.error({ message: error }, `Error deleting project:`);
    return res.status(500).send("Internal Server Error");
  }
});

projectRouter.put("/:id", async (req, res) => {
  const projectID = parseInt(req.params.id, 10);
  if (isNaN(projectID)) {
    logger.warn(`Invalid project ID: ${req.params.id}`);
    return res.status(400).send("Invalid project ID");
  }
  const payload = projectSchema.partial().safeParse(req.body);
  if (!payload.success) {
    logger.warn({ message: payload.error }, `Invalid project update payload`);
    return res.status(400).send(payload.error);
  }
  //@ts-ignore
  const userID = req.user.id;
  try {
    const currrnt = await prisma.project.findFirst({
      where: { id: projectID, userId: userID },
      include: { media: true },
    });
    if (!currrnt) {
      logger.warn(`Project id: ${projectID} for user id: ${userID} not found`);
      return res.status(404).json({ message: "Project not found" });
    }

    const {media} = await ImageKitClient.CompareAndDeleteMany(currrnt.media, payload.data.media || []);

    const result = await prisma.project.update({
      where: { id: projectID, userId: userID },
      data: {
        title: payload.data.title,
        description: payload.data.description,
        demoLink: payload.data.demoLink,
        repoLink: payload.data.repoLink,
        techStack: payload.data.techStack,
        additionalInfo: payload.data.additionalInfo,
        media: media,
      },
    });
    logger.info(`Updated project id: ${projectID} for user id: ${userID}`);
    return res.status(200).json({ message: "Project updated successfully", affectedRows: result });
  } catch (error: any) {
    logger.error({ message: error }, `Error updating project:`);
    return res.status(500).send("Internal Server Error");
  }
});
