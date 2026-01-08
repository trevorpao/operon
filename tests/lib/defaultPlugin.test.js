import { describe, it, expect, beforeEach } from 'vitest';
import { createPlugin, __resetPluginRegistry } from '../../app/scripts/lib/defaultPlugin';

describe('createPlugin', () => {
    beforeEach(() => {
        __resetPluginRegistry();
    });

    it('wraps install errors with plugin metadata', async () => {
        const plugin = createPlugin({
            name: 'test.plugin',
            async install() {
                throw new Error('boom');
            },
        });

        await expect(plugin.install()).rejects.toThrow('[plugin:test.plugin] install failed');
        try {
            await plugin.install();
        } catch (error) {
            expect(error.cause).toBeInstanceOf(Error);
            expect(error.cause.message).toBe('boom');
        }
    });
});
