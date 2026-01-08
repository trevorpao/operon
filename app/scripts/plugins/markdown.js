import { ensureBrowser } from '../lib/shared';

const stripWrapper = (html) => {
    if (!html) return '';
    return html.replace(/<\/?(head|body)[^>]*>/gi, '').trim();
};

const renderWithShowdown = (markdown, options = {}) => {
    if (!ensureBrowser()) return markdown || '';
    const win = window || {};
    const ShowdownCtor = (win.showdown && win.showdown.Converter)
        || (win.Showdown && win.Showdown.Converter)
        || (typeof showdown !== 'undefined' && showdown.Converter);
    if (typeof ShowdownCtor !== 'function') {
        return markdown || '';
    }
    const converter = new ShowdownCtor({ noHeaderId: true, ...options });
    return converter.makeHtml(markdown || '');
};

const markdownPlugin = {
    name: 'ui.markdown',
    install() {
        const render = (markdown, options) => stripWrapper(renderWithShowdown(markdown, options));

        const fromEditor = () => {
            if (!ensureBrowser()) return { markdown: '', html: '' };
            const editor = window.easyMDE;
            if (!editor) return { markdown: '', html: '' };
            const markdown = typeof editor.value === 'function' ? editor.value() : '';
            const html = typeof editor.markdown === 'function'
                ? stripWrapper(editor.markdown(markdown))
                : render(markdown);
            return { markdown, html };
        };

        return { api: { render, stripWrapper, fromEditor } };
    },
};

export default markdownPlugin;
