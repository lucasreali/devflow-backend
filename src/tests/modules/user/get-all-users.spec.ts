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

describe('Get all users', () => {
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

    it('200 - should return an empty list when there are no users', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/users',
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.payload);
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
    });

    it('200 - should return all users successfully', async () => {
        const first = userData({ email: 'user1@example.com' });
        const second = userData({ email: 'user2@example.com' });

        const create1 = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: first,
        });
        expect(create1.statusCode).toBe(201);
        

        const create2 = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: second,
        });
        expect(create2.statusCode).toBe(201);

        const res = await app.inject({
            method: 'GET',
            url: '/api/users',
        });

        expect(res.statusCode).toBe(200);
        const list = JSON.parse(res.payload);

        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBe(2);

        const emails = list.map((u: any) => u.email).sort();
        expect(emails).toEqual(['user1@example.com', 'user2@example.com']);

        list.forEach((u: any) => {
            expect(u.id).toBeDefined();
            expect(u.name).toBeDefined();
            expect(u.email).toBeDefined();
            expect(u.createdAt).toBeDefined();
            expect(u.updatedAt).toBeDefined();
            expect(u.password).toBeUndefined();
        });
    });
});
