import { authHandler } from '../../../core/middleware/auth-handler';
import {
    errorResponseSchema,
    successResponseSchema,
} from '../../../core/schemas/response-schemas';
import { FastifyTypeInstance } from '../../../types';
import { projectParms } from '../../project/project.dto';
import {
    columnArrayResponse,
    columnParms,
    columnResponse,
    columnResquest,
} from './column.dto';
import { columnService } from './column.service';

export const columnController = (app: FastifyTypeInstance) => {
    app.post(
        '/project/:projectId/columns',
        {
            preHandler: authHandler,
            schema: {
                body: columnResquest,
                params: projectParms,
                response: {
                    201: columnResponse,
                    400: errorResponseSchema,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { name } = req.body;
            const { projectId } = req.params;

            const column = await columnService.create(name, projectId);
            return rep.status(201).send(column);
        }
    );

    app.get(
        '/project/:projectId/columns',
        {
            schema: {
                params: projectParms,
                response: {
                    200: columnArrayResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },

        async (req, rep) => {
            const { projectId } = req.params;
            const columns = await columnService.findByProjectId(projectId);

            return rep.status(200).send(columns);
        }
    );

    app.patch(
        '/columns/:columnId',
        {
            preHandler: authHandler,
            schema: {
                body: columnResquest,
                params: columnParms,
                response: {
                    200: columnResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { name } = req.body;
            const { columnId } = req.params;

            const column = await columnService.update(columnId, name);

            return rep.status(200).send(column);
        }
    );

    app.delete(
        '/columns/:columnId',
        {
            preHandler: authHandler,
            schema: {
                params: columnParms,
                response: {
                    200: successResponseSchema,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { columnId } = req.params;

            await columnService.delete(columnId);

            return rep.status(200).send({
                message: 'Column deleted successfully',
            });
        }
    );
};
