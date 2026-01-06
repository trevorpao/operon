import { toElement } from '../dom/utils';

const createMedia = ({ app }) => {
    const defaultPic = (element) => {
        const el = element && element.target ? element.target : element;
        if (!el) return;
        el.src = '/images/default.jpg';
    };

    const checkWebP = (callback) => {
        var webP = new Image();
        webP.onload = webP.onerror = function () {
            callback(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    };

    const replaceWebP = (box) => {
        var root = box ? toElement(box) : document.body;
        if (!root || app.ifWebP) return;
        root.querySelectorAll('img:not(.rwpd)').forEach(function (img) {
            if (img.src.indexOf('webp?png') > -1) {
                img.src = img.src.replace(/\.webp\?(png)/i, '.$1');
            } else {
                img.src = img.src.replace(/\.webp\?(jpe?g)/i, '.$1');
            }
            img.classList.add('rwpd');
        });
    };

    const thumbnail = app.thumbnail;

    return {
        defaultPic,
        checkWebP,
        replaceWebP,
        thumbnail,
    };
};

export { createMedia };
