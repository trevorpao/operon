import { createPlugin } from '../lib/defaultPlugin';

const resolveYell = (app, gee) => {
    if (app && typeof app.yell === 'function') {
        return app.yell;
    }
    if (gee && typeof gee.yell === 'function') {
        return gee.yell.bind(gee);
    }
    return null;
};

const toElements = (input) => {
    if (!input) return [];
    const win = typeof window !== 'undefined' ? window : null;
    if (win && win.jQuery && input instanceof win.jQuery) {
        return input.toArray();
    }
    if (Array.isArray(input)) {
        return input.filter(Boolean);
    }
    if (typeof input.length === 'number' && typeof input.item === 'function') {
        return Array.from(input);
    }
    if (input.nodeType === 1 || input.nodeType === 9) {
        return [input];
    }
    return [];
};

const trackPlugin = createPlugin({
    name: 'track',
    install({ app, gee }) {
        const yellFn = resolveYell(app, gee);
        const state = { watchID: null, lastPos: 0 };
        const api = { watchID: null, pos: 0 };

        const updateWatchID = (id) => {
            state.watchID = id;
            api.watchID = id;
        };

        const updatePos = (pos) => {
            state.lastPos = pos;
            api.pos = pos;
        };

        const callYell = (endpoint, payload, callback) => {
            if (!yellFn || !endpoint) return;
            const wrapper = function () {
                if (typeof callback === 'function') {
                    callback.call(this, this);
                }
            };
            yellFn(endpoint, payload, wrapper, wrapper);
        };

        const clog = (payload) => {
            if (gee && typeof gee.clog === 'function') {
                gee.clog(payload);
            }
        };

        const send = (cate, act, label, which, value) => {
            const category = cate || 'normal';
            const action = act || 'jump';
            const eventLabel = label || (typeof document !== 'undefined' ? document.title || '' : '');
            const target = which || 'ga';
            const metric = typeof value === 'number' ? value : (Number(value) || 0);

            clog({ cate: category, act: action, label: eventLabel, which: target, value: metric });

            const win = typeof window !== 'undefined' ? window : null;
            const gtag = win && typeof win.gtag === 'function' ? win.gtag : null;
            if ((target === 'ga' || target === 'all') && gtag) {
                const opts = { event_category: category };
                if (eventLabel) opts.event_label = eventLabel;
                if (metric > 0) opts.value = metric;
                gtag('event', action, opts);
            }

            const fbq = win && typeof win.fbq === 'function' ? win.fbq : null;
            if ((target === 'pixel' || target === 'all') && fbq) {
                fbq('track', category, { action, label: eventLabel, value: metric });
            }
        };

        const newPage = () => {
            const win = typeof window !== 'undefined' ? window : null;
            if (win && typeof win.gtag === 'function') {
                win.gtag('event', 'page_view');
            }
        };

        const clearWatch = () => {
            const win = typeof window !== 'undefined' ? window : null;
            if (win && state.watchID !== null) {
                win.clearInterval(state.watchID);
            }
            updateWatchID(null);
        };

        const keepWatch = (getPos) => {
            if (typeof window === 'undefined' || typeof getPos !== 'function') return;
            const doc = window.document;
            if (!doc) return;

            const cidInput = doc.getElementById('banjiID');
            const sidInput = doc.getElementById('lessonID');
            const courseInput = doc.getElementById('courseID');
            const cid = cidInput ? cidInput.value : '';
            const sid = sidInput ? sidInput.value : '';

            const redirectOnFailure = function (resp) {
                const ok = resp === 1 || (resp && (resp.code === 1 || resp.ok === 1));
                if (ok) return;
                if (cid) {
                    window.location.href = `/banji/${cid}`;
                } else if (courseInput && courseInput.value) {
                    window.location.href = `/course/${courseInput.value}`;
                }
            };

            clearWatch();
            let finished = false;
            updateWatchID(window.setInterval(() => {
                const pos = Number(getPos()) || 0;
                const player = app.player || (app.player = { spent: 0, duration: 0 });
                player.spent = (Number(player.spent) || 0) + 1;

                if (player.spent % 10 === 0 && state.lastPos !== pos) {
                    updatePos(pos);
                    callYell('track/pass', { cid, sid, pos }, redirectOnFailure);
                }

                const duration = Number(player.duration) || 0;
                if (!finished && duration > 0 && (duration - 10) < pos) {
                    finished = true;
                    callYell('footprint/finished', { pos });
                }
            }, 1000));
        };

        const stopWatch = (getPos) => {
            if (typeof getPos !== 'function') return;
            const pos = Number(getPos()) || 0;
            const spent = Number(app.player && app.player.spent) || 0;
            callYell('footprint/pos', { spent, pos });
            clearWatch();
        };

        const endWatch = (getPos) => {
            if (typeof getPos !== 'function') return;
            const pos = Number(getPos()) || 0;
            const spent = Number(app.player && app.player.spent) || 0;
            callYell('footprint/finished', { spent, pos });
            clearWatch();
        };

        const handleClick = (event) => {
            const el = event.currentTarget;
            if (!el) return;
            const dataset = el.dataset || {};
            const cate = dataset.cate || 'normal';
            const act = dataset.act || 'jump';
            const which = dataset.which || 'ga';
            const label = dataset.label || el.getAttribute('title') || (typeof document !== 'undefined' ? document.title || '' : '');
            const value = dataset.value ? Number(dataset.value) || 0 : 0;
            send(cate, act, label, which, value);
            el.classList.remove('track');
            el.classList.add('tracked');
        };

        const bind = (target) => {
            if (typeof document === 'undefined') return 0;
            const nodes = new Set();
            toElements(target || document.body).forEach((root) => {
                if (!root) return;
                if (root.classList && root.classList.contains('track')) {
                    nodes.add(root);
                }
                if (typeof root.querySelectorAll === 'function') {
                    root.querySelectorAll('.track').forEach((node) => nodes.add(node));
                }
            });
            nodes.forEach((node) => {
                node.addEventListener('click', handleClick);
                node.classList.remove('track');
                node.classList.add('tracked');
            });
            return nodes.size;
        };

        const setupUserIdSync = () => {
            if (!app || typeof app.afterStatusChk !== 'function') return;
            app.afterStatusChk((opt = {}) => {
                if (opt.status === 'login' && typeof window !== 'undefined' && typeof window.gtag === 'function' && app.gaMeasurementID) {
                    window.gtag('config', app.gaMeasurementID, {
                        user_id: opt.session && opt.session.id,
                    });
                }
            });
        };

        Object.assign(api, {
            send,
            bind,
            newPage,
            keepWatch,
            stopWatch,
            endWatch,
        });

        const init = async () => {
            app.track = api;
            const doc = typeof document !== 'undefined' ? document : null;
            if (doc && doc.body) {
                bind(doc.body);
            }
            setupUserIdSync();
        };

        const destroy = async () => {
            clearWatch();
        };

        app.track = api;

        return { api, init, destroy };
    },
});

export default trackPlugin;
