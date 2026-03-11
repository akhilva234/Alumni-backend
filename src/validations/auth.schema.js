import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email format"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        gender: z.string().optional(),
        address: z.string().optional(),
        prn: z.string().min(1, "PRN is required"),
        adm_year: z.union([z.string(), z.number()]),
        graduationYear: z.union([z.string(), z.number()]),
        degree: z.any().optional(), // In service not directly used for creation if not mapped, but keeping it if expected
        department: z.any().optional(),
        course: z.union([z.string(), z.number()]),
        position: z.string().optional(),
        company: z.string().optional(),
        industry: z.union([z.string(), z.number()]).optional(),
        workEmail: z.union([z.string().email("Invalid work email format"), z.literal(""), z.null()]).optional(),
        linkedin: z.string().optional(),
        skills: z.string().optional(),
        dob: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format for DOB" }),
        martialStatus: z.string().optional(),
    }).strict() // Reject unexpected fields
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
    }).strict()
});
