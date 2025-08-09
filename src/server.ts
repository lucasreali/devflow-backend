import 'dotenv/config';
import { build } from './app';

const app = build();

const run = async () => {
    try {
        const port = Number(process.env.PORT) || 8080;
        const host = process.env.HOST || '0.0.0.0';
        await app.listen({ port, host });
        console.log(`HTTP server running on port ${port}`);
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};

run();
