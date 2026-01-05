// Lightweight postMessage helper without jQuery dependency.

const supportsPostMessage = typeof window !== 'undefined' && typeof window.postMessage === 'function';

const toOrigin = (url) => {
    try {
        return new URL(url, window.location.href).origin;
    } catch (err) {
        const match = /^([^:]+:\/\/[^\/]*)/.exec(url || '');
        return match ? match[1] : '*';
    }
};

const serialize = (message) => {
    if (typeof message === 'string') return message;
    try {
        return new URLSearchParams(message).toString();
    } catch (err) {
        return JSON.stringify(message);
    }
};

export function postMessage(message, targetUrl, target = window.parent) {
    if (!targetUrl || !target) return;
    const origin = toOrigin(targetUrl);
    const payload = serialize(message);
    if (supportsPostMessage) {
        target.postMessage(payload, origin);
    } else {
        // Legacy hash fallback (very old browsers). Kept for backward compatibility.
        target.location = targetUrl.replace(/#.*$/, '') + '#' + Date.now() + '&' + payload;
    }
}

export function receiveMessage(callback, sourceOrigin, delay) {
    if (!callback) {
        return () => {};
    }

    if (supportsPostMessage) {
        const handler = (event) => {
            if (typeof sourceOrigin === 'string' && event.origin !== sourceOrigin) return;
            if (typeof sourceOrigin === 'function' && sourceOrigin(event.origin) === false) return;
            callback(event);
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }

    // Legacy hash polling fallback (kept to mirror old plugin behavior)
    let lastHash = document.location.hash;
    const interval = setInterval(() => {
        const hash = document.location.hash;
        const re = /^#?\d+&/;
        if (hash !== lastHash && re.test(hash)) {
            lastHash = hash;
            callback({ data: hash.replace(re, '') });
        }
    }, typeof sourceOrigin === 'number' ? sourceOrigin : typeof delay === 'number' ? delay : 100);

    return () => clearInterval(interval);
}

export default { postMessage, receiveMessage };
