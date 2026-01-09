const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const normalizeBlank = (blank) => {
    if (typeof blank === 'boolean') return blank;
    if (typeof blank === 'number') return blank !== 0;
    if (typeof blank === 'string') {
        const normalized = blank.trim().toLowerCase();
        return ['yes', 'true', '1', '_blank'].includes(normalized);
    }
    return false;
};

const listDepthClass = (depth = 0) => `depth-${Math.max(0, toNumber(depth, 0))}`;

const nextDepth = (depth = 0) => toNumber(depth, 0) + 1;

const menuPath = (parentPath = '', title = '') => {
    const trimmedTitle = String(title ?? '').trim();
    if (!trimmedTitle) return String(parentPath ?? '').trim();
    const trimmedParent = String(parentPath ?? '').trim();
    return trimmedParent ? `${trimmedParent} > ${trimmedTitle}` : trimmedTitle;
};

const analyticsId = (id) => `menu-${String(id ?? 'node')}`;

const hasChildren = (rows) => Array.isArray(rows) && rows.length > 0;

const isExternal = (uri = '') => /^https?:\/\//i.test(uri) || uri.startsWith('//');

const shouldOpenBlank = (blank, target) => {
    if (typeof target === 'string' && target.toLowerCase() === '_blank') {
        return true;
    }
    return normalizeBlank(blank);
};

const renderBadge = (badge) => {
    const value = String(badge ?? '').trim();
    if (!value) return '';
    const safe = escapeHtml(value);
    return `<span class="menu-badge" aria-label="${safe}">${safe}</span>`;
};

const menuHelpers = {
    analyticsId,
    hasChildren,
    isExternal,
    listDepthClass,
    menuPath,
    nextDepth,
    renderBadge,
    shouldOpenBlank,
};

export {
    analyticsId,
    hasChildren,
    isExternal,
    listDepthClass,
    menuHelpers,
    menuPath,
    nextDepth,
    renderBadge,
    shouldOpenBlank,
};

export default menuHelpers;
