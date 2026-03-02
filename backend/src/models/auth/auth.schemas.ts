import { z } from "zod";

export const signUpSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        fullName: z.string().min(1),
        courseMajor: z.string().min(1),
        age: z.number().int().min(16),
        gender: z.string().min(1),
    }),
});

export const signInSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }),
});
