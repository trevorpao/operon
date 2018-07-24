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

            var $grid = $('.grid').masonry({
                columnWidth: '.grid-sizer',
                itemSelector: '.grid-item',
                gutter: '.gutter-sizer'
            });

            $('.navbar-toggle').on('click', function(e) {
                e.preventDefault();
                $('#main-collapse').toggleClass('open');
                $('.sidebar').toggleClass('open');
            });

            $('.mobile .nav a').on('click', function(e) {
                $('#main-collapse').removeClass('open');
                $('.sidebar').removeClass('open');
            });

            app.waitFor(0.6).then(function () {
                $grid.masonry();
            });
        }
    };

}(app, gee, jQuery));
