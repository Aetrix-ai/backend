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

export const userUpdateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().or(z.literal("")),
  avatar: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  resume: z.string().url("Invalid URL").optional().or(z.literal("")),
});
/**
   *name: z.string().min(3, "Name must be at least 3 characters").max(100),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().or(z.literal("")),
  avatar: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  resume: z.string().url("Invalid URL").optional().or(z.literal("")),
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

/**
 *id          Int
  title       String
  description String
  demoLink    String?
  repoLink    String?
  techStack   String[]
  images      String[] // add any images
  videos      String[] // add any videos
  additionalInfo String?
  userId      Int
  owner       User    @relation(fields: [userId], references: [id])
 */

export const projectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  demoLink: z.string().url().optional(),
  repoLink: z.string().url().optional(),
  techStack: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
  additionalInfo: z.string().max(1000).optional(),
});

/**
 * model Skill {
  id     Int
  name   String
  level  String
  userId Int
  user   User   @relation(fields: [userId], references: [id])
}
 */

export const skillSchema = z.object({
  name: z.string().min(1).max(100),
  level: z.string().min(1).max(100),
});

export const eventSchema = z.object({});

export const updateUserSchema = z.object({});

export const SandBoxSchema = z.object({
  projectId: z.number(),
});
