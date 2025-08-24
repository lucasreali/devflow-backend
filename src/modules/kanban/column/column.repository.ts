import { eq } from 'drizzle-orm';
import { db } from '../../../core/database/db';
import { columns } from '../../../core/database/schema';

export const columnRepository = {
    async create(data: { name: string; projectId: string; order: number }) {
        return await db
            .insert(columns)
            .values({
                projectId: data.projectId,
                name: data.name,
                order: data.order,
            })
            .returning();
    },

    async findByProjectId(projectId: string) {
        return await db
            .select()
            .from(columns)
            .where(eq(columns.projectId, projectId));
    },

    async findById(id: string) {
        return await db.select().from(columns).where(eq(columns.id, id));
    },

    async update(id: string, name: string) {
        return await db
            .update(columns)
            .set({ name })
            .where(eq(columns.id, id))
            .returning();
    },

    async delete(id: string) {
        return await db.delete(columns).where(eq(columns.id, id)).returning();
    },
};
