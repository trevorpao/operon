// Base plugin scaffold. Extend this object when creating new plugins.
const defaultPlugin = {
    name: 'namespace.plugin',
    async install() {
        // Return the API exposed by this plugin. Override in your plugin.
        return { api: {} };
    },
    init: null,
    destroy: null,
};

export const createPlugin = (overrides = {}) => {
    const name = (overrides.name || '').trim();
    if (!name) {
        throw new Error('Plugin must provide a unique name (e.g., "util.example")');
    }
    if (typeof overrides.install !== 'function') {
        throw new Error('Plugin must implement install(ctx)');
    }
    return { ...defaultPlugin, ...overrides, name };
};

export default defaultPlugin;
