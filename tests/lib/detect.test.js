import { describe, it, expect, afterEach } from 'vitest';
import {
    getCapabilities,
    refreshCapabilities,
    isMobileDevice,
    hasTouchSupport,
    getViewport,
} from '../../app/scripts/lib/detect';

describe('detect capabilities', () => {
    afterEach(() => {
        delete globalThis.jQuery;
        if (typeof window !== 'undefined') {
            delete window.jQuery;
        }
    });

    it('derives feature flags from coarse pointer + touch data', () => {
        refreshCapabilities({
            touch: true,
            coarsePointer: true,
            viewportWidth: 414,
            viewportHeight: 896,
        });
        const caps = getCapabilities();

        expect(isMobileDevice(caps)).toBe(true);
        expect(hasTouchSupport(caps)).toBe(true);
        expect(getViewport()).toEqual({ width: 414, height: 896 });
    });

    it('syncs legacy jQuery.browser.mobile shim', () => {
        const jquery = { browser: {} };
        globalThis.jQuery = jquery;
        if (typeof window !== 'undefined') {
            window.jQuery = jquery;
        }

        refreshCapabilities({ isMobile: true });
        expect(jquery.browser.mobile).toBe(true);
        refreshCapabilities({ isMobile: false });
        expect(jquery.browser.mobile).toBe(false);
    });
});
