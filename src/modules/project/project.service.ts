import { NotFoundError } from '../../core/errors/NotFoundError';
import {
    projectRequestStatic,
    projectUpdateRequestStatic,
} from './project.dto';
import { projectRepository } from './project.repository';

export const projectService = {
    async create(project: projectRequestStatic, userId: string) {
        const [newProject] = await projectRepository.create(project, userId);
        if (!newProject) {
            throw new Error('Failed to create project');
        }
        return newProject;
    },

    async findById(projectId: string, userId: string) {
        const [project] = await projectRepository.findById(projectId, userId);
        if (!project) {
            throw new NotFoundError('Project not found');
        }
        return project;
    },

    async findAllByUser(userId: string) {
        const projects = await projectRepository.findAllByUser(userId);
        return projects;
    },

    async update(
        projectId: string,
        userId: string,
        data: projectUpdateRequestStatic
    ) {
        const [updatedProject] = await projectRepository.update(
            projectId,
            userId,
            data
        );
        if (!updatedProject) {
            throw new NotFoundError(
                'User does not have permission to update this project'
            );
        }
        return updatedProject;
    },

    async delete(projectId: string, userId: string) {
        const result = await projectRepository.delete(projectId, userId);
        if (result.length === 0) {
            throw new NotFoundError(
                'User does not have permission to delete this project'
            );
        }
        return;
    },
};
