import { describe, it, expect, vi } from 'vitest';

vi.mock('../../app/scripts/app', () => ({
    default: { tmplHelpers: {} },
}));

vi.mock('trevorpao/geneEH', () => ({
    default: {},
}));

import { createFormatHelper } from '../../app/scripts/lib/format';

const createHelper = () => createFormatHelper({
    appRef: { tmplHelpers: {} },
    gee: {
        picUri: 'https://cdn.operon.dev',
        mainUri: 'https://api.operon.dev',
    },
    jquery: null,
    momentLib: null,
});

describe('format helper', () => {
    it('rewrites thumbnail paths using presets and CDN prefix', () => {
        const helper = createHelper();
        const result = helper.thumbnail('/upload/images/poster.jpg', 'press');
        expect(result).toBe('https://cdn.operon.dev/upload/images/poster_400x225.jpg');
    });

    it('calculates rounded-up percent values', () => {
        const helper = createHelper();
        expect(helper.percent(5, 8, 2)).toBe(62.5);
        expect(helper.calPercent(1, 3, 2)).toBe(33.34);
    });
});
