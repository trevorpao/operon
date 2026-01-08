import { createPlugin } from '../lib/defaultPlugin';

const normalizeList = (list) => {
    if (!Array.isArray(list)) return [];
    if (list.length && list[0] === null) return [];
    return list;
};

const resourcePlugin = createPlugin({
    name: 'data.resource',
    async install({ app }) {
        const yellFn = (app && typeof app.yell === 'function') ? app.yell : null;

        const callYell = (endpoint, payload) => new Promise((resolve, reject) => {
            if (!yellFn) return reject(new Error('yell unavailable'));

            const handler = function () {
                if (!this || this.code !== 1) {
                    reject(this);
                } else {
                    resolve(this);
                }
            };

            yellFn('resource/' + endpoint, payload, handler, handler);
        });

        const load = async ({ pid, limit, meta }) => {
            const res = await callYell('load', { pid, limit, meta: meta || 0 });
            const payload = res && res.data ? res.data : {};
            const data = normalizeList(payload.data || []);
            return { data, cu: payload.cu };
        };

        const loadTop10 = async ({ limit = 5 } = {}) => {
            const res = await callYell('loadTop10', { limit });
            const payload = res ? res.data : [];
            const data = normalizeList(Array.isArray(payload) ? payload : (payload && payload.data ? payload.data : []));
            return { data };
        };

        return { api: { load, loadTop10 } };
    },
});

export default resourcePlugin;
