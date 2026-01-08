import { defineConfig } from 'vitest/config';

export default defineConfig({
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
