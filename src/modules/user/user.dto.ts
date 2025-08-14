import z from 'zod';

export const userRequest = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(4),
});

export const userParms = z.object({
    userId: z.uuid(),
});

export const userResponse = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const userUpdateRequest = userRequest.partial();
export const listUserResponse = z.array(userResponse);
export type userRequestStatic = z.infer<typeof userRequest>;
export type userResponseStatic = z.infer<typeof userResponse>;
export type userParmsStatic = z.infer<typeof userParms>;
export type listUserResponseStatic = z.infer<typeof listUserResponse>;
export type userUpdateRequestStatic = z.infer<typeof userUpdateRequest>;
