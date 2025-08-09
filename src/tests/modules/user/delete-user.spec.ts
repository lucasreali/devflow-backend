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

describe('Delete User', () => {
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

    it('200 - should delete a user successfully', async () => {
        const data = userData({ email: 'delete-user@example.com' });

        const createRes = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });
        expect(createRes.statusCode).toBe(201);
        const created = JSON.parse(createRes.payload);

        const deleteRes = await app.inject({
            method: 'DELETE',
            url: `/api/users/${created.id}`,
        });
        expect(deleteRes.statusCode).toBe(200);
        const body = JSON.parse(deleteRes.payload);
        expect(body.message).toBe('User deleted successfully');

        // ensure it was really deleted
        const getRes = await app.inject({
            method: 'GET',
            url: `/api/users/${created.id}`,
        });
        expect(getRes.statusCode).toBe(404);
    });

    it('404 - should return not found when id does not exist', async () => {
        const res = await app.inject({
            method: 'DELETE',
            url: `/api/users/00000000-0000-0000-0000-000000000000`,
        });
        expect(res.statusCode).toBe(404);
        const body = JSON.parse(res.payload);
        expect(body.message).toBe('User not found');
    });

    it('422 - should fail when id is not a valid uuid', async () => {
        const res = await app.inject({
            method: 'DELETE',
            url: `/api/users/not-a-uuid`,
        });
        expect(res.statusCode).toBe(422);
        const body = JSON.parse(res.payload);
        expect(body.message).toBe('Validation failed');
    });
});
