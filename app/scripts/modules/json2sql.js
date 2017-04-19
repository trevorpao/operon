;(function(app, gee, $){
    'use strict';

    app.json2sql = {
    };

    gee.hook('convertCode', function (me){
        var json = $('#json_str').val();
        var ta = '{{for rows}}'+ $('#ta').val() +'{{/for}}';
        var rows = JSON.parse(json);
        var sql = $('#sql_str').val();
        var tmpl = $.templates(ta);

        if (rows.data) {
            rows = rows.data;
        }

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

    gee.hook('getData', function (me){
        var uri = $('#json_uri').val();

        $.getJSON(uri, {
            format: 'jsonp'
        }).done(function(json) {
            gee.clog(json);
            $('#json_str').val(JSON.stringify(json));
        }).fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ', ' + error;
            console.log('Request Failed: ' + err);
        });
    });

}(app, gee, jQuery));
