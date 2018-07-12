;(function(app, gee, $){
    'use strict';

    app.resource = {
        apiUri: 'http://hl.sense-info.co/api/resource',

        load: function (tmpl, data, box) {
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    if (this.data.data[0] === null) {
                        this.data.data = [];
                    }
                    if (tmpl !== 'menuCTA') {
                        box.html(app.tmplStores[tmpl].render({data: this.data.data, cu: this.data.cu}));
                    }
                    else {
                        box.html($('#menuCTATmpl').render({data: this.data.data, cu: this.data.cu}));
                    }

                    gee.init();

                    if (this.data.data !== [] && box.find('.carousel')) {
                        app.resource.carousel(box.find('.carousel'));
                    }

                    app.track.bind(box);
                }
            };

            gee.yell(app.resource.apiUri + '/load', data, callback, callback);
        },

        loadTop10: function (tmpl, limit, box) {
            limit = limit || 5;

            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    box.html(app.tmplStores[tmpl].render({data: this.data}));

                    app.track.bind(box);
                }
            };

            gee.yell(app.resource.apiUri + '/loadTop10', {limit: limit}, callback, callback);
        },

        carousel: function (box) {
            box.each(function() {
                var elem = $(this),
                    carouselNav = elem.attr('data-arrows'),
                    carouselDots = elem.attr('data-dots') || true,
                    carouselAutoPlay = elem.attr('data-autoplay') || false,
                    carouselAutoplayTimeout = elem.attr('data-autoplay-timeout') || 5000,
                    carouselAutoWidth = elem.attr('data-auto-width') || false,
                    carouseAnimateIn = elem.attr('data-animate-in') || false,
                    carouseAnimateOut = elem.attr('data-animate-out') || false,
                    carouselLoop = elem.attr('data-loop') || false,
                    carouselMargin = elem.attr('data-margin') || 0,
                    carouselVideo = elem.attr('data-video') || false,
                    carouselItems = elem.attr('data-items') || 4,
                    carouselItemsLg = elem.attr('data-items-lg') || Number(carouselItems),
                    carouselItemsMd = elem.attr('data-items-md') || Number(carouselItemsLg),
                    carouselItemsSm = elem.attr('data-items-sm') || Number(carouselItemsMd),
                    carouselItemsXs = elem.attr('data-items-xs') || Number(carouselItemsSm),
                    carouselItemsXxs = elem.attr('data-items-xxs') || Number(carouselItemsXs),
                    carouselCenter = elem.attr('data-center') || false;

                if (carouselItemsMd >= 3) {
                    carouselItemsSm = elem.attr('data-items-sm') || Number(2);
                }
                if (carouselItemsSm >= 2) {
                    carouselItemsXs = elem.attr('data-items-xs') || Number(2);
                }
                if (carouselItemsXs >= 1) {
                    carouselItemsXxs = elem.attr('data-items-xxs') || Number(1);
                }

                if (carouselNav == 'false') {
                    carouselNav = false;
                } else {
                    carouselNav = true;
                }

                if (carouselDots == 'false') {
                    carouselDots = false;
                } else {
                    carouselDots = true;
                }

                if (carouselAutoPlay == 'false') {
                    carouselAutoPlay = false;
                }

                var t = setTimeout(function() {
                    elem.owlCarousel({
                        center: carouselCenter,
                        nav: carouselNav,
                        dots: carouselDots,
                        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
                        autoplay: carouselAutoPlay,
                        autoplayTimeout: carouselAutoplayTimeout,
                        autoplayHoverPause: true,
                        autoWidth: carouselAutoWidth,
                        loop: carouselLoop,
                        margin: Number(carouselMargin),
                        smartSpeed: Number(1300),
                        video: carouselVideo,
                        animateIn: carouseAnimateIn,
                        animateOut: carouseAnimateOut,
                        onInitialize: function(event) {
                            // setTimeout(function () {
                                elem.addClass("carousel-loaded owl-carousel");
                            //    }, 1000);
                        },
                        responsive: {
                            0: {
                                items: Number(carouselItemsXxs)
                            },
                            480: {
                                items: Number(carouselItemsXs)
                            },
                            768: {
                                items: Number(carouselItemsSm)
                            },
                            992: {
                                items: Number(carouselItemsMd)
                            },
                            1200: {
                                items: Number(carouselItemsLg)
                            }
                        }
                    });
                }, 100);
            });
        }
    };

    if (app.isProd()) {
        app.resource.apiUri = 'https://stage.how-living.com/api/resource';
    }

    gee.hook('loadTop10', function (me) {
        app.loadTmpl(me.data('tmpl'), me);

        app.resource.loadTop10(me.data('tmpl'), me.data('limit'), me);
    });

    gee.hook('resource.load', function (me) {
        let tmpl = me.data('tmpl');
        if (tmpl !== 'menuCTA') {
            app.loadTmpl(tmpl, me);
        }

        app.resource.load(tmpl, {pid: me.data('pid'), limit: me.data('limit'), meta: (me.data('meta') || 0)}, me);
    });

}(app, gee, jQuery));
