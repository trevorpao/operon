import { WHITESPACE_RE, toElements, toElement, ensureBrowser } from '../shared';

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
    toElements(elements).forEach((el) => {
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

export { alterClass, hasMutilClass, visible };
