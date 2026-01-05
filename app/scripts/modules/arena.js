;(function(app, gee, $){
    'use strict';

    // register a module name
    app.arena = {
        cuModal: null,
        feed: null,
        init: function () {
            // app.arena.initSlider($('#slider-range1'));
            app.arena.handler();

            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                $(window).bind('touchend touchcancel touchleave', function (e) {
                    app.arena.handler();
                });
            } else {
                $(window).scroll(function () {
                    app.arena.handler();
                });
            }

            localforage.ready().then(function() {
                app.arena.feed = localforage.createInstance({
                    name: 'arenaBase',
                    version: 1
                });
                gee.clog('-------------------------- localforage start -----------------------------');
                app.lang.init();
                app.arena.initFontSize();
            }).catch(function (e) {
                gee.clog(e);
                app.track.send('failure', 'init_localforage', JSON.stringify(e));
            });
        },
        initFontSize: function () {
            app.arena.feed.getItem('fontSize', function(err, val){
                if (err) {
                    gee.clog('---------------------- localforage err -------------------------');
                    gee.clog(err);
                    app.track.send('failure', 'load_localforage', JSON.stringify(err));
                }

                var cufontSize = app.fontSize;

                if (val) {
                    cufontSize = val*1;
                }

                if (app.fontSize !== cufontSize) {
                    app.fontSize = cufontSize;
                    $('#article-press .text p, #article-press .text li, #article-post .text p, #article-post .text li').css('fontSize', app.fontSize+'rem');
                }
            });
        },
        handler: function () {
            var currentWindowPosition = $(window).scrollTop();

            if (currentWindowPosition > 300) {
                $('.goTop').show();
            } else {
                $('.goTop').hide();
            }
        },
        hideModal: function () {
            if (!app.arena.cuModal) {
                return;
            }
            var modalEl = app.arena.cuModal;
            var content = modalEl.querySelector('.modal-content');
            if (content) {
                content.classList.remove('modal-lg', 'modal-nor', 'modal-sm');
            }
            modalEl.classList.remove('is-active');
            modalEl.setAttribute('aria-hidden', 'true');
            modalEl.style.display = 'none';

            var body = modalEl.querySelector('.modal-body');
            if (body) {
                body.innerHTML = '';
            }
            app.arena.cuModal = null;
        },
        showModal: function (ta, html) {
            html = (html) ? html : '';
            var modalEl = document.getElementById(ta);
            if (!modalEl) {
                return;
            }
            app.arena.cuModal = modalEl;
            var modalBody = modalEl.querySelector('.modal-body');
            if (modalBody && html !== '') {
                modalBody.innerHTML = html;
            }

            modalEl.style.display = 'block';
            modalEl.classList.add('is-active');
            modalEl.setAttribute('aria-hidden', 'false');
        }
    };

    gee.hook('reXPos', function(me) {
        var left = me.data('left')*1;
        var x = me.data('x')*1;
        var w = app.body.width();

        if (w > 1000) {
            left = 0;
        }
        else {
            left = (app.body.width() * x + left);
        }

        me.css({
            left: left + 'px'
        });

    }, 'init');

    // hook some handler
    gee.hook('arena.modal.iframe', function(me){
        app.arena.showModal('arena-modal', '<iframe src="'+ me.data('src') +'" frameborder="0"></iframe>');
    });

    gee.hook('loadMain', function(me) {
        var src = me.data('src');

        app.loadHtml(src, 'main-box', 1);
    });

    gee.hook('replaceMe', function(me) {
        var src = me.data('src');
        var newPath = '/'+ src;

        $.get(app.tmplPath + newPath +'.html?var=' + app.cuVersion, function(html) {
            me.replaceWith(html);
            gee.init();
        });
    });

    gee.hook('loadBox', function(me) {
        var src = me.data('src');

        app.loadHtml(src, me);
    });

    gee.hook('loadModal', function(me) {
        var type = me.data('type');
        var width = me.data('width') || 'std';

        app.loadHtml('modal/' + type, width + '-modal-box');
        var label = document.getElementById(width + '-modalLabel');
        if (label) {
            label.textContent = type;
        }
        app.arena.showModal(width + '-modal');
    });

    gee.hook('hideModal', function (me) {
        app.arena.hideModal();
    });

    gee.hook('reExe', function(me) {
        if (app.redo) {
            var f = app.redo.split('.');
            if (typeof app[f[0]][f[1]] === 'function') {
                app[f[0]][f[1]].call(this);
                app.redo = null;
            } else {
                location.reload();
            }
        }
    });

    gee.hook('largerFont', function(me) {
        var taStr = me.data('ta') || '#article-press .text p, #article-press .text li, #article-post .text p, #article-post .text li';
        app.fontSize = app.fontSize * 1 + 0.1;
        app.arena.feed.setItem('fontSize', app.fontSize).catch( gee.clog );
        $(taStr).css('fontSize', app.fontSize + 'rem');
    });

    gee.hook('smallerFont', function(me) {
        var taStr = me.data('ta') || '#article-press .text p, #article-press .text li, #article-post .text p, #article-post .text li';
        app.fontSize = app.fontSize * 1 - 0.1;
        app.arena.feed.setItem('fontSize', app.fontSize).catch( gee.clog );
        $(taStr).css('fontSize', app.fontSize + 'rem');
    });

    gee.hook('initAutolink', function(me) {
        var html = Autolinker.link(me.html(), {
            stripPrefix: false,
            truncate: { length: 32, location: 'middle' }
        });

        me.html(html);
    }, 'init');

    gee.hook('initPagination', function(me) {
        var el = (me && me[0]) ? me[0] : null;
        if (!el) { return; }

        var params = me.data ? me.data() : {};
        var totalPages = Math.max(1, Math.ceil((params.total || 0) / (params.length || 1)));
        var canonical = document.querySelector('link[rel="canonical"]');
        var baseHref = canonical ? canonical.getAttribute('href') : window.location.pathname;

        var html = '';
        for (var i = 1; i <= totalPages; i++) {
            html += '<a class="page-link" href="' + baseHref + '?page=' + i + '">' + i + '</a>';
        }
        el.innerHTML = html;
    }, 'init');

    gee.hook('initTmpl', function (me) {
        gee.clog('enter into iitTmpl method in arena.js++++++', me);

        app.loadTmpl(me.data('tmpl'), me);
    });

    gee.hook('react', function(me) {
        var ta = $(me.event.target);

        if (!ta.attr('func')) {
            ta = ta.parent();
        }

        var func = ta.attr('func');
        var type = ta.data('event') || 'click';

        gee.clog(func);

        if (type === me.event.type && gee.check(func)) {
            ta.event = me.event;
            gee.exe(func, ta);
        }
    });

    gee.hook('reactSubmit', function (me) {
        var code = me.event.keyCode || me.event.which;
        var func = me.attr('func');
        if (code === 13 && !me.event.shiftKey && func !== '' && gee.check(func)) {
            if (func === 'stdSubmit') {
                var form = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form');
                me = form.find('[data-gene="click:stdSubmit"]');
            }

            if (func === 'login') {
                var form = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form');
                me = form.find('[data-gene="click:login"]');
            }

            gee.exe(func, me);
        }
    });

}(app, gee, jQuery));
