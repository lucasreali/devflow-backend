import { userController } from './modules/user/user.controller';
import { FastifyTypeInstance } from './types';

export const routes = (app: FastifyTypeInstance) => {
    app.register(userController);
};
