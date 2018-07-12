;(function(app, gee, $){
    'use strict';

    app.iframeHeight = {};

    var Pipe = function (){
        var that = this;
        that.regex = /(how-living|sense-info)/;
        that.getParam = function (query, name, type) {
            var param;
            switch (type) {
                case 'string':
                    param = query[name];
                break;
                case 'uri':
                    param = decodeURIComponent(query[name]);
                break;
                default:
                    param = parseInt(query[name], 10);
                break;
            }

            return param;
        };

        return {
            handleParams: function (e){
                var params = gee.parseUrlQuery('/?'+ e.data);
                var h = that.getParam(params, 'if_height', 'int');
                var w = that.getParam(params, 'if_width', 'int');
                var ta = that.getParam(params, 'if_ta', 'string');
                var scrollToTop = that.getParam(params, 'scrollToTop', 'int');

                if ( !isNaN( h ) && h > 0 ) { // && h !== app.iframeHeight[''+ ta] ) {

                    gee.clog('height:'+ h);

                    $('#'+ ta).css('height', h);

                    if(w > 0) {
                        $('#'+ ta).css('width', w);
                    }

                    app.iframeHeight[''+ ta] = h;
                }

                if( 1 === scrollToTop) {
                    window.scrollTo(0, $('#'+ ta).position().top);
                }

                if (!_.isEmpty(params.func)) {
                    _.map((params.func).split('%3B'), function (r) {
                        gee.clog(r);

                        if( 'hideModal' === r) {
                            app.arena.hideModal();
                        }

                        if( 'showModal' === r) {
                            params.uri = that.getParam(params, 'uri', 'uri');
                            gee.arena.showModal(params.uri);
                        }

                        if( 'member.status' === r) {
                            app.member.status();
                        }
                    });
                }
            },
            handleCors: function (e){
                if (e.match(that.regex)===null) {
                    return false;
                }
                else {
                    return true;
                }
            }
        };
    };

    app.pipe = new Pipe();

    $.receiveMessage(app.pipe.handleParams, app.pipe.handleCors);

}(app, gee, jQuery));
