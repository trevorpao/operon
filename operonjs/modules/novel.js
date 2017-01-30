;(function(app, gee, $){
    "use strict";

    app.novel = {
        uri: '',
        tmpl: null,
        loadHtml: function(novelID) {
            var success = function(html, status, xhr) {
                if ( status == "error" ) {
                    gee.alert({
                        title: 'Alert!',
                        txt: "Sorry but there was an error: "+ xhr.status + " " + xhr.statusText
                    });
                }
                else {
                    gee.clog($(html).find('#info'));
                }
            };

            $.ajax({url: app.novel.uri +'/'+ novelID, cache: false}).done(success);
        },
    };

    gee.hook('convertNovel', function (me){
        var novel_ls = $('#novel_str').val();
        var rows = novel_ls.split("\n");

        if (Array.isArray(rows)) {
            var tmp = [];
            $.each(rows, function(idx, row){
                var str = row.trim();
                if (str !== '' && str !== ',') {
                    var sub = str.split(',');
                    if (sub[1]) {
                        tmp.push({novelTitle: sub[0], novelID: sub[1]});
                    }
                }
            });
            rows = tmp;
        }

        if (rows !== []) {
            $.each(rows, function(idx, row){
                app.novel.loadHtml(row.novelID);
            });
        }

        $('#upload-result').html(app.novel.tmpl.render({rows: rows}));
    });

    gee.hook('loadResultTmpl', function(me){
        app.novel.uri = $('#novel_uri').val();
        app.novel.tmpl = $.templates(me.html());

        var helper = {
            novelUri: function(novelID, chapterUri) {
                return app.novel.uri +'/'+ novelID + ((chapterUri) ? '/'+ chapterUri : '');
            }
        };

        $.views.helpers(helper);

        me.html('');
    }, 'init');

}(app, gee, jQuery));
