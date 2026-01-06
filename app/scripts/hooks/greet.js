import app from '../app';
import { toElement, ensureBrowser } from '../lib/shared';

// Demo hook: data-gene="click:greet-btn" triggers hello directly (no extra listener).
export default function installGreetHook() {
    if (!ensureBrowser()) return () => {};

    let api;
    try {
        api = app.get('util.greet');
    } catch (err) {
        return () => {};
    }

    const handler = (me) => {
        const el = toElement(me);
        const who = el && el.dataset && el.dataset.name ? el.dataset.name : 'World';
        api.hello(who);
    };

    if (typeof gee !== 'undefined' && typeof gee.hook === 'function') {
        gee.hook('click:greet-btn', handler);
    }

    return function teardown() {};
}
