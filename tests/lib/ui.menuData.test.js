import { describe, expect, it, vi } from 'vitest';
import { menuData } from '../../app/scripts/lib/ui';

describe('ui.menuData', () => {
    it('normalizes nested nodes recursively', () => {
        const node = {
            title: 'parent',
            children: [
                { title: 'child-1' },
                null,
                { title: 'child-2', rows: [{ title: 'leaf' }] },
            ],
        };
        const normalized = menuData.normalizeNode(node);
        expect(normalized?.rows).toHaveLength(2);
        expect(normalized.rows[1].rows[0].title).toBe('leaf');
    });

    it('normalizes payload shapes returned by yell', () => {
        const payload = {
            data: {
                data: [
                    { title: 'foo' },
                    { title: 'bar', children: [{ title: 'baz' }] },
                ],
            },
        };
        const menu = menuData.normalizeMenuData(payload);
        expect(menu).toHaveLength(2);
        expect(menu[1].rows[0].title).toBe('baz');
    });

    it('withTimeout resolves when promise finishes early', async () => {
        await expect(menuData.withTimeout(Promise.resolve('ok'), 10)).resolves.toBe('ok');
    });

    it('withTimeout rejects when promise exceeds timeout', async () => {
        const never = new Promise(() => {});
        await expect(menuData.withTimeout(never, 5, 'timeout')).rejects.toThrow('timeout');
    });

    it('loadMenuWithCache caches results and uses normalizer', async () => {
        const cacheMap = new Map();
        const loader = vi.fn().mockResolvedValue([{ title: 'cached' }]);
        const normalizer = vi.fn((value) => value);

        const first = await menuData.loadMenuWithCache({
            cacheKey: 'alpha',
            cacheMap,
            loader,
            normalizer,
        });
        expect(first).toEqual([{ title: 'cached' }]);
        expect(loader).toHaveBeenCalledTimes(1);

        const second = await menuData.loadMenuWithCache({
            cacheKey: 'alpha',
            cacheMap,
            loader,
            normalizer,
        });
        expect(second).toEqual(first);
        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('validateSchema guards against non-array menu data', () => {
        expect(menuData.validateSchema([{ title: 'ok' }])).toBe(true);
        expect(menuData.validateSchema(null)).toBe(false);
    });
});
