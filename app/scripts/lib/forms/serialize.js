import { ensureBrowser } from '../shared';

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

export { serializeFormJSON };
