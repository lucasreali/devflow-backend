import { eq } from 'drizzle-orm';
import { db } from '../../../core/database/db';
import { cards } from '../../../core/database/schema';

export const cardRepository = {
    async create(data: { name: string; columnId: string; order: number }) {
        return await db
            .insert(cards)
            .values({
                columnId: data.columnId,
                name: data.name,
                order: data.order,
            })
            .returning();
    },

    async findByColumnId(columnId: string) {
        return await db
            .select()
            .from(cards)
            .where(eq(cards.columnId, columnId));
    },

    async findById(id: string) {
        return await db.select().from(cards).where(eq(cards.id, id));
    },

    async update(id: string, data: { name?: string; order?: number }) {
        return await db
            .update(cards)
            .set(data)
            .where(eq(cards.id, id))
            .returning();
    },

    async delete(id: string) {
        return await db.delete(cards).where(eq(cards.id, id)).returning();
    },
};
