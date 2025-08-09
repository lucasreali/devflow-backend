import { FastifyReply, FastifyRequest } from 'fastify';
import { Secret, verify } from 'jsonwebtoken';
import { jwtPayloadStatic } from '../../modules/auth/auth.dto';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export const authHandler = async (req: FastifyRequest, rep: FastifyReply) => {
    const header = req.headers.authorization;
    const secret = process.env.JWT_SECRET as Secret | undefined;

    if (!secret) {
        throw new UnauthorizedError('JWT secret is not configured');
    }

    if (!header || !header.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = header.slice(7).trim();

    try {
        const decoded = verify(token, secret) as jwtPayloadStatic;
        req.user = decoded;
    } catch {
        throw new UnauthorizedError('Invalid or expired token');
    }
};
