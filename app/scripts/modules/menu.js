;(function(app, gee, $){
    'use strict';

    var renderTmpl = function (selector, data) {
        var tmplEl = document.querySelector(selector);
        if (!tmplEl || !window.Handlebars || typeof Handlebars.compile !== 'function') {
            return '';
        }
        var fn = Handlebars.compile(tmplEl.innerHTML);
        return fn(data);
    };

    app.menu = {
        apiUri: 'http://hl.sense-info.co/api/menu',

        init: function () {

        },

        load: function (box, menuID) {
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    var html = renderTmpl('#menuTmpl', { data: this.data });
                    var boxEl = (box && box[0]) ? box[0] : box;
                    if (boxEl) {
                        boxEl.innerHTML = html;
                    }
                    else if (box && typeof box.html === 'function') {
                        box.html(html);
                    }

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
                    var html = renderTmpl('#footerMenuTmpl', { data: this.data });
                    var boxEl = (box && box[0]) ? box[0] : box;
                    if (boxEl) {
                        boxEl.insertAdjacentHTML('afterbegin', html);
                    }
                    else if (box && typeof box.prepend === 'function') {
                        box.prepend(html);
                    }
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
