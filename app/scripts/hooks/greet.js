import gee from 'trevorpao/geneEH';
import app from '../app';

// Demo hook: binds a click handler to elements with data-gene="greet-btn".
// Not auto-registered; call installGreetHook() after installing the plugin.
export default function installGreetHook() {
    let api;
    try {
        api = app.get('util.greet');
    } catch (err) {
        // plugin not installed; no-op
        return () => {};
    }

    const unbind = gee.hook('greet-btn', (el) => {
        const who = el.dataset.name || 'World';
        el.addEventListener('click', () => api.hello(who));
    });

    return function teardown() {
        if (typeof unbind === 'function') {
            unbind();
        }
    };
}
