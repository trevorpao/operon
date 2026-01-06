import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';

// Hook registration via gee.hook to honor data-gene="submit:contact.submit" bindings.
export default function installContactHook() {
    if (!ensureBrowser()) return () => {};

    let api;
    try {
        api = app.get('data.contact');
    } catch (err) {
        return () => {};
    }

    const handler = function (me) {
        const btn = toElement(me);
        const form = btn ? toElement(btn.closest('form')) : null;
        if (!form) return false;

        if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
            return false;
        }

        // Fallback to app.validateForm if reportValidity is unavailable
        if (typeof form.reportValidity !== 'function' && typeof app.validateForm === 'function' && !app.validateForm(form)) {
            return false;
        }

        // Progress indication
        const restore = (() => {
            if (!btn) return () => {};
            const original = { html: btn.innerHTML, disabled: btn.disabled };
            btn.disabled = true;
            btn.innerHTML = `${btn.innerHTML}<i class="fa fa-spinner fa-pulse fa-fw"></i>`;
            return () => {
                btn.disabled = original.disabled;
                btn.innerHTML = original.html;
            };
        })();

        const submit = async () => {
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
                restore();
            }
        };

        submit();
    };

    if (typeof gee !== 'undefined' && typeof gee.hook === 'function') {
        gee.hook('contact.submit', handler);
    }

    // gee.hook does not expose unregister; return no-op teardown
    return function teardownFn() {};
}
 