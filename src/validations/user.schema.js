import { z } from 'zod';

export const updateProfileSchema = z.object({
    body: z.object({
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        phone_number: z.string().optional(),
        location: z.string().optional(),
        user_photo: z.string().url("Invalid image URL").optional().or(z.literal("")),
        current_address: z.string().optional(),
        marital_status: z.enum(["Married", "Unmarried", "Divorced"]).optional(),
        // Add any other user updatable fields here, rejecting the rest
        professionalDetails: z.object({
             company_name: z.string().optional(),
             current_position: z.string().optional(),
             work_email: z.string().email("Invalid work email").or(z.literal("")).optional(),
             linkedin_profile: z.string().url("Invalid URL").or(z.literal("")).optional(),
             key_skills: z.string().optional(),
        }).optional()
    }).strict(),
});
