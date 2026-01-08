const cleanArray = (actual) => Array.isArray(actual) ? actual.filter(Boolean) : [];

const baseConverter = (nbasefrom, basefrom, baseto) => {
    var SYMBOLS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (basefrom <= 0 || basefrom > SYMBOLS.length || baseto <= 0 || baseto > SYMBOLS.length) {
        return null;
    }
    var i, nbaseten = 0;
    if (basefrom !== 10) {
        var sizenbasefrom = nbasefrom.length;
        for (i = 0; i < sizenbasefrom; i++) {
            var mul, mul_ok = -1;
            for (mul = 0; mul < SYMBOLS.length; mul++) {
                if (nbasefrom[i] === SYMBOLS[mul]) {
                    mul_ok = 1;
                    break;
                }
            }
            if (mul >= basefrom) return null;
            if (mul_ok === -1) return null;
            var exp = (sizenbasefrom - i - 1);
            if (exp === 0) {
                nbaseten += mul;
            } else {
                nbaseten += mul * Math.pow(basefrom, exp);
            }
        }
    } else {
        nbaseten = parseInt(nbasefrom, 10);
    }

    if (baseto !== 10) {
        var nbaseto = [];
        while (nbaseten > 0) {
            var mod = nbaseten % baseto;
            if (mod < 0 || mod >= SYMBOLS.length) return null;
            nbaseto.push(SYMBOLS[mod]);
            nbaseten = parseInt(nbaseten / baseto, 10);
        }
        return nbaseto.reverse().toString().replace(/,/g, '');
    }
    return nbaseten.toString();
};

// Lightweight MD5 (hex, lowercase) for gravatar/legacy helpers; replaces broken minified copy
// source adapted from blueimp/JavaScript-MD5 (MIT) but trimmed for our use-case
const MD5 = (str = '') => {
    const rotateLeft = (lValue, iShiftBits) => ((lValue << iShiftBits) | (lValue >>> (32 - iShiftBits))) >>> 0;
    const addUnsigned = (lX, lY) => {
        const lX4 = lX & 0x40000000;
        const lY4 = lY & 0x40000000;
        const lX8 = lX & 0x80000000;
        const lY8 = lY & 0x80000000;
        const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8) >>> 0;
        if (lX4 | lY4) {
            return (lResult & 0x40000000)
                ? (lResult ^ 0xc0000000 ^ lX8 ^ lY8) >>> 0
                : (lResult ^ 0x40000000 ^ lX8 ^ lY8) >>> 0;
        }
        return (lResult ^ lX8 ^ lY8) >>> 0;
    };

    const F = (x, y, z) => ((x & y) | (~x & z)) >>> 0;
    const G = (x, y, z) => ((x & z) | (y & ~z)) >>> 0;
    const H = (x, y, z) => (x ^ y ^ z) >>> 0;
    const I = (x, y, z) => (y ^ (x | ~z)) >>> 0;

    const FF = (a, b, c, d, x, s, ac) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, F(b, c, d)), addUnsigned(x, ac)), s), b);
    const GG = (a, b, c, d, x, s, ac) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, G(b, c, d)), addUnsigned(x, ac)), s), b);
    const HH = (a, b, c, d, x, s, ac) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, H(b, c, d)), addUnsigned(x, ac)), s), b);
    const II = (a, b, c, d, x, s, ac) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, I(b, c, d)), addUnsigned(x, ac)), s), b);

    const toWordArray = (msg) => {
        const lMessageLength = msg.length;
        const lNumberOfWordsTemp1 = lMessageLength + 8;
        const lNumberOfWordsTemp2 = ((lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64 + 1) * 16;
        const lWordArray = new Array(lNumberOfWordsTemp2).fill(0);
        for (let i = 0; i < lMessageLength; i += 1) {
            const wordCount = (i - (i % 4)) / 4;
            const bytePosition = (i % 4) * 8;
            lWordArray[wordCount] |= msg.charCodeAt(i) << bytePosition;
        }
        const wordCount = (lMessageLength - (lMessageLength % 4)) / 4;
        const bytePosition = (lMessageLength % 4) * 8;
        lWordArray[wordCount] |= 0x80 << bytePosition;
        lWordArray[lNumberOfWordsTemp2 - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWordsTemp2 - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    const wordToHex = (lValue) => {
        let wordToHexValue = '';
        for (let lCount = 0; lCount <= 3; lCount += 1) {
            const lByte = (lValue >>> (lCount * 8)) & 255;
            const temp = `0${lByte.toString(16)}`;
            wordToHexValue += temp.slice(temp.length - 2);
        }
        return wordToHexValue;
    };

    const utf8Encode = (msg) => unescape(encodeURIComponent(msg));

    const x = toWordArray(utf8Encode(String(str)));
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    for (let k = 0; k < x.length; k += 16) {
        const [aa, bb, cc, dd] = [a, b, c, d];

        a = FF(a, b, c, d, x[k + 0], 7, 0xd76aa478);
        d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
        c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
        b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
        a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
        d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
        c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613);
        b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
        a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8);
        d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
        c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
        b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
        a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122);
        d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
        c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e);
        b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);

        a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562);
        d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
        c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51);
        b = GG(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
        a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d);
        d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
        c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
        b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
        a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
        d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
        c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
        b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
        a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
        d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
        c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9);
        b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);

        a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942);
        d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
        c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
        b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
        a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44);
        d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
        c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
        b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
        a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
        d = HH(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
        c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
        b = HH(b, c, d, a, x[k + 6], 23, 0x04881d05);
        a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
        d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
        c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
        b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);

        a = II(a, b, c, d, x[k + 0], 6, 0xf4292244);
        d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
        c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7);
        b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
        a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3);
        d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
        c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d);
        b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
        a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
        d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
        c = II(c, d, a, b, x[k + 6], 15, 0xa3014314);
        b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
        a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82);
        d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
        c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
        b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);

        a = addUnsigned(a, aa);
        b = addUnsigned(b, bb);
        c = addUnsigned(c, cc);
        d = addUnsigned(d, dd);
    }

    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
};

