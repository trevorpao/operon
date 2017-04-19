;(function(app, gee, $){
    'use strict';

    // register a module name
    app.arena = {
        cuModal: null,
        init: function () {
            // app.page.initSlider($('#slider-range1'));
            app.page.handler();

            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                $(window).bind('touchend touchcancel touchleave', function (e) {
                    app.page.handler();
                });
            } else {
                $(window).scroll(function () {
                    app.page.handler();
                });
            }

        },
        handler: function () {
            var currentWindowPosition = $(window).scrollTop();

            if (currentWindowPosition > 300) {
                $('.goTop').show();
            } else {
                $('.goTop').hide();
            }
        },
        showModal: function (ta, html) {
            html = (html) ? html : '';
            var modal = $('#'+ ta), modalBody = $('#'+ ta +' .modal-body');

            modal.unbind()
                .on('show.bs.modal', function () {
                    gee.clog('show.bs.modal');
                    if (html !== '') {
                        modalBody.html(html);
                    }
                    app.page.cuModal = modal;
                })
                .on('hidden.bs.modal', function () {
                    gee.clog('hidden.bs.modal');
                    if (html !== '') {
                        modalBody.html('');
                    }
                    app.page.cuModal = null;
                })
                .modal();
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
    gee.hook('arena.modal.show', function(me){
    });

}(app, gee, jQuery));
