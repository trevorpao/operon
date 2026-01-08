import { isBrowserEnv, getWindow, getDocument } from './runtime/deps';

const isBrowser = isBrowserEnv;

const toStringSafe = (val = '') => (val == null ? '' : String(val));

const toNumberSafe = (val, fallback = 0) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
};

const toNodes = (input) => {
    if (!input) return [];
    if (input instanceof Element) return [input];
    if (input instanceof NodeList || Array.isArray(input)) return Array.from(input).filter(Boolean);
    return [];
};

const toElement = (input) => toNodes(input)[0];

const ensureBrowser = () => isBrowser;

const withBrowser = (cb, fallback) => {
    if (!isBrowser || typeof cb !== 'function') {
        return typeof fallback === 'function' ? fallback() : fallback;
    }
    try {
        return cb({ window: getWindow(), document: getDocument() });
    } catch (err) {
        if (typeof fallback === 'function') {
            return fallback(err);
        }
        return fallback;
    }
};

const WHITESPACE_RE = /\s+/;

export {
    isBrowser,
    toStringSafe,
    toNumberSafe,
    toNodes,
    toElement,
    ensureBrowser,
    withBrowser,
    WHITESPACE_RE,
};
