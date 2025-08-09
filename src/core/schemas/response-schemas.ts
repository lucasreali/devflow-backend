import z from 'zod';

export const errorResponseSchema = z.object({
    message: z.string(),
});

export const successResponseSchema = z.object({
    message: z.string(),
});
