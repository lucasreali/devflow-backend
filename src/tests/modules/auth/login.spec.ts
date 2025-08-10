import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { build } from '../../../app';
import { db } from '../../../core/database/db';
import { users } from '../../../core/database/schema';
import { authService } from '../../../modules/auth/auth.service';
import { FastifyTypeInstance } from '../../../types';
import { userData } from '../../factories/user.factory';

describe('Auth - Login', () => {
    let app: FastifyTypeInstance;

    beforeEach(async () => {
        // Garantir segredo JWT para geração/validação de token
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
        authService.secret = process.env.JWT_SECRET as unknown as any;

        app = build();
        await db.delete(users);
    });

    afterEach(async () => {
        await db.delete(users);
    });

    afterAll(async () => {
        await app.close();
    });

    it('200 - should login successfully and return a token', async () => {
        const data = userData();

        const create = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });
        expect(create.statusCode).toBe(201);

        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: data.email, password: data.password },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload) as { token: string };
        expect(typeof body.token).toBe('string');
        expect(body.token.length).toBeGreaterThan(10);
    });

    it('404 - should return not found when user does not exist', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: 'unknown@example.com', password: 'pass123' },
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.payload) as { message: string };
        expect(body.message).toBe('User not found');
    });

    it('401 - should return unauthorized when password is invalid', async () => {
        const data = userData({
            email: 'john@example.com',
            password: 'correct',
        });

        const create = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });
        expect(create.statusCode).toBe(201);

        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: data.email, password: 'wrong' },
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload) as { message: string };
        expect(body.message).toBe('Invalid credentials');
    });

    it('422 - should fail when payload is invalid (invalid email)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: 'not-an-email', password: 'pass123' },
        });

        expect(response.statusCode).toBe(422);
        const body = JSON.parse(response.payload) as { message: string };
        expect(body.message).toBe('Validation failed');
    });

    it('422 - should fail when payload is invalid (missing password)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: 'user@example.com' },
        });

        expect(response.statusCode).toBe(422);
        const body = JSON.parse(response.payload) as { message: string };
        expect(body.message).toBe('Validation failed');
    });
});
