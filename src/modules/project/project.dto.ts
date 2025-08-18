import z from 'zod';

export const projectRequest = z.object({
    name: z
        .string()
        .min(3, { message: 'Name must be at least 3 characters long' }),
    description: z.string().optional(),
});

export const projectResponse = z.object({
    id: z.uuid(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const projectParms = z.object({
    projectId: z.uuid(),
});

export const projectArrayResponse = z.array(projectResponse);
export const projectUpdateRequest = projectRequest.partial();

export type projectRequestStatic = z.infer<typeof projectRequest>;
export type projectResponseStatic = z.infer<typeof projectResponse>;
export type projectArrayResponseStatic = z.infer<typeof projectArrayResponse>;
export type projectUpdateRequestStatic = z.infer<typeof projectUpdateRequest>;
