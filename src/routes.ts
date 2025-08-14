import { authController } from './modules/auth/auth.controller';
import { projectController } from './modules/project/project.controller';
import { userController } from './modules/user/user.controller';
import { FastifyTypeInstance } from './types';

export const routes = (app: FastifyTypeInstance) => {
    app.register(userController);
    app.register(authController, { prefix: '/auth' });
    app.register(projectController, {prefix: '/user'})
};
