const pressPlugin = {
    name: 'press',
    install() {
        const defaultTrack = {
            className: 'track',
            act: 'curiosity_inartilce',
            value: '2',
            cate: 'article',
            ariaSuffix: ':另開視窗',
        };

        const defaultOptions = {
            waitMs: 100,
            aspectRatio: 0.5625,
            linkify: true,
            trackAttrs: defaultTrack,
        };

        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const convertUrlsToLinks = (text) => {
            if (!text) return '';
            const regex = /(https?:\/\/[\w.-]+(?:\/[\w./?%&=+-]*)?)/g;
            return text.replace(regex, (url) => `<a href="${url}">${url}</a>`);
        };

        const linkifyBoxHtml = (boxEl, opts) => {
            if (!opts.linkify) return;
            const html = boxEl.innerHTML;
            if (typeof window !== 'undefined' && window.Autolinker?.link) {
                boxEl.innerHTML = window.Autolinker.link(html, { stripPrefix: false });
                return;
            }
            boxEl.innerHTML = convertUrlsToLinks(html);
        };

        const tagLinks = (contentEl, trackOpts) => {
            if (!contentEl) return;
            const { className, act, value, cate, ariaSuffix } = trackOpts;
            const ariaText = ariaSuffix || '';
            contentEl.querySelectorAll('a').forEach((anchor) => {
                const label = (anchor.textContent || '').trim();
                if (className) anchor.classList.add(className);
                if (act) anchor.setAttribute('data-act', act);
                if (value) anchor.setAttribute('data-value', value);
                if (cate) anchor.setAttribute('data-cate', cate);
                anchor.setAttribute('target', '_blank');
                anchor.setAttribute('aria-label', label ? `${label}${ariaText}` : ariaText);
            });
        };

        const resizeVideos = (contentEl, ratio) => {
            if (!contentEl) return;
            const selector = '.f-video-editor iframe, .fr-video iframe';
            contentEl.querySelectorAll(selector).forEach((iframe) => {
                const width = iframe.getBoundingClientRect().width || iframe.offsetWidth;
                if (width) {
                    iframe.style.height = `${Math.round(width * ratio)}px`;
                }
                if (!iframe.getAttribute('title')) {
                    iframe.setAttribute('title', '相關影片');
                }
            });
        };

        const replaceDict = (dictEl, selector = 'p,ul,ol', scope = document) => {
            if (!dictEl || !scope) return 0;
            const aliases = (dictEl.querySelector('.j-term-alias')?.textContent || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            if (!aliases.length) {
                dictEl.remove();
                return 0;
            }

            const html = dictEl.outerHTML;
            let inserted = false;
            scope.querySelectorAll(selector).forEach((node) => {
                if (inserted) return;
                const paragraph = node.textContent || '';
                aliases.forEach((alias) => {
                    if (!inserted && paragraph.includes(alias)) {
                        node.insertAdjacentHTML('afterend', html);
                        inserted = true;
                    }
                });
            });

            if (inserted) dictEl.remove();
            return inserted ? 1 : 0;
        };

        const removePaywall = (container) => {
            const root = container || document.body;
            if (!root) return;
            root.querySelectorAll('.js-paywall').forEach((el) => el.remove());
        };

        const initArticle = (box, options = {}) => {
            const boxEl = typeof box === 'string' ? document.querySelector(box) : box;
            if (!boxEl) return false;
            const opts = {
                ...defaultOptions,
                ...options,
                trackAttrs: { ...defaultTrack, ...(options.trackAttrs || {}) },
            };

            const pressId = boxEl.getAttribute('data-pid');
            if (!pressId) return false;

            linkifyBoxHtml(boxEl, opts);

            return wait(opts.waitMs).then(() => {
                const content = boxEl.querySelector('.article-content') || boxEl;
                tagLinks(content, opts.trackAttrs);
                resizeVideos(content, opts.aspectRatio);
                boxEl.querySelectorAll('.article-dictionary').forEach((dictEl) => {
                    replaceDict(dictEl, 'p,ul,ol', content);
                });
                return true;
            });
        };

        const api = {
            initArticle,
            removePaywall,
            convertUrlsToLinks,
            replaceDict,
        };

        return { api };
    },
};

export default pressPlugin;
