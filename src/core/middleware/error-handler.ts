import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { BasicError } from '../errors/BasicError';

export const errorHandler = (
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) => {
    // Log do erro para debugging
    request.log.error(error);

    // Se for um erro da nossa aplicação
    if (error instanceof BasicError) {
        return reply.status(error.statusCode).send({
            message: error.message,
        });
    }

    // Se for erro de validação do Zod
    if (error.validation) {
        return reply.status(422).send({
            message: 'Validation failed',
        });
    }

    // Erro genérico (500)
    return reply.status(500).send({
        message: 'Internal server error',
    });
};
