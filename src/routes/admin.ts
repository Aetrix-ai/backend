// admin login routes
// later work

/**
 * super admin is the topmost admin with all privileges
 * which is created through environment variables
 * other admins can be created by super admin
 */
import { Router } from "express";
const adminRouter = Router();
import { z } from "zod";
import bcrypt from "bcrypt";
import { Config } from "../config";
import logger from "../lib/logger";
import jwt from "jsonwebtoken";
export const adminSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  permissions: z.array(z.string()),
  password: z.string().min(8),
});

/** admin login */
adminRouter.get("/signin", async (req, res) => {
  const { email, password } = req.body;
  const isValid = adminSchema.safeParse({ email, password });
  if (!isValid.success) {
    return res.status(400).send(isValid.error);
  }
  try {
    const admin = await Config.PRISMA_CLIENT?.admin.findUnique({
      where: { email },
    });
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    const isPasswordValid = bcrypt.compareSync(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid password");
    }
    const token = jwt.sign({ adminId: admin.id }, Config.JWT.ADMIN_JWT_SECRET, { expiresIn: "1h" });
    res.status(200).send({ message: "Login successful", token });
  } catch (err) {
    logger.error({ err }, "Error during admin login:");
    return res.status(500).send("Internal Server Error");
  }
});

/** create admins */
adminRouter.post("/create", async (req, res) => {
  //@ts-ignore */
  const { id, email, rank } = req.admin;

  // verify payload
  const result = adminSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error);
  }

  // check if admin has a persmission to create admins
  try {
    // verify admin permissions
    const admin = await Config.PRISMA_CLIENT?.admin.findUnique({
      where: { id },
    });
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    if (!admin.PERMISSIONS.includes("MANAGE_ADMINS")) {
      return res.status(403).send("Forbidden: You don't have permission to create admins");
    }

    //verify existing admin with same email
    const existingAdmin = await Config.PRISMA_CLIENT?.admin.findUnique({
      where: { email: result.data.email },
    });
    if (existingAdmin) {
      return res.status(409).send("Admin with this email already exists");
    }
    const hashedPassword = bcrypt.hashSync(result.data.password, Config.BCRYPT_SALT_ROUNDS);
    // create admin
    const newAdmin = await Config.PRISMA_CLIENT?.admin.create({
      data: {
        email: result.data.email,
        password: hashedPassword,
        PERMISSIONS: result.data.permissions,
        rank: admin.rank + 1, // new admin rank is one level below the creator admin
      },
    });
    res.status(201).send({ message: "Admin created successfully", adminId: newAdmin?.id });
    return;
  } catch (err) {
    logger.error({ err }, "Error creating admin:");
    return res.status(500).send("Internal Server Error");
  }
});

adminRouter.post("/delete/:adminId", async (req, res) => {
  //@ts-ignore */
  const { id: requesterAdminId } = req.admin;
  const { adminId } = req.params;

  try {
    // verify requester admin permissions
    const requesterAdmin = await Config.PRISMA_CLIENT?.admin.findUnique({
      where: { id: requesterAdminId },
    });
    if (!requesterAdmin) {
      return res.status(404).send("Admin not found");
    }
    if (!requesterAdmin.PERMISSIONS.includes("MANAGE_ADMINS")) {
      return res.status(403).send("Forbidden: You don't have permission to delete admins");
    }
    // delete admin
    const deletedAdmin = await Config.PRISMA_CLIENT?.admin.delete({
      where: { id: parseInt(adminId) },
    });
    if (!deletedAdmin) {
      return res.status(404).send("Admin not found");
    }
    res.status(200).send({ message: "Admin deleted successfully", adminId: deletedAdmin.id });
    return;
  } catch (err) {
    logger.error({ err }, "Error deleting admin:");
    return res.status(500).send("Internal Server Error");
  }
});
