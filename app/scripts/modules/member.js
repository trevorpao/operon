;(function(app, gee, $){
    'use strict';

    app.member = {
        current: {},
        errMsg: {
            'e8200': '驗證碼錯誤',
            'e8202': 'Email格式錯誤',
            'e8203': '此帳號已有人使用',
            'e8204': '原密碼輸入錯誤',
            'e8205': '密碼須為 6~32 英文數字組合',
            'e8206': '確認密碼與密碼不相同',
            'e7100': '帳號不存在',
            'e7104': '帳號或密碼錯誤',
            'e6100': '尚未登入',
            'e6101': '已登入',
            'e6102': '電子郵件已驗證',
            'e6103': '電子郵件未驗證',
            'e6104': '需要登入後才可使用'
        },
        init: function() {
            app.member.status();
        },
        status: function() {
            var callback = function() {
                if (this.code !== '1') {
                    app.stdErr(this);
                }
                else {
                    if (this.data.isLogin) {
                        gee.clog('Logined');
                        app.body.removeClass('logout').addClass('login');
                        app.member.current = this.data.user;
                        app.member.setHtml();
                    }
                    else {
                        gee.clog('Did not login');
                        app.body.removeClass('login').addClass('logout');
                    }

                }
            };

            gee.yell('member/status', {}, callback, callback);
        },

        setHtml: function() {
            $('.my-nickname').text(app.member.current.nickname);
            $('.my-avatar').attr('src', app.member.current.img);
        },

        login: function(data, btn) {
            var callback = function() {
                app.doneBtn(btn);

                if (this.code !== '1') {
                    app.stdErr(this);
                }
                else {
                    app.body.removeClass('logout').addClass('login');

                    if (gee.isset(this.data.msg)) {
                        gee.alert({
                            title: 'Alert!',
                            txt: this.data.msg
                        });
                    }

                    if (gee.isset(this.data.uri)) {
                        location.href = (this.data.uri === '') ? gee.apiUri : this.data.uri;
                    }
                }
            };

            gee.yell('member/login', data, callback, callback);
        },

        register: function(data, btn) {
            var callback = function() {
                btn.removeAttr('disabled').find('i').remove();

                if (this.code == '1') {

                    if (gee.isset(this.data.msg)) {
                        gee.alert({
                            title: 'Alert!',
                            txt: this.data.msg
                        });
                    }

                    if (gee.isset(this.data.uri)) {
                        location.href = (this.data.uri === '') ? gee.apiUri : this.data.uri;
                    }

                    if (gee.isset(this.data.goback)) {
                        history.go(-1);
                    }
                } else {
                    if (gee.isset(this.data) && gee.isset(this.data.msg)) {
                        gee.alert({
                            title: 'Alert!',
                            txt: this.data.msg
                        });
                    } else {
                        gee.alert({
                            title: 'Error!',
                            txt: 'Server Error, Plaese Try Later(' + this.code + ')'
                        });
                    }
                }
            };

            gee.yell('member/add_new', data, callback, callback);
        },

        update: function(data, btn) {
            var callback = function() {
                btn.removeAttr('disabled').find('i').remove();

                if (this.code == '1') {

                    if (gee.isset(this.data.msg)) {
                        gee.alert({
                            title: 'Alert!',
                            txt: this.data.msg
                        });
                    }

                    if (gee.isset(this.data.uri)) {
                        location.href = (this.data.uri === '') ? gee.apiUri : this.data.uri;
                    }

                    if (gee.isset(this.data.goback)) {
                        history.go(-1);
                    }
                } else {
                    if (gee.isset(this.data) && gee.isset(this.data.msg)) {
                        gee.alert({
                            title: 'Alert!',
                            txt: this.data.msg
                        });
                    } else {
                        gee.alert({
                            title: 'Error!',
                            txt: 'Server Error, Plaese Try Later(' + this.code + ')'
                        });
                    }
                }
            };

            gee.yell('member/update', data, callback, callback);
        },

        logout: function() {
            var callback = function() {
                if (this.code !== '1') {
                    app.stdErr(this);
                }
                else {
                    location.href = '/';
                }
            };

            gee.yell('member/logout', {}, callback, callback, 'GET');
        },

        getMinsFromNow: function (mins) {
            return new Date(new Date().valueOf() + mins * 60 * 1000);
        },

        keepMe: function (col) {
            var input = (col && col[0]) ? col[0] : col;
            var form = input ? input.closest('form') : null;
            if (!form) return;

            var acct = form.querySelector('input[name="account"]');
            var pwd = form.querySelector('input[name="passwd"]');

            if (input && input.checked) {
                app.arena.feed.setItem('acct', acct ? acct.value : '').catch( gee.clog );
                app.arena.feed.setItem('passwd', pwd ? pwd.value : '').catch( gee.clog );
            } else {
                app.arena.feed.removeItem('acct', gee.clog);
                app.arena.feed.removeItem('passwd', gee.clog);
            }
        }
    };

    gee.hook('login', function(me){
        var form = me.data('ta') ? document.getElementById(me.data('ta')) : (me.closest('form')[0] || null);
        if (!form) { return false; }

        if (!app.validateForm(form)) {
            return false;
        }

        var keep = form.querySelector('input[name="keep-me"]');
        app.member.keepMe(keep);
        app.progressingBtn(me);
        app.member.login(app.serializeForm(form), me);
    });

    gee.hook('sendPinCode', function(me){
        var f = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form');

        var $clock = $('#clock');

        $clock.countdown(app.member.getMinsFromNow(5), function(event) {
            $(this).html(event.strftime('%M:%S'));
        });
    });

    gee.hook('register', function(me){
        var form = me.data('ta') ? document.getElementById(me.data('ta')) : (me.closest('form')[0] || null);
        if (!form) { return false; }

        form.querySelectorAll('input').forEach(function (input) {
            if (input.value === input.getAttribute('placeholder')) {
                input.value = '';
            }
        });

        var agreed = form.querySelector('input[name="agree"]:checked');
        if (!agreed && !confirm('是否同意會員條款?')) {
            gee.alert({ title: 'Error!', txt: '您尚未同意會員條款' });
            return false;
        }
        if (!agreed) {
            var label = document.querySelector('label[for="agree_cb"]');
            if (label) { label.click(); }
        }

        if (!app.validateForm(form)) {
            return false;
        }

        me[0] ? me[0].setAttribute('disabled', 'disabled') : me.attr('disabled', 'disabled');
        if (me[0]) {
            var icon = document.createElement('i');
            icon.className = 'fa fa-spinner fa-pulse fa-fw';
            me[0].appendChild(icon);
        } else {
            me.append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
        }
        return app.member.register(app.serializeForm(form), me);
    });

    gee.hook('modify', function(me){
        var form = me.data('ta') ? document.getElementById(me.data('ta')) : (me.closest('form')[0] || null);
        if (!form) { return false; }

        form.querySelectorAll('input').forEach(function (input) {
            if (input.value === input.getAttribute('placeholder')) {
                input.value = '';
            }
        });

        if (!app.validateForm(form)) {
            return false;
        }

        var chk = 1;
        var txt = [];
        var pwd = form.querySelector('#pwd');
        var cpwd = form.querySelector('#cpwd');

        if (pwd && pwd.value) {
            if (typeof pwd.isPasswdErr === 'function' && pwd.isPasswdErr()) {
                txt.push('密碼：請確認是否符合 6~12 字英文及數字');
                chk = 0;
            }

            if (cpwd && cpwd.value !== pwd.value) {
                txt.push('密碼與確認密碼不相同');
                chk = 0;
            }
        }

        if (chk === 1) {
            me[0] ? me[0].setAttribute('disabled', 'disabled') : me.attr('disabled', 'disabled');
            if (me[0]) {
                var icon = document.createElement('i');
                icon.className = 'fa fa-spinner';
                me[0].appendChild(icon);
            } else {
                me.append('<i class="fa fa-spinner"></i>');
            }
            return app.member.update(app.serializeForm(form), me);
        }
        else {
            gee.alert({
                title: 'Error!',
                txt: txt.join('\r\n')
            });
        }
    });

    gee.hook('logout', function(me){
        app.member.logout();
    });

}(app, gee, jQuery));
