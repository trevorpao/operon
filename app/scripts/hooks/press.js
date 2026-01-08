import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';

app.install('press', () => {
    const press = app.get('press');
    if (!press || !ensureBrowser()) return;

    const parseIntOr = (value) => {
        const num = parseInt(value, 10);
        return Number.isFinite(num) ? num : undefined;
    };

    const parseFloatOr = (value) => {
        const num = parseFloat(value);
        return Number.isFinite(num) ? num : undefined;
    };

    const readTrack = (el) => ({
        className: el.getAttribute('data-track-class') || undefined,
        act: el.getAttribute('data-track-act') || undefined,
        value: el.getAttribute('data-track-value') || undefined,
        cate: el.getAttribute('data-track-cate') || undefined,
        ariaSuffix: el.getAttribute('data-track-aria-suffix') || undefined,
    });

    const readOptions = (el) => {
        if (!el) return {};
        return {
            waitMs: parseIntOr(el.getAttribute('data-wait-ms')),
            aspectRatio: parseFloatOr(el.getAttribute('data-aspect-ratio')),
            linkify: el.getAttribute('data-linkify') !== 'false',
            trackAttrs: readTrack(el),
        };
    };

    app.hook('press.article', ({ gene }) => {
        const target = toElement(gene.target);
        if (!target) return false;
        const options = readOptions(target);
        return press.initArticle(target, options);
    });

    app.hook('press.paywall', ({ gene }) => {
        const target = toElement(gene.target) || document.body;
        press.removePaywall(target);
    });

    app.hook('press.convert', ({ gene }) => {
        const target = toElement(gene.target);
        if (!target) return false;
        const html = target.innerHTML;
        target.innerHTML = press.convertUrlsToLinks(html);
    });
});
