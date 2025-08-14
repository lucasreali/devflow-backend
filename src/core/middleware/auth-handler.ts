import { FastifyReply, FastifyRequest } from 'fastify';
import {
    JsonWebTokenError,
    Secret,
    TokenExpiredError,
    verify,
} from 'jsonwebtoken';
import { jwtPayloadStatic } from '../../modules/auth/auth.dto';
import { userRepository } from '../../modules/user/user.repository';
import { UnauthorizedError } from '../errors/UnauthorizedError';

function verifyJwtToken(token: string, secret: Secret): jwtPayloadStatic {
    try {
        return verify(token, secret) as jwtPayloadStatic;
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            throw new UnauthorizedError('Token expired');
        }
        if (error instanceof JsonWebTokenError) {
            throw new UnauthorizedError('Invalid token');
        }
        throw error;
    }
}

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

    const decoded = verifyJwtToken(token, secret);

    const [user] = await userRepository.findById(decoded.id);

    if (
        !user ||
        user.id !== decoded.id ||
        user.email !== decoded.email ||
        user.role !== decoded.role
    )
        if (!user) {
            throw new UnauthorizedError('Invalid or expired token');
        }

    req.user = decoded;
};
