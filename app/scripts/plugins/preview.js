import { createPlugin } from '../lib/defaultPlugin';

const sanitizePath = (url) => {
    const normalized = (url || '').replace(/^\/+/, '').replace(/\.\.+/g, '').replace(/\/+/, '/');
    return normalized;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const previewPlugin = createPlugin({
    name: 'data.preview',
    install({ app, config }) {
        const registry = new Map();
        const basePath = '/app/mock/api';

        const getLatency = () => {
            const fromConfig = config && typeof config.previewLatency === 'number' ? config.previewLatency : null;
            const fromQuery = (typeof window !== 'undefined') ? Number(new URLSearchParams(window.location.search).get('latency')) : null;
            if (Number.isFinite(fromQuery) && fromQuery > 0) return fromQuery;
            if (Number.isFinite(fromConfig) && fromConfig > 0) return fromConfig;
            return 0;
        };

        const resolvePath = (url) => {
            const reg = registry.get(url);
            if (typeof reg === 'string') return reg;
            const sanitized = sanitizePath(url).replace(/\//g, '/');
            return `${basePath}/${sanitized}.json`;
        };

        const mock = async (url, payload) => {
            const path = resolvePath(url);
            const latency = getLatency();
            try {
                const res = await fetch(path, { credentials: 'same-origin' });
                if (!res.ok) {
                    throw new Error(`mock not found: ${path}`);
                }
                const json = await res.json();
                if (latency > 0) await sleep(latency);
                const body = (json && typeof json === 'object') ? json : {};
                // Align with backend shape: prefer { code, data }
                if (Object.prototype.hasOwnProperty.call(body, 'code') && Object.prototype.hasOwnProperty.call(body, 'data')) {
                    return body;
                }
                return { code: 1, data: body.data !== undefined ? body.data : body, payload: payload || null };
            } catch (err) {
                console.warn('[preview] mock failed, path=', path, err);
                throw err;
            }
        };

        const registerMock = (url, pathOrHandler) => {
            registry.set(url, pathOrHandler);
        };

        return { api: { mock, registerMock } };
    },
});

export default previewPlugin;
