import { z } from "zod";

export const userUpdateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().or(z.literal("")),
  avatar: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  resume: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const userSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(["STUDENT", "FACULTY"]).default("STUDENT"),
  skills: z.array(z.string()),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  resume: z.string().url().optional(),
  achievements: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
});

export const MediaSchema = z.object({
  fileId: z.string().min(6, "invalid file id"),
  type: z.enum(["IMAGE", "VIDEO"]),
  url: z.url(),
  additional: z.string().min(6, "Invalid format min 6 char len").optional(),
});

export type MediaI = z.infer<typeof MediaSchema>;
export const achievementSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  date: z.string(), // ISO date string
  media: z.array(MediaSchema),
});

export const aiRouterSchema = z.object({
  prompt: z.string().min(1).max(5000),
});

export const projectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  demoLink: z.string().url().optional(),
  repoLink: z.string().url().optional(),
  techStack: z.array(z.string()).optional(),
  media: z.array(MediaSchema),
  additionalInfo: z.string().max(1000).optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1).max(100),
  level: z.string().min(1).max(100),
});

export const eventSchema = z.object({});

export const updateUserSchema = z.object({});

export const SandBoxSchema = z.object({
  projectId: z.number(),
});
