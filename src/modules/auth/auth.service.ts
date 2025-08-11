import { compare } from 'bcrypt';
import { Secret, sign } from 'jsonwebtoken';
import { NotFoundError } from '../../core/errors/NotFoundError';
import { UnauthorizedError } from '../../core/errors/UnauthorizedError';
import { userRepository } from '../user/user.repository';
import { accountRepository } from './account.repository';
import { authLoginRequestStatic, jwtPayloadStatic } from './auth.dto';

export const authService = {
    secret: process.env.JWT_SECRET as Secret,

    async login(credentials: authLoginRequestStatic) {
        const [user] = await userRepository.findByEmail(credentials.email);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const isMatch = await compare(credentials.password, user.password);

        if (!isMatch) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const [account] = await accountRepository.findByUserId(user.id);

        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: account.avatarUrl,
        } as jwtPayloadStatic;

        if (!this.secret) {
            throw new Error('JWT secret is not defined');
        }

        const token = sign(payload, this.secret, { expiresIn: '1d' });

        return { token };
    },

    async githubFromAccessToken(accessToken: string) {
        const headers = this.buildGithubHeaders(accessToken);

        const profile = await this.fetchGithubProfile(headers);
        const emails = await this.fetchGithubEmails(headers);
        const primaryEmail = this.pickPrimaryEmail(emails);

        if (!primaryEmail) {
            throw new UnauthorizedError(
                'No verified email found in GitHub account'
            );
        }

        const [user] = await userRepository.findByEmail(primaryEmail);
        if (!user) {
            throw new UnauthorizedError(
                'No local account associated with this GitHub email'
            );
        }

        if (!this.secret) {
            throw new Error('JWT secret is not defined');
        }

        await accountRepository.create({
            userId: user.id,
            githubId: profile.id,
            avatarUrl: profile.avatar_url,
            login: profile.login,
        });

        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: profile.avatar_url,
        } as jwtPayloadStatic;

        const token = sign(payload, this.secret, { expiresIn: '1d' });
        return { token };
    },

    buildGithubHeaders(accessToken: string) {
        return {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'DevFlow',
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
        } as const;
    },

    async fetchGithubProfile(headers: Record<string, string>) {
        const res = await fetch('https://api.github.com/user', { headers });
        if (!res.ok)
            throw new UnauthorizedError('Failed to fetch GitHub profile');
        return (await res.json()) as {
            id: string;
            name: string | null;
            login: string;
            avatar_url: string;
        };
    },

    async fetchGithubEmails(headers: Record<string, string>) {
        const res = await fetch('https://api.github.com/user/emails', {
            headers,
        });
        if (!res.ok)
            throw new UnauthorizedError('Failed to fetch GitHub emails');
        return (await res.json()) as Array<{
            email: string;
            primary: boolean;
            verified: boolean;
        }>;
    },

    pickPrimaryEmail(
        emails: Array<{ email: string; primary: boolean; verified: boolean }>
    ) {
        return (
            emails.find((e) => e.primary && e.verified)?.email ??
            emails[0]?.email
        );
    },
};
