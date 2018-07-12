;
(function (app, gee, $) {
    'use strict';

    app.contact = {
        send: function (data, btn) {
            var callback = function () {
                app.doneBtn(btn);

                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    btn.closest('form')[0].reset();
                    app.stdSuccess(this);
                }
            };

            gee.yell('contact/add_new', data, callback, callback);
        }
    };

    gee.hook('contact.submit', function (me) {
        var form = me.closest('form');

         if (!$.validatr.validateForm(form)) {
            return false;
        } else {
            app.progressingBtn(me);

            app.contact.send(form.serialize(), me);
        }
    });

}(app, gee, jQuery));
