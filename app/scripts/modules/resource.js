;(function(app, gee, $){
    'use strict';

    app.resource = {
        load: function (tmpl, data, box) {
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    if (this.data.data[0] === null) {
                        this.data.data = [];
                    }
                    box.html(app.tmplStores[tmpl].render({data: this.data.data, cu: this.data.cu}));

                    gee.init();

                    if (this.data.data !== [] && box.find('.carousel')) {
                        app.resource.carousel(box.find('.carousel'));
                    }

                    if (app.isProd()) {
                        app.track.bind(box);
                    }
                }
            };

            gee.yell('load', data, callback, callback);
        },

        loadTop10: function (tmpl, limit, box) {
            limit = limit || 5;

            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    box.html(app.tmplStores[tmpl].render({data: this.data}));

                    if (app.isProd()) {
                        app.track.bind(box);
                    }
                }
            };

            gee.yell('loadTop10', {limit: limit}, callback, callback);
        },

        carousel: function (box) {
            box.each(function() {
                var elem = $(this);
                elem.addClass('carousel-loaded');
                elem.css({
                    display: 'flex',
                    gap: (elem.attr('data-margin') || 0) + 'px',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory'
                });

                elem.children().css({
                    scrollSnapAlign: 'start'
                });
            });
        }
    };

    gee.hook('loadTop10', function (me) {
        app.loadTmpl(me.data('tmpl'), me);

        app.resource.loadTop10(me.data('tmpl'), me.data('limit'), me);
    });

    gee.hook('resource.load', function (me) {
        let tmpl = me.data('tmpl');

        app.resource.load(tmpl, {pid: me.data('pid'), limit: me.data('limit'), meta: (me.data('meta') || 0)}, me);
    });

}(app, gee, jQuery));
