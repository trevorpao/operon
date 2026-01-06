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
            },
        };
    },
};

export default arenaPlugin;
