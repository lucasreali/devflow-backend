import z from 'zod';

export const columnResquest = z.object({
    name: z.string().min(3),
});

export type columnResquestStatic = z.infer<typeof columnResquest>;
