import fastifyCors from '@fastify/cors';
import { fastify } from 'fastify';
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { errorHandler } from './core/middleware/error-handler';
import { githubOAuth } from './plugins/githubOauth';
import { swagger } from './plugins/swagger';
import { routes } from './routes';

export const build = () => {
    const app = fastify({
        logger: process.env.NODE_ENV === 'test',
    }).withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.setErrorHandler(errorHandler);

    app.register(fastifyCors, { origin: '*' });

    // plugins
    app.register(swagger);
    app.register(githubOAuth);

    app.register(routes, {
        prefix: '/api',
    });

    return app;
};
