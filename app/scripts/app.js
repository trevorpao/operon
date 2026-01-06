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

        initModules: ['arena'],

        ifWebP: 1,

        thumbnail: {
            all_thn: [128, 128],
            default_thn: [300, 300],
            press_thn: [400, 225],
            product_thn: [400, 225]
        },

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

            const initList = Array.isArray(modules) && modules.length > 0 ? modules : app.initModules;

            if (initList && initList.length > 0) {
                initList.map(function (module) {
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

        isDev: function () {
            var port = $(location).attr('port');
            return port === '9001';
        },

        ifWebView: function () {
            var userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
            var rtn = '';
            var isiPhone = /iphone/i.test(userAgent);

            if (isiPhone) {
                if (/line/i.test(userAgent)) {
                    rtn = 'line';
                } else if (/fbios/i.test(userAgent)) {
                    rtn = 'facebook';
                }
            } else {
                if (/line/i.test(userAgent)) {
                    rtn = 'line';
                } else if (/fbiab/i.test(userAgent)) {
                    rtn = 'facebook';
                } else if (/iab/i.test(userAgent)) {
                    rtn = 'unknow';
                }
            }

            return rtn;
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
            var el = element && element.target ? element.target : element;
            if (!el) return;
            el.src = '/images/default.jpg';
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

        race: function (condition, min, max) {
            var times = 0;
            var during = 70;
            var minTimes = min || 9;
            var maxTimes = max || 18;

            return new Promise(function (resolve) {
                var timer = setInterval(function () {
                    times++;
                    if ((typeof condition === 'function' && condition(times) && times > minTimes) || times > maxTimes) {
                        clearInterval(timer);
                        resolve();
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

        stdCallback: function (btn) {
            return function () {
                app.doneBtn(btn);
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);
                }
            };
        },

        yell: function (url, data, callback, type) {
            var cb = (typeof callback === 'function') ? callback : function () {};
            var method = type || 'POST';
            gee.yell(url, data, cb, cb, method);
        },

        setCookie: function (key, val, days) {
            var expires = '';
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toUTCString();
            }
            document.cookie = key + '=' + (val || '') + expires + '; path=/';
        },

        getCookie: function (key) {
            var nameEQ = key + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
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

        detectForm: function(elem) {
            var el = toElement(elem);
            if (!el) return [null, null];
            if (el.tagName === 'FORM') return [el, el.querySelector('.btn-submit')];
            var form = el.closest('form');
            return [form, el];
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

        baseConverter: function (nbasefrom, basefrom, baseto) {
            var SYMBOLS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (basefrom <= 0 || basefrom > SYMBOLS.length || baseto <= 0 || baseto > SYMBOLS.length) {
                return null;
            }
            var i, nbaseten = 0;
            if (basefrom !== 10) {
                var sizenbasefrom = nbasefrom.length;
                for (i = 0; i < sizenbasefrom; i++) {
                    var mul, mul_ok = -1;
                    for (mul = 0; mul < SYMBOLS.length; mul++) {
                        if (nbasefrom[i] === SYMBOLS[mul]) {
                            mul_ok = 1;
                            break;
                        }
                    }
                    if (mul >= basefrom) {
                        return null;
                    }
                    if (mul_ok === -1) {
                        return null;
                    }
                    var exp = (sizenbasefrom - i - 1);
                    if (exp === 0) {
                        nbaseten += mul;
                    }
                    else {
                        nbaseten += mul * Math.pow(basefrom, exp);
                    }
                }
            } else {
                nbaseten = parseInt(nbasefrom, 10);
            }

            if (baseto !== 10) {
                var nbaseto = [];
                while (nbaseten > 0) {
                    var mod = nbaseten % baseto;
                    if (mod < 0 || mod >= SYMBOLS.length) {
                        return null;
                    }
                    nbaseto.push(SYMBOLS[mod]);
                    nbaseten = parseInt(nbaseten / baseto, 10);
                }
                return nbaseto.reverse().toString().replace(/,/g, '');
            } else {
                return nbaseten.toString();
            }
        },

        MD5: function(s){function L(k,d){return(k<<d)|(k>>>(32-d));}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H);}if(I|d){if(x&1073741824){return(x^3221225472^F^H);}else{return(x^1073741824^F^H);}}else{return(x^F^H);}function r(d,F,k){return(d&F)|((~d)&k);}function q(d,F,k){return(d&k)|(F&(~k));}function p(d,F,k){return(d^F^k);}function n(d,F,k){return(F^(d|(~k)));}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F);}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F);}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F);}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F);}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++;}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa;}function B(x){var k='',F='',G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F='0'+G.toString(16);k=k+F.substr(F.length-2,2);}return k;}function J(k){k=k.replace(/rn/g,'n');var d='';for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x);}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128);}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128);}}}return d;}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g);}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase();
        },

        checkWebP: function (callback) {
            var webP = new Image();
            webP.onload = webP.onerror = function () {
                callback(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        },

        replaceWebP: function (box) {
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
        },

        formFilled: function (form) {
            var el = toElement(form);
            if (!el) return 0;
            return el.querySelectorAll('[required]:placeholder-shown').length;
        },

        bytesLength: function (str) {
            var n = (str || '').length;
            var len = 0;
            for (var i = 0; i < n; i++) {
                var s = str.charCodeAt(i);
                while (s > 0) {
                    len++;
                    s = s >> 8;
                }
            }
            return len / 2;
        },

        padLeft: function (str, length) {
            var val = String(str);
            if (val.length >= length) return val;
            return app.padLeft('0' + val, length);
        },

        log: function (module, txt) {
            if (!gee || !gee.isset) {
                console.log(module + '::' + JSON.stringify(txt));
                return;
            }
            if (
                app.tracking === module ||
                !gee.isset(app.tracking) ||
                module === '' ||
                module === 'all'
            ) {
                gee.clog(module + '::' + JSON.stringify(txt));
            }
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
