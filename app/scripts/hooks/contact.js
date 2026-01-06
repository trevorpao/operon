import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';

const disableBtn = (btn) => {
    if (!btn) return () => {};
    const original = { html: btn.innerHTML, disabled: btn.disabled };
    btn.disabled = true;
    btn.innerHTML = `${btn.innerHTML}<i class="fa fa-spinner fa-pulse fa-fw"></i>`;
    return () => {
        btn.disabled = original.disabled;
        btn.innerHTML = original.html;
    };
};

export default function installContactHook(root) {
    if (!ensureBrowser()) return () => {};
    let api;
    try {
        api = app.get('data.contact');
    } catch (err) {
        return () => {};
    }

    const scope = root && root.nodeType ? root : document;
    const teardown = [];

    const submitHandler = (btn) => async (evt) => {
        evt.preventDefault();
        const form = toElement(btn.closest('form'));
        if (!form) return;
        if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;
        const enable = disableBtn(btn);
        try {
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());
            await api.send(payload);
            form.reset();
            if (typeof app.stdSuccess === 'function') {
                app.stdSuccess({ msg: 'sent' });
            }
        } catch (err) {
            if (typeof app.stdErr === 'function') {
                app.stdErr(err);
            }
        } finally {
            enable();
        }
    };

    const buttons = scope.querySelectorAll('[data-hook="contact.submit"]');
    buttons.forEach((btn) => {
        const handler = submitHandler(btn);
        btn.addEventListener('click', handler);
        teardown.push(() => btn.removeEventListener('click', handler));
    });

    return function teardownFn() {
        teardown.forEach((fn) => fn());
    };
}
