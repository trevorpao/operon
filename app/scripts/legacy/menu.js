;(function(app, gee, $){
    'use strict';

    app.menu = {

        init: function () {

        },

        load: function (box, menuID) {
            var tmpl = box.data('tmpl') || 'menuTmpl';
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    box.html($.templates('#'+ tmpl).render({data: this.data}));

                    app.waitFor(0.1).then(function () { // waitfor DOM ready
                        gee.init();
                        app.track.bind(box);
                    });
                }
            };

            app.yell('menu/lotsMenu', { menuID: menuID }, callback, callback);
        },
    };

    // hook some handler
    gee.hook('menu/load', function (me) {
        var menuID = me.data('menu-id');
        app.menu.load(me, menuID);
    });

}(app, gee, jQuery));
