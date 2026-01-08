import { ensureBrowser, toElements } from '../shared';

const supportsNativePlaceholder = () => ensureBrowser() && ('placeholder' in document.createElement('input'));

const setColorToken = (el, value) => {
    if (el.dataset) {
        el.dataset.placeholderColor = value || '';
        return;
    }
    el.setAttribute('data-placeholder-color', value || '');
};

const getColorToken = (el) => {
    if (el.dataset) {
        return el.dataset.placeholderColor || '';
    }
    return el.getAttribute('data-placeholder-color') || '';
};

const clearColorToken = (el) => {
    if (el.dataset) {
        delete el.dataset.placeholderColor;
        return;
    }
    el.removeAttribute('data-placeholder-color');
};

const createHandlers = (el, text, originalColor) => {
    const apply = () => {
        if (el.value) return;
        el.value = text;
        setColorToken(el, originalColor || '');
        el.style.color = '#aaa';
    };

    const clear = () => {
        if (el.value !== text) return;
        el.value = '';
        el.style.color = getColorToken(el);
    };

    return { apply, clear };
};

const detachAll = (handles) => {
    while (handles.length) {
        const teardown = handles.pop();
        if (typeof teardown === 'function') {
            teardown();
        }
    }
};

const placeholder = (elements) => {
    if (!ensureBrowser() || supportsNativePlaceholder()) {
        return () => {};
    }

    const teardownHandles = [];
    toElements(elements).forEach((el) => {
        const text = el.getAttribute('placeholder');
        if (!text) return;

        const { apply, clear } = createHandlers(el, text, el.style.color);
        apply();
        el.addEventListener('focus', clear);
        el.addEventListener('blur', apply);

        teardownHandles.push(() => {
            el.removeEventListener('focus', clear);
            el.removeEventListener('blur', apply);
            if (el.value === text) {
                el.value = '';
            }
            el.style.color = getColorToken(el);
            clearColorToken(el);
        });
    });

    return () => detachAll(teardownHandles);
};

export { placeholder, supportsNativePlaceholder };
