import { describe, it, expect } from 'vitest';
import {
    getCapabilities,
    refreshCapabilities,
    isMobileDevice,
    hasTouchSupport,
    getViewport,
} from '../../app/scripts/lib/detect';

describe('detect capabilities', () => {
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
});
