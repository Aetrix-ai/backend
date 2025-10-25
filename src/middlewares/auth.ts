import jwt from "jsonwebtoken";
import { Config } from "../config";
import { NextFunction, Request, Response } from "express";

/**
 * User authentication middleware
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const userAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).send("Authorization header missing");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send("Token missing");
  }
  try {
    const decoded = jwt.verify(token, Config.JWT.USER_JWT_SECRET);
    //@ts-ignore
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
};


/**
 * Admin authentication middleware
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Authorization header missing");
  }
  try {
    const decoded = jwt.verify(token, Config.JWT.ADMIN_JWT_SECRET);
    //@ts-ignore
    if (decoded.role !== "admin") {
      return res.status(403).send("Forbidden: Admins only");
    }
    //@ts-ignore
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
};
