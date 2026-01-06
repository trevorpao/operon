import app from '../app';
import { toStringSafe, toNumberSafe } from './shared';

const resolveDeps = () => {
    const win = (typeof window !== 'undefined') ? window : undefined;
    return {
        gee: (win && win.gee) || (typeof gee !== 'undefined' ? gee : undefined),
        $: (win && (win.jQuery || win.$)) || (typeof jQuery !== 'undefined' ? jQuery : undefined),
        moment: (win && win.moment) || (typeof moment !== 'undefined' ? moment : undefined),
    };
};

const { gee, $, moment } = resolveDeps();

const hasMoment = () => Boolean(moment && typeof moment === 'function');
const hasFormatMoney = () => Boolean($ && $.fn && typeof $.fn.formatMoney === 'function');
const log = (msg) => {
    if (gee && typeof gee.clog === 'function') {
        gee.clog(msg);
    }
};
const timeagoOrRaw = (ts) => ($ && typeof $.timeago === 'function') ? $.timeago(ts) : ts;

const THUMBNAIL_PRESETS = {
    all_thn: [128, 128],
    default_thn: [300, 300],
    press_thn: [400, 225],
    author_thn: [300, 300],
};

const fmt = (ts, pattern, fallback = '') => {
    if (!hasMoment()) {
        return fallback || toStringSafe(ts);
    }

    const inst = moment(ts);
    return (inst && inst.isValid()) ? inst.format(pattern) : (fallback || '');
};

const formatMoney = (val) => {
    const raw = toStringSafe(val);

    if (hasFormatMoney()) {
        return $.fn.formatMoney(raw, 0);
    }

    const num = Number(raw);
    if (Number.isFinite(num)) {
        try {
            return num.toLocaleString();
        } catch (err) {
            // noop
        }
    }

    return raw;
};

const resolveThumbnail = (str, type, presets, prefix) => {
    const safe = toStringSafe(str);
    const parts = safe.split('.');
    if (parts.length < 2) {
        return safe;
    }

    let newPath;
    if (type === 'sm') {
        newPath = `${parts[0]}_sm.${parts[1]}`;
    } else {
        const preset = presets[`${type}_thn`];
        newPath = preset ? `${parts[0]}_${preset[0]}x${preset[1]}.${parts[1]}` : safe;
    }

    return (newPath.indexOf('/upload') === 0 ? prefix : '') + newPath;
};

const applyTextTransforms = (str, transforms) => transforms.reduce((acc, fn) => fn(acc), toStringSafe(str));

const formatISO = (ts) => (hasMoment() ? moment(ts).toISOString() : toStringSafe(ts));

const percent = (num, divide = 1, decimals = 0) => {
    const base = Math.pow(10, decimals);
    const n = toNumberSafe(num);
    const d = toNumberSafe(divide) || 1;
    return Math.ceil((n * 100 * base) / d) / base;
};

