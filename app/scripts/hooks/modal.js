import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';
import registerHooks from '../lib/hooks/register';

const truthy = (value) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === '') return true;
    if (normalized === 'false' || normalized === '0') return false;
    return undefined;
};

const readTargetId = (el) => {
    if (!el) return 'modal';
    const target = el.getAttribute('data-target') || el.getAttribute('data-ta');
    return target || 'modal';
};

const readVideoId = (el) => {
    if (!el) return undefined;
    return el.getAttribute('data-video')
        || el.getAttribute('data-video-id')
        || el.getAttribute('data-youtubeid');
};

const readHtml = (el) => {
    if (!el) return undefined;
    const inlineHtml = el.getAttribute('data-html');
    if (inlineHtml) return inlineHtml;
    const iframeSrc = el.getAttribute('data-src');
    if (iframeSrc) {
        return `<iframe src="${iframeSrc}" frameborder="0" allowfullscreen></iframe>`;
    }
    return undefined;
};

const readOptions = (el) => {
    if (!el) return {};
    const useBootstrapAttr = el.getAttribute('data-use-bootstrap');
    const lockScrollAttr = el.getAttribute('data-modal-lock-scroll');
    const autoplayAttr = el.getAttribute('data-video-autoplay');
    return {
        size: el.getAttribute('data-modal-size') || undefined,
        zIndex: el.getAttribute('data-modal-z') || undefined,
        lockScroll: truthy(lockScrollAttr),
        closeSelector: el.getAttribute('data-close-selector') || undefined,
        html: readHtml(el),
        htmlSrc: el.getAttribute('data-html-src') || undefined,
        useBootstrap: truthy(useBootstrapAttr),
        trigger: el,
        embedTemplate: el.getAttribute('data-embed-template') || undefined,
        autoplay: autoplayAttr === null ? true : autoplayAttr !== 'false',
    };
};

const pickElement = (me) => {
    if (me && me.event && me.event.target) {
        return toElement(me.event.target);
    }
    return toElement(me);
};

export default function installModalHook() {
    if (!ensureBrowser()) return () => {};
    let modal;
    try {
        modal = app.get('ui.modal');
    } catch (err) {
        modal = null;
    }
    if (!modal) return () => {};

    const callModal = (method, ...args) => {
        if (modal && typeof modal[method] === 'function') {
            modal[method](...args);
            return true;
        }
        return false;
    };

    const handleShow = (me) => {
        const el = pickElement(me);
        if (!el) return false;
        const id = readTargetId(el);
        const opts = readOptions(el);
        callModal('show', id, opts);
        return true;
    };

    const handleHide = (me) => {
        const el = pickElement(me);
        if (!el) return false;
        const id = readTargetId(el);
        const opts = readOptions(el);
        callModal('hide', id, opts);
        return true;
    };

    const handleInlineShow = (me) => {
        const el = pickElement(me);
        if (!el) return false;
        const id = readTargetId(el);
        const opts = readOptions(el);
        callModal('showInline', id, opts.html, opts);
        return true;
    };

    const handleInlineHide = (me) => {
        const el = pickElement(me);
        if (!el) return false;
        const id = readTargetId(el);
        const opts = readOptions(el);
        callModal('hideInline', id, opts);
        return true;
    };

    const handleYouTubeShow = (me) => {
        const el = pickElement(me);
        if (!el) return false;
        const id = readTargetId(el);
        const videoId = readVideoId(el);
        const opts = readOptions(el);
        callModal('showYouTube', id, videoId, opts);
        return true;
    };

    const handleYouTubeHide = (me) => {
        const el = pickElement(me);
        if (!el) return false;
        const id = readTargetId(el);
        const opts = readOptions(el);
        callModal('hideYouTube', id, opts);
        return true;
    };

    registerHooks('modal', {
        show: handleShow,
        hide: handleHide,
        'inline.show': handleInlineShow,
        'inline.hide': handleInlineHide,
        'youtube.show': handleYouTubeShow,
        'youtube.hide': handleYouTubeHide,
    }, {
        legacy: {
            show: ['modal.iframe', 'arena.modal.show', 'arena.modal.iframe'],
            hide: ['arena.hideModal'],
            'inline.show': ['arena.openModal'],
            'inline.hide': ['arena.closeModal'],
            'youtube.show': ['arena.openYTModal'],
            'youtube.hide': ['arena.closeYTModal'],
        },
    });

    return function teardownModalHook() {
        // gee.hook has no unregister support
    };
}
