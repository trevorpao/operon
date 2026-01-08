import { createPlugin } from '../lib/defaultPlugin';

const createOverlay = () => {
    const overlay = document.createElement('div');
    overlay.className = 'sl-overlay-native';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:none;align-items:center;justify-content:center;z-index:9999;';

    const img = document.createElement('img');
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    overlay.appendChild(img);

    document.body.appendChild(overlay);
    return { overlay, img };
};

const sliderPlugin = createPlugin({
    name: 'ui.slider',
    async install() {
        let overlay;
        let overlayImg;

        const ensureOverlay = () => {
            if (overlay && overlayImg) return;
            const parts = createOverlay();
            overlay = parts.overlay;
            overlayImg = parts.img;
        };

        const show = (src) => {
            ensureOverlay();
            if (!overlay || !overlayImg) return;
            overlayImg.src = src;
            overlay.style.display = 'flex';
            document.body.classList.add('hidden-scroll');
        };

        const hide = () => {
            if (!overlay) return;
            overlay.style.display = 'none';
            document.body.classList.remove('hidden-scroll');
        };

        const bindClose = () => {
            ensureOverlay();
            if (!overlay) return;
            const onClick = () => hide();
            const onKey = (e) => { if (e.key === 'Escape') hide(); };
            overlay.addEventListener('click', onClick);
            document.addEventListener('keydown', onKey);
            return () => {
                overlay.removeEventListener('click', onClick);
                document.removeEventListener('keydown', onKey);
            };
        };

        return { api: { show, hide, bindClose } };
    },
});

export default sliderPlugin;
