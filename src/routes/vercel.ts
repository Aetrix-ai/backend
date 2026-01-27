import { Router } from "express";



export const VercelRouter = Router()



VercelRouter.get("/vercel", (req, res) => {

    res.json({ message: "Vercel route is working!" });

});