import { isBrowserEnv, getWindow, getDocument } from './runtime/deps';

const isBrowser = Boolean(isBrowserEnv);
const isSSR = !isBrowser;

const isElementInstance = (node) => (typeof Element !== 'undefined' && node instanceof Element);
const isNodeListInstance = (value) => (typeof NodeList !== 'undefined' && value instanceof NodeList);

const toStringSafe = (val = '') => (val == null ? '' : String(val));

const toNumberSafe = (val, fallback = 0) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
};

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

const withDocument = (cb, fallback) => {
    if (typeof cb !== 'function') {
        return typeof fallback === 'function' ? fallback() : fallback;
    }
    return withBrowser(({ document }) => cb(document), fallback);
};

const toElements = (input) => {
    if (!input) return [];

    if (typeof input === 'string') {
        return withDocument((doc) => Array.from(doc.querySelectorAll(input)), []);
    }

    if (isElementInstance(input)) return [input];
    if (isNodeListInstance(input) || Array.isArray(input)) {
        return Array.from(input).filter((node) => isElementInstance(node));
    }
    return [];
};

const toNodes = (input) => toElements(input);

const toElement = (input) => toElements(input)[0] || null;

const WHITESPACE_RE = /\s+/;

export {
    isBrowser,
    isSSR,
    toStringSafe,
    toNumberSafe,
    toNodes,
    toElements,
    toElement,
    ensureBrowser,
    withBrowser,
    withDocument,
    WHITESPACE_RE,
};
