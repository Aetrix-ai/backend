import jwt  from "jsonwebtoken"
import { Config } from "../config";
import { NextFunction, Request ,Response } from "express";
export const authMiddleware = (req:Request, res:Response, next:NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Authorization header missing");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send("Token missing");
  }
  try {
    const decoded = jwt.verify(token, Config.getInstance().JWT_SECRET);
    //@ts-ignore
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
}