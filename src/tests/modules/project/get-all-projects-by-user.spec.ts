import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { build } from '../../../app';
import { db } from '../../../core/database/db';
import { projects, users } from '../../../core/database/schema';
import { authService } from '../../../modules/auth/auth.service';
import { FastifyTypeInstance } from '../../../types';
import { projectData } from '../../factories/project.factory';
import { userData } from '../../factories/user.factory';

describe('Get All Projects by User', () => {
    let app: FastifyTypeInstance;
    let authToken: string;
    let userId: string;

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
        const createdUser = JSON.parse(createUserResponse.payload);
        userId = createdUser.id;

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

    it('200 - should return an empty list when user has no projects', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
        });

        expect(response.statusCode).toBe(200);
        const projects = JSON.parse(response.payload);
        expect(Array.isArray(projects)).toBe(true);
        expect(projects.length).toBe(0);
    });

    it('200 - should return all projects for a user successfully', async () => {
        const project1 = {
            name: 'First Project',
            description: 'First description',
        };
        const project2 = {
            name: 'Second Project',
            description: 'Second description',
        };
        const project3 = { name: 'Third Project' };

        const create1 = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: project1,
        });
        expect(create1.statusCode).toBe(201);

        const create2 = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: project2,
        });
        expect(create2.statusCode).toBe(201);

        const create3 = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: project3,
        });
        expect(create3.statusCode).toBe(201);

        const response = await app.inject({
            method: 'GET',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
        });

        expect(response.statusCode).toBe(200);
        const projects = JSON.parse(response.payload);

        expect(Array.isArray(projects)).toBe(true);
        expect(projects.length).toBe(3);

        const sortedProjects = projects.sort((a: any, b: any) =>
            a.name.localeCompare(b.name)
        );

        expect(sortedProjects[0].name).toBe('First Project');
        expect(sortedProjects[0].description).toBe('First description');
        expect(sortedProjects[0].id).toBeDefined();
        expect(sortedProjects[0].createdAt).toBeDefined();
        expect(sortedProjects[0].updatedAt).toBeDefined();

        expect(sortedProjects[1].name).toBe('Second Project');
        expect(sortedProjects[1].description).toBe('Second description');
        expect(sortedProjects[1].id).toBeDefined();
        expect(sortedProjects[1].createdAt).toBeDefined();
        expect(sortedProjects[1].updatedAt).toBeDefined();

        expect(sortedProjects[2].name).toBe('Third Project');
        expect(sortedProjects[2].description).toBeNull();
        expect(sortedProjects[2].id).toBeDefined();
        expect(sortedProjects[2].createdAt).toBeDefined();
        expect(sortedProjects[2].updatedAt).toBeDefined();

        projects.forEach((project: any) => {
            expect(project.id).toBeDefined();
            expect(project.name).toBeDefined();
            expect(project.createdAt).toBeDefined();
            expect(project.updatedAt).toBeDefined();
            expect(
                typeof project.description === 'string' ||
                    project.description === null
            ).toBe(true);
        });
    });

    it('200 - should only return projects belonging to the authenticated user', async () => {
        const anotherUser = userData();
        const createAnotherUserResponse = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: anotherUser,
        });

        expect(createAnotherUserResponse.statusCode).toBe(201);

        const loginAnotherUserResponse = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                email: anotherUser.email,
                password: anotherUser.password,
            },
        });

        expect(loginAnotherUserResponse.statusCode).toBe(200);
        const anotherLoginBody = JSON.parse(loginAnotherUserResponse.payload);
        const anotherAuthToken = anotherLoginBody.token;

        const userProject = projectData({ name: 'User Project' });
        const createUserProject = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
            payload: userProject,
        });
        expect(createUserProject.statusCode).toBe(201);

        const otherUserProject = projectData({ name: 'Other User Project' });
        const createOtherUserProject = await app.inject({
            method: 'POST',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${anotherAuthToken}`,
            },
            payload: otherUserProject,
        });
        expect(createOtherUserProject.statusCode).toBe(201);

        const response = await app.inject({
            method: 'GET',
            url: `/api/projects`,
            headers: {
                authorization: `Bearer ${authToken}`,
            },
        });

        expect(response.statusCode).toBe(200);
        const projects = JSON.parse(response.payload);

        expect(Array.isArray(projects)).toBe(true);
        expect(projects.length).toBe(1);
        expect(projects[0].name).toBe('User Project');
    });
});
