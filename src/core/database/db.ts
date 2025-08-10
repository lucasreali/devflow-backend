import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString });

const enableLogs = process.env.NODE_ENV === 'test';

const testLogger = {
    logQuery(query: string, params: unknown[]) {
        console.log('[drizzle]', query, params);
    },
};

export const db = drizzle(pool, {
    logger: enableLogs ? testLogger : false,
});
