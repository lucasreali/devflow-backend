import { compare } from 'bcrypt';
import { Secret, sign } from 'jsonwebtoken';
import { NotFoundError } from '../../core/errors/NotFoundError';
import { UnauthorizedError } from '../../core/errors/UnauthorizedError';
import { userRepository } from '../user/user.repository';
import { authLoginRequestStatic } from './auth.dto';

export const authService = {
    secret: process.env.JWT_SECRET as Secret,

    async login(credentials: authLoginRequestStatic) {
        const [user] = await userRepository.findByEmail(credentials.email);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const isMatch = await compare(credentials.password, user.password);

        if (!isMatch) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
        };

        if (!this.secret) {
            throw new Error('JWT secret is not defined');
        }

        const token = sign(payload, this.secret, { expiresIn: '1d' });

        return { token };
    },
};
