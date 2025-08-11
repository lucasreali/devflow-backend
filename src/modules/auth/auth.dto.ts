import z from 'zod';

export const authLoginRequest = z.object({
    email: z.email(),
    password: z.string(),
});

export const authLoginResponse = z.object({
    token: z.jwt(),
});

export const jwtPayload = z.object({
    id: z.uuid(),
    email: z.email(),
    name: z.string(),
    avatarUrl: z.string(),
});

export type authLoginRequestStatic = z.infer<typeof authLoginRequest>;
export type authLoginResponseStatic = z.infer<typeof authLoginResponse>;
export type jwtPayloadStatic = z.infer<typeof jwtPayload>;
