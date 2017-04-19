;(function(app, gee, $){
    'use strict';

    app.editor = {
        init: function() {
            $('.froalaEditor').froalaEditor({
                key: 'mrumF-11eyF4H-7od1==',
                placeholderText: '開始打字吧~~~~~~',
                toolbarInline: true,
                toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'indent', 'outdent', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'insertLink', 'undo', 'redo'],
                quickInsertButtons: ['image', 'table', 'ul', 'ol', 'hr'],
                toolbarButtonsXS: null,
                toolbarButtonsSM: null,
                toolbarButtonsMD: null
            });

            $( '.datepicker' ).datepicker({dateFormat:'yy-mm-dd'});
        }
    };

    gee.hook('initEditor', function(me){
        app.editor.init();
    }, 'init');

}(app, gee, jQuery));
