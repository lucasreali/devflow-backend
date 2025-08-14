import { FastifyReply, FastifyRequest } from 'fastify';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export const permissionHandler = (req: FastifyRequest, rep: FastifyReply) => {
    const params = req.params as { userId?: string };
    const userIdParam = params.userId;
    const user = req.user;

    if (!user || (user.role !== 'ADMIN' && user.id !== userIdParam)) {
        throw new UnauthorizedError('Invalid token');
    }

    return;
};
