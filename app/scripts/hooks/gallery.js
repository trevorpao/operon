import app from '../app';

const selectors = 'gee\\:gallery-grid, [data-hook="gallery.grid"]';

export default function installGalleryHook(root) {
    let api;
    try {
        api = app.get('ui.gallery');
    } catch (err) {
        return () => {};
    }

    const scope = root && root.nodeType ? root : document;
    const nodes = scope.querySelectorAll ? scope.querySelectorAll(selectors) : [];

    nodes.forEach((node) => {
        const page = node.getAttribute('page') || (node.dataset ? node.dataset.page : undefined);
        const html = api.renderGrid({ page });
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const replacement = wrapper.firstElementChild;
        if (replacement && node.parentNode) {
            node.parentNode.replaceChild(replacement, node);
        }
    });

    return function teardownFn() {};
}
