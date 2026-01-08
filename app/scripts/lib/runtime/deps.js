const hasWindow = typeof window !== 'undefined';
const hasDocument = typeof document !== 'undefined';

const getGlobal = () => {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (hasWindow) return window;
    if (typeof global !== 'undefined') return global;
    return {};
};

const getWindow = () => (hasWindow ? window : undefined);
const getDocument = () => (hasDocument ? document : undefined);
const isBrowserEnv = hasWindow && hasDocument;

const resolveFromGlobal = (key) => {
    const scope = getGlobal();
    if (!scope || typeof scope !== 'object') return undefined;
    return scope[key];
};

const resolveGee = () => resolveFromGlobal('gee');
const resolveHandlebars = () => resolveFromGlobal('Handlebars');
const resolveMoment = () => resolveFromGlobal('moment');
const resolveJQuery = () => {
    const scope = getGlobal();
    if (!scope || typeof scope !== 'object') return undefined;
    if (scope.jQuery) return scope.jQuery;
    if (scope.$ && scope.$.fn) return scope.$;
    return undefined;
};

export {
    getGlobal,
    getWindow,
    getDocument,
    isBrowserEnv,
    resolveGee,
    resolveHandlebars,
    resolveMoment,
    resolveJQuery,
};

export default {
    getGlobal,
    getWindow,
    getDocument,
    isBrowserEnv,
    resolveGee,
    resolveHandlebars,
    resolveMoment,
    resolveJQuery,
};
