import gee from 'trevorpao/geneEH';
import app from '../app';

const apiBase = () => (app.isProd() ? 'https://stage.how-living.com/api/menu' : 'http://hl.sense-info.co/api/menu');

const callYell = (uri, payload) => new Promise((resolve, reject) => {
    const handler = function () {
        if (!this || this.code !== 1) {
            reject(this);
        } else {
            resolve(this);
        }
    };

    gee.yell(uri, payload, handler, handler);
});

const menuPlugin = {
    name: 'data.menu',
    async install() {
        const fetchMenu = async (menuID) => {
            const uri = `${apiBase()}/lotsMenu`;
            const res = await callYell(uri, { menuID });
            const data = res && res.data ? res.data : [];
            return Array.isArray(data) ? data : (data.data ? data.data : []);
        };

        return { api: { fetchMenu, apiUri: apiBase() } };
    },
};

export default menuPlugin;
