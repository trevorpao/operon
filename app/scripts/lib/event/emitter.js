const NOOP = () => {};
const WILDCARD_SUFFIX = '.*';

const normalizeTopic = (topic) => (typeof topic === 'string' ? topic.trim() : '');
const isFunction = (fn) => typeof fn === 'function';
const isWildcardPattern = (pattern) => pattern === '*' || pattern.endsWith(WILDCARD_SUFFIX);

const matchesTopic = (pattern, topic) => {
    if (!pattern || !topic) return false;
    if (pattern === '*' || pattern === topic) return true;
    if (!pattern.includes('*')) return false;
    if (!pattern.endsWith(WILDCARD_SUFFIX)) return false;
    const prefix = pattern.slice(0, -WILDCARD_SUFFIX.length);
    if (!prefix) return true;
    if (topic === prefix) return true;
    return topic.startsWith(`${prefix}.`);
};

const defaultLogger = (context, error) => {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error('[emitter]', context, error);
    }
};

export const createEmitter = (options = {}) => {
    const listeners = new Map();
    const logError = isFunction(options.onError) ? options.onError : defaultLogger;

    const on = (rawTopic, handler) => {
        const topic = normalizeTopic(rawTopic);
        if (!topic || !isFunction(handler)) return NOOP;
        if (!listeners.has(topic)) {
            listeners.set(topic, new Set());
        }
        const bucket = listeners.get(topic);
        bucket.add(handler);
        return () => off(topic, handler);
    };

    const off = (rawTopic, handler) => {
        const topic = normalizeTopic(rawTopic);
        if (!topic || !listeners.has(topic)) return;
        if (!handler) {
            listeners.delete(topic);
            return;
        }
        const bucket = listeners.get(topic);
        bucket.delete(handler);
        if (!bucket.size) {
            listeners.delete(topic);
        }
    };

    const once = (topic, handler) => {
        if (!isFunction(handler)) return NOOP;
        const wrapped = (...args) => {
            off(topic, wrapped);
            handler(...args);
        };
        return on(topic, wrapped);
    };

    const emit = (rawTopic, ...args) => {
        const topic = normalizeTopic(rawTopic);
        if (!topic) return 0;
        let delivered = 0;
        listeners.forEach((bucket, pattern) => {
            if (!matchesTopic(pattern, topic)) return;
            const isWildcard = isWildcardPattern(pattern);
            Array.from(bucket).forEach((handler) => {
                if (!isFunction(handler)) return;
                try {
                    if (isWildcard) {
                        handler(topic, ...args);
                    } else {
                        handler(...args);
                    }
                    delivered += 1;
                } catch (error) {
                    logError({ topic, pattern }, error);
                }
            });
        });
        return delivered;
    };

    const clear = (topic) => {
        if (typeof topic === 'undefined') {
            listeners.clear();
            return;
        }
        const target = normalizeTopic(topic);
        if (!target) return;
        listeners.delete(target);
    };

    const listenerCount = (topic) => {
        const target = normalizeTopic(topic);
        if (!target) {
            let total = 0;
            listeners.forEach((bucket) => {
                total += bucket.size;
            });
            return total;
        }
        const bucket = listeners.get(target);
        return bucket ? bucket.size : 0;
    };

    return {
        on,
        off,
        once,
        emit,
        clear,
        listenerCount,
    };
};

export { isWildcardPattern, matchesTopic };

export default createEmitter;
