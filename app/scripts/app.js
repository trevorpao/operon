import gee from 'trevorpao/geneEH';

/**
 * app
 */

const createApp = () => {
    'use strict';

    const that = {};

    const toElement = (target) => {
        if (!target) return null;
        if (target instanceof Element) return target;
        if (typeof target === 'string') {
            return document.getElementById(target) || document.querySelector(target);
        }
        if (target[0] instanceof Element) return target[0];
        return null;
    };

    const getTemplateFn = (tmplName, source) => {
        if (window.templates && typeof window.templates[tmplName] === 'function') {
            return window.templates[tmplName];
        }
        if (window.Handlebars && typeof window.Handlebars.compile === 'function' && source) {
            return window.Handlebars.compile(source);
        }
        return null;
    };

    const serializeForm = (form) => {
        if (!form) return '';
        return new URLSearchParams(new FormData(form)).toString();
    };

    const validateForm = (form) => {
        if (!form) return false;
        if (typeof form.reportValidity === 'function') {
            return form.reportValidity();
        }
        if (typeof form.checkValidity === 'function') {
            return form.checkValidity();
        }
        return true;
    };

    that.config = {
        baseUrl: window.apiUrl,
        detectWidth: 600,
    };

    const app = {
        pageCounter: 1,
        pageLimit: 8,

        fontSize: 1.25,

        redo: null,

        plugins: new Map(),

        tmplStores: {},
        htmlStores: {},
        tmplPath: 'tmpls',
        cuVersion: '',

        errMsg: {
            'e9100': '資料庫發生錯誤',
            'e9101': '資料庫發生錯誤',
            'e9102': '資料庫發生錯誤',
            'e9103': '資料庫發生錯誤',
            'e8100': '請輸入必填欄位'
        },

        init: function(modules) {

            app.announce();

            app.cuVersion = document.cuVersion;
            app.win = window;
            app.docu = document;
            app.body = $('body');
            app.bodyEl = document.body;

            app.screen = (app.bodyEl.clientWidth < that.config.detectWidth) ? 'mobile' : 'tablet';

            app.body.addClass(app.screen);
            app.bodyEl.classList.add(app.screen);

            gee.apiUri = window.apiUrl +'';
            gee.mainUri = window.mainUrl;
            gee.picUri = '';

            if (!app.isProd()) {
                gee.mainUri = 'https://f3cms.lo:4433/';
                gee.apiUri = 'https://f3cms.lo:4433/api/';
                gee.picUri = gee.mainUri.slice(0, -1);
            }

            gee.init();

            if (modules && modules.length > 0) {
                modules.map(function (module) {
                    if (gee.isset(app[module]) && gee.isset(app[module].init)) {
                        app[module].init();
                    }
                });
            }
        },

        announce: function () {
            setTimeout(console.log.bind(console, '%c%s', 'color: blue; font-size: 10px;', '   ###                                                    ###\n  #   #                                                     #\n #     #  ######    #####    # ###    #####   # ####        #    #####\n #     #  #     #  #     #   ##      #     #  ##    #       #   #\n #     #  #     #  #######   #       #     #  #     #  #    #    ####\n  #   #   #     #  #         #       #     #  #     #  #    #        #\n   ###    ######    #####    #        #####   #     #   ####    #####\n          #\n          #\n'));
            setTimeout(console.log.bind(console, '%c%s', 'color: red; background: yellow; font-size: 24px;', '\u8b66\u544a\uff01'));
            setTimeout(console.log.bind(console, '%c%s', 'font-size: 18px;', '\u4f7f\u7528\u9019\u500b\u4e3b\u63a7\u53f0\u53ef\u80fd\u6703\u8b93\u653b\u64ca\u8005\u6709\u6a5f\u6703\u5229\u7528\u540d\u70ba Self-XSS \u7684\u653b\u64ca\u65b9\u5f0f\u5192\u7528\u4f60\u7684\u8eab\u5206\uff0c\u7136\u5f8c\u7aca\u53d6\u4f60\u7684\u8cc7\u8a0a\u3002\n\u8acb\u52ff\u8f38\u5165\u6216\u8cbc\u4e0a\u4f86\u8def\u4e0d\u660e\u7684\u7a0b\u5f0f\u78bc\u3002'));
        },

        isProd: function () {
            var host = $(location).attr('hostname');

            return (host !== 'localhost' && host.indexOf('fake.') === -1 && host.indexOf('loc.') === -1);
        },

        resetCurrent: function (box) {
            const boxEl = toElement(box);
            if (!boxEl) {
                return;
            }

            const tmpl = boxEl.dataset.tmpl;
            app.pageBox = boxEl;

            if (!app.tmplStores[tmpl]) {
                const source = boxEl.innerHTML || '';
                app.tmplStores[tmpl] = getTemplateFn(tmpl, source) || (() => '');
            }

            app.pageCounter = 1;
            boxEl.innerHTML = '';
            app.destroyPaginate();
        },

        setPaginate: function (total, callback) {
            const pager = document.getElementById('paginate');
            if (!pager) {
                return;
            }

            const totalPages = Math.max(1, Math.ceil(total / app.pageLimit));
            pager.innerHTML = '';

            const renderBtn = (page) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = page;
                btn.className = (page === app.pageCounter) ? 'active' : '';
                btn.addEventListener('click', function () {
                    if (app.pageCounter === page) {
                        return;
                    }
                    app.pageCounter = page;
                    Array.from(pager.children).forEach((child) => child.classList.remove('active'));
                    btn.classList.add('active');
                    callback && callback.call(this);
                });
                return btn;
            };

            for (let i = 1; i <= totalPages; i++) {
                pager.appendChild(renderBtn(i));
            }
        },

        destroyPaginate: function (total, callback) {
            const pager = document.getElementById('paginate');
            if (pager) {
                pager.innerHTML = '';
            }
        },

        loadHtml: async function(src, ta, redirect) {
            const target = toElement(ta || src);
            const newPath = '/' + src;
            const cacheKey = 'file-' + src;
            const redirectFlag = redirect ? redirect : '';

            const applyHtml = (html) => {
                if (target) {
                    target.innerHTML = html;
                }
                if (redirectFlag === 1) {
                    app.redirect({ path: newPath, ta: target });
                }
                gee.init();
            };

            if (app.htmlStores[cacheKey]) {
                applyHtml(app.htmlStores[cacheKey]);
                return;
            }

            const url = `${gee.mainUri}${app.tmplPath}${newPath}.html?var=${app.cuVersion}`;
            gee.clog('load: ' + url);

            try {
                const res = await fetch(url, { credentials: 'include' });
                if (!res.ok) {
                    gee.alert({
                        title: 'Alert!',
                        txt: 'Sorry but there was an error: ' + res.status + ' ' + res.statusText
                    });
                    return;
                }
                const html = await res.text();
                app.htmlStores[cacheKey] = html;
                applyHtml(html);
            } catch (err) {
                gee.alert({ title: 'Alert!', txt: 'Sorry but there was an error: ' + err.message });
            }
        },

        loadTmpl: function (tmplName, box) {
            const boxEl = toElement(box);
            if (!boxEl) {
                return;
            }

            if (!app.tmplStores[tmplName]) {
                if (boxEl.tagName === 'FORM' && app.backend && typeof app.backend.initForm === 'function') {
                    app.backend.initForm(box);
                }

                const htmlCode = (boxEl.innerHTML || '')
                    .replace(/pre-gee/g, 'gee')
                    .replace(/pre-src/g, 'src');

                const tmplFn = getTemplateFn(tmplName, htmlCode);
                app.tmplStores[tmplName] = tmplFn || (() => '');
            }

            boxEl.innerHTML = '';
        },

        setForm: function (ta, row) {
            var formEl = toElement(ta);
            if (!formEl) return;

            formEl.querySelectorAll('input:not([type="button"]), select, textarea').forEach(function (el) {
                var idx = el.getAttribute('name');
                if (!idx || !row.hasOwnProperty(idx)) return;
                var val = row[idx];
                if (el.type === 'checkbox') {
                    el.checked = (el.value === String(val));
                } else if (el.type === 'radio') {
                    el.checked = (el.value === String(val));
                } else {
                    el.value = val;
                }
            });
        },

        redirect: function(state){
            if (!app.route) {
                window.location.hash = state.path;
            }
            else {
                window.history.pushState(state, '', state.path);
            }
        },

        renderBox: function (box, dataList, clearBox, orientation) {
            const boxEl = toElement(box);
            if (!boxEl || !dataList) {
                return;
            }

            const tmpl = boxEl.dataset.tmpl;
            const tmplFn = app.tmplStores[tmpl];
            if (typeof tmplFn !== 'function') {
                return;
            }

            const html = tmplFn(dataList);
            const direction = orientation || 'down';

            if (clearBox) {
                boxEl.innerHTML = '';
            }

            if (direction === 'down') {
                boxEl.insertAdjacentHTML('beforeend', html);

                if (app.pageCounter === 1) {
                    app.toTop();
                }
            } else {
                app.toTop();
                boxEl.insertAdjacentHTML('afterbegin', html);
            }
        },

        toTop: function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        defaultPic: function(element) {
            element.src = '/images/member.jpg';
        },

        /**
         * a object of promise
         * @param  condition function OR sec return bool
         * @param  int limit max test times
         * @return promise
         */
        waitFor: function (condition, limit) {
            var times = 0;
            var during = 70;
            var max = limit || 9; // Longest duration : during * (limit+1)

            return new Promise(function (resolve, reject) {
                if (Number(condition) === condition) {
                    setTimeout(resolve, condition * 1000);
                    return;
                }

                var timer = setInterval(function () {
                    times++;
                    try {
                        if (typeof condition === 'function' && condition()) {
                            clearInterval(timer);
                            resolve();
                        } else if (times > max) {
                            clearInterval(timer);
                            reject(new Error('waitFor timeout'));
                        }
                    } catch (err) {
                        clearInterval(timer);
                        reject(err);
                    }
                }, during);
            });
        },

        stdErr: function (e, redo) {
            e.data = e.data || {};

            if (gee.isset(e.data.msg)) {
                gee.alert({ title: 'Alert!', txt: e.data.msg });
            } else {
                var code = 'e' + e.code;
                if (gee.isset(app.errMsg[code])) {
                    gee.alert({ title: 'Alert!', txt: app.errMsg[code] });
                } else {
                    gee.alert({
                        title: 'Error!',
                        txt: 'Server Error, Plaese Try Later(' + e.code + ')'
                    });
                }
            }
        },

        stdSuccess: function (rtn) {
            rtn.data = rtn.data || {};

            if (gee.isset(rtn.data.msg)) {
                gee.alert({ title: 'Alert!', txt: rtn.data.msg });
            }

            if (gee.isset(rtn.data.redirect)) {
                location.href = (rtn.data.redirect === '') ? gee.apiUri : rtn.data.redirect;
            }

            if (gee.isset(rtn.data.goback)) {
                history.go(-1);
            }
        },

        showErrMsg: function (col, cond, msg) {
            var el = toElement(col);
            if (!el) return;
            var box = el.closest('.form-group');
            if (!box) return;

            box.classList.remove('has-error', 'has-pass', 'has-feedback');

            if (cond) {
                box.classList.add('has-error');
                var err = box.querySelector('.error-msg');
                if (err) {
                    err.textContent = msg;
                }
                var handler = function () {
                    app.clearMsg && app.clearMsg();
                    el.removeEventListener('keyup', handler);
                };
                el.addEventListener('keyup', handler);
            } else {
                box.classList.add('has-pass', 'has-feedback');
            }
        },

                cleanArray: function (actual) {
                        return Array.isArray(actual) ? actual.filter(Boolean) : [];
        },

        formatHelper: {
            currency: function(val) { return '$' + ($.fn.formatMoney((val+''), 0)); },
            sum: function(price, qty) { return tmplHelpers.currency(qty*price); },
            loadPic: function(path) { return gee.picUri + path; },
            average: function(sum, divide) { return (divide!='0') ? Math.round(sum*10/divide)/10 : 0; },
            beforeDate: function(ts, target) {
                var cu = moment(ts);
                app[target].max_ts = moment.max(app[target].max_ts, cu);
                app[target].min_ts = moment.min(app[target].min_ts, cu);
                return $.timeago(ts);
            },
            showDate: function(status, flow, schedule, createDate, publishDate) {
                var ts = publishDate || createDate;

                return status +' 於 ' + moment(ts).format('MM/DD HH:mm');
            },
            iso8601: function(ts) {
                return moment(ts).toISOString();
            },
            getYear: function(ts) {
                return moment(ts).format('YYYY');
            },
            getMon: function(ts) {
                return moment(ts).format('MMMM');
            },
            getWeek: function(ts) {
                return moment(ts).format('ddd');
            },
            getDay: function(ts) {
                return moment(ts).format('DD');
            },
            getTime: function(ts) {
                return moment(ts).format('HH:mm');
            },
            genderedHonorific: function(gender) {
                return (gender === 'f') ? '女士' : '先生';
            },
            linkAPI: function(str) {
                return that.config.uri + str;
            },
            nl2br: function(str) {
                var breakTag = '<br />';
                return (str + '')
                    .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
            }
        },

        extractAttr: function(obj) {
            var attr = {};
            obj.each(function() {
                $.each(this.attributes, function() {
                    attr[this.name] = this.value;
                });
            });
            return attr;
        },

        progressingBtn: function(btn) {
            var el = toElement(btn);
            if (!el) return;
            el.disabled = true;
            var icon = document.createElement('i');
            icon.className = 'fa fa-spinner fa-pulse fa-fw';
            el.appendChild(icon);
        },

        doneBtn: function(btn) {
            var el = toElement(btn);
            if (!el) return;
            app.waitFor(0.9).then(function () {
                el.disabled = false;
                var icon = el.querySelector('.fa-spinner');
                if (icon) {
                    icon.remove();
                }
            });
        },

        /**
         *
         * http://mir.aculo.us/2011/03/09/little-helpers-a-tweet-sized-javascript-templating-engine/
         *
         * simple string tmpl
         * @param  str target string
         * @param  params object that need to be replaced
         * @return string
         */
        tmpl: function(str, params) {
            for (var item in params) {
                str = str.replace(new RegExp('{' + item + '}', 'g'), params[item]);
            }

            return str;
        },

        use: async function (plugin) {
            if (!plugin || typeof plugin.install !== 'function') {
                throw new Error('Plugin must provide install(ctx)');
            }
            var name = (plugin.name || '').trim();
            if (!name) {
                throw new Error('Plugin must provide name');
            }
            if (app.plugins.has(name)) {
                return app.plugins.get(name).api;
            }

            var ctx = { app: app, gee: gee, config: that.config };
            var installed = await Promise.resolve(plugin.install(ctx));
            var api = (installed && installed.api) ? installed.api : {};
            var init = (installed && typeof installed.init === 'function') ? installed.init : null;
            var destroy = (installed && typeof installed.destroy === 'function') ? installed.destroy : null;

            app.plugins.set(name, { api: api, init: init, destroy: destroy });
            if (init) {
                await init();
            }

            return api;
        },

        get: function (name) {
            var entry = app.plugins.get(name);
            if (!entry) {
                throw new Error('Plugin "' + name + '" not found');
            }
            return entry.api;
        },

        destroy: async function (name) {
            var entry = app.plugins.get(name);
            if (!entry) {
                return;
            }
            if (typeof entry.destroy === 'function') {
                await entry.destroy();
            }
            app.plugins.delete(name);
        },

        serializeForm,
        validateForm
    };

    return app;
};

const app = createApp();

if (typeof Handlebars !== 'undefined' && typeof Handlebars.registerHelper === 'function') {
    Object.entries(app.formatHelper).forEach(function ([name, fn]) {
        Handlebars.registerHelper(name, fn);
    });
}

export default app;
