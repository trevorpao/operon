/**
 * There is some code that needs to be placed before </head>
 */

var ieDetect = (function () {
    'use strict';

    var ret = {};
    var isTheBrowser = false;
    var actualVersion = 0;
    var jscriptMap = {
        '5.5': '5.5',
        '5.6': '6',
        '5.7': '7',
        '5.8': '8',
        '9': '9',
        '10': '10'
    };
    var jscriptVersion = (function () {
        /*@cc_on return @_jscript_version; @*/
        return undefined;
    })();
    // var jscriptVersion = new Function('/*@cc_on return @_jscript_version; @*/')();

    if (jscriptVersion !== undefined) {
        isTheBrowser = true;
        actualVersion = jscriptMap[jscriptVersion];
    }

    ret = {
        isTheBrowser: isTheBrowser,
        actualVersion: actualVersion
    };

    return ret;
}());

if (ieDetect.isTheBrowser) {
    alert('Sorry! This page doesn\'t support Internet Explorer');
}

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', window.gaMeasurementID, {
    send_page_view: false
});
