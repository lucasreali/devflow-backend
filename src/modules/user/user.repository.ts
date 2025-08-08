import { eq } from 'drizzle-orm';
import { db } from '../../core/database/db';
import { users } from '../../core/database/schema';
import { userRequestStatic } from './user.dto';

export const userRepository = {
    async create(user: { id: string } & userRequestStatic) {
        return await db
            .insert(users)
            .values({
                name: user.name,
                email: user.email,
                id: user.id,
                password: user.password,
            })
            .returning({
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
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.email, email));
    },
};
