import { describe, it, expect, beforeEach } from 'vitest';
import headPlugin from '../../app/scripts/lib/head';

describe('requireModernBrowser helper', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        headPlugin.resetState();
    });

    it('injects default UI when predicate reports legacy browser', () => {
        const ok = headPlugin.requireModernBrowser({ predicate: () => false });
        expect(ok).toBe(false);
        expect(document.querySelector('.browser-upgrade-notice')).not.toBeNull();
    });
});

describe('head plugin analytics', () => {
    beforeEach(() => {
        document.head.innerHTML = '';
        document.body.innerHTML = '';
        delete window.gaMeasurementID;
        window.dataLayer = [];
        delete window.gtag;
        headPlugin.resetState();
    });

    it('injects gtag only when measurement id provided', () => {
        headPlugin.injectAnalytics('G-TEST', { autoInitGa: true });
        const script = document.querySelector('script[data-gtag-id="G-TEST"]');
        expect(script).not.toBeNull();
        expect(window.dataLayer.length).toBeGreaterThanOrEqual(2);
    });

    it('skips analytics when measurement id missing', () => {
        headPlugin.injectAnalytics(null);
        expect(document.querySelector('[data-gtag-id]')).toBeNull();
        expect(window.dataLayer.length).toBe(0);
    });
});
