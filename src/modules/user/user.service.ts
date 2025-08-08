import { hash } from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { ConflictError } from '../../core/errors/ConflictError';
import { NotFoundError } from '../../core/errors/NotFoundError';
import { userRequestStatic } from './user.dto';
import { userRepository } from './user.repository';

export const userService = {
    async create(user: userRequestStatic) {
        const [exists] = await userRepository.findByEmail(user.email);
        if (exists) throw new ConflictError('Email already in use');

        const hashedPassword = await hash(user.password, 10);

        const [newUser] = await userRepository.create({
            id: randomUUID(),
            name: user.name,
            email: user.email,
            password: hashedPassword,
        });

        return newUser;
    },

    async findById(id: string) {
        const [user] = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user;
    },

    async findAll() {
        return await userRepository.findAll();
    },

    async delete(id: string) {
        const result = await userRepository.delete(id);
        if (result.length === 0) {
            throw new NotFoundError('User not found');
        }
        return result[0];
    },
};
