import { toNumberSafe } from '../shared';

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

export { formatNum };
