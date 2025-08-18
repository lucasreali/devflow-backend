import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { build } from '../../../app';
import { db } from '../../../core/database/db';
import { projects, users } from '../../../core/database/schema';
import { authService } from '../../../modules/auth/auth.service';
import { FastifyTypeInstance } from '../../../types';
import { projectData } from '../../factories/project.factory';
import { userData } from '../../factories/user.factory';

describe('Update Project', () => {
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

    it('200 - should update provided fields and keep others intact', async () => {
        const originalProject = projectData({
            name: 'Original Project',
            description: 'Original description',
        });

        // Create project
        const createResponse = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: originalProject,
        });

        expect(createResponse.statusCode).toBe(201);
        const createdProject = JSON.parse(createResponse.payload);

        const updatePayload = {
            name: 'Updated Project Name',
            description: 'Updated description',
        };

        // Update project
        const updateResponse = await app.inject({
            method: 'PATCH',
            url: `/api/projects/${createdProject.id}`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: updatePayload,
        });

        expect(updateResponse.statusCode).toBe(200);
        const updatedProject = JSON.parse(updateResponse.payload);

        expect(updatedProject.id).toBe(createdProject.id);
        expect(updatedProject.name).toBe('Updated Project Name');
        expect(updatedProject.description).toBe('Updated description');
        expect(
            new Date(updatedProject.updatedAt).getTime()
        ).toBeGreaterThanOrEqual(new Date(updatedProject.createdAt).getTime());
        expect(updatedProject.createdAt).toBe(createdProject.createdAt);
    });

    it('200 - should allow updating only the name', async () => {
        const originalProject = projectData({
            name: 'Original Name',
            description: 'Original description',
        });

        // Create project
        const createResponse = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: originalProject,
        });

        expect(createResponse.statusCode).toBe(201);
        const createdProject = JSON.parse(createResponse.payload);

        const updatePayload = {
            name: 'Only Name Updated',
        };

        // Update project
        const updateResponse = await app.inject({
            method: 'PATCH',
            url: `/api/projects/${createdProject.id}`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: updatePayload,
        });

        expect(updateResponse.statusCode).toBe(200);
        const updatedProject = JSON.parse(updateResponse.payload);

        expect(updatedProject.id).toBe(createdProject.id);
        expect(updatedProject.name).toBe('Only Name Updated');
        expect(updatedProject.description).toBe(originalProject.description);
    });

    it('200 - should allow updating only the description', async () => {
        const originalProject = projectData({
            name: 'Original Name',
            description: 'Original description',
        });

        // Create project
        const createResponse = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: originalProject,
        });

        expect(createResponse.statusCode).toBe(201);
        const createdProject = JSON.parse(createResponse.payload);

        const updatePayload = {
            description: 'Only description updated',
        };

        // Update project
        const updateResponse = await app.inject({
            method: 'PATCH',
            url: `/api/projects/${createdProject.id}`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: updatePayload,
        });

        expect(updateResponse.statusCode).toBe(200);
        const updatedProject = JSON.parse(updateResponse.payload);

        expect(updatedProject.id).toBe(createdProject.id);
        expect(updatedProject.name).toBe(originalProject.name);
        expect(updatedProject.description).toBe('Only description updated');
    });

    it('200 - should keep original description when omitted from update', async () => {
        const originalProject = projectData({
            name: 'Original Name',
            description: 'Original description',
        });

        // Create project
        const createResponse = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: originalProject,
        });

        expect(createResponse.statusCode).toBe(201);
        const createdProject = JSON.parse(createResponse.payload);

        const updatePayload = {
            name: 'Updated Name',
            // description omitted - should keep original value
        };

        // Update project
        const updateResponse = await app.inject({
            method: 'PATCH',
            url: `/api/projects/${createdProject.id}`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: updatePayload,
        });

        expect(updateResponse.statusCode).toBe(200);
        const updatedProject = JSON.parse(updateResponse.payload);

        expect(updatedProject.id).toBe(createdProject.id);
        expect(updatedProject.name).toBe('Updated Name');
        expect(updatedProject.description).toBe(originalProject.description);
    });

    it('404 - should return not found when project does not exist', async () => {
        const nonExistentId = randomUUID();

        const response = await app.inject({
            method: 'PATCH',
            url: `/api/projects/${nonExistentId}`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: {
                name: 'Updated Name',
            },
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.payload);
        expect(body.message).toBe(
            'User does not have permission to update this project'
        );
    });

    it('422 - should fail when projectId is not a valid uuid', async () => {
        const response = await app.inject({
            method: 'PATCH',
            url: `/api/projects/not-a-uuid`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: {
                name: 'Updated Name',
            },
        });

        expect(response.statusCode).toBe(422);
        const body = JSON.parse(response.payload);
        expect(body.message).toBe('Validation failed');
    });

    it('422 - should fail when name is too short', async () => {
        const originalProject = projectData();

        // Create project
        const createResponse = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: originalProject,
        });

        expect(createResponse.statusCode).toBe(201);
        const createdProject = JSON.parse(createResponse.payload);

        const updatePayload = {
            name: 'AB', // Too short (less than 3 characters)
        };

        // Update project
        const updateResponse = await app.inject({
            method: 'PATCH',
            url: `/api/projects/${createdProject.id}`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: updatePayload,
        });

        expect(updateResponse.statusCode).toBe(422);
        const body = JSON.parse(updateResponse.payload);
        expect(body.message).toBe('Validation failed');
    });
});
