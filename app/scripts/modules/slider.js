;(function(app, gee, $){
    'use strict';

    app.slider = {
        canClose: true,
        target: null,
        setTarget: function (taStr) {
            app.slider.target = $(taStr) || $('#article-press, #article-post');
            app.slider.canClose = app.slider.target.data('can-close') || app.slider.canClose;
            return app.slider;
        },
        render: function () {
            app.slider.target.find('img.size-large, img.size-medium, img.fr-fin, img.fr-dib').each(function () {
                var cu = $(this)[0].outerHTML;
                var imgPath = $(this).attr('src');
                $(this).replaceWith('<a class="slbox" href="'+ imgPath +'">'+ cu +'</a>');
            });

            return app.slider;
        },
        bind: function () {
            app.slider.cu = app.slider.target.find('a.slbox')
            .on('shown.simplelightbox', function () {
                app.body.addClass('hidden-scroll');
            }).on('closed.simplelightbox', function () {
                app.body.removeClass('hidden-scroll');
            }).simpleLightbox({
                close: app.slider.canClose,
                disableScroll: false,
                history: false,
                loop: false,
                showCounter: false
            });

            if (app.slider.canClose) {
                app.slider.cu.on('shown.simplelightbox', function () {
                    $('.sl-close, .sl-overlay').on('click', function (evt) {
                        app.slider.cu.close();
                    });
                });
            }

            return app.slider;
        }
    };

    gee.hook('initSlider', function (me) {
        app.slider.setTarget(me.data('ta')).render().bind();
    });

}(app, gee, jQuery));
