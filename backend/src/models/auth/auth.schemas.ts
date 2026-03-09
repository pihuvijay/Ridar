import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),

  fullName: z.string().min(1),
  courseMajor: z.string().min(1),
  age: z.number().int().min(16).max(120),
  gender: z.string().min(1),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const VerifyEmailSchema = z.object({
  email: z.string().email(),
});