;(function(app, gee, $){
    'use strict';

    app.fullcalendar = {
        monthEvt: [],
        cuEvt: [],

        addCuEvt: (raw, target) => {
            target = target ? moment(target) : moment();

            if( target.startOf('day').diff(moment(raw.start)) <= 0 && target.endOf('day').diff(raw.end) >= 0 ){
                app.fullcalendar.cuEvt.push(raw);
            }
        },

        refreshSidePanel: (target) => {
            app.fullcalendar.cuEvt = [];
            app.fullcalendar.monthEvt.forEach( e => {
                app.fullcalendar.addCuEvt(e, target);
            });
            app.fullcalendar.renderList(app.fullcalendar.cuEvt, target);
        },

        defaultCallback: (rtn) => {
            if (rtn.code !== 1) {
                app.stdErr(rtn);
                if(app.fullcalendar.fakeevents){
                    app.fullcalendar.fakeevents.forEach( e => {
                        gee.clog('ready to render fakeevents', e);
                        $('#how_fullCalendar').fullCalendar('renderEvent', e);
                        app.fullcalendar.addTodayEvt(e);
                    });
                }
            }
            else {
                if (gee.isset(rtn.data)) {
                    rtn.data.forEach( e => {
                        $('#how_fullCalendar').fullCalendar('renderEvent', e);
                        app.fullcalendar.addCuEvt(e);
                        app.fullcalendar.monthEvt.push(e);
                    });
                    gee.clog( app.fullcalendar.monthEvt);
                    // TODO: render schedule-list
                    app.fullcalendar.renderList(app.fullcalendar.cuEvt);
                }
            }
        },

        init: (me) => {
            $('#how_fullCalendar').fullCalendar({
                // themeSystem: 'bootstrap3',
                displayEventTime: false,
                header: {
                    left: 'prev,',
                    center: 'title',
                    right: 'next',
                },
                views: {
                    month: {
                        titleFormat: 'YYYY 年 MM 月',
                    }
                },
                dayClick: function(date, jsEvent, view) {
                    gee.clog(' dayclick get date : ', date.format('YYYY-MM-DD HH:mm:ss ZZ'));
                    // app.fullcalendar.refreshSidePanel(date);
                },
                eventSources: [
                    {
                        url: gee.apiUri + 'schedule/lots',  // TODO: replace API path
                        type: 'GET',
                        success: app.fullcalendar.defaultCallback,
                        error: app.fullcalendar.defaultCallback
                    }
                ],
                eventClick: function(event) {
                    app.fullcalendar.refreshSidePanel(event.start);
                }
            });
        },

        fakeevents: [],

        renderList: function (data, target) {
            target = target ? moment(target) : moment();
            $('#simple-schedule-list').html(
                app.tmplStores['schedule-list'].render({data: data, today: target.format('YYYY月MM月DD日')}));
        }
    };

    gee.hook('calendar/init', function(me){
        if(!$.fn.fullCalendar){
            gee.clog('fullcalendar: fullcalendar plugin is missing.');
            return true;
        }
        app.fullcalendar.init();
    });

})(app, gee, jQuery);
