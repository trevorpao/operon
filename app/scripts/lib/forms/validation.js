import { toElement } from '../dom/utils';

const serializeForm = (form) => {
    if (!form) return '';
    return new URLSearchParams(new FormData(form)).toString();
};

const validateForm = (form) => {
    if (!form) return false;
    if (typeof form.reportValidity === 'function') {
        return form.reportValidity();
    }
    if (typeof form.checkValidity === 'function') {
        return form.checkValidity();
    }
    return true;
};

const createValidation = ({ app, gee }) => {
    const progressingBtn = (btn) => {
        const el = toElement(btn);
        if (!el) return;
        el.disabled = true;
        const icon = document.createElement('i');
        icon.className = 'fa fa-spinner fa-pulse fa-fw';
        el.appendChild(icon);
    };

    const doneBtn = (btn) => {
        const el = toElement(btn);
        if (!el) return;
        const waiter = (app && typeof app.waitFor === 'function') ? app.waitFor(0.9) : Promise.resolve();
        waiter.then(function () {
            el.disabled = false;
            const icon = el.querySelector('.fa-spinner');
            if (icon) icon.remove();
        });
    };

    const detectForm = (elem) => {
        const el = toElement(elem);
        if (!el) return [null, null];
        if (el.tagName === 'FORM') return [el, el.querySelector('.btn-submit')];
        const form = el.closest('form');
        return [form, el];
    };

    const formFilled = (form) => {
        const el = toElement(form);
        if (!el) return 0;
        return el.querySelectorAll('[required]:placeholder-shown').length;
    };

    const showErrMsg = (col, cond, msg) => {
        const el = toElement(col);
        if (!el) return;
        const box = el.closest('.form-group');
        if (!box) return;

        box.classList.remove('has-error', 'has-pass', 'has-feedback');

        if (cond) {
            box.classList.add('has-error');
            const err = box.querySelector('.error-msg');
            if (err) err.textContent = msg;
            const handler = function () {
                if (typeof app.clearMsg === 'function') app.clearMsg();
                el.removeEventListener('keyup', handler);
            };
            el.addEventListener('keyup', handler);
        } else {
            box.classList.add('has-pass', 'has-feedback');
        }
    };

    const stdErr = (e) => {
        e.data = e.data || {};

        if (gee.isset(e.data.msg)) {
            gee.alert({ title: 'Alert!', txt: e.data.msg });
        } else {
            const code = 'e' + e.code;
            if (gee.isset(app.errMsg[code])) {
                gee.alert({ title: 'Alert!', txt: app.errMsg[code] });
            } else {
                gee.alert({ title: 'Error!', txt: 'Server Error, Plaese Try Later(' + e.code + ')' });
            }
        }
    };

    const stdSuccess = (rtn) => {
        rtn.data = rtn.data || {};

        if (gee.isset(rtn.data.msg)) {
            gee.alert({ title: 'Alert!', txt: rtn.data.msg });
        }

        if (gee.isset(rtn.data.redirect)) {
            location.href = (rtn.data.redirect === '') ? gee.apiUri : rtn.data.redirect;
        }

        if (gee.isset(rtn.data.goback)) {
            history.go(-1);
        }
    };

    const stdCallback = (btn) => {
        return function () {
            doneBtn(btn);
            if (this.code !== 1) {
                stdErr(this);
            } else {
                stdSuccess(this);
            }
        };
    };

    return {
        serializeForm,
        validateForm,
        detectForm,
        formFilled,
        showErrMsg,
        stdErr,
        stdSuccess,
        stdCallback,
        progressingBtn,
        doneBtn,
    };
};

export { createValidation, serializeForm, validateForm };
