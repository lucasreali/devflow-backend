import { eq } from 'drizzle-orm';
import { db } from '../../core/database/db';
import { users } from '../../core/database/schema';
import { userRequestStatic, userUpdateRequestStatic } from './user.dto';

export const userRepository = {
    async create(user: userRequestStatic) {
        return await db.insert(users).values(user).returning({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        });
    },

    async findById(id: string) {
        return await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                password: users.password,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, id));
    },

    async findAll() {
        return await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users);
    },

    async delete(id: string) {
        return await db.delete(users).where(eq(users.id, id)).returning();
    },

    async findByEmail(email: string) {
        return await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                password: users.password,
                role: users.role,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.email, email));
    },

    async update(id: string, data: userUpdateRequestStatic) {
        return await db
            .update(users)
            .set(data)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });
    },
};
