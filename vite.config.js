const path = require('path');
const { defineConfig } = require('vite');
const viteTwig = require('vite-twig-ssr');

const VIEWS_PREFIX = '/app/themes/default/ssr/';
const PUBLIC_ASSETS_DIR = path.resolve(__dirname, 'app/themes/default/assets');

const triggerFullReload = (server, label) => {
    if (!server) return;
    server.moduleGraph.invalidateAll();
    server.ws.send({ type: 'full-reload' });
    if (server.config.logger?.info) {
        server.config.logger.info(`[twig-hmr] ${label} updated -> full reload`);
    }
};

const createTemplateReloadPlugin = ({ name, extensions, label }) => ({
    name,
    configureServer(server) {
        const watchedEvents = new Set(['add', 'change', 'unlink']);
        const matchesExtension = (filePath = '') => extensions.some((ext) => filePath.endsWith(ext));

        server.watcher.on('all', (event, filePath) => {
            if (!watchedEvents.has(event) || !matchesExtension(filePath)) {
                return;
            }
            triggerFullReload(server, label);
        });
    },
});

const hbsHotReloadPlugin = () => createTemplateReloadPlugin({
    name: 'hbs-hot-reload',
    extensions: ['.hbs'],
    label: 'Handlebars partial',
});

const twigHotReloadPlugin = () => createTemplateReloadPlugin({
    name: 'twig-hot-reload',
    extensions: ['.twig', '.json'],
    label: 'Twig view',
});

const devRoutingPlugin = () => ({
    name: 'docute-dev-routing',
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            if (!req.url) {
                return next();
            }

            if (req.url === '/') {
                res.statusCode = 302;
                res.setHeader('Location', '/index.twig');
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
    publicDir: PUBLIC_ASSETS_DIR,
    plugins: [
        devRoutingPlugin(),
        twigHotReloadPlugin(),
        hbsHotReloadPlugin(),
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
        open: '/index.twig',
        watch: {
            ignored: ['**/node_modules/**', '**/dist/**'],
        },
    },
});
