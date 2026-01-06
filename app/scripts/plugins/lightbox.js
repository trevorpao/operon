import app from '../app';

const defaults = {
    rootSelector: '.fr-view .fr-fic',
    lightboxId: 'lightbox',
    imageId: 'lightbox-img',
    figcaptionId: 'lightbox-figcaption',
    illustrateId: 'lightbox-illustrate',
    minItems: 3,
    allowMobile: false,
};

const buildArray = (iterable) => Array.prototype.slice.call(iterable || []);

const resolveFigureSet = (node) => {
    if (!node) return { box: null, img: null };
    let box = node;
    let img = null;
    if (node.tagName && node.tagName.toLowerCase() === 'img') {
        img = node;
        const fig = node.closest('figure') || node.closest('p');
        if (fig) box = fig;
    } else {
        img = node.querySelector('img');
    }
    return { box, img };
};

const lightboxPlugin = {
    name: 'ui.lightbox',
    install() {
        let state = {
            figures: [],
            currentIndex: 0,
            lightbox: null,
            lightboxImg: null,
            figcaptionEl: null,
            illustrateEl: null,
            btnClose: null,
            btnPrev: null,
            btnNext: null,
            teardownFns: [],
            options: { ...defaults },
            ready: false,
        };

        const detachAll = () => {
            state.teardownFns.forEach((fn) => {
                try { fn(); } catch (err) { /* ignore */ }
            });
            state.teardownFns = [];
        };

        const close = () => {
            if (!state.lightbox) return;
            state.lightbox.classList.remove('show');
            state.lightbox.setAttribute('hidden', 'true');
        };

        const render = (index) => {
            const figure = state.figures[index];
            if (!figure) return;
            const { box, img } = resolveFigureSet(figure);
            state.currentIndex = index;

            if (img && state.lightboxImg) {
                state.lightboxImg.src = img.src;
                state.lightboxImg.alt = img.alt || '';
            }

            const figcaption = box ? (box.querySelector('figcaption') || box.querySelector('.fr-inner')) : null;
            const nextP = box ? box.nextElementSibling : null;
            const illustrate = nextP && nextP.classList.contains('illustrate') ? (nextP.textContent || '').trim() : '';

            if (state.figcaptionEl) {
                state.figcaptionEl.textContent = figcaption ? (figcaption.textContent || '').trim() : '';
            }
            if (state.illustrateEl) {
                state.illustrateEl.textContent = illustrate;
            }

            if (state.lightbox) {
                state.lightbox.removeAttribute('hidden');
                state.lightbox.classList.add('show');
            }
        };

        const next = () => {
            if (!state.figures.length) return;
            const idx = (state.currentIndex + 1) % state.figures.length;
            render(idx);
        };

        const prev = () => {
            if (!state.figures.length) return;
            const idx = (state.currentIndex - 1 + state.figures.length) % state.figures.length;
            render(idx);
        };

        const bindKeydown = () => {
            const handler = (e) => {
                if (!state.lightbox || state.lightbox.hasAttribute('hidden')) return;
                if (e.key === 'Escape') close();
                if (e.key === 'ArrowRight') next();
                if (e.key === 'ArrowLeft') prev();
            };
            document.addEventListener('keydown', handler);
            state.teardownFns.push(() => document.removeEventListener('keydown', handler));
        };

        const bindButtons = () => {
            const bind = (el, fn) => {
                if (!el || typeof fn !== 'function') return;
                el.addEventListener('click', fn);
                state.teardownFns.push(() => el.removeEventListener('click', fn));
            };
            bind(state.btnClose, close);
            bind(state.btnNext, next);
            bind(state.btnPrev, prev);
        };

        const bindFigures = () => {
            state.figures.forEach((figure, index) => {
                const { img } = resolveFigureSet(figure);
                if (!img) return;
                img.style.cursor = 'pointer';
                const fn = () => render(index);
                img.addEventListener('click', fn);
                state.teardownFns.push(() => img.removeEventListener('click', fn));
            });
        };

        const shouldSkipMobile = () => {
            if (state.options.allowMobile) return false;
            if (app && app.screen === 'mobile') return true;
            return false;
        };

        const init = (options = {}) => {
            detachAll();
            state.options = { ...defaults, ...options };
            state.lightbox = document.getElementById(state.options.lightboxId);
            state.lightboxImg = document.getElementById(state.options.imageId);
            state.figcaptionEl = document.getElementById(state.options.figcaptionId);
            state.illustrateEl = document.getElementById(state.options.illustrateId);
            state.btnClose = document.querySelector('.lightbox-close');
            state.btnPrev = document.querySelector('.lightbox-prev');
            state.btnNext = document.querySelector('.lightbox-next');
            state.figures = buildArray(document.querySelectorAll(state.options.rootSelector));
            state.currentIndex = 0;

            if (!state.lightbox || !state.lightboxImg || !state.figcaptionEl || !state.illustrateEl) {
                state.ready = false;
                return;
            }
            if (shouldSkipMobile()) {
                state.ready = false;
                return;
            }
            if (state.figures.length < state.options.minItems) {
                state.ready = false;
                return;
            }

            state.ready = true;
            bindFigures();
            bindButtons();
            bindKeydown();
        };

        const teardown = () => {
            detachAll();
            state = {
                figures: [],
                currentIndex: 0,
                lightbox: null,
                lightboxImg: null,
                figcaptionEl: null,
                illustrateEl: null,
                btnClose: null,
                btnPrev: null,
                btnNext: null,
                teardownFns: [],
                options: { ...defaults },
                ready: false,
            };
        };

        const api = {
            init,
            render,
            open: render,
            close,
            next,
            prev,
            teardown,
            get ready() { return state.ready; },
            get currentIndex() { return state.currentIndex; },
        };

        return { api };
    },
};

export default lightboxPlugin;
