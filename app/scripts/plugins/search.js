const searchPlugin = {
    name: 'data.search',
    install({ app, gee }) {
        const yellFn = (app && typeof app.yell === 'function')
            ? app.yell
            : (gee && typeof gee.yell === 'function' ? gee.yell.bind(gee) : null);

        const callYell = (endpoint, payload) => new Promise((resolve, reject) => {
            if (!endpoint) {
                reject(new Error('search endpoint is missing'));
                return;
            }
            if (!yellFn) {
                reject(new Error('yell unavailable'));
                return;
            }

            const handler = function () {
                if (!this || this.code !== 1) {
                    reject(this || new Error('search request failed'));
                } else {
                    resolve(this);
                }
            };

            yellFn(endpoint, payload, handler, handler);
        });

        const fetchList = async ({
            endpoint,
            pid,
            query = '',
            sorter = '',
            page = 1,
            limit = 24,
        } = {}) => {
            const payload = {
                pid,
                query,
                sorter,
                page,
                limit,
            };
            const res = await callYell(endpoint, payload);
            return res && res.data ? res.data : res;
        };

        return { api: { fetchList } };
    },
};

export default searchPlugin;
