import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';

// Hook: data-gene="click:track"
export default function installTrackHook() {
    if (!ensureBrowser()) return () => {};

    let api;
    try {
        api = app.get('track');
    } catch (err) {
        return () => {};
    }

    const handleTrack = (me) => {
        const el = toElement(me && me.event ? me.event.target : me);
        if (!el) return false;
        const cate = el.dataset && el.dataset.cate ? el.dataset.cate : 'normal';
        const act = el.dataset && el.dataset.act ? el.dataset.act : 'jump';
        const label = (el.dataset && el.dataset.label) || el.getAttribute('title') || document.title || '';
        const which = el.dataset && el.dataset.which ? el.dataset.which : 'ga';
        api.send(cate, act, label, which);
        el.classList.remove('track');
        el.classList.add('tracked');
    };

    if (typeof gee !== 'undefined' && typeof gee.hook === 'function') {
        gee.hook('click:track', handleTrack);
    }

    return function teardown() {};
}
