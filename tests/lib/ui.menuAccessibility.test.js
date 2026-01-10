import { beforeEach, describe, expect, it, vi } from 'vitest';
import { menuAccessibility, createMenuHelpers } from '../../app/scripts/lib/ui';

const buildMenuRoot = () => {
    const nav = document.createElement('nav');
    nav.innerHTML = `
        <ul class="menu-list" role="menubar">
            <li class="menu-item has-children" role="none">
                <a class="menu-link" role="menuitem" href="#products" aria-haspopup="true" aria-expanded="false">
                    產品
                </a>
                <ul role="menu">
                    <li class="menu-item" role="none">
                        <a class="menu-link" role="menuitem" href="#analytics" target="_blank">
                            分析
                        </a>
                    </li>
                </ul>
            </li>
        </ul>
    `;
    document.body.appendChild(nav);
    return nav;
};

describe('ui.menuAccessibility', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('secures external links with noopener', () => {
        const root = buildMenuRoot();
        const external = root.querySelector('[target="_blank"]');
        external.setAttribute('rel', '');

        menuAccessibility.secureExternalLinks(root, '[role="menuitem"][target="_blank"]');

        expect(external.getAttribute('rel')).toContain('noopener');
    });

    it('prevents duplicate registrations', () => {
        const root = buildMenuRoot();
        const disposeFn = vi.fn();
        const attachSpy = vi.fn(() => disposeFn);

        const tokenA = menuAccessibility.ensureSingleRegistration(root, attachSpy);
        const tokenB = menuAccessibility.ensureSingleRegistration(root, attachSpy);

        expect(tokenA).toBe(tokenB);
        expect(attachSpy).toHaveBeenCalledTimes(1);

        tokenA.dispose();
        expect(disposeFn).toHaveBeenCalledTimes(1);

        const tokenC = menuAccessibility.ensureSingleRegistration(root, attachSpy);
        expect(tokenC).not.toBe(tokenA);
        expect(attachSpy).toHaveBeenCalledTimes(2);
        tokenC.dispose();
    });

    it('attaches interactions only when mode is debug', () => {
        const debugRoot = buildMenuRoot();
        const liteRoot = buildMenuRoot();

        const buildOptions = (root, handleKey) => ({
            root,
            selectors: {
                itemSelector: '[role="menuitem"]',
                parentSelector: 'li.has-children',
            },
            callbacks: {
                itemSelector: '[role="menuitem"]',
                hasSubmenu: (link) => Boolean(link.closest('li')?.querySelector(':scope > ul')),
                toggleSubmenu: vi.fn(),
                moveFocus: vi.fn(),
                focusParentItem: vi.fn(),
                focusFirstChild: vi.fn(),
                setActiveItem: (item, items) => {
                    items.forEach((node) => node.setAttribute('tabindex', '-1'));
                    item.setAttribute('tabindex', '0');
                },
                allowedKeys: new Set(['ArrowDown']),
                handleKey,
            },
        });

        const debugHandleKey = vi.fn();
        const liteHandleKey = vi.fn();

        const debugHelpers = createMenuHelpers({ appDebug: true });
        const liteHelpers = createMenuHelpers({ appDebug: false });

        const disposeDebug = debugHelpers.attachMenuInteractions(buildOptions(debugRoot, debugHandleKey));
        const disposeLite = liteHelpers.attachMenuInteractions(buildOptions(liteRoot, liteHandleKey));

        const debugItem = debugRoot.querySelector('[role="menuitem"]');
        const liteItem = liteRoot.querySelector('[role="menuitem"]');

        debugItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        liteItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

        expect(debugHandleKey).toHaveBeenCalledTimes(1);
        expect(liteHandleKey).toHaveBeenCalledTimes(0);

        disposeDebug();
        disposeLite();
    });
});
