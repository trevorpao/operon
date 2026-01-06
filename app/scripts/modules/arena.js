;(function(app, gee, $){
    'use strict';

    // register a module name
    app.arena = {
        cuModal: null,
        feed: null,
        lastScroll: 0,
        fontSizeRatio: 1,
        lineHeightRatio: 1.6,
        fontSizeTarget: [
            '.fr-view',
            '.article-header>h1',
            '.article-header>h2',
            '.article-intro',
        ],
        fontSizeUnit: 'px',
        init: function () {
            // app.arena.initSlider($('#slider-range1'));
            app.arena.handler();

            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                app.win.bind('touchend touchcancel touchleave', function (e) {
                    app.arena.handler();
                });
            } else {
                app.win.on('scroll', _.throttle(function () {
                    app.arena.handler();
                }, 180));
            }

            localforage.ready().then(function() {
                app.arena.feed = localforage.createInstance({
                    name: 'arenaBase',
                    version: 1
                });
                gee.clog('-------------------------- localforage start -----------------------------');
                app.arena.initFontSize();

                gee.event.fire('app.arenaBaseReady', {});
            }).catch(function (e) {
                gee.clog(e);
                app.track.send('failure', 'init_localforage', JSON.stringify(e));
            });
        },

        adjustAjax: function() {

            $.ajaxSetup({
                // async: false,
                contentType: 'application/x-www-form-urlencoded',
                xhrFields: {
                    withCredentials: true
                },
                headers: {
                    'Mobile-Token': 'KNN5364HAGX8GHGD6YNTH4MKD7J9G5AA'
                }
            });
        },

        initFontSize: function () {
            app.arena.feed.getItem('fontSize', function (err, val) {
                if (err) {
                    gee.clog('---------------------- localforage err -------------------------');
                    gee.clog(err);
                    app.track.send(
                        'load_localforage',
                        'failure',
                        JSON.stringify(err)
                    );
                }

                let cufontSizeRatio = val ? val * 1 : app.arena.fontSizeRatio;

                if (app.arena.fontSizeRatio !== cufontSizeRatio) {
                    app.arena.fontSizeRatio = cufontSizeRatio;
                    app.arena.deployFontSize(cufontSizeRatio);
                }
            });
        },
        deployFontSize: function (fontSizeRatio) {
            app.arena.fontSizeTarget.forEach((target) => {
                $(target).attr('style', '');
                let elFontSize = $(target).css('fontSize');

                if (elFontSize) {
                    elFontSize = Number(
                        elFontSize.replace(app.arena.fontSizeUnit, '')
                    );
                    $(target)
                        .css(
                            'fontSize',
                            elFontSize * fontSizeRatio + app.arena.fontSizeUnit
                        )
                        .css(
                            'lineHeight',
                            elFontSize *
                                fontSizeRatio *
                                app.arena.lineHeightRatio +
                                app.arena.fontSizeUnit
                        );
                }
            });

            app.track.send('customer', 'fontSize', app.arena.fontSizeRatio);
        },

        handler: function () {
            let winSky = app.win.scrollTop();
            let winBtm = winSky + app.win.height();
            // let eyeH = (winBtm/3 + winSky*2/3);

            if (winSky > 300) {
                $('.goTop').show();
            } else {
                $('.goTop').hide();
            }

            if (app.player && app.player.deepSensor.length > 0) {
                let docuH = $('#app').height();
                let pos = Math.ceil((winBtm / docuH)*100);
                pos = Math.floor(pos / 25) * 25; // 0, 25, 50, 75

                if ((winSky - app.arena.lastScroll) > 0 && pos != 0) {
                    let idx = app.player.deepSensor.indexOf(pos);

                    if (idx != -1) { // only the first rearch
                        app.player.deepSensor.splice(idx, 1);
                        // send finished api
                        gee.yell('footprint/finished', {pos: pos});
                    }
                }
            }

            app.arena.lastScroll = winSky;
        },
        hideModal: function () {
            if (app.arena.cuModal !== null) {
                app.arena.cuModal
                    // .removeClass('is-active')
                    .find('.modal-content')
                    .removeClass('modal-lg modal-nor modal-sm');
                app.arena.cuModal.modal('hide');
            }
        },
        showModal: function (ta, html) {
            html = (html) ? html : '';
            app.arena.cuModal = $('#'+ ta);
            var modalBody = app.arena.cuModal.find('.modal-body');

            app.arena.cuModal.unbind()
                .on('show.bs.modal', function () {
                    gee.clog('show.bs.modal');
                    if (html !== '') {
                        modalBody.html(html);
                    }
                })
                .on('hidden.bs.modal', function () {
                    gee.clog('hidden.bs.modal');
                    modalBody.html('');
                    app.arena.cuModal = null;
                })
                .modal('show');
        },

        loadZip: function ($elem, county) {
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    if (this.data.length) {
                        $elem.html(app.arena.zipOptTmpl.render({ placeholder: '請選擇地區*', opt: this.data }));
                    }
                }
            };

            gee.yell('option/zipcodes', {county: county}, callback, callback);

            return app.cart;
        },

        countdown: function(num, callback) {
            let slabel = document.getElementById('j-countdown-seconds');
            let countDown = new Date().getTime();
            countDown += num * 1000;
            app.site.cd = setInterval(function() {
                let now = new Date().getTime();
                let s = countDown - now;
                if (slabel !== null) {
                    slabel.innerText = Math.floor(s / 1000);
                }
                if (s < 1) {
                    clearInterval(app.site.cd);
                    callback();
                }
            }, 100);
        },

        copyStr: function (str, btn) {
            navigator.clipboard.writeText(str).then(() => {
                btn.addClass('copied');
            }, () => {
            });
        },

        showMsg: function(type) {
            $('#main-box').addClass('no-scroll');
            $('#j-'+ type +'-msg').addClass('block');
        },
    };

    app.arena.defaultOptTmpl = $.templates('<option disabled value=""> <%:placeholder%> </option> <%props opt%><option value="<%:prop.id%>"><%:prop.title%></option> <%/props%> ');

    app.arena.zipOptTmpl = $.templates('<option disabled value=""> <%:placeholder%> </option> <%props opt%><option value="<%:prop.zipcode%>"> <%:prop.town%>(<%:prop.zipcode%>) </option> <%/props%> ');

    gee.hook('reXPos', function(me) {
        var left = me.data('left')*1;
        var x = me.data('x')*1;
        var w = app.body.width();

        if (w > 1000) {
            left = 0;
        }
        else {
            left = (app.body.width() * x + left);
        }

        me.css({
            left: left + 'px'
        });

    }, 'init');

    // hook some handler
    gee.hook('arena.modal.iframe', function(me){
        app.arena.showModal('arena-modal', '<iframe src="'+ me.data('src') +'" frameborder="0"></iframe>');
    });

    gee.hook('loadMain', function(me) {
        var src = me.data('src');
        var ta = me.data('ta') || 'main-box';

        if (ta != 'main-box') {
            app.body.alterClass('open-*', 'open-' + ta);

            app.site.registerBack(function(args) {
                app.body.removeClass('open-'+ ta);
            });
        }

        app.loadHtml(src, ta, 1);

        $('html, body').scrollTop(0);
    });

    gee.hook('replaceMe', function(me) {
        var src = me.data('src');
        var newPath = '/'+ src;

        $.get(app.tmplPath + newPath +'.html?var=' + app.tmplVersion, function(html) {
            me.replaceWith(html);
            gee.init();
        });
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

    gee.hook('hideModal', function (me) {
        app.arena.hideModal();
    });

    gee.hook('hideMsg', function (me) {
        $('.modal').removeClass('block');
        $('#main-box').removeClass('no-scroll');
    });

    gee.hook('loadZip', function(me) {
        app.arena.loadZip($('#'+ me.data('ta')), me.val());
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

    gee.hook('adjustFontSize', function (me) {
        app.arena.fontSizeRatio = app.arena.fontSizeRatio + 0.15;

        if (app.arena.fontSizeRatio > 1.3) {
            app.arena.fontSizeRatio = 1;
        }

        app.arena.deployFontSize(app.arena.fontSizeRatio);
        app.arena.feed
            .setItem('fontSize', app.arena.fontSizeRatio)
            .catch(gee.clog);
    });

    gee.hook('initAutolink', function(me) {
        var html = Autolinker.link(me.html(), {
            stripPrefix: false,
            truncate: { length: 32, location: 'middle' }
        });

        me.html(html);
    }, 'init');

    gee.hook('initPagination', function(me) {
        var params = me.data();
        me.twbsPagination({
            totalPages: Math.ceil(params.total / params.length),
            visiblePages: 7,
            href: $('link[rel="canonical"]').attr('href') + '?page={{number}}'
        });
    }, 'init');

    gee.hook('initTmpl', function (me) {
        gee.clog('enter into iitTmpl method in arena.js++++++', me);

        app.loadTmpl(me.data('tmpl'), me);
    });

    gee.hook('switchTab', function (me) {
        var box = $(me.data('ta'));
        var state = me.data('state');
        var back = me.data('back') || 'welcome';

        me.addClass('active').closest('.j-tabs').find('.active').removeClass('active');
        box.alterClass('js-state-*', 'js-state-'+ state);

        if (back) {
            app.site.registerBack(function(args) {
                box.alterClass('js-state-*', 'js-state-'+ back);
            });
        }
    });

    gee.hook('react', function(me) {
        var ta = $(me.event.target);

        if (!ta.attr('func')) {
            ta = ta.closest('[func]');
        }

        var func = ta.attr('func');
        var type = ta.data('event') || 'click';

        gee.clog(func);

        if (type === me.event.type && gee.check(func)) {
            ta.event = me.event;
            gee.exe(func, ta);
        }
    });

    gee.hook('reactSubmit', function (me) {
        var code = me.event.keyCode || me.event.which;
        var func = me.attr('func');
        if (code === 13 && !me.event.shiftKey && func !== '' && gee.check(func)) {
            var form = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form');
            if (func === 'stdSubmit') {
                me = form.find('[data-gene="click:stdSubmit"]');
            }

            if (func === 'login') {
                me = form.find('[data-gene="click:login"]');
            }

            gee.exe(func, me);
        }
    });

    gee.hook('readySubmit', function(me){
        var form = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form');
        var ta = $(me.event.target);

        if ($.validatr.chkElement(ta)) {
            ta.closest('.input-group.has-error').removeClass('has-error');
        }

        if (!(app.formFilled(form) > 0)) {
            form.find('button.btn-submit').alterClass('btn-disabled', 'btn-primary');
        } else {
            form.find('button.btn-submit').alterClass('btn-primary', 'btn-disabled');
        }
    });

    gee.hook('switchPasswd', function (me) {
        let input = me.closest('.passwd-group').find('.field-passwd').get(0);
        if (input.type === 'password') {
            me[0].checked = true;
            input.type = 'text';
        } else {
            me[0].checked = false;
            input.type = 'password';
        }
    });

    gee.hook('nextstep', function (me) {
        let [form, btn] = app.detectForm((me.data('ta') ? $('#' + me.data('ta')) : me.closest('form')));
        let step = me.attr('step');
        let tmp = step.split('.');
        let box = me.closest('.step-box');

        if (app[tmp[0]] && app[tmp[0]][tmp[1]]) {
            app.progressingBtn(btn);
            app[tmp[0]][tmp[1]](form, me, function () {
                app.doneBtn(btn);
                box.alterClass('on-step-*', 'on-step-'+ me.data('num'));
            });
        } else {
            gee.alert({ title: 'Alert!', txt: 'No such step!!' });
        }
    });

    gee.hook('backstep', function (me) {
        var box = me.closest('.step-box');

        box.alterClass('on-step-*', 'on-step-'+ me.data('num'));
    });

    gee.hook('nxtCol', function (me){
        var code = me.event.keyCode || me.event.which;
        let $ta = $(me.data('ta'));
        let v = me.val();

        if( v.length == me.attr('maxlength')){
            if ($ta.length) {
                $ta.focus().select();
            } else {
                if (me.next('input').length > 0) {
                    me.next('input').focus().select();
                } else {
                    gee.readySubmit(me);

                    if (code === 13 && !me.event.shiftKey) {
                        me.closest('form').find('button.btn-submit').trigger('click');
                    }
                }
            }
        }
    }, 'keyup');

    gee.hook('arena/copy', function (me) {
        let txt = $('#' + me.data('ta')).val();
        app.arena.copyStr(txt, me);

        if (!_.isEmpty(me.data('txt'))) {
            alert(me.data('txt') +': '+ txt);
        }
    });

    gee.hook('arena/toggleCls', function (me) {
        let target = $('#'+ me.data('target'));
        let cls = me.data('cls') || 'active';

        target.toggleClass(cls);
        me.toggleClass('opened');

        let isOpen = me.hasClass('opened');
        let labelText = me.data('label') || '內容';

        me.attr('aria-expanded', isOpen);
        me.attr('aria-label', (isOpen ? '關閉' : '展開') + labelText);

        // TO DO language switch
    });

    gee.hook('calDateLimit', function(me) {
        let min = me.data('min');
        let max = me.data('max');

        if (max) {
            me.attr('max', moment().add(max, 'days').format('YYYY-MM-DD'));
        }

        if (min) {
            me.attr('min', moment().subtract(min, 'days').format('YYYY-MM-DD'));
        }
    });

    gee.hook('arena/openNav', function (me) {
        let target = $('#'+ me.data('ta'));
        target.css('height', '100%');
    });

    gee.hook('arena/closeNav', function (me) {
        let target = $('#'+ me.data('ta'));
        target.css('height', '0%');
    });

    gee.hook('arena/openModal', function (me) {
        let target = $('#'+ me.data('ta'));
        target.removeClass('hide').removeAttr('hidden').attr('aria-hidden', 'false');
    });

    gee.hook('arena/openYTModal', function (me) {
        let target = $('#'+ me.data('ta'));
        target.find('iframe').attr('src', 'https://www.youtube.com/embed/'+ me.data('youtubeid') +'?autoplay=1').end()
            .removeClass('hide').removeAttr('hidden').attr('aria-hidden', 'false');
    });

    gee.hook('arena/closeModal', function (me) {
        let target = $('#'+ me.data('ta'));
        target.addClass('hide').attr('hidden', 'true').attr('aria-hidden', 'true');
    });

    gee.hook('arena/closeYTModal', function (me) {
        let target = $('#'+ me.data('ta'));
        target.find('iframe').attr('src', '_blank').end()
            .addClass('hide').attr('hidden', 'true').attr('aria-hidden', 'true');
    });

    gee.hook('arena/setCookiePrivacy', function (me) {
        app.setCookie('cookie_privacy', 1, 400);
        $('#privacy-banner').addClass('hide');
    });


}(app, gee, jQuery));
