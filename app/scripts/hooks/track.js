import app from '../app';

// Hook for elements with class .track. Returns a teardown function.
export default function installTrackHook(root) {
    let api;
    try {
        api = app.get('track');
    } catch (err) {
        return () => {};
    }

    const scope = root && root.nodeType ? root : document;
    const nodes = scope.querySelectorAll ? scope.querySelectorAll('.track') : [];
    const unbinders = [];

    nodes.forEach((el) => {
        const handler = () => {
            const cate = el.dataset.cate || 'normal';
            const act = el.dataset.act || 'jump';
            const label = el.dataset.label || el.getAttribute('title') || document.title || '';
            const which = el.dataset.which || 'ga';
            api.send(cate, act, label, which);
            el.classList.remove('track');
            el.classList.add('tracked');
        };
        el.addEventListener('click', handler, { once: true });
        unbinders.push(() => el.removeEventListener('click', handler));
    });

    return function teardown() {
        unbinders.forEach((fn) => fn());
    };
}
