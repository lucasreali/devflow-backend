import { authHandler } from '../../core/middleware/auth-handler';
import { FastifyTypeInstance } from '../../types';
import { userParms } from '../user/user.dto';
import { projectRequest, projectResponse } from './project.dto';
import { projectService } from './project.service';

export const projectController = (app: FastifyTypeInstance) => {
    app.post(
        '/:userId/projects',
        {
            preHandler: authHandler,
            schema: {
                body: projectRequest,
                params: userParms,
                response: {
                    201: projectResponse,
                },
            },
        },
        async (req, res) => {
            const project = req.body;
            const { userId } = req.params;

            const newProject = await projectService.create(project, userId);
            return res.status(201).send(newProject);
        }
    );
};
