import app from '../app';
import { createPlugin } from './defaultPlugin';
import {
    toStringSafe,
    toNumberSafe,
    toNodes,
    toElement,
} from './shared';
import { placeholder } from './dom/placeholder';
import { alterClass, hasMutilClass, visible } from './dom/classList';
import { serializeFormJSON } from './forms/serialize';
import { formatNum } from './number/format';

const inArray = (ary, value) => Array.isArray(ary) ? ary.indexOf(value) !== -1 : false;

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

const extendPlugin = createPlugin({
    name: 'util.extend',
    async install() {
        app.extendHelper = extendHelper;
        return { api: extendHelper };
    },
});

export default extendPlugin;
