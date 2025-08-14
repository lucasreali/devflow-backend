import z from 'zod';

export const projectRequest = z.object({
    name: z
        .string()
        .min(3, { message: 'Name must be at least 3 characters long' }),
    description: z.string(),
});

export const projectResponse = z.object({
    id: z.uuid(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type projectRequestStatic = z.infer<typeof projectRequest>;
export type projectResponseStatic = z.infer<typeof projectRequest>;
