import { createPlugin } from '../lib/defaultPlugin';
import { ensureBrowser, withBrowser } from '../lib/shared';

const pickSelector = (value, fallback) => {
    if (typeof value === 'string' && value.trim()) {
        return value.trim();
    }
    return fallback;
};

const hideElement = (el) => {
    if (!el) return;
    if (!el.dataset.originalDisplay) {
        el.dataset.originalDisplay = el.style.display || '';
    }
    el.style.display = 'none';
};

const restoreDisplay = (el) => {
    if (!el) return;
    if (el.dataset.originalDisplay !== undefined) {
        el.style.display = el.dataset.originalDisplay;
        delete el.dataset.originalDisplay;
        return;
    }
    el.style.removeProperty('display');
};

const rememberSlideDisplay = (slides) => {
    const map = new Map();
    slides.forEach((slide) => {
        map.set(slide, slide.style.display || '');
    });
    return map;
};

const restoreSlides = (slides, displayMap) => {
    slides.forEach((slide) => {
        if (displayMap.has(slide)) {
            slide.style.display = displayMap.get(slide);
        } else {
            slide.style.removeProperty('display');
        }
        slide.removeAttribute('aria-hidden');
        slide.removeAttribute('aria-label');
    });
};

const stopVideos = (root) => {
    root.querySelectorAll('.video-container').forEach((container) => {
        container.innerHTML = '';
    });
};

const loadVideo = (slide) => {
    if (!slide) return;
    withBrowser(({ document }) => {
        const container = slide.querySelector('.video-container');
        if (!container) return;
        const { src } = container.dataset || {};
        if (!src) return;
        container.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.src = src;
        iframe.title = 'Video player';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
        iframe.allowFullscreen = true;
        container.appendChild(iframe);
    });
};

const slidePlugin = createPlugin({
    name: 'ui.slide',
    install() {
        if (!ensureBrowser()) {
            return { api: { create: () => null, destroy: () => {} } };
        }
        const instances = new WeakMap();

        const destroy = (root) => {
            const instance = instances.get(root);
            if (instance && typeof instance.destroy === 'function') {
                instance.destroy();
            }
            instances.delete(root);
        };

        const create = (root, selectors = {}) => {
            if (!ensureBrowser() || !root) return null;

            destroy(root);

            const slideSelector = pickSelector(selectors.slideSelector, '.slide-banner');
            const prevSelector = pickSelector(selectors.prevSelector, '.prev');
            const nextSelector = pickSelector(selectors.nextSelector, '.next');
            const dotsSelector = pickSelector(selectors.dotsSelector, '.dot-container');

            const slides = Array.from(root.querySelectorAll(slideSelector));
            if (!slides.length) return null;

            const prevBtn = root.querySelector(prevSelector);
            const nextBtn = root.querySelector(nextSelector);
            const dotsContainer = root.querySelector(dotsSelector);
            const slideDisplay = rememberSlideDisplay(slides);
            const teardown = [];
            let dots = [];

            const updateDots = (activeIndex) => {
                dots.forEach((dot, idx) => {
                    const isActive = idx === activeIndex;
                    dot.classList.toggle('active', isActive);
                    dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
                    dot.setAttribute('tabindex', isActive ? '0' : '-1');
                });
            };

            const buildDots = () => {
                if (!dotsContainer) return [];
                dotsContainer.innerHTML = '';
                const built = slides.map((slide, index) => {
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = 'dot';
                    dot.setAttribute('role', 'tab');
                    dot.setAttribute('aria-label', `顯示第 ${index + 1} 張圖片`);
                    dot.setAttribute('aria-controls', slide.id || '');
                    dot.setAttribute('aria-selected', 'false');
                    dot.setAttribute('tabindex', '-1');
                    const onClick = () => goTo(index);
                    dot.addEventListener('click', onClick);
                    teardown.push(() => dot.removeEventListener('click', onClick));
                    dotsContainer.appendChild(dot);
                    return dot;
                });
                dotsContainer.style.display = built.length ? '' : 'none';
                return built;
            };

            const state = { index: 0 };

            const setNavControls = (slide) => {
                if (!slide) return;
                const targetId = slide.id || '';
                if (prevBtn) {
                    prevBtn.setAttribute('aria-controls', targetId);
                }
                if (nextBtn) {
                    nextBtn.setAttribute('aria-controls', targetId);
                }
            };

            const showSlide = (index) => {
                const total = slides.length;
                if (!total) return;
                const normalized = ((index % total) + total) % total;
                state.index = normalized;
                slides.forEach((slide, idx) => {
                    const active = idx === state.index;
                    slide.style.display = active ? 'block' : 'none';
                    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
                    if (active) {
                        slide.setAttribute('aria-label', `${idx + 1} / ${total}`);
                    }
                });
                updateDots(state.index);
                stopVideos(root);
                const current = slides[state.index];
                setNavControls(current);
                loadVideo(current);
            };

            const goTo = (index) => {
                showSlide(index);
                return true;
            };

            const handlePrev = (evt) => {
                if (evt) evt.preventDefault();
                goTo(state.index - 1);
            };

            const handleNext = (evt) => {
                if (evt) evt.preventDefault();
                goTo(state.index + 1);
            };

            const enableControls = () => {
                if (prevBtn) {
                    prevBtn.style.display = '';
                    prevBtn.addEventListener('click', handlePrev);
                    teardown.push(() => prevBtn.removeEventListener('click', handlePrev));
                }
                if (nextBtn) {
                    nextBtn.style.display = '';
                    nextBtn.addEventListener('click', handleNext);
                    teardown.push(() => nextBtn.removeEventListener('click', handleNext));
                }
                dots = buildDots();
            };

            const disableControls = () => {
                hideElement(prevBtn);
                hideElement(nextBtn);
                if (dotsContainer) {
                    dotsContainer.style.display = 'none';
                }
            };

            if (slides.length <= 1) {
                disableControls();
                showSlide(0);
            } else {
                enableControls();
                showSlide(0);
            }

            const controller = {
                goTo,
                next: () => goTo(state.index + 1),
                prev: () => goTo(state.index - 1),
                destroy: () => {
                    teardown.forEach((fn) => fn());
                    if (dotsContainer) {
                        dotsContainer.innerHTML = '';
                        restoreDisplay(dotsContainer);
                    }
                    restoreDisplay(prevBtn);
                    restoreDisplay(nextBtn);
                    restoreSlides(slides, slideDisplay);
                    stopVideos(root);
                },
            };

            instances.set(root, controller);
            return controller;
        };

        return { api: { create, destroy } };
    },
});

export default slidePlugin;
