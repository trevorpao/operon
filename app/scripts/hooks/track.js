import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';
import registerHooks from '../lib/hooks/register';

const getTrackApi = () => {
    try {
        return app.get('track');
    } catch (err) {
        return app.track || null;
    }
};

const isBindableTarget = (candidate) => {
    if (!candidate) return false;
    if (candidate.nodeType === 1 || candidate.nodeType === 9) return true;
    if (Array.isArray(candidate)) return true;
    if (typeof candidate.length === 'number' && typeof candidate.item === 'function') return true;
    const win = typeof window !== 'undefined' ? window : null;
    if (win && win.jQuery && candidate instanceof win.jQuery) {
        return true;
    }
    return false;
};

const bindTargets = (target) => {
    const api = getTrackApi();
    if (!api || typeof api.bind !== 'function') return false;
    api.bind(target);
    return true;
};

export default function installTrackHook(target) {
    if (isBindableTarget(target)) {
        bindTargets(target);
        return () => {};
    }

    if (!ensureBrowser()) return () => {};

    const api = getTrackApi();
    if (!api || typeof api.send !== 'function') {
        return () => {};
    }

    const handleTrack = (me) => {
        const el = toElement(me && me.event ? me.event.target : me);
        if (!el) return false;
        const dataset = el.dataset || {};
        const cate = dataset.cate || 'normal';
        const act = dataset.act || 'jump';
        const which = dataset.which || 'ga';
        const label = dataset.label || el.getAttribute('title') || (typeof document !== 'undefined' ? document.title || '' : '');
        const value = dataset.value ? Number(dataset.value) || 0 : 0;
        api.send(cate, act, label, which, value);
        if (el.classList) {
            el.classList.remove('track');
            el.classList.add('tracked');
        }
        return true;
    };

    registerHooks('track', {
        click: { handler: handleTrack, alias: ['track'] },
    });

    const doc = typeof document !== 'undefined' ? document : null;
    if (doc && doc.body) {
        bindTargets(doc.body);
    }

    return function teardown() {};
}
