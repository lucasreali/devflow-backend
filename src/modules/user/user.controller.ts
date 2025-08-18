import { authHandler } from '../../core/middleware/auth-handler';
import { permissionHandler } from '../../core/middleware/permission-handler';
import {
    errorResponseSchema,
    successResponseSchema,
} from '../../core/schemas/response-schemas';
import { FastifyTypeInstance } from '../../types';
import {
    listUserResponse,
    userParms,
    userRequest,
    userResponse,
    userUpdateRequest,
} from './user.dto';
import { userService } from './user.service';

export const userController = (app: FastifyTypeInstance) => {
    app.post(
        '/users',
        {
            schema: {
                tags: ['users'],
                description: 'Create',
                body: userRequest,
                response: {
                    201: userResponse,
                },
            },
        },
        async (req, rep) => {
            const user = req.body;
            const newUser = await userService.create(user);
            return rep.status(201).send(newUser);
        }
    );

    app.get(
        '/users/:userId',
        {
            schema: {
                tags: ['users'],
                description: 'Find by id',
                params: userParms,
                response: {
                    200: userResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { userId } = req.params;
            const user = await userService.findById(userId);
            return rep.status(200).send(user);
        }
    );

    app.get(
        '/users',
        {
            schema: {
                tags: ['users'],
                description: 'Find all',
                response: { 200: listUserResponse },
            },
        },
        async (req, rep) => {
            const users = await userService.findAll();
            return rep.status(200).send(users);
        }
    );

    app.patch(
        '/users/:userId',
        {
            schema: {
                tags: ['users'],
                description: 'Update',
                params: userParms,
                body: userUpdateRequest,
                response: {
                    200: userResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { userId } = req.params;
            const user = req.body;
            const newUser = await userService.update(userId, user);
            return rep.status(200).send(newUser);
        }
    );

    app.delete(
        '/users/:userId',
        {
            schema: {
                tags: ['users'],
                description: 'Delete',
                params: userParms,
                response: {
                    200: successResponseSchema,
                    404: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { userId } = req.params;
            await userService.delete(userId);
            return rep
                .status(200)
                .send({ message: 'User deleted successfully' });
        }
    );
};
