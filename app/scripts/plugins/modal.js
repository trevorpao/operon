import { createPlugin } from '../lib/defaultPlugin';

const modalPlugin = createPlugin({
    name: 'ui.modal',
    install() {
        const modalCache = new Map();
        const sizes = { lg: 'modal-lg', md: 'modal-nor', sm: 'modal-sm' };
        const zIndexes = { base: 100, info: 150, warn: 200 };
        const defaultOptions = {
            size: 'md',
            zIndex: 'base',
            lockScroll: false,
            autoplay: true,
            embedTemplate: 'https://www.youtube.com/embed/{id}?autoplay=1',
            closeSelector: '[data-gene="modal.hide"],[data-dismiss="modal"]',
        };

        let currentId = null;
        let lastTrigger = null;
        let listenersBound = false;
        let activeModal = null;
        let bodyOverflow = null;
        let lockCount = 0;

        const hasBootstrapModal = () => typeof window !== 'undefined' && typeof window.$ === 'function' && typeof window.$.fn?.modal === 'function';

        const getModal = (id) => {
            if (!id) return null;
            if (modalCache.has(id)) return modalCache.get(id);
            const el = document.getElementById(id);
            if (!el) {
                console.warn('[modal] missing modal', id);
                return null;
            }
            modalCache.set(id, el);
            return el;
        };

        const cleanupBody = (modalEl) => {
            if (!modalEl) return;
            const body = modalEl.querySelector('.modal-body');
            if (body) body.innerHTML = '';
        };

        const removeSizeClasses = (modalEl) => {
            if (!modalEl) return;
            const content = modalEl.querySelector('.modal-content');
            if (!content) return;
            Object.values(sizes).forEach((cls) => content.classList.remove(cls));
        };

        const applySize = (modalEl, size) => {
            const content = modalEl?.querySelector('.modal-content');
            if (!content) return;
            removeSizeClasses(modalEl);
            const cls = sizes[size];
            if (cls) content.classList.add(cls);
        };

        const applyZIndex = (modalEl, zKey) => {
            const value = zIndexes[zKey] ?? zIndexes.base;
            modalEl.style.zIndex = String(value);
        };

        const lockScroll = () => {
            if (lockCount === 0) {
                bodyOverflow = document.body.style.overflow || '';
                document.body.style.overflow = 'hidden';
            }
            lockCount += 1;
        };

        const unlockScroll = () => {
            lockCount = Math.max(0, lockCount - 1);
            if (lockCount === 0) {
                document.body.style.overflow = bodyOverflow;
            }
        };

        const focusableSelectors = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
        const focusTrap = (modalEl, event) => {
            if (event.key !== 'Tab') return;
            const focusable = Array.from(modalEl.querySelectorAll(focusableSelectors)).filter((node) => !node.hasAttribute('disabled'));
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        const setAria = (modalEl, isHidden) => {
            modalEl.setAttribute('role', 'dialog');
            modalEl.setAttribute('aria-modal', 'true');
            modalEl.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
            if (!modalEl.hasAttribute('tabindex')) modalEl.setAttribute('tabindex', '-1');
        };

        const applyContent = (modalEl, opts) => {
            const body = modalEl.querySelector('.modal-body');
            if (!body) return;
            let content = opts.html;
            if (!content && opts.htmlSrc) {
                const source = document.querySelector(opts.htmlSrc);
                if (source) content = source.innerHTML;
            }
            if (!content) return;
            if (typeof opts.render === 'function') content = opts.render(content);
            if (typeof opts.sanitize === 'function') content = opts.sanitize(content);
            body.innerHTML = content;
        };

        const clearIframe = (modalEl) => {
            const iframe = modalEl.querySelector('iframe');
            if (iframe) iframe.src = '';
        };

        const restoreIframe = (modalEl, src) => {
            const iframe = modalEl.querySelector('iframe');
            if (iframe) iframe.src = src || '';
        };

        const storeState = (id, modalEl, options) => {
            currentId = id;
            lastTrigger = options.trigger || document.activeElement;
            activeModal = { el: modalEl, closeSelector: options.closeSelector };
            if (!listenersBound) {
                document.addEventListener('keydown', onKeydown, true);
                document.addEventListener('click', onDocumentClick, true);
                listenersBound = true;
            }
        };

        const clearState = () => {
            activeModal = null;
            currentId = null;
            lastTrigger = null;
            if (listenersBound) {
                document.removeEventListener('keydown', onKeydown, true);
                document.removeEventListener('click', onDocumentClick, true);
                listenersBound = false;
            }
        };

        const normalizeOptions = (options = {}) => ({ ...defaultOptions, ...options });

        const openDom = (id, modalEl, options) => {
            applySize(modalEl, options.size);
            applyZIndex(modalEl, options.zIndex);
            applyContent(modalEl, options);
            setAria(modalEl, false);
            modalEl.classList.remove('hide');
            modalEl.classList.add('is-active');
            modalEl.removeAttribute('hidden');
            modalEl.style.display = 'block';
            if (options.lockScroll) lockScroll();
            storeState(id, modalEl, options);
            modalEl.focus();
        };

        const closeDom = (id, modalEl, options) => {
            cleanupBody(modalEl);
            removeSizeClasses(modalEl);
            setAria(modalEl, true);
            modalEl.classList.add('hide');
            modalEl.classList.remove('is-active');
            modalEl.setAttribute('hidden', 'true');
            modalEl.style.display = 'none';
            modalEl.style.zIndex = '';
            clearIframe(modalEl);
            if (options.lockScroll) unlockScroll();
            if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
            clearState();
        };

        const onKeydown = (event) => {
            if (!activeModal || !activeModal.el) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                close(currentId, { lockScroll: lockCount > 0 });
            } else {
                focusTrap(activeModal.el, event);
            }
        };

        const onDocumentClick = (event) => {
            if (!activeModal || !activeModal.el) return;
            const target = event.target;
            if (target === activeModal.el || (activeModal.closeSelector && target.closest(activeModal.closeSelector))) {
                close(currentId, { lockScroll: lockCount > 0 });
            }
        };

        const openBootstrap = (id, modalEl, options) => {
            applySize(modalEl, options.size);
            applyZIndex(modalEl, options.zIndex);
            applyContent(modalEl, options);
            setAria(modalEl, false);
            window.$(modalEl).modal('show');
            if (options.lockScroll) lockScroll();
            storeState(id, modalEl, options);
        };

        const closeBootstrap = (id, modalEl, options) => {
            cleanupBody(modalEl);
            removeSizeClasses(modalEl);
            setAria(modalEl, true);
            modalEl.style.zIndex = '';
            window.$(modalEl).modal('hide');
            clearIframe(modalEl);
            if (options.lockScroll) unlockScroll();
            if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
            clearState();
        };

        const open = (id, options = {}) => {
            const modalEl = getModal(id);
            if (!modalEl) return;
            const opts = normalizeOptions(options);
            const useBootstrap = opts.useBootstrap ?? hasBootstrapModal();
            if (useBootstrap) {
                openBootstrap(id, modalEl, opts);
            } else {
                openDom(id, modalEl, opts);
            }
        };

        const close = (id, options = {}) => {
            const modalEl = getModal(id);
            if (!modalEl) return;
            const opts = normalizeOptions(options);
            const useBootstrap = opts.useBootstrap ?? hasBootstrapModal();
            if (useBootstrap) {
                closeBootstrap(id, modalEl, opts);
            } else {
                closeDom(id, modalEl, opts);
            }
        };

        const showInline = (id, html, options = {}) => {
            open(id, { ...options, html, useBootstrap: false });
        };

        const hideInline = (id, options = {}) => {
            close(id, { ...options, useBootstrap: false });
        };

        const showYouTube = (id, videoId, options = {}) => {
            if (!videoId) return;
            const modalEl = getModal(id);
            if (!modalEl) return;
            const opts = normalizeOptions(options);
            const template = opts.embedTemplate || defaultOptions.embedTemplate;
            const src = template.replace('{id}', videoId).replace('{videoId}', videoId);
            const iframe = modalEl.querySelector('iframe');
            if (!iframe) {
                console.warn('[modal] missing iframe for youtube', id);
            } else {
                iframe.dataset.originalSrc = iframe.dataset.originalSrc || iframe.src;
                iframe.src = opts.autoplay ? src : iframe.src || src.replace('?autoplay=1', '');
            }
            open(id, { ...opts, useBootstrap: opts.useBootstrap ?? false });
        };

        const hideYouTube = (id, options = {}) => {
            const modalEl = getModal(id);
            if (!modalEl) return;
            const iframe = modalEl.querySelector('iframe');
            if (iframe) restoreIframe(modalEl, iframe.dataset.originalSrc || '');
            close(id, { ...options, useBootstrap: options.useBootstrap ?? false });
        };

        const destroy = (id) => {
            const modalEl = getModal(id);
            if (!modalEl) return;
            if (currentId === id) close(id, { lockScroll: lockCount > 0 });
            cleanupBody(modalEl);
            removeSizeClasses(modalEl);
            modalEl.style.zIndex = '';
            clearIframe(modalEl);
            modalCache.delete(id);
        };

        const api = {
            open,
            close,
            show: open,
            hide: close,
            showInline,
            hideInline,
            showYouTube,
            hideYouTube,
            destroy,
        };

        return { api };
    },
});

export default modalPlugin;
