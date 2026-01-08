import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { placeholder } from '../../../app/scripts/lib/dom/placeholder';

const overrideNativePlaceholderSupport = () => {
    const original = document.createElement.bind(document);
    let shouldStubNextInput = true;

    document.createElement = (tagName, options) => {
        if (shouldStubNextInput && String(tagName).toLowerCase() === 'input') {
            shouldStubNextInput = false;
            return {};
        }
        return original(tagName, options);
    };

    return {
        restore: () => {
            document.createElement = original;
        },
        createInput: () => original('input'),
    };
};

describe('placeholder fallback', () => {
    let override;

    beforeEach(() => {
        override = overrideNativePlaceholderSupport();
    });

    afterEach(() => {
        if (override) {
            override.restore();
            override = null;
        }
    });

    it('attaches placeholder behavior and returns teardown handle', () => {
        const input = override.createInput();
        input.setAttribute('placeholder', 'Email');
        input.style.color = '#000';

        const teardown = placeholder([input]);
        expect(typeof teardown).toBe('function');
        expect(input.value).toBe('Email');
        expect(input.style.color).toBe('rgb(170, 170, 170)');

        input.dispatchEvent(new Event('focus'));
        expect(input.value).toBe('');

        input.dispatchEvent(new Event('blur'));
        expect(input.value).toBe('Email');

        teardown();
        input.dispatchEvent(new Event('focus'));
        expect(input.value).toBe('');
        expect(input.style.color).toBe('rgb(0, 0, 0)');
        input.dispatchEvent(new Event('blur'));
        expect(input.value).toBe('');
    });
});
