import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { fastify } from 'fastify';
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { routes } from './routes';

export const build = () => {
    const app = fastify().withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(fastifyCors, { origin: '*' });

    app.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'DavFlow',
                version: '0.0.1',
            },
        },
        transform: jsonSchemaTransform,
    });

    app.register(fastifySwaggerUi, { routePrefix: '/docs' });

    app.register(routes, {
        prefix: '/api',
    });

    return app;
};
