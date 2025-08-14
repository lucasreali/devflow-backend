import { projectRequestStatic } from './project.dto';
import { projectRepository } from './project.repository';

export const projectService = {
    async create(project: projectRequestStatic, userId: string) {
        const [newProject] = await projectRepository.create(project, userId);

        return newProject;
    },
};
