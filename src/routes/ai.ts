import { Router } from "express";
export const AiRouter = Router();

AiRouter.post("/", (req, res) => {
    res.send("Text Generated");
});

AiRouter.post("/image", (req, res) => {
    res.send("Image Generated");
});