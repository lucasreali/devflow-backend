import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { build } from '../../../app';
import { db } from '../../../core/database/db';
import { users } from '../../../core/database/schema';
import { FastifyTypeInstance } from '../../../types';
import { userData } from '../../factories/user.factory';

describe('Create User', () => {
    let app: FastifyTypeInstance;

    beforeEach(async () => {
        app = build();
        await db.delete(users);
    });

    afterEach(async () => {
        await db.delete(users);
    });

    afterAll(async () => {
        await app.close();
    });

    it('200 - should create a new user successfully', async () => {
        const data = userData();

        const response = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });

        expect(response.statusCode).toBe(201);

        const createdUser = JSON.parse(response.payload);

        expect(createdUser.name).toBe(data.name);
        expect(createdUser.email).toBe(data.email);
        expect(createdUser.id).toBeDefined();
        expect(createdUser.createdAt).toBeDefined();
        expect(createdUser.updatedAt).toBeDefined();

        expect(createdUser.password).toBeUndefined();
    });

    it('409 - should not allow duplicate email', async () => {
        const data = userData({ email: 'duplicate@example.com' });

        const first = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });
        expect(first.statusCode).toBe(201);

        const second = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });
        expect(second.statusCode).toBe(409);
        const body = JSON.parse(second.payload);
        expect(body.message).toBe('Email already in use');
    });

    it('422 - should fail when email is invalid', async () => {
        const data = userData({ email: 'invalid-email' });

        const res = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });

        expect(res.statusCode).toBe(422);
        const body = JSON.parse(res.payload);
        expect(body.message).toBe('Validation failed');
    });

    it('422 - should fail when password is too short', async () => {
        const data = userData({ password: '123' });

        const res = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });

        expect(res.statusCode).toBe(422);
        const body = JSON.parse(res.payload);
        expect(body.message).toBe('Validation failed');
    });

    it('422 - should fail with when name is missing', async () => {
        const { name, ...rest } = userData();

        const res = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: rest as any,
        });

        expect(res.statusCode).toBe(422);
        const body = JSON.parse(res.payload);
        expect(body.message).toBe('Validation failed');
    });
});
