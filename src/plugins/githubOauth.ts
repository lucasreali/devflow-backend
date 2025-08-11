import oauth2, { fastifyOauth2 } from '@fastify/oauth2';
import fp from 'fastify-plugin';
import { FastifyTypeInstance } from '../types';

export const githubOAuth = fp(async (app: FastifyTypeInstance) => {
    app.register(oauth2, {
        name: 'githubOAuth2',
        credentials: {
            client: {
                id: process.env.GITHUB_CLIENT_ID!,
                secret: process.env.GITHUB_CLIENT_SECRET!,
            },
            auth: fastifyOauth2.GITHUB_CONFIGURATION,
        },
        scope: ['read:user', 'user:email'],
        startRedirectPath: '/api/auth/github/login',
        callbackUri: process.env.GITHUB_REDIRECT_URI!,
    });
});
