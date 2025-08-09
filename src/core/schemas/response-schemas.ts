import z from 'zod';

export const errorResponseSchema = z.object({
    message: z.string(),
});

export const successSchema = z.object({
    message: z.string(),
})

