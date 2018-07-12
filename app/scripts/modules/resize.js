;(function(app, gee, $){
    'use strict';

    var Resize = function (box){

        var that = this;
        that.iefh = 10;
        that.iefw = 0;
        that.stt = 0;
        that.box = box;

        return {
            resize: function(opt) {
                var q = gee.parseUrlQuery(location.href);
                var params = {
                    'if_height': (opt.height || that.box.innerHeight()) + that.iefh,
                    'if_width': (opt.width || that.box.innerWidth()) + that.iefw,
                    'scrollToTop': (opt.scrollToTop || that.stt),
                    'func': (opt.func || null),
                    'uri': (opt.uri || null),
                    'if_ta': q.ta
                };

                $.postMessage(
                    params,
                    q.canonical,
                    window.parent
                );
            },

            dalay: function(d, opt) {
                app.waitFor(d).then(function () {
                    // $('#preload').remove();
                    // that.box.show();

                    app.resize.resize(opt || {});
                });
            },

            deploy: function() {
                var fixedH = 0;

                app.waitFor(function (argument) {
                    return (that.box.height()*1 > 10);
                }).then(function () {
                    app.resize.resize({
                        height: that.box.height()*1 + fixedH,
                        width: that.box.width()*1
                    });
                });
            },
        };
    };

    app.resize = new Resize($('#js-embed-box'));

}(app, gee, jQuery));
