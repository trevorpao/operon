import { createPlugin } from '../lib/defaultPlugin';

const menuPlugin = createPlugin({
    name: 'data.menu',
    install({ app: ctxApp, gee: ctxGee }) {
        const yellFn = (ctxApp && typeof ctxApp.yell === 'function')
            ? ctxApp.yell
            : (ctxGee && typeof ctxGee.yell === 'function' ? ctxGee.yell.bind(ctxGee) : null);

        const fetchMenu = async (menuID) => {
            if (!yellFn) return [];

            const payload = { menuID };
            const res = await new Promise((resolve, reject) => {
                const handler = function () {
                    if (!this || this.code !== 1) {
                        reject(this || new Error('menu fetch failed'));
                    } else {
                        resolve(this);
                    }
                };

                yellFn('menu/lotsMenu', payload, handler, handler);
            });

            const data = res && res.data ? res.data : [];
            return Array.isArray(data) ? data : (data && data.data ? data.data : []);
        };

        return { api: { fetchMenu } };
    },
});

export default menuPlugin;
