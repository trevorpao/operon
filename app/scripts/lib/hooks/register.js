import gee from 'trevorpao/geneEH';

const toArray = (value) => {
    if (!value) return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
};

const normalizeName = (namespace, key) => {
    if (!namespace) return key;
    if (key.startsWith(namespace + '.') || key.startsWith(namespace + '/')) {
        return key.replace('/', '.');
    }
    if (key.startsWith('.')) {
        return `${namespace}${key}`;
    }
    if (key.includes(':')) {
        return key;
    }
    return `${namespace}.${key}`;
};

const slashAlias = (namespace, key, normalized) => {
    if (key.includes(':')) return null;
    if (!namespace) {
        return normalized.includes('.') ? normalized.replace(/\./g, '/') : null;
    }
    if (key.startsWith(namespace + '.') || key.startsWith(namespace + '/')) {
        const suffix = key.slice(namespace.length + 1);
        return `${namespace}/${suffix.replace(/\./g, '/')}`;
    }
    if (key.includes('.')) {
        return `${namespace}/${key.replace(/\./g, '/')}`;
    }
    return `${namespace}/${key}`;
};

const registerHooks = (namespace, definitions, options = {}) => {
    if (!gee || typeof gee.hook !== 'function') return;
    const { aliasSlash = true, legacy = {} } = options;

    Object.entries(definitions || {}).forEach(([key, def]) => {
        let handler = def;
        let eventName;
        let extraAliases = [];

        if (def && typeof def === 'object' && !Array.isArray(def) && typeof def !== 'function') {
            handler = def.handler || def.fn || def.callback;
            eventName = def.event;
            extraAliases = toArray(def.alias);
        } else if (Array.isArray(def)) {
            handler = def[0];
            eventName = def[1];
            extraAliases = toArray(def[2]);
        }

        if (typeof handler !== 'function') return;

        const normalized = normalizeName(namespace, key);
        gee.hook(normalized, handler, eventName);

        const aliases = [...extraAliases];
        const legacyEntry = legacy[key] || legacy[normalized];
        if (legacyEntry) {
            aliases.push(...toArray(legacyEntry));
        }

        if (aliasSlash) {
            const slashName = slashAlias(namespace, key, normalized);
            if (slashName && slashName !== normalized) {
                aliases.push(slashName);
            }
        }

        aliases
            .filter(Boolean)
            .filter((name, idx, arr) => name !== normalized && arr.indexOf(name) === idx)
            .forEach((name) => {
                gee.hook(name, handler, eventName);
            });
    });
};

export default registerHooks;
