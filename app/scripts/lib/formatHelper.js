;
(function(gee, app, $) {
    'use strict';

    app.thumbnail = {
        all_thn: [128, 128],
        default_thn: [300, 300],
        press_thn: [400, 225],
        author_thn: [300, 300]
    };

    app.formatHelper = {
        currency: function(val) { return ($.fn.formatMoney((val+''), 0)); },
        sum: function(price, qty) { return app.tmplHelpers.currency(qty*price); },
        loadPic: function(path) { return gee.picUri + path; },
        average: function(sum, divide) { return (divide!='0') ? Math.round(sum*10/divide)/10 : 0; },
        s2m: function (num) {
            var s = num % 60;
            var m = Math.floor(num / 60);

            return (s > 0) ? m +' 分 '+ s +' 秒' : m +' 分';
        },
        beforeDate: function(ts, target) {
            var cu = moment(ts);
            app[target].max_ts = moment.max(app[target].max_ts, cu);
            app[target].min_ts = moment.min(app[target].min_ts, cu);
            return $.timeago(ts);
        },
        showDate: function(status, flow, schedule, createDate, publishDate) {
            var ts = publishDate || createDate;

            return status +' 於 ' + moment(ts).format('MM/DD HH:mm');
        },
        iso8601: function(ts) {
            return moment(ts).toISOString();
        },
        getYear: function(ts) {
            return moment(ts).format('YYYY');
        },
        getMon: function(ts) {
            return moment(ts).format('MMMM');
        },
        getWeek: function(ts) {
            return moment(ts).format('ddd');
        },
        getDay: function(ts) {
            return moment(ts).format('DD');
        },
        getTime: function(ts) {
            return moment(ts).format('HH:mm');
        },
        formatDate: function (str, format) {
            str = (str) ? moment(str, 'YYYY-MM-DD HH:mm:ss') : moment();

            if (str.isValid()) {
                return str.format(format);
            } else {
                return moment().format(format);
            }
        },
        during: function (ts1, ts2) {
            ts1 = moment(ts1, 'YYYY-MM-DD HH:mm:ss');
            ts2 = moment(ts2, 'YYYY-MM-DD HH:mm:ss');
            var diff = ts1.diff(ts2, 'days');
            var str = '';

            gee.clog('diff::'+ diff);

            if (diff != 0) {
                str = ts1.format('YY.MM.DD') + ts2.format(' ~ YY.MM.DD');
            } else {
                str = ts1.format('YY.MM.DD HH:mm') + ts2.format(' ~ HH:mm');
            }

            return str;
        },
        genderedHonorific: function(gender) {
            return (gender === 'f') ? '女士' : '先生';
        },
        linkAPI: function(str) {
            return gee.mainUri + str;
        },
        percent: function(num) {
            return Math.ceil(num*100);
        },
        calPercent: function(num, divide, decimals) {
            decimals = decimals || 0;
            var base = Math.pow(10, decimals);
            return Math.ceil(num*100*base/divide) / base;
        },
        nl2br: function(str) {
            var breakTag = '<br />';
            return (str + '')
                .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        },
        indent: function(str) {
            return '<p class="text-indent-c">' + (str.split(/\r?\n/)).join('</p> <p class="text-indent-c">') + '</p>';
        },
        strong: function(str) {
            return (str + '').replace(/\[b\]/g, '<strong>').replace(/\[\/b\]/g, '</strong>');
        },
        getGravatar: function (email, size, type) {
            size = size || 80;
            return ((type !== 'cat') ? '//www.gravatar.com/avatar/' + app.MD5(email) + '.jpg?s=' : '//robohash.org/' + app.MD5(email) + '?set=set4&s=') + size;
        },
        repathImg: function (str) {
            return ((str.indexOf('/upload') == 0) ? gee.picUri : '')+ str ;
        },
        thumbnail: function (str, type) {
            var newpath = '';
            var tmp = str.split('.');

            if (type == 'sm') {
                newpath = tmp[0] + '_sm.' + tmp[1];
            } else {
                if (app.thumbnail[type + '_thn']) {
                    newpath = tmp[0] + '_' + app.thumbnail[type + '_thn'][0] + 'x' + app.thumbnail[type + '_thn'][1] + '.' + tmp[1];
                } else {
                    newpath = str;
                }
            }

            newpath = ((newpath.indexOf('/upload') == 0) ? gee.picUri : '')+ newpath;

            return newpath;
        },
    };

    $.views.settings.delimiters('<%', '%>');
    $.views.helpers(app.formatHelper);

    $.views.converters('nl2br', app.formatHelper.nl2br);

}(gee, app, jQuery));
