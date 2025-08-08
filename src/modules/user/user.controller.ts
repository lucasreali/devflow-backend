import z from 'zod';
import { errorResponseSchema } from '../../core/schemas/responseSchemas';
import { FastifyTypeInstance } from '../../types';
import {
    listUserResponse,
    userParms,
    userRequest,
    userResponse,
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
        '/users/:id',
        {
            schema: {
                tags: ['users'],
                description: 'Find by id',
                params: userParms,
                response: {
                    200: userResponse,
                    404: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { id } = req.params;
            const user = await userService.findById(id);
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

    app.delete(
        '/users/:id',
        {
            schema: {
                tags: ['users'],
                description: 'Delete',
                params: userParms,
                response: {
                    200: z.object({ message: z.string() }),
                    404: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { id } = req.params;
            await userService.delete(id);
            return rep
                .status(200)
                .send({ message: 'User deleted successfully' });
        }
    );
};
