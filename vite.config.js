const { defineConfig } = require('vite');
const viteTwig = require('vite-twig-ssr');

const redirectRootPlugin = () => ({
  name: 'redirect-root-to-twig',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/' || req.url === '/index.html') {
        res.statusCode = 302;
        res.setHeader('Location', '/app/themes/default/ssr/index.twig');
        return res.end();
      }
      return next();
    });
  },
});

module.exports = defineConfig({
  root: __dirname,
  plugins: [
    redirectRootPlugin(),
    viteTwig({
      viewsPath: './app/themes/default/ssr/',
      mockPath: './mock',
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
