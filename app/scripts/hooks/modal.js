import app from '../app';
import { ensureBrowser } from '../lib/head';

app.install('modal', () => {
    const modal = app.get('ui.modal');
    if (!modal || !ensureBrowser()) return;

    const readTargetId = (gene) => gene.target?.getAttribute('data-target') || 'modal';
    const readVideoId = (gene) => gene.target?.getAttribute('data-video');

    const readBool = (value) => value === 'true' || value === true;

    const readOptions = (gene) => {
        const el = gene.target;
        if (!el) return {};
        return {
            size: el.getAttribute('data-modal-size') || undefined,
            zIndex: el.getAttribute('data-modal-z') || undefined,
            lockScroll: readBool(el.getAttribute('data-modal-lock-scroll')),
            closeSelector: el.getAttribute('data-close-selector') || undefined,
            html: el.getAttribute('data-html') || undefined,
            htmlSrc: el.getAttribute('data-html-src') || undefined,
            useBootstrap: el.getAttribute('data-use-bootstrap') === 'true' ? true : el.getAttribute('data-use-bootstrap') === 'false' ? false : undefined,
            trigger: el,
            embedTemplate: el.getAttribute('data-embed-template') || undefined,
            autoplay: el.getAttribute('data-video-autoplay') !== 'false',
        };
    };

    app.hook('modal.show', ({ gene }) => {
        const id = readTargetId(gene);
        const options = readOptions(gene);
        modal.show(id, options);
    });

    app.hook('modal.hide', ({ gene }) => {
        const id = readTargetId(gene);
        const options = readOptions(gene);
        modal.hide(id, options);
    });

    app.hook('modal.inline.show', ({ gene }) => {
        const id = readTargetId(gene);
        const options = readOptions(gene);
        modal.showInline(id, options.html, options);
    });

    app.hook('modal.inline.hide', ({ gene }) => {
        const id = readTargetId(gene);
        const options = readOptions(gene);
        modal.hideInline(id, options);
    });

    app.hook('modal.youtube.show', ({ gene }) => {
        const id = readTargetId(gene);
        const videoId = readVideoId(gene);
        const options = readOptions(gene);
        modal.showYouTube(id, videoId, options);
    });

    app.hook('modal.youtube.hide', ({ gene }) => {
        const id = readTargetId(gene);
        const options = readOptions(gene);
        modal.hideYouTube(id, options);
    });
});
