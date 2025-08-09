import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        pool: 'threads',
        poolOptions: {
          threads: {
            minThreads: 1,
            maxThreads: 1,
          },
        },
        sequence: {
          concurrent: false,
        },
      },
});
