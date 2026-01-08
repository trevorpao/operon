const defaultPlugin = {
    name: 'namespace.plugin',
    async install() {
        return { api: {} };
    },
    init: null,
    destroy: null,
};

const registeredPlugins = new Map();

const normalizeResult = (result) => {
    if (result && typeof result === 'object') {
        return result;
    }
    return { api: {} };
};

const logPluginError = (name, error) => {
    const message = `[plugin:${name}] install failed`;
    const wrapped = new Error(message);
    wrapped.cause = error;
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error(message, error);
    }
    return wrapped;
};

export const createPlugin = (overrides = {}) => {
    const name = (overrides.name || '').trim();
    if (!name) {
        throw new Error('Plugin must provide a unique name (e.g., "util.example")');
    }
    if (registeredPlugins.has(name)) {
        throw new Error(`Plugin "${name}" already registered`);
    }
    const install = overrides.install;
    if (typeof install !== 'function') {
        throw new Error('Plugin must implement install(ctx)');
    }

    const plugin = {
        ...defaultPlugin,
        ...overrides,
        name,
        async install(ctx = {}) {
            try {
                const result = await install.call(this, ctx);
                return normalizeResult(result);
            } catch (error) {
                throw logPluginError(name, error);
            }
        },
    };

    registeredPlugins.set(name, plugin);
    return plugin;
};

export const __resetPluginRegistry = () => registeredPlugins.clear();
export const listRegisteredPlugins = () => Array.from(registeredPlugins.keys());

export default defaultPlugin;
