import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { build } from '../../../app';
import { db } from '../../../core/database/db';
import { projects, users } from '../../../core/database/schema';
import { authService } from '../../../modules/auth/auth.service';
import { FastifyTypeInstance } from '../../../types';
import { projectData } from '../../factories/project.factory';
import { userData } from '../../factories/user.factory';

describe('Create Project', () => {
    let app: FastifyTypeInstance;
    let authToken: string;

    beforeEach(async () => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
        authService.secret = process.env.JWT_SECRET as unknown as any;

        app = build();
        await db.delete(projects);
        await db.delete(users);

        const user = userData();
        const createUserResponse = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: user,
        });

        expect(createUserResponse.statusCode).toBe(201);

        const loginResponse = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: user.email, password: user.password },
        });

        expect(loginResponse.statusCode).toBe(200);
        const loginBody = JSON.parse(loginResponse.payload);
        authToken = loginBody.token;
    });

    afterEach(async () => {
        await db.delete(projects);
        await db.delete(users);
    });

    afterAll(async () => {
        await app.close();
    });

    it('201 - should create a new project successfully', async () => {
        const data = projectData();

        const response = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: data,
        });

        expect(response.statusCode).toBe(201);

        const createdProject = JSON.parse(response.payload);

        expect(createdProject.name).toBe(data.name);
        expect(createdProject.description).toBe(data.description);
        expect(createdProject.id).toBeDefined();
        expect(createdProject.createdAt).toBeDefined();
        expect(createdProject.updatedAt).toBeDefined();
    });

    it('201 - should create a project without description', async () => {
        const data = { name: 'Test Project' };

        const response = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: data,
        });

        expect(response.statusCode).toBe(201);

        const createdProject = JSON.parse(response.payload);

        expect(createdProject.name).toBe(data.name);
        expect(createdProject.description).toBeNull();
        expect(createdProject.id).toBeDefined();
        expect(createdProject.createdAt).toBeDefined();
        expect(createdProject.updatedAt).toBeDefined();
    });

    it('422 - should fail when name is missing', async () => {
        const data = { description: 'Test description' };

        const response = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: data,
        });

        expect(response.statusCode).toBe(422);
        const body = JSON.parse(response.payload);
        expect(body.message).toBe('Validation failed');
    });

    it('422 - should fail when name is empty string', async () => {
        const data = { name: '' };

        const response = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: data,
        });

        expect(response.statusCode).toBe(422);
        const body = JSON.parse(response.payload);
        expect(body.message).toBe('Validation failed');
    });
});
