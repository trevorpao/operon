;(function(app, gee, $){
    "use strict";

    // register a module name
    app.animate = {
        box: {},
        html: '',
        loopIdx: 0,
        delay: 2.5,
        interval: 10,
        loopIn: function(){
            box.find('.item:eq('+ app.animate.loopIdx % list.length +')').animateCss(loopOut);
        },
        loopOut: function(){
            setTimeout(fadeout, (app.animate.interval - app.animate.delay) *1000);
        },
        fadeout: function () {
            box.find('.item:eq('+ app.animate.loopIdx % list.length +')').animateCss(resetCurrent);
        },
        resetCurrent: function() {
            box.find('.item').removeClass('current');
        }
    };

    $.fn.extend({
        animateCss: function (callback) {
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            this.addClass('animated').one(animationEnd, function() {
                $(this).removeClass('animated');
                if (typeof callback == 'function') {
                    callback.call($(this));
                }
            });
        }
    });

    // hook some handler
    gee.hook('loopList', function(me){
        var list = me.find(me.data('ta'));

        me.find('.item:eq('+ app.animate.loopIdx % list.length +')')
            .addClass('current')
            .animateCss('fadeInUpBig', loopOut);

        setInterval(function () {
            app.animate.loopIdx++;
            me.find('.item:eq('+ app.animate.loopIdx % list.length +')')
                .addClass('current')
                .animateCss('fadeInUpBig', loopOut);
        }, app.animate.interval * 1000)
    });

}(app, gee, jQuery));
