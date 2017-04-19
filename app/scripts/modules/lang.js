;(function(app, gee, $){
    'use strict';

   var cfg = {
        tw: {
            '唐': '唐',
            '宋': '宋',
            '元': '元',
            '明': '明',
            '清': '清',
            '請將行動裝置轉為直向': '請將行動裝置轉為直向',
            '畫家關係圖': '畫家關係圖',
            '了解畫家間的關係與流派影響': '了解畫家間的關係與流派影響',
            '加入書籤': '加入書籤',
            '繪畫簡史': '繪畫簡史',
            '延伸閱讀': '延伸閱讀',
            '師徒': '師徒',
            '父子': '父子',
            '影響': ''
        },
        en: {
            '唐': 'Tang',
            '宋': 'Song',
            '元': 'Yuan',
            '明': 'Ming',
            '清': 'Qing',
            '請將行動裝置轉為直向': 'Please rotate your device',
            '畫家關係圖': 'Association with the painters',
            '了解畫家間的關係與流派影響': 'Understand the associations between the painters and how they are influenced by the different schools of Art',
            '加入書籤': 'Add to bookmark',
            '繪畫簡史': 'Intro',
            '延伸閱讀': 'Extended reading',
            '師徒': 'Master & Disciple',
            '父子': 'Father & Son',
            '影響': ''
        }
    };

    app.lang = {
        default: 'tw',
        cu: 'tw',
        opt: [
            {k: 'tw', v: '中'},
            {k: 'en', v: 'EN'}
        ],
        init: function() {
            app.lang.cu = ( ($('#lang').val()) ? $('#lang').val() : ( getCookie('cuLang') === null ? app.lang.default : getCookie('cuLang') ) );
            app.lang.set(app.lang.cu);
            app.body.addClass(app.lang.cu);

            var root = document.documentElement;
            root.setAttribute('class', app.lang.cu);
        },
        set: function(lang) {
            var p = 0;
            $.each(app.lang.opt, function(idx, row){
                if (row.k === lang) {
                    p = idx;
                }
            });
            app.lang.point(p);
        },
        next: function() {
            var p = 0;
            $.each(app.lang.opt, function(idx, row){
                if (row.k === app.lang.cu) {
                    p = idx + 1;
                    if (p >= app.lang.opt.length ) {
                        p = 0;
                    }
                }
            });
            app.lang.point(p);
        },
        point: function (idx) {
            app.lang.cu = app.lang.opt[idx].k;
            $('body').removeClass('tw en').addClass(app.lang.cu);

            var root = document.documentElement;
            root.setAttribute('class', app.lang.cu);

            setCookie('cuLang', app.lang.cu, 7);

            $('.lang-text').text(app.lang.opt[idx].v);
        },
        get: function (idx) {
            return (cfg[app.lang.cu][idx]) ? cfg[app.lang.cu][idx] : idx;
        },
        switch: function() {
            $('[lang-key]').each(function(){
                var ta = $(this);
                var key = ta.attr('lang-key');
                var gotit = 0;
                $.each(cfg[app.lang.cu], function(idx, val){
                    if (idx === key) {
                        ta.text(val);
                        gotit = 1;
                    }
                });
                if (gotit === 0) {
                    ta.text(key);
                }
            });
        }
    };

    // change lang
    gee.hook('nextLang', function(me){
        app.lang.next();
    });

    // change lang & redirect
    gee.hook('switchI18n', function (me) {
        var uUri = $('link[rel="canonical"]').attr('href');
        var nUri = '';
        var old = app.lang.cu;

        app.lang.cu = me.data('ta');
        setCookie('cuLang', app.lang.cu, 7);

        nUri = uUri.replace('/'+ old, '/'+ app.lang.cu);

        if (nUri === uUri) {
            if (nUri.indexOf('/'+ app.lang.cu) == -1) {
                if(nUri.substr(-1) === '/') {
                    nUri = nUri.substr(0, nUri.length - 1);
                }
                nUri = nUri + '/'+ app.lang.cu;
            }
        }

        location.href = nUri;
    });

}(app, gee, jQuery));
