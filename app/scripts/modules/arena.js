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
            if (app.arena.cuModal !== null) {
                app.arena.cuModal
                    // .removeClass('is-active')
                    .find('.modal-content')
                    .removeClass('modal-lg modal-nor modal-sm');
                app.arena.cuModal.modal('hide');
            }
        },
        showModal: function (ta, html) {
            html = (html) ? html : '';
            app.arena.cuModal = $('#'+ ta);
            var modalBody = app.arena.cuModal.find('.modal-body');

            app.arena.cuModal.unbind()
                .on('show.bs.modal', function () {
                    gee.clog('show.bs.modal');
                    if (html !== '') {
                        modalBody.html(html);
                    }
                })
                .on('hidden.bs.modal', function () {
                    gee.clog('hidden.bs.modal');
                    modalBody.html('');
                    app.arena.cuModal = null;
                })
                .modal('show');
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

        $('#' + width + '-modalLabel').text(type);
        $('#' + width + '-modal').modal('show');
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

    gee.hook('initSwitchery', function(me) {
        new Switchery(me[0], me.data());
    }, 'init');

    gee.hook('initPagination', function(me) {
        var params = me.data();
        me.twbsPagination({
            totalPages: Math.ceil(params.total / params.length),
            visiblePages: 7,
            href: $('link[rel="canonical"]').attr('href') + '?page={{number}}'
        });
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
