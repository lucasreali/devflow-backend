import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { BasicError } from '../errors/BasicError';

export const errorHandler = (
    error: FastifyError,
    req: FastifyRequest,
    rep: FastifyReply
) => {
    // Log do erro para debugging
    req.log.error(error);

    // Se for um erro da nossa aplicação
    if (error instanceof BasicError) {
        return rep.status(error.statusCode).send({
            message: error.message,
        });
    }

    // Se for erro de validação do Zod
    if (error.validation) {
        return rep.status(422).send({
            message: 'Validation failed',
        });
    }

    // Erro genérico (500)
    return rep.status(500).send({
        message: 'Internal server error',
    });
};
