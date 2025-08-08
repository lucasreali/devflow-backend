import { FastifyTypeInstance } from '../../types';
import { authLoginRequest, authLoginResponse } from './auth.dto';
import { authService } from './auth.service';

export const authController = (app: FastifyTypeInstance) => {
    app.post(
        '/login',
        {
            schema: {
                tags: ['auth'],
                body: authLoginRequest,
                response: {
                    200: authLoginResponse,
                },
            },
        },
        async (req, rep) => {
            const credentials = req.body;
            const token = await authService.login(credentials);
            return rep.status(200).send(token);
        }
    );
};
