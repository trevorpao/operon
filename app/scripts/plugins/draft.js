import { createPlugin } from '../lib/defaultPlugin';

const buildYell = (app, gee) => {
    if (app && typeof app.yell === 'function') {
        return app.yell;
    }
    if (gee && typeof gee.yell === 'function') {
        return gee.yell.bind(gee);
    }
    return null;
};

const draftPlugin = createPlugin({
    name: 'data.draft',
    install({ app, gee }) {
        const yell = buildYell(app, gee);

        const importDraft = async (payload = {}) => {
            if (!yell) {
                throw new Error('draft import unavailable');
            }
            return new Promise((resolve, reject) => {
                const handler = function (res) {
                    const response = res || this || {};
                    if (response.code === 1) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                };

                yell('draft/import', payload, handler, handler);
            });
        };

        return { api: { importDraft } };
    },
});

export default draftPlugin;
