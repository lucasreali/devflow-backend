import { eq } from 'drizzle-orm';
import { db } from '../../core/database/db';
import { accounts } from '../../core/database/schema';

export const accountRepository = {
    async create(data: {
        userId: string;
        githubId: string;
        avatarUrl: string;
        login: string;
    }) {
        return await db.insert(accounts).values(data);
    },

    async findByUserId(userId: string) {
        return db.select().from(accounts).where(eq(accounts.userId, userId));
    },
};
