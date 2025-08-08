import fastifyCors from '@fastify/cors';
import { fastify } from 'fastify';
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { errorHandler } from './core/middleware/errorHandler';
import swagger from './plugins/swagger';
import { routes } from './routes';

export const build = () => {
    const app = fastify().withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.setErrorHandler(errorHandler);

    app.register(fastifyCors, { origin: '*' });

    // plugins
    app.register(swagger);

    app.register(routes, {
        prefix: '/api',
    });

    return app;
};
