import app from '../app';
import {
    isBrowser,
    toStringSafe,
    toNumberSafe,
    toNodes,
    toElement,
    ensureBrowser,
    WHITESPACE_RE,
} from './shared';

const supportsPlaceholder = () => isBrowser && ('placeholder' in document.createElement('input'));

const placeholderHandlers = (el, text, originalColor) => ({
    apply: () => {
        if (!el.value) {
            el.value = text;
            el.dataset.color = originalColor;
            el.style.color = '#aaa';
        }
    },
    clear: () => {
        if (el.value === text) {
            el.value = '';
            el.style.color = el.dataset.color || '';
        }
    },
});

const placeholder = (elements) => {
    if (!ensureBrowser() || supportsPlaceholder()) return;
    toNodes(elements).forEach((el) => {
        const text = el.getAttribute('placeholder');
        if (!text) return;
        const originalColor = el.style.color;
        const { apply, clear } = placeholderHandlers(el, text, originalColor);
        apply();
        el.addEventListener('focus', clear);
        el.addEventListener('blur', apply);
    });
};

const applyClasses = (el, list, op) => {
    if (!list) return;
    list.split(WHITESPACE_RE).forEach((cls) => {
        if (!cls) return;
        if (op === 'add') el.classList.add(cls);
        if (op === 'remove') el.classList.remove(cls);
    });
};

const removeWildcardClasses = (el, pattern) => {
    if (!pattern) return;
    const patt = new RegExp(`\\s${pattern.replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s')}\\s`, 'g');
    const current = ` ${el.className} `;
    el.className = current.replace(patt, ' ').trim();
};

const alterClass = (elements, removals, additions) => {
    toNodes(elements).forEach((el) => {
        if (!removals) {
            applyClasses(el, additions, 'add');
            return;
        }

        if (removals.indexOf('*') === -1) {
            applyClasses(el, removals, 'remove');
        } else {
            removeWildcardClasses(el, removals);
        }

        applyClasses(el, additions, 'add');
    });
};

const inArray = (ary, value) => Array.isArray(ary) ? ary.indexOf(value) !== -1 : false;

const formatIntegerPart = (intPart, sep) => {
    const j = intPart.length > 3 ? intPart.length % 3 : 0;
    return (j ? intPart.substr(0, j) + sep : '') + intPart.substr(j).replace(/(\d{3})(?=\d)/g, `$1${sep}`);
};

const formatFraction = (abs, decimals, dec) => (decimals ? dec + Math.abs(abs - parseInt(abs, 10)).toFixed(decimals).slice(2) : '');

const formatNum = (n, c, d, t, s) => {
    const num = toNumberSafe(n);
    const decimals = Number.isNaN(c = Math.abs(c)) ? 2 : c;
    const dec = typeof d === 'undefined' ? '.' : d;
    const sep = typeof t === 'undefined' ? ',' : t;
    const sign = (s === 1) ? '' : (num < 0 ? '-' : '');
    const abs = Math.abs(num || 0).toFixed(decimals);
    const intPart = parseInt(abs, 10) + '';

    return sign + formatIntegerPart(intPart, sep) + formatFraction(abs, decimals, dec);
};

const serializeFormJSON = (form) => {
    const result = {};
    if (!ensureBrowser() || !form) return result;

    const data = new FormData(form);
    data.forEach((value, key) => {
        const val = value == null ? '' : value;
        if (Object.prototype.hasOwnProperty.call(result, key)) {
            if (!Array.isArray(result[key])) result[key] = [result[key]];
            result[key].push(val);
        } else {
            result[key] = val;
        }
    });

    return result;
};

const parseClassExpr = (nameStr) => {
    const split = nameStr.indexOf('|') !== -1 ? '|' : '&';
    return { split, list: nameStr.split(split).filter(Boolean) };
};

const hasMutilClass = (element, nameStr) => {
    const el = toElement(element);
    if (!el || !nameStr) return false;
    const { split, list } = parseClassExpr(nameStr);
    if (list.length === 0) return false;
    return split === '|' ? list.some((cls) => el.classList.contains(cls)) : list.every((cls) => el.classList.contains(cls));
};

const getViewport = () => ({
    top: 0,
    bottom: (window.innerHeight || document.documentElement.clientHeight),
});

const visible = (element, partial) => {
    const el = toElement(element);
    if (!ensureBrowser() || !el) return false;
    const rect = el.getBoundingClientRect();
    const { top, bottom } = getViewport();
    const compareTop = partial ? rect.bottom : rect.top;
    const compareBottom = partial ? rect.top : rect.bottom;
    return compareBottom <= bottom && compareTop >= top;
};

const dom = { placeholder, alterClass, serializeFormJSON, hasMutilClass, visible };
const number = { formatNum };
const text = { inArray };
const utils = { toNodes, toElement, toStringSafe, toNumberSafe };

const extendHelper = {
    ...dom,
    ...number,
    ...text,
    dom,
    number,
    text,
    utils,
};

const extendPlugin = {
    name: 'util.extend',
    async install() {
        app.extendHelper = extendHelper;
        return { api: extendHelper };
    },
};

export default extendPlugin;