const formatHelper = {
    currency: (val) => formatMoney(val),

    sum: (price, qty) => {
        const currencyFn = (app.tmplHelpers && typeof app.tmplHelpers.currency === 'function') ? app.tmplHelpers.currency : formatMoney;
        return currencyFn(toNumberSafe(qty) * toNumberSafe(price));
    },

    loadPic: (path) => {
        const prefix = (gee && gee.picUri) ? gee.picUri : '';
        return prefix + toStringSafe(path);
    },

    average: (sumVal, divide) => {
        const d = toNumberSafe(divide);
        return d !== 0 ? Math.round((toNumberSafe(sumVal) * 10) / d) / 10 : 0;
    },

    s2m: (num) => {
        const total = toNumberSafe(num);
        const s = total % 60;
        const m = Math.floor(total / 60);
        return s > 0 ? `${m} 分 ${s} 秒` : `${m} 分`;
    },

    beforeDate: (ts, target) => {
        if (hasMoment()) {
            const current = moment(ts);
            if (target && app[target]) {
                app[target].max_ts = moment.max(app[target].max_ts, current);
                app[target].min_ts = moment.min(app[target].min_ts, current);
            }
        }

        return timeagoOrRaw(ts);
    },

    showDate: (status, flow, schedule, createDate, publishDate) => {
        const ts = publishDate || createDate;
        return `${toStringSafe(status)} 於 ${fmt(ts, 'MM/DD HH:mm', toStringSafe(ts))}`;
    },

    formatISO: (ts) => formatISO(ts),
    iso8601: (ts) => formatISO(ts),

    getYear: (ts) => fmt(ts, 'YYYY', toStringSafe(ts)),
    getMon: (ts) => fmt(ts, 'MMMM', toStringSafe(ts)),
    getWeek: (ts) => fmt(ts, 'ddd', toStringSafe(ts)),
    getDay: (ts) => fmt(ts, 'DD', toStringSafe(ts)),
    getTime: (ts) => fmt(ts, 'HH:mm', toStringSafe(ts)),

    formatDate: (str, pattern) => {
        if (!hasMoment()) {
            return '';
        }

        const source = str ? moment(str, 'YYYY-MM-DD HH:mm:ss') : moment();
        return source.isValid() ? source.format(pattern) : moment().format(pattern);
    },

    during: (ts1, ts2) => {
        if (!hasMoment()) {
            return '';
        }

        const start = moment(ts1, 'YYYY-MM-DD HH:mm:ss');
        const end = moment(ts2, 'YYYY-MM-DD HH:mm:ss');
        const diff = start.diff(end, 'days');

        log(`diff::${diff}`);

        return diff !== 0 ? `${start.format('YY.MM.DD')}${end.format(' ~ YY.MM.DD')}` : `${start.format('YY.MM.DD HH:mm')}${end.format(' ~ HH:mm')}`;
    },

    genderedHonorific: (gender) => (gender === 'f' ? '女士' : '先生'),

    linkAPI: (str) => {
        const prefix = (gee && gee.mainUri) ? gee.mainUri : '';
        return prefix + toStringSafe(str);
    },

    percent: (num, divide = 1, decimals = 0) => percent(num, divide, decimals),

    calPercent: (num, divide, decimals) => percent(num, divide, decimals),

    nl2br: (str) => applyTextTransforms(str, [
        (v) => v.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2'),
    ]),

    indent: (str) => applyTextTransforms(str, [
        (v) => `<p class="text-indent-c">${v.split(/\r?\n/).join('</p> <p class="text-indent-c">')}</p>`,
    ]),

    strong: (str) => applyTextTransforms(str, [
        (v) => v.replace(/\[b\]/g, '<strong>').replace(/\[\/b\]/g, '</strong>'),
    ]),

    getGravatar: (email, size, type) => {
        const safeSize = size || 80;
        const hash = (typeof app.MD5 === 'function') ? app.MD5(email) : '';
        return type !== 'cat'
            ? `//www.gravatar.com/avatar/${hash}.jpg?s=${safeSize}`
            : `//robohash.org/${hash}?set=set4&s=${safeSize}`;
    },

    repathImg: (str) => {
        const prefix = (gee && gee.picUri) ? gee.picUri : '';
        const safe = toStringSafe(str);
        return (safe.indexOf('/upload') === 0 ? prefix : '') + safe;
    },

    thumbnail: (str, type) => {
        const prefix = (gee && gee.picUri) ? gee.picUri : '';
        return resolveThumbnail(str, type, THUMBNAIL_PRESETS, prefix);
    },
};

const formatPlugin = {
    name: 'util.format',
    async install() {
        app.thumbnail = THUMBNAIL_PRESETS;
        const api = formatHelper;
        app.formatHelper = api;

        if (typeof Handlebars !== 'undefined' && typeof Handlebars.registerHelper === 'function') {
            Object.entries(api).forEach(([name, fn]) => {
                if (typeof fn === 'function') {
                    Handlebars.registerHelper(name, fn);
                }
            });
        }

        return { api };
    },
};

export default formatPlugin;

