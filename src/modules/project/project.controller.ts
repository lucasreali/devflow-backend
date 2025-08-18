import { authHandler } from '../../core/middleware/auth-handler';
import {
    errorResponseSchema,
    successResponseSchema,
} from '../../core/schemas/response-schemas';
import { FastifyTypeInstance } from '../../types';
import { userParms } from '../user/user.dto';
import {
    projectArrayResponse,
    projectParms,
    projectRequest,
    projectResponse,
    projectUpdateRequest,
} from './project.dto';
import { projectService } from './project.service';

export const projectController = (app: FastifyTypeInstance) => {
    app.post(
        '/projects',
        {
            preHandler: authHandler,
            schema: {
                tags: ['projects'],
                security: [{ BearerAuth: [] }],
                description: 'Create project',
                body: projectRequest,
                response: {
                    201: projectResponse,
                    409: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, res) => {
            const project = req.body;
            const userId = req.user?.id as string;

            const newProject = await projectService.create(project, userId);
            return res.status(201).send(newProject);
        }
    );

    app.get(
        '/project/:projectId',
        {
            preHandler: authHandler,
            schema: {
                tags: ['projects'],
                security: [{ BearerAuth: [] }],
                description: 'Find project by id',
                params: projectParms,
                response: {
                    200: projectResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { projectId } = req.params;
            const userId = req.user?.id as string;
            const project = await projectService.findById(projectId, userId);

            return rep.status(200).send(project);
        }
    );

    app.get(
        '/projects',
        {
            preHandler: authHandler,
            schema: {
                tags: ['projects'],
                security: [{ BearerAuth: [] }],
                description: 'Find all projects by user',
                response: {
                    200: projectArrayResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const userId = req.user?.id as string;
            const projects = await projectService.findAllByUser(userId);

            return rep.status(200).send(projects);
        }
    );

    app.patch(
        '/projects/:projectId',
        {
            preHandler: authHandler,
            schema: {
                tags: ['projects'],
                security: [{ BearerAuth: [] }],
                description: 'Update project',
                params: projectParms,
                body: projectUpdateRequest,
                response: {
                    200: projectResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { projectId } = req.params;
            const userId = req.user?.id as string;
            const project = req.body;

            const updatedProject = await projectService.update(
                projectId,
                userId,
                project
            );
            return rep.status(200).send(updatedProject);
        }
    );

    app.delete(
        '/projects/:projectId',
        {
            preHandler: authHandler,
            schema: {
                tags: ['projects'],
                description: 'Delete project',
                params: projectParms,
                security: [{ BearerAuth: [] }],
                response: {
                    200: successResponseSchema,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { projectId } = req.params;
            const userId = req.user?.id as string;
            await projectService.delete(projectId, userId);
            return rep.status(200).send({
                message: 'Project deleted successfully',
            });
        }
    );
};
