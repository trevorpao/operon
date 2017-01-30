/**
 * hook base events
 */

;(function(app, gee, $) {
    'use strict';

    gee.hook('loadMain', function(me) {
        var type = me.data('type');

        app.loadHtml(type, 'main-box', 1);
    });

    gee.hook('loadBox', function(me) {
        var src = me.data('src');

        app.loadHtml(src, me);
    });

    gee.hook('loadModal', function(me) {
        var type = me.data('type');
        var width = me.data('width') || 'std';

        app.loadHtml('modal/' + type, width + '-modal-box');

        $('#' + width + '-modalLabel').text(type);
        $('#' + width + '-modal').modal('show');
    });

    gee.hook('reExe', function(me) {
        if (app.redo) {
            var f = app.redo.split('.');
            if (typeof app[f[0]][f[1]] === 'function') {
                app[f[0]][f[1]].call(this);
                app.redo = null;
            } else {
                location.reload();
            }
        }
    });

    gee.hook('translatePage', function(me) {
        $('.ts-switch').removeClass('focus');
        me.addClass('focus');
        translatePage();
    });

    gee.hook('largerFont', function() {
        app.fontSize = app.fontSize * 1 + 0.1;
        setCookie('fontSize', app.fontSize, 7);
        $('article .text p, article .text li').css('fontSize', app.fontSize + 'rem');
    });

    gee.hook('smallerFont', function() {
        app.fontSize = app.fontSize * 1 - 0.1;
        setCookie('fontSize', app.fontSize, 7);
        $('article .text p, article .text li').css('fontSize', app.fontSize + 'rem');
    });

    gee.hook('initSwitchery', function(me) {
        new Switchery(me[0], me.data());
    }, 'init');

    gee.hook('initPagination', function(me) {
        var params = me.data();
        me.twbsPagination({
            totalPages: Math.ceil(params.total / params.length),
            visiblePages: 7,
            href: $('link[rel="canonical"]').attr('href') + '?page={{number}}'
        });
    }, 'init');

    gee.hook("convertCode", function (me){
        var json = $('#json_str').val();
        var ta = '{{for rows}}'+ $('#ta').val() +'{{/for}}';
        var rows = JSON.parse(json);
        var sql = $('#sql_str').val();
        var tmpl = $.templates(ta);

        if (!Array.isArray(rows)) {
            var tmp = [];
            tmp.push(rows);
            rows = tmp;
        }

        var helper = {
            intval: function(val) { return val*1; }
        };

        $.views.helpers(helper);

        sql = sql + tmpl.render({rows: rows});

        $('#sql_str').val(sql);
    });

    gee.hook("getData", function (me){
        var uri = $('#json_uri').val();

        $.getJSON(uri, {
            format: "jsonp"
        }).done(function(json) {
            gee.clog(json);
            $('#json_str').val(JSON.stringify(json));
        }).fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });
    });

}(app, gee, jQuery));
