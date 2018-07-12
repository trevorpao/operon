;(function(app, gee, $){
    'use strict';

    app.menu = {
        apiUri: 'http://hl.sense-info.co/api/menu',

        init: function () {

        },

        load: function (box, menuID) {
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    box.html($.templates('#menuTmpl').render({data: this.data}));

                    // TODO: try do this in gee way
                    if (!app.body.is('.device-lg, .device-md')) {
                        $(
                            '#mainMenu nav > ul > li.dropdown > a, '+
                            '#mainMenu nav > ul .dropdown-submenu > a, '+
                            '#mainMenu nav > ul .dropdown-submenu > span'
                        ).on('click touchend', function(e) {
                            $(this).parent('li').siblings().removeClass('hover-active');
                            $(this).parent('li').toggleClass('hover-active');
                            return false;
                        });
                    }

                    gee.init();
                }
            };

            gee.yell(app.menu.apiUri + '/lotsMenu', { menuID: menuID }, callback, callback);
        },

        loadFooter: function (box, menuID) {
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    box.prepend($.templates('#footerMenuTmpl').render({data: this.data}));
                }
            };

            gee.yell(app.menu.apiUri + '/lotsMenu', { menuID: menuID }, callback, callback);
        },
    };

    if (app.isProd()) {
        app.menu.apiUri = 'https://stage.how-living.com/api/menu';
    }

    // hook some handler
    gee.hook('getMainMenu', function (me) {
        var menuID = me.data('menu-id');
        app.menu.load(me, menuID);
    });

    gee.hook('getFooterMenu', function (me) {
        var menuID = me.data('menu-id');
        app.menu.loadFooter(me, menuID);
    });

}(app, gee, jQuery));
