import { z } from "zod";

/*

  id       Int
  email    String
  name     String
  password String
  role     String
  skills   String[]
  bio      String?
  avatar   String?
  github   String?
  linkedin String?
  twitter  String?
  resume   String?
  achievements String[]
  certifications String[]
  techStack String[]
  projects Projects[]
  events   Event[]

 */

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

/**
 * model Achievement {
  id          Int
  title       String
  description String
  date        DateTime
  userId      Int
  images     String[] // add any images
  user        User    @relation(fields: [userId], references: [id])
}
 */
export const achievementSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  date: z.string(), // ISO date string
  images: z.array(z.string().url()).optional(),
});

export const aiRouterSchema = z.object({
  prompt: z.string().min(1).max(5000),
});

export const projectSchema = z.object({

});

export const eventSchema = z.object({});

export const updateUserSchema = z.object({});