const bytesLength = (str) => {
    var n = (str || '').length;
    var len = 0;
    for (var i = 0; i < n; i++) {
        var s = str.charCodeAt(i);
        while (s > 0) {
            len++;
            s = s >> 8;
        }
    }
    return len / 2;
};

const padLeft = (str, length) => {
    var val = String(str);
    if (val.length >= length) return val;
    return padLeft('0' + val, length);
};

const tmpl = (str, params) => {
    var out = str;
    for (var item in params) {
        out = out.replace(new RegExp('{' + item + '}', 'g'), params[item]);
    }
    return out;
};

const createFormat = ({ gee, config }) => {
    const currency = (val) => {
        if (typeof window !== 'undefined' && window.$ && window.$.fn && typeof window.$.fn.formatMoney === 'function') {
            return '$' + window.$.fn.formatMoney((val + ''), 0);
        }
        const num = Number(val || 0);
        return '$' + Math.round(num).toString();
    };

    const formatHelper = {
        currency,
        sum: function (price, qty) { return currency(qty * price); },
        loadPic: function (path) { return (gee && gee.picUri ? gee.picUri : '') + path; },
        average: function (sum, divide) { return (divide !== '0') ? Math.round(sum * 10 / divide) / 10 : 0; },
        beforeDate: function (ts) {
            if (typeof moment === 'undefined') return ts;
            return (typeof $.timeago === 'function') ? $.timeago(ts) : moment(ts).fromNow();
        },
        showDate: function (status, flow, schedule, createDate, publishDate) {
            if (typeof moment === 'undefined') return status;
            var ts = publishDate || createDate;
            return status + ' 於 ' + moment(ts).format('MM/DD HH:mm');
        },
        iso8601: function (ts) { return (typeof moment === 'undefined') ? ts : moment(ts).toISOString(); },
        getYear: function (ts) { return (typeof moment === 'undefined') ? ts : moment(ts).format('YYYY'); },
        getMon: function (ts) { return (typeof moment === 'undefined') ? ts : moment(ts).format('MMMM'); },
        getWeek: function (ts) { return (typeof moment === 'undefined') ? ts : moment(ts).format('ddd'); },
        getDay: function (ts) { return (typeof moment === 'undefined') ? ts : moment(ts).format('DD'); },
        getTime: function (ts) { return (typeof moment === 'undefined') ? ts : moment(ts).format('HH:mm'); },
        genderedHonorific: function (gender) { return (gender === 'f') ? '女士' : '先生'; },
        linkAPI: function (str) { return (config && config.baseUrl ? config.baseUrl : '') + str; },
        nl2br: function (str) {
            var breakTag = '<br />';
            return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        }
    };

    return {
        cleanArray,
        formatHelper,
        tmpl,
        baseConverter,
        MD5,
        padLeft,
        bytesLength,
    };
};

export { createFormat, cleanArray, tmpl, baseConverter, MD5, padLeft, bytesLength };
