import app from '../app';
import { createPlugin } from './defaultPlugin';
import { toStringSafe, toNumberSafe } from './shared';
import { resolveGee, resolveJQuery, resolveMoment, resolveHandlebars } from './runtime/deps';

const THUMBNAIL_PRESETS = {
    all_thn: [128, 128],
    default_thn: [300, 300],
    press_thn: [400, 225],
    author_thn: [300, 300],
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

const calcPercent = (num, divide = 1, decimals = 0) => {
    const base = Math.pow(10, decimals);
    const n = toNumberSafe(num);
    const d = toNumberSafe(divide) || 1;
    return Math.ceil((n * 100 * base) / d) / base;
};

const createFormatHelper = (overrides = {}) => {
    const {
        appRef = app,
        gee = resolveGee(),
        jquery = resolveJQuery(),
        momentLib = resolveMoment(),
        timeagoFn,
    } = overrides;

    const resolvedTimeago = typeof timeagoFn === 'function'
        ? timeagoFn
        : (jquery && typeof jquery.timeago === 'function' ? (ts) => jquery.timeago(ts) : null);

    const hasMoment = () => Boolean(momentLib && typeof momentLib === 'function');
    const log = (msg) => {
        if (gee && typeof gee.clog === 'function') {
            gee.clog(msg);
        }
    };

    const fmt = (ts, pattern, fallback = '') => {
        if (!hasMoment()) {
            return fallback || toStringSafe(ts);
        }

        const inst = momentLib(ts);
        return (inst && inst.isValid()) ? inst.format(pattern) : (fallback || '');
    };

    const formatISO = (ts) => {
        if (!hasMoment()) {
            return toStringSafe(ts);
        }
        const inst = momentLib(ts);
        return inst && inst.isValid() ? inst.toISOString() : toStringSafe(ts);
    };

    const formatMoney = (val) => {
        const raw = toStringSafe(val);

        if (jquery && jquery.fn && typeof jquery.fn.formatMoney === 'function') {
            return jquery.fn.formatMoney(raw, 0);
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

    const timeagoOrRaw = (ts) => (resolvedTimeago ? resolvedTimeago(ts) : ts);
    const getPicPrefix = () => (gee && gee.picUri) ? gee.picUri : '';
    const getApiPrefix = () => (gee && gee.mainUri) ? gee.mainUri : '';
    const computePercent = (num, divide = 1, decimals = 0) => calcPercent(num, divide, decimals);

    const helper = {
        currency: (val) => formatMoney(val),

        sum: (price, qty) => {
            const currencyFn = (appRef.tmplHelpers && typeof appRef.tmplHelpers.currency === 'function')
                ? appRef.tmplHelpers.currency
                : formatMoney;
            return currencyFn(toNumberSafe(qty) * toNumberSafe(price));
        },

        loadPic: (path) => getPicPrefix() + toStringSafe(path),

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
                const current = momentLib(ts);
                if (target && appRef[target]) {
                    const bucket = appRef[target];
                    bucket.max_ts = bucket.max_ts ? momentLib.max(bucket.max_ts, current) : current;
                    bucket.min_ts = bucket.min_ts ? momentLib.min(bucket.min_ts, current) : current;
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

            const source = str ? momentLib(str, 'YYYY-MM-DD HH:mm:ss') : momentLib();
            return source.isValid() ? source.format(pattern) : momentLib().format(pattern);
        },

        during: (ts1, ts2) => {
            if (!hasMoment()) {
                return '';
            }

            const start = momentLib(ts1, 'YYYY-MM-DD HH:mm:ss');
            const end = momentLib(ts2, 'YYYY-MM-DD HH:mm:ss');
            const diff = start.diff(end, 'days');

            log(`diff::${diff}`);

            return diff !== 0
                ? `${start.format('YY.MM.DD')}${end.format(' ~ YY.MM.DD')}`
                : `${start.format('YY.MM.DD HH:mm')}${end.format(' ~ HH:mm')}`;
        },

        genderedHonorific: (gender) => (gender === 'f' ? '女士' : '先生'),

        linkAPI: (str) => getApiPrefix() + toStringSafe(str),

        percent: (num, divide = 1, decimals = 0) => computePercent(num, divide, decimals),

        calPercent: (num, divide, decimals) => computePercent(num, divide, decimals),

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
            const hash = (typeof appRef.MD5 === 'function') ? appRef.MD5(email) : '';
            return type !== 'cat'
                ? `//www.gravatar.com/avatar/${hash}.jpg?s=${safeSize}`
                : `//robohash.org/${hash}?set=set4&s=${safeSize}`;
        },

        repathImg: (str) => {
            const prefix = getPicPrefix();
            const safe = toStringSafe(str);
            return (safe.indexOf('/upload') === 0 ? prefix : '') + safe;
        },

        thumbnail: (str, type) => {
            const prefix = getPicPrefix();
            return resolveThumbnail(str, type, THUMBNAIL_PRESETS, prefix);
        },
    };

    return helper;
};

const registerTemplateHelpers = (handlebarsInstance, helpers) => {
    if (!handlebarsInstance || typeof handlebarsInstance.registerHelper !== 'function') {
        return;
    }

    Object.entries(helpers).forEach(([name, fn]) => {
        if (typeof fn === 'function') {
            handlebarsInstance.registerHelper(name, fn);
        }
    });
};

const formatPlugin = createPlugin({
    name: 'util.format',
    async install() {
        app.thumbnail = THUMBNAIL_PRESETS;
        const api = createFormatHelper({ appRef: app });
        app.formatHelper = api;
        registerTemplateHelpers(resolveHandlebars(), api);
        return {
            api,
            registerTemplateHelpers: (handlebarsInstance) => registerTemplateHelpers(handlebarsInstance, api),
        };
    },
});

export { createFormatHelper, registerTemplateHelpers, THUMBNAIL_PRESETS };

export default formatPlugin;

