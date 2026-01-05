import '../lib/extend';

// Extend helper plugin: ensures jQuery helpers are registered.
const extendPlugin = {
    name: 'util.extend',
    async install() {
        // Side-effect import already attached helpers to jQuery.
        return { api: {} };
    },
};

export default extendPlugin;
