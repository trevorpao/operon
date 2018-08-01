;(function(app, gee, $){
    'use strict';

    // register a module name
    app.gallery = {

        baseIfrme: function() {
            return '<div class="gene-iframe app-{prefix}"><iframe id="ifr_{uniqid}" src="{taUri}" width="{width}" scrolling="no" frameborder="0" allowtransparency="true" role="application" style="width: {width}; z-index: {zidx};" class="app-box"></iframe></div>';
        },

        renderOpt: function(prefix, width, zidx) {
            var opt = {
                uniqid: prefix + Math.floor(Math.random() * 999 + 1),
                taUri: gee.mainUri +'tmpls/'+ prefix +'.html?pc=XXXX&uc=xxxx',
                width: width,
                zidx: zidx,
                prefix: prefix
            };

            opt.taUri += '&ta=' + opt.uniqid +'&canonical=' + decodeURIComponent($('link[rel=canonical]').attr('href'));

            return opt;
        }
    };

    gee.hookTag('gee\\:gallery-grid', function(me) {
        var opt = app.gallery.renderOpt('gallery-grid', '100%', '5');
        var attr = app.extractAttr(me);

        opt.taUri += '&page='+ attr.page;

        me.replaceWith(app.tmpl(app.gallery.baseIfrme(), opt));
    });

    // <gee:gallery-grid page="123456"></gee:gallery-grid>


}(app, gee, jQuery));
