import { z } from 'zod';

export const updateApprovalStatusSchema = z.object({
    body: z.object({
        status: z.enum(["APPROVED", "REJECTED", "PENDING"], {
            errorMap: () => ({ message: "Status must be APPROVED, REJECTED, or PENDING" })
        }),
    }).strict(),
    params: z.object({
        userId: z.string().regex(/^\d+$/, "userId must be a valid integer"),
    }).strict(),
});

export const createFacultySchema = z.object({
    body: z.object({
        first_name: z.string().min(1, "First name is required"),
        last_name: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email format"),
        phone_number: z.string().min(10, "Phone number required"),
        date_of_birth: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" }),
        role: z.enum(["FACULTY", "RETD_FACULTY"]).optional(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        department_id: z.union([z.number(), z.string().regex(/^\d+$/)]).optional()
    }).strict(),
});

export const updateFacultySchema = z.object({
    body: z.object({
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        email: z.string().email("Invalid email format").optional(),
        phone_number: z.string().optional(),
        role: z.enum(["FACULTY", "RETD_FACULTY"]).optional(),
        department_id: z.union([z.number(), z.string().regex(/^\d+$/)]).optional()
    }).strict(),
    params: z.object({
        userId: z.string().regex(/^\d+$/, "userId must be a valid integer"),
    }).strict(),
});

export const createEventSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        event_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" }),
        event_time: z.string().optional(),
        location: z.string().optional(),
        image_url: z.string().url("Invalid image URL").or(z.literal("")).optional(),
    }).strict(),
});

export const updateEventSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        event_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" }).optional(),
        event_time: z.string().optional(),
        location: z.string().optional(),
        image_url: z.string().url("Invalid image URL").or(z.literal("")).optional(),
    }).strict(),
    params: z.object({
        eventId: z.string().regex(/^\d+$/, "eventId must be a valid integer"),
    }).strict(),
});

export const createJobPostSchema = z.object({
    body: z.object({
        content: z.string().min(1, "Content is required"),
        image_url: z.string().url("Invalid image URL").or(z.literal("")).optional(),
    }).strict(),
});

export const createPrincipalSchema = z.object({
    body: z.object({
        first_name: z.string().min(1, "First name is required"),
        last_name: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email format"),
        phone_number: z.string().min(10, "Phone number required"),
        date_of_birth: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" }),
        password: z.string().min(6, "Password must be at least 6 characters"),
        department: z.string().optional(),
        profilePic: z.string().optional(),
    }).strict(),
});

export const updatePrincipalSchema = z.object({
    body: z.object({
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        email: z.string().email("Invalid email format").optional(),
        phone_number: z.string().optional(),
        department: z.string().optional(),
        profilePic: z.string().optional(),
    }).strict(),
    params: z.object({
        userId: z.string().regex(/^\d+$/, "userId must be a valid integer"),
    }).strict(),
});
