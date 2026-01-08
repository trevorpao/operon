import { isSSR, withBrowser } from './shared';

const noop = () => {};
const DEFAULT_TIMEOUT = 5000;

const getGlobalWindow = () => withBrowser(({ window }) => window, null);
const hasNativePostMessage = () => withBrowser(({ window }) => typeof window.postMessage === 'function', false);

const toOrigin = (url) => {
    if (!url) return '*';
    return withBrowser(({ window }) => {
        const base = window?.location?.href || 'http://localhost';
        try {
            return new URL(url, base).origin;
        } catch (err) {
            const match = /^([^:]+:\/\/[^\/]*)/.exec(url || '');
            return match ? match[1] : '*';
        }
    }, () => {
        const match = /^([^:]+:\/\/[^\/]*)/.exec(url || '');
        return match ? match[1] : '*';
    });
};

const serialize = (message) => {
    if (typeof message === 'string') return message;
    if (!message || typeof message !== 'object') {
        return String(message ?? '');
    }
    try {
        const params = new URLSearchParams();
        Object.entries(message).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((entry) => params.append(key, String(entry)));
            } else if (value != null) {
                params.append(key, String(value));
            }
        });
        const encoded = params.toString();
        return encoded || JSON.stringify(message);
    } catch (err) {
        return JSON.stringify(message);
    }
};

const parseFormEncoded = (raw) => {
    const params = new URLSearchParams(raw);
    const result = {};
    let hasEntries = false;
    params.forEach((value, key) => {
        hasEntries = true;
        if (Object.prototype.hasOwnProperty.call(result, key)) {
            const current = result[key];
            if (Array.isArray(current)) {
                current.push(value);
            } else {
                result[key] = [current, value];
            }
        } else {
            result[key] = value;
        }
    });
    return hasEntries ? result : raw;
};

const parseMessageData = (payload) => {
    if (typeof payload !== 'string') return payload;
    const trimmed = payload.trim();
    if (!trimmed) return payload;
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
            return JSON.parse(trimmed);
        } catch (err) {
            // fallthrough to URLSearchParams parsing
        }
    }
    try {
        return parseFormEncoded(trimmed);
    } catch (err) {
        return payload;
    }
};

const createMessageValidator = (schema) => {
    if (!schema) return null;
    if (typeof schema === 'function') return schema;
    if (typeof schema !== 'object') return null;

    const rules = Object.entries(schema).map(([key, rule]) => {
        if (typeof rule === 'function') {
            return { key, validate: rule };
        }
        const typeRule = String(rule).toLowerCase();
        const validate = (value) => {
            if (typeRule === 'array') return Array.isArray(value);
            if (typeRule === 'object') return value != null && typeof value === 'object' && !Array.isArray(value);
            return typeof value === typeRule;
        };
        return { key, validate };
    });

    return (payload = {}) => rules.every(({ key, validate }) => validate(payload[key], payload));
};

export function postMessage(message, targetUrl, target = getGlobalWindow()?.parent ?? getGlobalWindow()) {
    if (isSSR || !targetUrl || !target) return;
    const origin = toOrigin(targetUrl);
    const payload = serialize(message);

    if (hasNativePostMessage() && typeof target.postMessage === 'function') {
        target.postMessage(payload, origin);
        return;
    }

    if (target.location) {
        const base = targetUrl.replace(/#.*$/, '');
        target.location = `${base}#${Date.now()}&${payload}`;
    }
}

export function receiveMessage(callback, sourceOrigin, delay) {
    if (typeof callback !== 'function') {
        return noop;
    }

    if (hasNativePostMessage()) {
        const handler = (event) => {
            if (typeof sourceOrigin === 'string' && event.origin !== sourceOrigin) return;
            if (typeof sourceOrigin === 'function' && sourceOrigin(event.origin) === false) return;
            callback(event);
        };
        return withBrowser(({ window }) => {
            window.addEventListener('message', handler);
            return () => window.removeEventListener('message', handler);
        }, noop);
    }

    return withBrowser(({ window, document }) => {
        let lastHash = document.location.hash;
        const intervalDuration = typeof sourceOrigin === 'number'
            ? sourceOrigin
            : typeof delay === 'number'
                ? delay
                : 100;

        const timer = window.setInterval(() => {
            const hash = document.location.hash;
            const re = /^#?\d+&/;
            if (hash !== lastHash && re.test(hash)) {
                lastHash = hash;
                callback({ data: hash.replace(re, '') });
            }
        }, intervalDuration);

        return () => window.clearInterval(timer);
    }, noop);
}

export const createMessageListener = ({ handler, sourceOrigin, schema, delay } = {}) => {
    if (typeof handler !== 'function') {
        return noop;
    }
    const validator = createMessageValidator(schema);
    return receiveMessage((event) => {
        const parsed = parseMessageData(event.data);
        if (validator && !validator(parsed)) {
            return;
        }
        handler({ event, data: parsed, origin: event.origin });
    }, sourceOrigin, delay);
};

const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const requestResponse = ({
    message,
    targetUrl,
    target = getGlobalWindow()?.parent ?? getGlobalWindow(),
    targetOrigin,
    schema,
    timeout = DEFAULT_TIMEOUT,
} = {}) => {
    if (!target) {
        return Promise.reject(new Error('requestResponse: target window is unavailable'));
    }

    const origin = targetOrigin || (targetUrl ? toOrigin(targetUrl) : null);
    if (!origin) {
        return Promise.reject(new Error('requestResponse: targetUrl or targetOrigin is required'));
    }

    const validator = createMessageValidator(schema);
    const requestId = generateRequestId();
    const payload = (message && typeof message === 'object')
        ? { ...message, requestId }
        : { value: message, requestId };

    return new Promise((resolve, reject) => {
        const cleanups = [];
        const cleanup = () => {
            while (cleanups.length) {
                const fn = cleanups.pop();
                if (typeof fn === 'function') fn();
            }
        };

        const rejectWithCleanup = (error) => {
            cleanup();
            reject(error);
        };

        const dispose = receiveMessage((event) => {
            if (origin !== '*' && event.origin !== origin) return;
            const parsed = parseMessageData(event.data);
            if (!parsed || parsed.requestId !== requestId) return;
            if (validator && !validator(parsed)) {
                rejectWithCleanup(new Error('Response schema mismatch'));
                return;
            }
            cleanup();
            resolve({ event, data: parsed });
        }, origin);

        cleanups.push(dispose);

        const timer = setTimeout(() => {
            rejectWithCleanup(new Error('postMessage response timed out'));
        }, timeout);
        cleanups.push(() => clearTimeout(timer));

        try {
            postMessage(payload, targetUrl || origin, target);
        } catch (err) {
            rejectWithCleanup(err);
        }
    });
};

export {
    createMessageValidator,
    parseMessageData,
};

export default {
    postMessage,
    receiveMessage,
    createMessageValidator,
    createMessageListener,
    requestResponse,
};
