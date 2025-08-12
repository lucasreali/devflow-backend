import fastifyOauth2 from '@fastify/oauth2';
import { FastifyTypeInstance } from '../../types';
import { authLoginRequest, authLoginResponse } from './auth.dto';
import { authService } from './auth.service';
import { authHandler } from '../../core/middleware/auth-handler';
import { errorResponseSchema, successResponseSchema } from '../../core/schemas/response-schemas';

export const authController = (app: FastifyTypeInstance) => {
    app.post(
        '/login',
        {
            schema: {
                tags: ['auth'],
                body: authLoginRequest,
                response: {
                    200: authLoginResponse,
                },
            },
        },
        async (req, rep) => {
            const credentials = req.body;
            const token = await authService.login(credentials);
            return rep.status(200).send(token);
        }
    );

    app.get('/github/callback', async (req, rep) => {
        const tokenResponse = await (
            app as any
        ).githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
        const accessToken: string | undefined =
            tokenResponse?.token?.access_token;

        if (!accessToken) {
            return rep
                .status(401)
                .send({ message: 'GitHub authorization failed' });
        }

        const result = await authService.githubFromAccessToken(accessToken);
        return rep.status(200).send(result);
    });

    app.get(
        '/verify',
        {
            preHandler: authHandler,
            schema: {
                security: [{ BearerAuth: [] }],
                response: {
                    200: successResponseSchema,
                    401: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            return rep.status(200).send({ message: 'Valid token' });
        }
    );
};
