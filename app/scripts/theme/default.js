import gee from 'trevorpao/geneEH';
import app from '../app';
import { createPlugin } from '../lib/defaultPlugin';
import { toElement, ensureBrowser } from '../lib/shared';
import registerHooks from '../lib/hooks/register';

const messages = {
    tw: {
        confirm_warning: '是否確認內容無誤？',
    },
    en: {
        confirm_warning: 'Is the content confirmed to be correct?',
    },
};

const select = (selector) => {
    if (!ensureBrowser()) return null;
    return document.querySelector(selector);
};

const ensureSiteNamespace = () => {
    const state = app.site || {};
    if (!app.site) {
        app.site = state;
    }
    if (typeof state.registerBack !== 'function') {
        state.registerBack = (handler) => {
            if (!handler || !gee || !gee.event || typeof gee.event.subscribe !== 'function') return;
            gee.event.subscribe('arena.backPrevious', handler);
        };
    }
};

ensureSiteNamespace();

const readValue = (selector) => {
    const el = select(selector);
    if (!el) return '';
    return 'value' in el ? el.value : el.textContent || '';
};

const getThemeApi = () => {
    try {
        return app.get('theme.default');
    } catch (err) {
        return null;
    }
};

const getMarkdownApi = () => {
    try {
        return app.get('ui.markdown');
    } catch (err) {
        return null;
    }
};

const gatherContent = () => {
    const markdownApi = getMarkdownApi();
    if (ensureBrowser() && document.body && document.body.classList.contains('draft')) {
        if (markdownApi && typeof markdownApi.fromEditor === 'function') {
            return markdownApi.fromEditor();
        }
    }
    const article = select('#articleContent');
    const html = article ? article.innerHTML : '';
    return {
        markdown: '',
        html: markdownApi && typeof markdownApi.stripWrapper === 'function' ? markdownApi.stripWrapper(html) : html,
    };
};

const buildDraftPayload = () => {
    const { markdown, html } = gatherContent();
    return {
        id: readValue('#draftID'),
        lang: readValue('#draftLang'),
        press_id: readValue('#pressID'),
        title: readValue('#articleTitle').trim(),
        info: readValue('#articleInfo').trim(),
        content: html,
        markdown,
    };
};

const withProgress = (btn) => {
    if (!btn) return () => {};
    const original = { html: btn.innerHTML, disabled: btn.disabled };
    btn.disabled = true;
    btn.innerHTML = `${original.html}<i class="fa fa-spinner fa-pulse fa-fw"></i>`;
    return () => {
        btn.disabled = original.disabled;
        btn.innerHTML = original.html;
    };
};

const getRegisteredPlugin = (ctx, name) => {
    try {
        return ctx.get(name);
    } catch (err) {
        return null;
    }
};

const defaultThemePlugin = createPlugin({
    name: 'theme.default',
    install({ app: ctx }) {
        const getPrivacy = () => getRegisteredPlugin(ctx, 'ui.privacy');
        const getDraft = () => getRegisteredPlugin(ctx, 'data.draft');

        const initTheme = () => {
            if (!ensureBrowser()) return;
            document.querySelectorAll('.loading-o').forEach((node) => node.remove());
            const privacy = getPrivacy();
            if (privacy && typeof privacy.needsBanner === 'function' && privacy.needsBanner()) {
                privacy.showBanner();
            }
        };

        const showPrivacyBanner = () => {
            const privacy = getPrivacy();
            if (privacy && typeof privacy.showBanner === 'function') {
                privacy.showBanner();
            }
        };

        const getConfirmMessage = (lang) => {
            const langKey = lang && messages[lang] ? lang : 'tw';
            return messages[langKey].confirm_warning;
        };

        const importDraft = async (payload) => {
            const draft = getDraft();
            if (!draft || typeof draft.importDraft !== 'function') {
                throw new Error('draft plugin missing');
            }
            return draft.importDraft(payload);
        };

        return {
            api: {
                initTheme,
                showPrivacyBanner,
                getConfirmMessage,
                importDraft,
            },
        };
    },
});

export function installDefaultTheme() {
    if (!ensureBrowser()) return () => {};

    const handleInit = () => {
        const theme = getThemeApi();
        if (theme && typeof theme.initTheme === 'function') {
            theme.initTheme();
        }
    };

    const handleGoback = () => {
        if (gee && gee.event && typeof gee.event.fire === 'function') {
            gee.event.fire('arena.backPrevious', {});
        }
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.classList.add('hide');
        }
        if (gee && gee.event && typeof gee.event.clear === 'function') {
            gee.event.clear('arena.backPrevious');
        }
        window.history.go(-1);
        return true;
    };

    const handleInitMarkdown = (me) => {
        const el = toElement(me);
        if (!el) return false;
        const markdownApi = getMarkdownApi();
        if (!markdownApi || typeof markdownApi.render !== 'function') return false;
        const html = markdownApi.render(el.textContent || '');
        el.innerHTML = html;
        return true;
    };

    const handleImport = async (me) => {
        const btn = toElement(me);
        if (!btn) return false;
        const theme = getThemeApi();
        if (!theme || typeof theme.importDraft !== 'function') return false;

        const langCode = (app.lang && app.lang.cu) ? app.lang.cu : 'tw';
        const confirmMsg = typeof theme.getConfirmMessage === 'function'
            ? theme.getConfirmMessage(langCode)
            : 'Is the content confirmed to be correct?';

        if (typeof window !== 'undefined' && typeof window.confirm === 'function' && !window.confirm(confirmMsg)) {
            return false;
        }

        const restore = withProgress(btn);

        try {
            const payload = buildDraftPayload();
            await theme.importDraft(payload);
            btn.style.display = 'none';
            if (typeof app.stdSuccess === 'function') {
                app.stdSuccess({ msg: 'imported' });
            }
        } catch (err) {
            if (typeof app.stdErr === 'function') {
                app.stdErr(err);
            }
        } finally {
            restore();
        }
        return true;
    };

    registerHooks('site.default', {
        init: { handler: handleInit, event: 'init' },
        goback: handleGoback,
        import: handleImport,
        initMarkdown: { handler: handleInitMarkdown, event: 'init' },
    }, {
        legacy: {
            init: 'site.init',
            goback: 'site.goback',
            import: 'site.importDraft',
            initMarkdown: 'site.initMarkdown',
        },
    });

    return function teardownDefaultTheme() {};
}

export default defaultThemePlugin;
