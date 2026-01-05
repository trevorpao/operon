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
                        var links = document.querySelectorAll('#mainMenu nav > ul > li.dropdown > a, #mainMenu nav > ul .dropdown-submenu > a, #mainMenu nav > ul .dropdown-submenu > span');
                        links.forEach(function (lnk) {
                            lnk.addEventListener('click', function (e) {
                                e.preventDefault();
                                var li = lnk.parentElement;
                                if (!li) return;
                                var siblings = li.parentElement ? li.parentElement.children : [];
                                Array.prototype.forEach.call(siblings, function (sib) {
                                    if (sib !== li) sib.classList.remove('hover-active');
                                });
                                li.classList.toggle('hover-active');
                            });
                            lnk.addEventListener('touchend', function (e) {
                                e.preventDefault();
                                var li = lnk.parentElement;
                                if (!li) return;
                                var siblings = li.parentElement ? li.parentElement.children : [];
                                Array.prototype.forEach.call(siblings, function (sib) {
                                    if (sib !== li) sib.classList.remove('hover-active');
                                });
                                li.classList.toggle('hover-active');
                            });
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
