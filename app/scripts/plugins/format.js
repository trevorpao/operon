import app from '../app';

// Format helper plugin: exposes existing app.formatHelper for reuse.
const formatPlugin = {
    name: 'util.format',
    async install() {
        const api = app.formatHelper || {};

        // Register as Handlebars helpers if available.
        if (typeof Handlebars !== 'undefined' && typeof Handlebars.registerHelper === 'function') {
            Object.entries(api).forEach(([name, fn]) => {
                if (typeof fn === 'function') {
                    Handlebars.registerHelper(name, fn);
                }
            });
        }

        return { api };
    },
};

export default formatPlugin;
