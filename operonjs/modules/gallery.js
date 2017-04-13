;(function(app, gee, $){
    "use strict";

    // register a module name
    app.gallery = {

        baseIfrme: function() {
            return '<div class="gene-iframe app-%(prefix)s"><iframe id="ifr_%(uniqid)s" src="'+ location.href +'%(taUri)s" width="%(width)s" scrolling="no" frameborder="0" allowtransparency="true" role="application" style="width: %(width)s; z-index: %(zidx)s;" class="app-box"></iframe></div>';
        },

        renderOpt: function(prefix, width, zidx) {
            var opt = {
                uniqid: prefix + Math.floor(Math.random() * 999 + 1),
                taUri: '/'+ prefix +'.html?pc=XXXX&uc=xxxx',
                width: width,
                zidx: zidx,
                prefix: prefix
            };

            opt.taUri += '&ta=' + opt.uniqid +'&canonical=' + decodeURIComponent($('link[rel=canonical]').attr('href'));

            return opt;
        }
    };

    gee.hookTag('gee\\:gallery-grid', function(me) {
        var opt = app.gallery.renderOpt('ratybox', '100%', '5');
        var attr = app.extractAttr(me);

        opt.taUri += '&page='+ attr.page;

        me.replaceWith(sprintf(app.gallery.baseIfrme(), opt));
    });

    // <gee:gallery-grid page="123456"></gee:gallery-grid>


}(app, gee, jQuery));
