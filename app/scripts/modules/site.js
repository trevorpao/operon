;(function(app, gee, $){
    'use strict';

    // only for this site
    app.site = {
        init: function () {

            $('#article .text img.fr-fin, #article .text img.fr-dib').each(function() { // handle img caption
                var $me = $(this);
                var imageCaption = $me.attr('alt');
                if (imageCaption != '' && imageCaption != 'Image title') {
                    var img = $me.prop('outerHTML');
                    var imgWidth = $me.width();

                    var cap = $('<span class="img-caption ellipsis"><em>' + imageCaption +
                        '</em></span>').css({
                        'width': imgWidth + 'px'
                    }).prop('outerHTML');

                    $me.replaceWith('<div class="img-with-caption">'+ img +''+ cap +'</div>');
                }
            });

            $('#article .text .f-video-editor iframe').each(function() {
                var $me = $(this);
                var imgWidth = $me.width();
                $me.css({
                    'height': Math.round(imgWidth*0.5625) + 'px'
                });
            });
        }
    };

    gee.hook('site/toggleNav', function(me) {
        $('#main-collapse').toggleClass('open');
        $('.sidebar').toggleClass('open');
    });

    gee.hook('site/closeNav', function(me) {
        $('#main-collapse').removeClass('open');
        $('.sidebar').removeClass('open');
    });

    gee.hook('site/masonryInit', function(me) {
        var $grid = me.masonry({
            columnWidth: '.grid-sizer',
            itemSelector: '.grid-item',
            gutter: '.gutter-sizer'
        });

        app.waitFor(0.6).then(function () {
            $grid.masonry();
        });
    });



}(app, gee, jQuery));
