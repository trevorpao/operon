;(function(app, gee, $){
    'use strict';

    app.search = {
        limit: 6,
        page: 1,
        box: null,
        pid: 0,
        $grid: null,
        tags: [],
        mode: 'normal',

        load: function () {
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.search.render(this.data.data);
                }
            };

            gee.yell('search/load', {
                pid: app.search.pid,
                page: app.search.page,
                limit: app.search.limit
            }, callback, callback);
        },

        more: function (pid, src, btn) {
            var callback = function () {
                app.doneBtn(btn);
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    if (src === 'report/load') {
                        app.search.renderReport(this.data.data);
                    }
                    else {
                        app.search.render(this.data.data);
                    }
                    app.search.render(this.data.data);
                }
            };

            gee.yell(src, {
                pid: pid,
                page: app.search.page,
                limit: app.search.limit
            }, callback, callback);
        },

        render: function (data) {
            var items = $('#preess3ColsTmpl').render({data: data});

            if (app.search.page === 1 && app.search.mode !== 'filter') {
                app.search.box.append(items);

                app.search.$grid = app.search.initGrid(app.search.box);

                $('#search-total').prepend((data.total === 0)?'沒有':'共有 '+ data.total +' 筆');

                if (data.total > data.limit) {
                    $('#showMore').removeClass('hidden');
                }
            }
            else {
                items = $(items);
                app.search.box.append(items);

                app.search.box.find('.post-image img:last').one('load', function() {
                    app.waitFor(0.4).then(function () {
                        app.search.$grid.isotope('appended', items).isotope('layout');
                        app.search.box.addClass('grid-loaded');
                    });
                });

                if (data.total <= (data.pos*1+1)*data.limit) {
                    $('#showMore').addClass('hidden');
                }
            }

        },

        renderReport: function (data) {
            var items = $('#reportTmpl').render({data: data});

            if (app.search.page === 1 && app.search.mode !== 'filter') {
                app.search.box.append(items);

                if (data.total > data.limit) {
                    $('#showMore').removeClass('hidden');
                }
            }
            else {
                items = $(items);
                app.search.box.append(items);

                if (data.total <= (data.pos*1+1)*data.limit) {
                    $('#showMore').addClass('hidden');
                }
            }

        },

        initGrid: function (box) {
            var gridItem = box.attr('data-item') || 'portfolio-item';

            return box.isotope({
                layoutMode: box.attr('data-layout') || 'masonry',
                transitionDuration: box.attr('data-transition') || '0.55s',
                stagger: Number(box.attr('data-stagger') || 10),
                itemSelector: '.' + gridItem,
                autoHeight: true,
                hiddenStyle: {
                    opacity: 0,
                    transform: 'translate3d(0px, 60px, 0px)',
                },
                visibleStyle: {
                    opacity: 1,
                    transform: 'translate3d(0px, 0px, 0px)',
                },
                masonry: {
                    columnWidth: box.find('.' + gridItem + ':not(.large-width)')[0],
                }
            });
        }
    };

    gee.hook('search.load', function (me) {
        app.search.box = me;
        app.search.limit = me.data('limit') || app.search.limit;
        app.search.page = 1;
        app.search.pid = me.data('pid');

        app.search.box.text('');

        app.search.load();
    });

    gee.hook('search.next', function (me) {
        app.search.page++;

        app.search.load();
    });

    gee.hook('search.filter', function (me) {
        var ta = $(me.event.target);

        if (ta.is('label') || ta.is('input')) {
            app.search.mode = 'filter';
            app.waitFor(1.2).then(function () {
                var checkedValues = $('.filter-chk:checked').map(function() {
                    return this.value;
                }).get();
                checkedValues.push(me.data('pid'));

                if (!_.isEqual(app.search.tags, checkedValues)) {
                    app.search.box = $('#'+ me.data('ta'));
                    app.search.box.removeClass('grid-loaded');
                    $('#showMore').removeClass('hidden');
                    app.search.$grid = app.search.initGrid(app.search.box);

                    app.search.$grid.find('.post-item').each(function () {
                        app.search.$grid.isotope('remove', this);
                    });
                    app.search.$grid.isotope('layout');

                    app.search.page = 1;
                    app.search.tags = checkedValues;

                    app.search.more(app.search.tags.join(','), me.data('src'), me);
                }
            });
        }
    });

    gee.hook('search.more', function (me) {
        let ids = (app.search.mode === 'filter') ? app.search.tags.join(',') : me.data('pid');
        app.search.box = $('#'+ me.data('ta'));
        app.search.limit = me.data('limit') || app.search.limit;
        app.search.$grid = app.search.initGrid(app.search.box);

        app.search.page++;

        app.progressingBtn(me);

        app.search.more(ids, me.data('src'), me);
    });

}(app, gee, jQuery));
