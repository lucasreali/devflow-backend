import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { build } from '../../../app';
import { db } from '../../../core/database/db';
import { projects, users } from '../../../core/database/schema';
import { authService } from '../../../modules/auth/auth.service';
import { FastifyTypeInstance } from '../../../types';
import { projectData } from '../../factories/project.factory';
import { userData } from '../../factories/user.factory';

describe('Get Project by ID', () => {
    let app: FastifyTypeInstance;
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
        authService.secret = process.env.JWT_SECRET as unknown as any;

        app = build();
        await db.delete(projects);
        await db.delete(users);

        // Create user
        const user = userData();
        const createUserResponse = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: user,
        });

        expect(createUserResponse.statusCode).toBe(201);
        const createdUser = JSON.parse(createUserResponse.payload);
        userId = createdUser.id;

        // Login to get auth token
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

    it('200 - should return the project by id', async () => {
        const projectPayload = projectData();

        // Create project first
        const createResponse = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: projectPayload,
        });

        expect(createResponse.statusCode).toBe(201);
        const createdProject = JSON.parse(createResponse.payload);

        // Get project by id
        const getResponse = await app.inject({
            method: 'GET',
            url: `/api/project/${createdProject.id}`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
        });

        expect(getResponse.statusCode).toBe(200);
        const retrievedProject = JSON.parse(getResponse.payload);

        expect(retrievedProject.id).toBe(createdProject.id);
        expect(retrievedProject.name).toBe(projectPayload.name);
        expect(retrievedProject.description).toBe(projectPayload.description);
        expect(retrievedProject.createdAt).toBeDefined();
        expect(retrievedProject.updatedAt).toBeDefined();
    });

    it('200 - should return project with null description', async () => {
        const projectPayload = { name: 'Test Project' };

        // Create project without description
        const createResponse = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: projectPayload,
        });

        expect(createResponse.statusCode).toBe(201);
        const createdProject = JSON.parse(createResponse.payload);

        // Get project by id
        const getResponse = await app.inject({
            method: 'GET',
            url: `/api/project/${createdProject.id}`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
        });

        expect(getResponse.statusCode).toBe(200);
        const retrievedProject = JSON.parse(getResponse.payload);

        expect(retrievedProject.id).toBe(createdProject.id);
        expect(retrievedProject.name).toBe(projectPayload.name);
        expect(retrievedProject.description).toBeNull();
        expect(retrievedProject.createdAt).toBeDefined();
        expect(retrievedProject.updatedAt).toBeDefined();
    });

    it('404 - should return not found when project does not exist', async () => {
        const nonExistentId = randomUUID();

        const response = await app.inject({
            method: 'GET',
            url: `/api/project/${nonExistentId}`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.payload);
        expect(body.message).toBe('Project not found');
    });

    it('422 - should fail when projectId is not a valid uuid', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/project/not-a-uuid`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
        });

        expect(response.statusCode).toBe(422);
        const body = JSON.parse(response.payload);
        expect(body.message).toBe('Validation failed');
    });
});
