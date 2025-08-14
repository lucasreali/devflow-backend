import { db } from '../../core/database/db';
import { projects } from '../../core/database/schema';
import { projectRequestStatic } from './project.dto';

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
};
