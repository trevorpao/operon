import { describe, it, expect, vi } from 'vitest';

const importWithoutBrowser = async (modulePath) => {
    const hadWindow = Object.prototype.hasOwnProperty.call(globalThis, 'window');
    const hadDocument = Object.prototype.hasOwnProperty.call(globalThis, 'document');
    const hadNavigator = Object.prototype.hasOwnProperty.call(globalThis, 'navigator');
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    const originalNavigator = globalThis.navigator;
    vi.resetModules();
    try {
        delete globalThis.window;
        delete globalThis.document;
        delete globalThis.navigator;
        return await import(modulePath);
    } finally {
        if (hadWindow) {
            globalThis.window = originalWindow;
        } else {
            delete globalThis.window;
        }
        if (hadDocument) {
            globalThis.document = originalDocument;
        } else {
            delete globalThis.document;
        }
        if (hadNavigator) {
            globalThis.navigator = originalNavigator;
        } else {
            delete globalThis.navigator;
        }
    }
};

describe('SSR safety', () => {
    it('loads detect module without window/document globals', async () => {
        const mod = await importWithoutBrowser('../../app/scripts/lib/detect.js');
        expect(mod).toBeTruthy();
    });

    it('loads head module without window/document globals', async () => {
        const mod = await importWithoutBrowser('../../app/scripts/lib/head.js');
        expect(mod).toBeTruthy();
    });
});
