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
import { FastifyTypeInstance } from '../../../types';
import { userData } from '../../factories/user.factory';

describe('Update User', () => {
    let app: FastifyTypeInstance;

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

    it('200 - should update provided fields and keep others intact', async () => {
        const original = userData({ email: 'update-original@example.com' });

        const createRes = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: original,
        });
        expect(createRes.statusCode).toBe(201);
        const created = JSON.parse(createRes.payload);

        const updatePayload = {
            name: 'Jane Updated',
            email: 'updated@example.com',
        };

        const updateRes = await app.inject({
            method: 'PATCH',
            url: `/api/users/${created.id}`,
            payload: updatePayload,
        });
        expect(updateRes.statusCode).toBe(200);
        const updated = JSON.parse(updateRes.payload);

        expect(updated.id).toBe(created.id);
        expect(updated.name).toBe('Jane Updated');
        expect(updated.email).toBe('updated@example.com');
        expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
            new Date(updated.createdAt).getTime()
        );
        expect(updated.password).toBeUndefined();
    });

    it('404 - should return not found when id does not exist', async () => {
        const res = await app.inject({
            method: 'PATCH',
            url: `/api/users/00000000-0000-0000-0000-000000000000`,
            payload: { name: 'No One' },
        });

        expect(res.statusCode).toBe(404);
        const body = JSON.parse(res.payload);
        expect(body.message).toBe('User not found');
    });

    it('422 - should fail when id is not a valid uuid', async () => {
        const res = await app.inject({
            method: 'PATCH',
            url: `/api/users/not-a-uuid`,
            payload: { name: 'Invalid' },
        });

        expect(res.statusCode).toBe(422);
        const body = JSON.parse(res.payload);
        expect(body.message).toBe('Validation failed');
    });

    it('422 - should fail when email is invalid', async () => {
        const original = userData({ email: 'update-invalid@example.com' });
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: original,
        });
        expect(createRes.statusCode).toBe(201);
        const created = JSON.parse(createRes.payload);

        const res = await app.inject({
            method: 'PATCH',
            url: `/api/users/${created.id}`,
            payload: { email: 'invalid-email' },
        });

        expect(res.statusCode).toBe(422);
        const body = JSON.parse(res.payload);
        expect(body.message).toBe('Validation failed');
    });

    it('422 - should fail when password is too short', async () => {
        const original = userData({ email: 'update-pass-short@example.com' });
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: original,
        });
        expect(createRes.statusCode).toBe(201);
        const created = JSON.parse(createRes.payload);

        const res = await app.inject({
            method: 'PATCH',
            url: `/api/users/${created.id}`,
            payload: { password: '123' },
        });

        expect(res.statusCode).toBe(422);
        const body = JSON.parse(res.payload);
        expect(body.message).toBe('Validation failed');
    });

    it('200 - should allow updating only the password', async () => {
        const original = userData({
            email: 'only-pass@example.com',
            password: 'oldpass',
        });
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: original,
        });
        expect(createRes.statusCode).toBe(201);
        const created = JSON.parse(createRes.payload);

        const res = await app.inject({
            method: 'PATCH',
            url: `/api/users/${created.id}`,
            payload: { password: 'newpass123' },
        });

        expect(res.statusCode).toBe(200);
        const updated = JSON.parse(res.payload);
        expect(updated.id).toBe(created.id);
        expect(updated.name).toBe(created.name);
        expect(updated.email).toBe(created.email);
        expect(updated.password).toBeUndefined();
    });
});
