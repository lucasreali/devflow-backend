import { hash } from 'bcrypt';
import { ConflictError } from '../../core/errors/ConflictError';
import { NotFoundError } from '../../core/errors/NotFoundError';
import { userRequestStatic, userUpdateRequestStatic } from './user.dto';
import { userRepository } from './user.repository';

export const userService = {
    async create(user: userRequestStatic) {
        const [exists] = await userRepository.findByEmail(user.email);
        if (exists) throw new ConflictError('Email already in use');

        const hashedPassword = await hash(user.password, 10);

        const [newUser] = await userRepository.create({
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
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
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

    async update(id: string, data: userUpdateRequestStatic) {
        const toUpdate: userUpdateRequestStatic = {};

        if (data.name !== undefined) toUpdate.name = data.name;
        if (data.email !== undefined) toUpdate.email = data.email;
        if (data.password !== undefined) {
            toUpdate.password = await hash(data.password, 10);
        }

        const [result] = await userRepository.update(id, toUpdate);
        if (!result) {
            throw new NotFoundError('User not found');
        }
        return result;
    },
};
