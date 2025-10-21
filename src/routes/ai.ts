import { Router } from "express";
export const AiRouter = Router();

AiRouter.post("/", (req, res) => {
    
});

AiRouter.post("/image", (req, res) => {
    res.send("Image Generated");
});