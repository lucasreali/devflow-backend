import 'dotenv/config';
import { build } from './app';

const app = build();

const run = async () => {
    try {
        const port = process.env.PORT || 8080;
        await app.listen({ port: Number(port) });
        console.log(`HTTP server running on port ${port}`);
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};

run();
