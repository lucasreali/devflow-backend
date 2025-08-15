import { and, eq } from 'drizzle-orm';
import { db } from '../../core/database/db';
import { projects } from '../../core/database/schema';
import {
    projectRequestStatic,
    projectUpdateRequestStatic,
} from './project.dto';

export const projectRepository = {
    async create(project: projectRequestStatic, userId: string) {
        return await db
            .insert(projects)
            .values({ ...project, userId })
            .returning({
                id: projects.id,
                name: projects.name,
                description: projects.description,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            });
    },

    async findById(projectId: string, userId: string) {
        return await db
            .select({
                id: projects.id,
                name: projects.name,
                description: projects.description,
                userId: projects.userId,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            })
            .from(projects)
            .where(
                and(eq(projects.id, projectId), eq(projects.userId, userId))
            );
    },

    async findAllByUser(userId: string) {
        return await db
            .select({
                id: projects.id,
                name: projects.name,
                description: projects.description,
                userId: projects.userId,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            })
            .from(projects)
            .where(eq(projects.userId, userId));
    },

    async update(
        projectId: string,
        userId: string,
        data: projectUpdateRequestStatic
    ) {
        return await db
            .update(projects)
            .set(data)
            .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
            .returning({
                id: projects.id,
                name: projects.name,
                description: projects.description,
                userId: projects.userId,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            });
    },

    async delete(projectId: string, userId: string) {
        return await db
            .delete(projects)
            .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
            .returning({
                id: projects.id,
                name: projects.name,
                description: projects.description,
                userId: projects.userId,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            });
    },
};
