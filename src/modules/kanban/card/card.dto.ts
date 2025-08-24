import z from 'zod';

export const cardRequest = z.object({
    name: z
        .string()
        .min(3, { message: 'Name must be at least 3 characters long' }),
});

export const cardResponse = z.object({
    id: z.uuid(),
    columnId: z.uuid(),
    name: z.string(),
    order: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const cardParams = z.object({
    cardId: z.uuid(),
});

export const cardArrayResponse = z.array(cardResponse);
export const cardUpdateRequest = cardRequest.partial();

export type cardRequestStatic = z.infer<typeof cardRequest>;
export type cardResponseStatic = z.infer<typeof cardResponse>;
export type cardParamsStatic = z.infer<typeof cardParams>;
export type cardArrayResponseStatic = z.infer<typeof cardArrayResponse>;
export type cardUpdateRequestStatic = z.infer<typeof cardUpdateRequest>;
