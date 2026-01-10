import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAllByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';

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
            debug: false,
        },
        __mockPlugin: pluginApi,
        __mockTrackBind: trackBind,
    };
});

vi.mock('gene-event-handler', () => ({}));

const sampleMenuHtml = `
<ul class="menu-list" role="menubar">
    <li class="menu-item" role="none">
        <a class="menu-link" role="menuitem" href="#home" aria-haspopup="false" aria-expanded="false" tabindex="-1">
            <span class="menu-link__label">首頁</span>
        </a>
    </li>
</ul>
`;

const nestedMenuHtml = `
<ul class="menu-list" role="menubar">
    <li class="menu-item has-children" role="none">
        <a class="menu-link" role="menuitem" href="#products" aria-haspopup="true" aria-expanded="false" tabindex="-1">
            <span class="menu-link__label">產品</span>
        </a>
        <ul role="menu">
            <li class="menu-item" role="none">
                <a class="menu-link" role="menuitem" href="#analytics" target="_blank" tabindex="-1">
                    <span class="menu-link__label">分析</span>
                </a>
            </li>
        </ul>
    </li>
    <li class="menu-item" role="none">
        <a class="menu-link" role="menuitem" href="#contact" aria-haspopup="false" aria-expanded="false" tabindex="-1">
            <span class="menu-link__label">聯絡</span>
        </a>
    </li>
</ul>
`;

const createTarget = () => {
    const nav = document.createElement('nav');
    nav.setAttribute('data-gene', 'init:menu.load');
    nav.dataset.menuId = 'primary';
    nav.dataset.menuTemplate = 'navbar';
    nav.dataset.menuTimeout = '1500';
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
        hook: vi.fn((name, handler) => {
            hooks.set(name, handler);
        }),
        init: vi.fn(),
        isset: (value) => typeof value !== 'undefined' && value !== null,
    };

    const appModule = await import('../../app/scripts/app');
    const appMock = appModule.default;
    appMock.debug = false;
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
        appMock,
        installMenuHook: hookModule.default,
    };
};

describe('menu hook integration', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('renders via gee hook and tears down cleanly', async () => {
        const { hooks, pluginApi, trackBind, installMenuHook, appMock } = await setupHookModule();
        appMock.debug = true;
        pluginApi.render.mockResolvedValue({ html: sampleMenuHtml, menu: [] });
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        const nav = createTarget();
        const teardown = installMenuHook();
        const loadHook = hooks.get('menu.load');

        await expect(loadHook(nav)).resolves.toBe(true);

        expect(pluginApi.render).toHaveBeenCalledWith(expect.objectContaining({
            template: 'navbar',
            menuId: 'primary',
            timeout: 1500,
        }));
        expect(nav.classList.contains('menu--ready')).toBe(true);
        expect(nav.getAttribute('aria-busy')).toBeNull();
        expect(nav.dataset.menuLoadedAt).toBeDefined();
        expect(trackBind).toHaveBeenCalledWith(nav);
        expect(globalThis.gee.init).toHaveBeenCalled();

        teardown();
        expect(pluginApi.destroy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalled();
        infoSpy.mockRestore();
    });

    it('handles keyboard interactions and passes axe audit', async () => {
        const { hooks, pluginApi, installMenuHook, appMock } = await setupHookModule();
        appMock.debug = true;
        pluginApi.render.mockResolvedValue({ html: nestedMenuHtml, menu: [] });
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        const nav = createTarget();
        const teardown = installMenuHook();
        const loadHook = hooks.get('menu.load');
        await loadHook(nav);

        const items = getAllByRole(nav, 'menuitem');
        const parentLink = items[0];
        const submenu = nav.querySelector('li.has-children > ul');
        const childLink = submenu.querySelector('[role="menuitem"]');

        expect(submenu).not.toBeNull();
        expect(submenu.hasAttribute('hidden')).toBe(true);
        expect(document.activeElement).toBe(parentLink);

        const user = userEvent.setup();
        await user.keyboard('{ArrowRight}');
        expect(parentLink.getAttribute('aria-expanded')).toBe('true');
        expect(submenu.hasAttribute('hidden')).toBe(false);
        expect(document.activeElement).toBe(childLink);

        await user.keyboard('{Escape}');
        expect(parentLink.getAttribute('aria-expanded')).toBe('false');
        expect(submenu.hasAttribute('hidden')).toBe(true);

        const external = nav.querySelector('[target="_blank"]');
        expect(external.getAttribute('rel')).toContain('noopener');

        const { violations } = await axe.run(nav, {
            rules: {
                'color-contrast': { enabled: false },
            },
        });
        if (violations.length) {
            console.error('axe violations', violations);
        }
        expect(violations).toHaveLength(0);

        teardown();
        expect(infoSpy).toHaveBeenCalled();
        infoSpy.mockRestore();
    });

    it('skips accessibility wiring when debug is disabled', async () => {
        const { hooks, pluginApi, installMenuHook, appMock } = await setupHookModule();
        appMock.debug = false;
        pluginApi.render.mockResolvedValue({ html: nestedMenuHtml, menu: [] });
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        const nav = createTarget();
        const teardown = installMenuHook();
        const loadHook = hooks.get('menu.load');
        await loadHook(nav);

        const parentLink = nav.querySelector('li.has-children > [role="menuitem"]');
        const submenu = nav.querySelector('li.has-children > ul');
        const external = nav.querySelector('[target="_blank"]');

        const initialExpanded = parentLink.getAttribute('aria-expanded');
        const initialHidden = submenu.hasAttribute('hidden');
        const initialRel = external.getAttribute('rel');

        const user = userEvent.setup();
        await user.keyboard('{ArrowRight}');

        expect(parentLink.getAttribute('aria-expanded')).toBe(initialExpanded);
        expect(submenu.hasAttribute('hidden')).toBe(initialHidden);
        expect(external.getAttribute('rel')).toBe(initialRel);

        expect(infoSpy).not.toHaveBeenCalled();
        infoSpy.mockRestore();
        teardown();
    });
});
