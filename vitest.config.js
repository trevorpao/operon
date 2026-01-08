import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));

const resolveFromRoot = (...segments) => resolve(rootDir, ...segments);

export default defineConfig({
    resolve: {
        alias: {
            'trevorpao/geneEH': resolveFromRoot('tests/stubs/gee.js'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: [
            'tests/**/*.test.{js,ts}',
            'app/scripts/**/*.{spec,test}.js',
        ],
        exclude: [
            'node_modules',
            'dist',
        ],
        setupFiles: [],
    },
});
