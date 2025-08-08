import { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { build } from '../../app';
import { db } from '../../core/database/db';
import { users } from '../../core/database/schema';

describe('Create User', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = build();
        await db.delete(users);
    });

    afterEach(async () => {
        await db.delete(users);
        await app.close();
    });

    it('should create a new user successfully', async () => {
        const userData = {
            name: 'João Silva',
            email: 'joao@example.com',
            password: 'senha123',
        };

        const response = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: userData,
        });

        expect(response.statusCode).toBe(201);

        const createdUser = JSON.parse(response.payload);

        expect(createdUser.name).toBe(userData.name);
        expect(createdUser.email).toBe(userData.email);
        expect(createdUser.id).toBeDefined();
        expect(createdUser.createdAt).toBeDefined();
        expect(createdUser.updatedAt).toBeDefined();

        expect(createdUser.password).toBeUndefined();
    });
});
