const path = require('path');
const { defineConfig } = require('vite');
const viteTwig = require('vite-twig-ssr');

const VIEWS_PREFIX = '/app/themes/default/ssr/';

const devRoutingPlugin = () => ({
    name: 'docute-dev-routing',
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            if (!req.url) {
                return next();
            }

            if (req.url === '/' || req.url === '/index.html') {
                res.statusCode = 302;
                res.setHeader('Location', `${VIEWS_PREFIX}index.twig`);
                return res.end();
            }

            if (req.url.startsWith(VIEWS_PREFIX) && req.url.endsWith('.twig')) {
                req.url = `/${req.url.slice(VIEWS_PREFIX.length)}`;
            }

            return next();
        });
    },
});

module.exports = defineConfig({
    root: __dirname,
    resolve: {
        alias: {
            'trevorpao/geneEH': path.resolve(__dirname, 'app/scripts/lib/gee-bridge.js'),
        },
    },
    plugins: [
        devRoutingPlugin(),
        viteTwig({
            viewsPath: './app/themes/default/ssr/',
            mockPath: './app/mock',
            globalData: {
                feVersion: '0.0.1-dev',
                assetsUri: '/assets/',
                opts: {
                    default: {
                        contact_mail: 'dev-team@example.com',
                    },
                },
            },
            filters: {
                headline: (value) => String(value || '').toUpperCase(),
            },
            functions: {
                asset: (value) => `/assets/${value}`,
            },
        }),
    ],
    server: {
        open: '/app/themes/default/ssr/index.twig',
        watch: {
            ignored: ['**/node_modules/**', '**/dist/**'],
        },
    },
});
