;(function(app, gee){
    'use strict';

    var toElement = function (target) {
        if (!target) return null;
        if (target instanceof Element) return target;
        if (typeof target === 'string') return document.querySelector(target);
        if (target[0] instanceof Element) return target[0];
        return null;
    };

    var createOverlay = function () {
        var overlay = document.createElement('div');
        overlay.className = 'sl-overlay-native';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:none;align-items:center;justify-content:center;z-index:9999;';

        var img = document.createElement('img');
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        overlay.appendChild(img);

        document.body.appendChild(overlay);
        return { overlay: overlay, img: img };
    };

    app.slider = {
        canClose: true,
        target: null,
        overlay: null,
        overlayImg: null,
        setTarget: function (target) {
            var el = toElement(target) || document.querySelector('#press-content, #post-content');
            app.slider.target = el;
            if (el && el.dataset && el.dataset.canClose) {
                app.slider.canClose = el.dataset.canClose;
            }
            return app.slider;
        },
        render: function () {
            if (!app.slider.target) {
                app.slider.setTarget();
            }
            var container = app.slider.target;
            if (!container) return app.slider;

            container.querySelectorAll('img.size-large, img.img-responsive, img.size-medium, img.fr-fin, img.fr-dib').forEach(function (img) {
                var wrapper = document.createElement('a');
                wrapper.className = 'slbox';
                wrapper.href = img.getAttribute('src') || img.src;
                wrapper.innerHTML = img.outerHTML;
                img.replaceWith(wrapper);
            });

            return app.slider;
        },
        bind: function () {
            if (!app.slider.overlay) {
                var parts = createOverlay();
                app.slider.overlay = parts.overlay;
                app.slider.overlayImg = parts.img;

                if (app.slider.canClose) {
                    app.slider.overlay.addEventListener('click', function () {
                        app.slider.hide();
                    });
                    document.addEventListener('keydown', function (e) {
                        if (e.key === 'Escape') {
                            app.slider.hide();
                        }
                    });
                }
            }

            var container = app.slider.target;
            if (!container) return app.slider;

            container.querySelectorAll('a.slbox').forEach(function (lnk) {
                lnk.addEventListener('click', function (evt) {
                    evt.preventDefault();
                    app.slider.show(lnk.getAttribute('href'));
                });
            });

            return app.slider;
        },
        show: function (src) {
            if (!app.slider.overlay || !app.slider.overlayImg) return;
            app.slider.overlayImg.src = src;
            app.slider.overlay.style.display = 'flex';
            document.body.classList.add('hidden-scroll');
        },
        hide: function () {
            if (!app.slider.overlay) return;
            app.slider.overlay.style.display = 'none';
            document.body.classList.remove('hidden-scroll');
        }
    };

    gee.hook('slider.init', function (me) {
        var ta = me.data && me.data('ta') ? me.data('ta') : null;
        var target = ta ? document.querySelector(ta) : (me[0] ? me[0] : me);
        if (app.screen === 'tablet') {
            app.slider.setTarget(target).render().bind();
        }
    });

}(app, gee));
