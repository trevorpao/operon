import gee from 'trevorpao/geneEH';
import { createPlugin } from '../lib/defaultPlugin';

const galleryPlugin = createPlugin({
    name: 'ui.gallery',
    async install() {
        const baseIframe = ({ prefix, width, zidx, uniqid, taUri }) => (
            `<div class="gene-iframe app-${prefix}"><iframe id="ifr_${uniqid}" src="${taUri}" width="${width}" scrolling="no" frameborder="0" allowtransparency="true" role="application" style="width: ${width}; z-index: ${zidx};" class="app-box"></iframe></div>`
        );

        const renderOpt = (prefix, width, zidx) => {
            const uniqid = `${prefix}${Math.floor(Math.random() * 999 + 1)}`;
            let taUri = `${gee.mainUri}tmpls/${prefix}.html?pc=XXXX&uc=xxxx`;
            const canonical = document.querySelector('link[rel=canonical]');
            const canonicalHref = canonical ? canonical.getAttribute('href') : window.location.href;
            taUri += `&ta=${uniqid}&canonical=${encodeURIComponent(canonicalHref)}`;
            return { uniqid, taUri, width, zidx, prefix };
        };

        const renderGrid = ({ page }) => {
            const opt = renderOpt('gallery-grid', '100%', '5');
            const pageParam = page ? `&page=${page}` : '';
            const taUri = `${opt.taUri}${pageParam}`;
            return baseIframe({ ...opt, taUri });
        };

        return { api: { renderGrid } };
    },
});

export default galleryPlugin;
