import { z } from 'zod';

export const createPostSchema = z.object({
    body: z.object({
        content: z.string().min(1, "Post content is required"),
        image_url: z.string().url("Invalid image URL").or(z.literal("")).optional(),
        post_type: z.enum(["GENERAL", "JOB"]).optional()
    }).strict(),
});

export const updatePostSchema = z.object({
    body: z.object({
        content: z.string().min(1, "Post content is required").optional(),
        image_url: z.string().url("Invalid image URL").or(z.literal("")).optional(),
    }).strict(),
    params: z.object({
        postId: z.string().regex(/^\d+$/, "postId must be a valid integer"),
    }).strict(),
});
