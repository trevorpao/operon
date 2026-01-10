import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../app/scripts/app', () => {
    const pluginApi = {
        render: vi.fn(),
        loadMenu: vi.fn(),
        destroy: vi.fn(),
    };
    const trackBind = vi.fn();

    return {
        __esModule: true,
        default: {
            get: vi.fn(() => pluginApi),
            track: {
                bind: trackBind,
            },
        },
        __mockPlugin: pluginApi,
        __mockTrackBind: trackBind,
    };
});

vi.mock('gene-event-handler', () => ({}));

const sampleMenuHtml = `
<ul class="menu-list" role="menubar">
    <li class="menu-item" role="none">
        <a class="menu-link" role="menuitem" href="#legacy" aria-haspopup="false" aria-expanded="false" tabindex="-1">
            <span class="menu-link__label">Legacy</span>
        </a>
    </li>
</ul>
`;

const createTarget = () => {
    const nav = document.createElement('nav');
    nav.setAttribute('data-gene', 'init:menu.load');
    nav.dataset.menuId = 'baseline';
    nav.dataset.menuTemplate = 'navbar';
    nav.dataset.menuTimeout = '800';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', '主選單');
    document.body.appendChild(nav);
    return nav;
};

const setupHookModule = async () => {
    vi.resetModules();
    document.body.innerHTML = '';

    const hooks = new Map();
    globalThis.gee = {
        hook: vi.fn((name, handler) => hooks.set(name, handler)),
        init: vi.fn(),
        isset: (value) => typeof value !== 'undefined' && value !== null,
    };

    const appModule = await import('../../app/scripts/app');
    const pluginApi = appModule.__mockPlugin;
    const trackBind = appModule.__mockTrackBind;
    pluginApi.render.mockReset();
    pluginApi.loadMenu.mockReset();
    pluginApi.destroy.mockReset();
    trackBind.mockReset();

    const hookModule = await import('../../app/scripts/hooks/menu.js');
    return {
        hooks,
        pluginApi,
        trackBind,
        installMenuHook: hookModule.default,
    };
};

describe('menu legacy smoke baseline', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('renders fallback UI when plugin render rejects', async () => {
        const { hooks, pluginApi, installMenuHook } = await setupHookModule();
        pluginApi.render.mockRejectedValueOnce(new Error('legacy failure'));

        const nav = createTarget();
        const teardown = installMenuHook();
        const loadHook = hooks.get('menu.load');

        await expect(loadHook(nav)).resolves.toBe(false);
        expect(nav.classList.contains('menu--error')).toBe(true);
        const message = nav.querySelector('.menu-fallback__message');
        expect(message).not.toBeNull();
        expect(message.textContent).toContain('legacy failure');

        teardown();
    });

    it('toggles loading classes during legacy render flow', async () => {
        const { hooks, pluginApi, installMenuHook, trackBind } = await setupHookModule();
        pluginApi.render.mockResolvedValue({ html: sampleMenuHtml, menu: [] });

        const nav = createTarget();
        const teardown = installMenuHook();
        const loadHook = hooks.get('menu.load');

        const pending = loadHook(nav);
        expect(nav.classList.contains('menu--loading')).toBe(true);

        await expect(pending).resolves.toBe(true);
        expect(nav.classList.contains('menu--ready')).toBe(true);
        expect(trackBind).toHaveBeenCalledWith(nav);

        teardown();
    });
});
