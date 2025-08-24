import z from 'zod';

export const columnResquest = z.object({
    name: z.string().min(3),
});

export const columnResponse = z.object({
    name: z.string(),
});

export const columnParms = z.object({
    columnId: z.uuid(),
});

export const columnArrayResponse = z.array(columnResponse);

export type columnResquestStatic = z.infer<typeof columnResquest>;
