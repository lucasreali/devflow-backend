import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { build } from '../../../app';
import { db } from '../../../core/database/db';
import { users } from '../../../core/database/schema';
import { authService } from '../../../modules/auth/auth.service';
import { FastifyTypeInstance } from '../../../types';
import { userData } from '../../factories/user.factory';

describe('Verify Token', () => {
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

    it('200 - should verify a valid token successfully', async () => {
        const data = userData();

        // Create user
        const createUser = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });
        expect(createUser.statusCode).toBe(201);

        // Login to get token
        const loginResponse = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: data.email, password: data.password },
        });
        expect(loginResponse.statusCode).toBe(200);
        const { token } = JSON.parse(loginResponse.payload) as {
            token: string;
        };

        // Verify token
        const response = await app.inject({
            method: 'GET',
            url: '/api/auth/verify',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload) as { message: string };
        expect(body.message).toBe('Valid token');
    });

    it('401 - should return unauthorized when no authorization header is provided', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/auth/verify',
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload) as { message: string };
        expect(body.message).toBe('Missing or invalid Authorization header');
    });

    it('401 - should return unauthorized when authorization header format is invalid', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/auth/verify',
            headers: {
                Authorization: 'InvalidFormat token123',
            },
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload) as { message: string };
        expect(body.message).toBe('Missing or invalid Authorization header');
    });

    it('401 - should return unauthorized when token is invalid', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/auth/verify',
            headers: {
                Authorization: 'Bearer invalid.token.here',
            },
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload) as { message: string };
        expect(body.message).toBe('Invalid token');
    });

    it('401 - should return unauthorized when token is expired', async () => {
        const data = userData();

        // Create user
        const createUser = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });
        expect(createUser.statusCode).toBe(201);

        // Mock an expired token using jsonwebtoken directly
        const jwt = require('jsonwebtoken');
        const expiredToken = jwt.sign(
            {
                id: 'some-uuid',
                email: data.email,
                name: data.name,
                role: 'USER',
                avatarUrl: null,
            },
            authService.secret,
            { expiresIn: '-1h' } // Token expired 1 hour ago
        );

        const response = await app.inject({
            method: 'GET',
            url: '/api/auth/verify',
            headers: {
                Authorization: `Bearer ${expiredToken}`,
            },
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload) as { message: string };
        expect(body.message).toBe('Token expired');
    });

    it('401 - should return unauthorized when user no longer exists', async () => {
        const data = userData();

        // Create user
        const createUser = await app.inject({
            method: 'POST',
            url: '/api/users',
            payload: data,
        });
        expect(createUser.statusCode).toBe(201);
        const createdUser = JSON.parse(createUser.payload);

        // Login to get token
        const loginResponse = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { email: data.email, password: data.password },
        });
        expect(loginResponse.statusCode).toBe(200);
        const { token } = JSON.parse(loginResponse.payload) as {
            token: string;
        };

        // Delete the user
        const deleteUser = await app.inject({
            method: 'DELETE',
            url: `/api/users/${createdUser.id}`,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        expect(deleteUser.statusCode).toBe(200);

        // Try to verify token after user deletion
        const response = await app.inject({
            method: 'GET',
            url: '/api/auth/verify',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload) as { message: string };
        expect(body.message).toBe('Invalid or expired token');
    });
});
