import app from '../app';

const defaultFontTargets = '#article-press .text p, #article-press .text li, #article-post .text p, #article-post .text li';

const arenaPlugin = {
    name: 'ui.arena',
    async install() {
        let store;
        try {
            store = (window.localforage && typeof window.localforage.createInstance === 'function')
                ? window.localforage.createInstance({ name: 'arenaBase', version: 1 })
                : null;
        } catch (err) {
            store = null;
        }

        let fontSize = app.fontSize || 1.25;
        if (store) {
            try {
                const saved = await store.getItem('fontSize');
                if (saved) fontSize = Number(saved) || fontSize;
            } catch (err) {
                if (app.track && typeof app.track.send === 'function') {
                    app.track.send('failure', 'load_localforage', JSON.stringify(err));
                }
            }
        }

        const persistFont = async (size) => {
            if (!store) return;
            try {
                await store.setItem('fontSize', size);
            } catch (err) {
                if (app.track && typeof app.track.send === 'function') {
                    app.track.send('failure', 'save_localforage', JSON.stringify(err));
                }
            }
        };

        const setFontSize = async (size, selector = defaultFontTargets) => {
            fontSize = size;
            document.querySelectorAll(selector).forEach((el) => {
                el.style.fontSize = `${fontSize}rem`;
            });
            await persistFont(fontSize);
            app.fontSize = fontSize;
        };

        const changeFont = async (delta = 0.1, selector = defaultFontTargets) => setFontSize(fontSize + delta, selector);

        const setGoTopVisible = (visible) => {
            document.querySelectorAll('.goTop').forEach((el) => {
                el.style.display = visible ? 'block' : 'none';
            });
        };

        const copyText = async (text) => {
            if (!text) return false;
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(text);
                return true;
            }

            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', 'true');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                return true;
            } catch (err) {
                return false;
            } finally {
                document.body.removeChild(ta);
            }
        };

        const toggleClass = (el, cls = 'active') => {
            if (!el) return false;
            el.classList.toggle(cls);
            return el.classList.contains(cls);
        };

        const openNav = (el) => {
            if (!el) return;
            el.style.height = '100%';
        };

        const closeNav = (el) => {
            if (!el) return;
            el.style.height = '0%';
        };

        const showInlineModal = (el, html) => {
            if (!el) return;
            if (html) {
                const body = el.querySelector('.modal-body');
                if (body) body.innerHTML = html;
            }
            el.classList.remove('hide');
            el.removeAttribute('hidden');
            el.setAttribute('aria-hidden', 'false');
        };

        const hideInlineModal = (el) => {
            if (!el) return;
            const body = el.querySelector('.modal-body');
            if (body) body.innerHTML = '';
            el.classList.add('hide');
            el.setAttribute('hidden', 'true');
            el.setAttribute('aria-hidden', 'true');
        };

        const showYouTubeModal = (el, videoId) => {
            if (!el || !videoId) return;
            const iframe = el.querySelector('iframe');
            if (iframe) {
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            }
            showInlineModal(el);
        };

        const hideYouTubeModal = (el) => {
            if (!el) return;
            const iframe = el.querySelector('iframe');
            if (iframe) {
                iframe.src = '';
            }
            hideInlineModal(el);
        };

        const setCookiePrivacy = (days = 400) => {
            if (typeof app.setCookie === 'function') {
                app.setCookie('cookie_privacy', 1, days);
            } else {
                const expires = Date.now() + days * 24 * 60 * 60 * 1000;
                try {
                    localStorage.setItem('cookie_privacy', JSON.stringify({ v: 1, exp: expires }));
                } catch (err) {
                    // ignore storage errors
                }
            }

            const banner = document.getElementById('privacy-banner');
            if (banner) banner.classList.add('hide');
        };

        const setDateLimit = (el, minDays, maxDays) => {
            if (!el) return;
            const today = new Date();
            const fmt = (d) => d.toISOString().slice(0, 10);
            if (typeof maxDays === 'number') {
                const max = new Date(today);
                max.setDate(max.getDate() + maxDays);
                el.setAttribute('max', fmt(max));
            }
            if (typeof minDays === 'number') {
                const min = new Date(today);
                min.setDate(min.getDate() - minDays);
                el.setAttribute('min', fmt(min));
            }
        };

        const updateSubmitState = (form) => {
            if (!form) return;
            const btn = form.querySelector('button.btn-submit');
            if (!btn) return;

            const filled = typeof app.formFilled === 'function'
                ? app.formFilled(form)
                : Array.from(form.elements || []).some((field) => {
                    if (!(field instanceof HTMLElement)) return false;
                    if (field.type === 'hidden' || field.disabled) return false;
                    if ('value' in field) return String(field.value).trim() !== '';
                    return false;
                });

            if (filled > 0) {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-disabled');
            } else {
                btn.classList.remove('btn-disabled');
                btn.classList.add('btn-primary');
            }
        };

        const togglePasswordInput = (input) => {
            if (!input) return false;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            return !isPassword;
        };

        const cycleFont = async (delta = 0.15, min = 1, max = 1.3, reset = 1, selector = defaultFontTargets) => {
            let next = fontSize + delta;
            if (next > max) next = reset;
            if (next < min) next = min;
            await setFontSize(next, selector);
        };

        const renderZipOptions = (el, list, placeholder) => {
            const items = Array.isArray(list) ? list : [];
            const opts = [
                `<option disabled value=""> ${placeholder} </option>`,
                ...items.map((item) => {
                    const zipcode = item.zipcode || item.id || '';
                    const labelTown = item.town || item.title || '';
                    const label = zipcode && labelTown ? `${labelTown}(${zipcode})` : labelTown || String(zipcode);
                    return `<option value="${zipcode}"> ${label} </option>`;
                }),
            ];
            el.innerHTML = opts.join('');
        };

        const fetchZipOptions = async (county) => {
            if (!county) return [];
            if (typeof gee !== 'undefined' && typeof gee.yell === 'function') {
                return new Promise((resolve, reject) => {
                    const callback = (res) => {
                        if (res && res.code === 1 && Array.isArray(res.data)) return resolve(res.data);
                        if (res && Array.isArray(res.data)) return resolve(res.data);
                        return reject(res || new Error('zipcodes request failed'));
                    };
                    gee.yell('option/zipcodes', { county }, callback, reject);
                }).catch(() => []);
            }

            try {
                const res = await fetch(`/option/zipcodes?county=${encodeURIComponent(county)}`, { credentials: 'include' });
                if (!res.ok) return [];
                const json = await res.json();
                if (Array.isArray(json)) return json;
                if (json && Array.isArray(json.data)) return json.data;
                return [];
            } catch (err) {
                return [];
            }
        };

        const loadZipOptions = async (targetId, county, placeholder = '請選擇地區*') => {
            if (!targetId || !county) return;
            const target = document.getElementById(targetId);
            if (!target) return;
            const data = await fetchZipOptions(county);
            renderZipOptions(target, data, placeholder);
        };

        const showModal = (id, html) => {
            const modalEl = document.getElementById(id);
            if (!modalEl) return;
            const body = modalEl.querySelector('.modal-body');
            if (body && html) body.innerHTML = html;
            const content = modalEl.querySelector('.modal-content');
            if (content) content.classList.remove('modal-lg', 'modal-nor', 'modal-sm');
            modalEl.style.display = 'block';
            modalEl.classList.add('is-active');
            modalEl.setAttribute('aria-hidden', 'false');
        };

        const hideModal = (id) => {
            const modalEl = document.getElementById(id);
            if (!modalEl) return;
            const body = modalEl.querySelector('.modal-body');
            if (body) body.innerHTML = '';
            modalEl.style.display = 'none';
            modalEl.classList.remove('is-active');
            modalEl.setAttribute('aria-hidden', 'true');
        };

        const state = {
            get fontSize() { return fontSize; },
        };

        return {
            api: {
                state,
                setFontSize,
                changeFont,
                setGoTopVisible,
                showModal,
                hideModal,
                copyText,
                toggleClass,
                openNav,
                closeNav,
                showInlineModal,
                hideInlineModal,
                showYouTubeModal,
                hideYouTubeModal,
                setCookiePrivacy,
                setDateLimit,
                updateSubmitState,
                togglePasswordInput,
                cycleFont,
                loadZipOptions,
            },
        };
    },
};

export default arenaPlugin;
