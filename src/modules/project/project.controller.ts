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
} from './project.dto';
import { projectService } from './project.service';

export const projectController = (app: FastifyTypeInstance) => {
    app.post(
        '/:userId/projects',
        {
            preHandler: authHandler,
            schema: {
                tags: ['projects'],
                security: [{ BearerAuth: [] }],
                description: 'Create project',
                body: projectRequest,
                params: userParms,
                response: {
                    201: projectResponse,
                    409: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, res) => {
            const project = req.body;
            const { userId } = req.params;
            console.log('Creating project for user:', userId);

            const newProject = await projectService.create(project, userId);
            return res.status(201).send(newProject);
        }
    );

    app.get(
        '/:userId/project/:projectId',
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
            const { userId, projectId } = req.params;
            const project = await projectService.findById(projectId, userId);

            return rep.status(200).send(project);
        }
    );

    app.get(
        '/:userId/projects',
        {
            preHandler: authHandler,
            schema: {
                tags: ['projects'],
                security: [{ BearerAuth: [] }],
                description: 'Find all projects by user',
                params: userParms,
                response: {
                    200: projectArrayResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { userId } = req.params;
            const projects = await projectService.findAllByUser(userId);

            return rep.status(200).send(projects);
        }
    );

    app.put(
        '/:userId/projects/:projectId',
        {
            preHandler: authHandler,
            schema: {
                tags: ['projects'],
                security: [{ BearerAuth: [] }],
                description: 'Update project',
                params: projectParms,
                body: projectRequest,
                response: {
                    200: projectResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { userId, projectId } = req.params;
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
        '/:userId/projects/:projectId',
        {
            preHandler: authHandler,
            schema: {
                tags: ['projects'],
                description: 'Delete project',
                params: projectParms,
                response: {
                    200: successResponseSchema,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { userId, projectId } = req.params;
            await projectService.delete(projectId, userId);
            return rep.status(200).send({
                message: 'Project deleted successfully',
            });
        }
    );
};
