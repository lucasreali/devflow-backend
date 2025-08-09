import { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { build } from '../../../app';
import { db } from '../../../core/database/db';
import { users } from '../../../core/database/schema';
import { userData } from '../../factories/user.factory';

describe('Get User by id', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = build();
    });

    beforeEach(async () => {
        await db.delete(users);
    });

    afterEach(async () => {
        await db.delete(users);
    });

    afterAll(async () => {
        await app.close();
    });

    it('201 - should return the user by id', async () => {
        const data = userData();

        const createRes = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });

        expect(createRes.statusCode).toBe(201);
        const createdUser = JSON.parse(createRes.payload);

        const getRes = await app.inject({
            method: 'GET',
            url: `/api/users/${createdUser.id}`,
        });

        expect(getRes.statusCode).toBe(200);
        const user = JSON.parse(getRes.payload);

        expect(user.id).toBe(createdUser.id);
        expect(user.name).toBe(data.name);
        expect(user.email).toBe(data.email);
        expect(user.createdAt).toBeDefined();
        expect(user.updatedAt).toBeDefined();
        expect(user.password).toBeUndefined();
    });

    it('404 - should return not found when id does not exist', async () => {
        const nonExistentId = randomUUID();

        const res = await app.inject({
            method: 'GET',
            url: `/api/users/${nonExistentId}`,
        });

        expect(res.statusCode).toBe(404);
        const body = JSON.parse(res.payload);
        expect(body.message).toBe('User not found');
    });

    it('422 - should fail when id is not a valid uuid', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/users/not-a-uuid`,
        });

        expect(res.statusCode).toBe(422);
        const body = JSON.parse(res.payload);
        expect(body.message).toBe('Validation failed');
    });
});
