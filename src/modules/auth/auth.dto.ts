import z from 'zod';

export const authLoginRequest = z.object({
    email: z.email(),
    password: z.string(),
});

export const authLoginResponse = z.object({
    token: z.jwt(),
});

export type authLoginRequestStatic = z.infer<typeof authLoginRequest>;
