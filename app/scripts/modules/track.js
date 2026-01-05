;(function(app, gee, $){
    'use strict';

    // how to use
    // <a href="linkhere" class="track" data-cate="my_cate" data-act="my_act">link txt</a>

    app.track = {
        init: function () {
            app.track.bind(app.body);
        },

        bind: function (box) {
            var root = (box && box[0]) ? box[0] : (box || document);
            var nodes = root.querySelectorAll ? root.querySelectorAll('.track') : [];

            nodes.forEach(function (el) {
                el.addEventListener('click', function () {
                    var cate = el.dataset.cate || 'normal';
                    var act = el.dataset.act || 'jump';
                    var label = el.dataset.label || el.getAttribute('title') || document.title;
                    var which = el.dataset.which || 'ga';

                    app.track.send(cate, act, label, which);
                    el.classList.remove('track');
                    el.classList.add('tracked');
                }, { once: true });
            });
        },

        send: function (cate, act, label, which) {
            which = (which) ? which : 'ga';

            gee.clog({
                cate: cate,
                act: act,
                label: label,
                which: which,
            });

            if ((which === 'ga' || which === 'all') && gee.isset(window.ga)) {
                // Google analytics
                if (label) {
                    window.ga('send', 'event', cate, act, label);
                } else {
                    window.ga('send', 'event', cate, act);
                }
            }

            if ((which === 'pixel' || which === 'all') && gee.isset(window.fbq)) {
                // Facebook Pixel
                window.fbq('track', cate, act, label);
            }
        }
    };

}(app, gee, jQuery));
