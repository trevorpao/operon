;(function(app, gee, $){
    "use strict";

    app.upload = {
        showFileName: function(file, box) {
            var reader = new FileReader();

            reader.onload = function(e) {
                box.find('.fuu-input-btn').text('Change');
                box.find('.fuu-clear').show();

                if (box.find('.fuu-filename').is('input')) {
                    box.find('.fuu-filename').val(file.name);
                }
                else {
                    box.find('.fuu-filename').txt(file.name);
                }
            };

            reader.readAsDataURL(file);
        },

        clearFileName: function(box) {
            box.find('.fuu-filename').val('');
            box.find('.fuu-clear').hide();
            box.find('.fuu-input input:file').val('');
            box.find('.fuu-input-btn').text('Browse');
        },

        progress: function(data, fileInput, uri) {
            var callback = function(rtn) {
                if (!rtn.code || rtn.code !== '1') {
                    app.stdErr(rtn);
                }
                else {
                    if (gee.isset(rtn.data.msg)) {
                        gee.alert({
                            title: 'Alert!',
                            txt: rtn.data.msg
                        });
                    }
                }
            };

            var fd = new FormData();
            fd.append('file', fileInput[0].files[0]);

            $.each(data, function(idx, row){
                fd.append(row.name, row.value);
            });

            $.ajax({
                url: gee.apiUri + uri,
                data: fd,
                processData: false,
                contentType: false,
                type: 'POST',
                success: callback
            });
        }
    };

    gee.hook('passFile', function(me){
        var file = me[0].files[0];
        var $box = me.data('ta') ? $('#' + me.data('ta')) : me.closest('.fuu');

        app.upload.showFileName(file, $box);
    });

    gee.hook('clearFile', function (me) {
        var $box = me.data('ta') ? $('#' + me.data('ta')) : me.closest('.fuu');
        app.upload.clearFileName($box);
    });

    gee.hook('upload', function(me){
        var form = me.data('ta') ? $('#' + me.data('ta')) : me.closest('.fuu');
        var fileInput = form.find('input:file');
        var uri = me.data('uri');

        if (fileInput.val() === '') {
            return false;
        }
        else {
            app.upload.progress(form.serializeArray(), fileInput, uri);
        }
    });

}(app, gee, jQuery));
