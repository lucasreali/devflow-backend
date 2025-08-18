import { db } from '../../../core/database/db';
// Make sure to import or define 'columns' from your schema
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
};
