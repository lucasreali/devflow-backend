import { authHandler } from '../../../core/middleware/auth-handler';
import { FastifyTypeInstance } from '../../../types';
import { projectParms } from '../../project/project.dto';
import { columnResquest } from './column.dto';
import { columnService } from './column.service';

export const columnController = (app: FastifyTypeInstance) => {
    app.post(
        '/columns',
        {
            preHandler: authHandler,
            schema: {
                body: columnResquest,
                params: projectParms,
            },
        },
        async (req, rep) => {
            const { name } = req.body;
            const { projectId } = req.params;

            const column = await columnService.create(name, projectId);
            return rep.status(201).send(column);
        }
    );
};
