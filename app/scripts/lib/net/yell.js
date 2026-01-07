const createNet = ({ app, gee }) => {
    const redirect = (state) => {
        if (!app.route) {
            window.location.hash = state.path;
        } else {
            window.history.pushState(state, '', state.path);
        }
    };

    const waitFor = (condition, limit) => {
        var times = 0;
        var during = 70;
        var max = limit || 9;

        return new Promise(function (resolve, reject) {
            if (Number(condition) === condition) {
                setTimeout(resolve, condition * 1000);
                return;
            }

            var timer = setInterval(function () {
                times++;
                try {
                    if (typeof condition === 'function' && condition()) {
                        clearInterval(timer);
                        resolve();
                    } else if (times > max) {
                        clearInterval(timer);
                        reject(new Error('waitFor timeout'));
                    }
                } catch (err) {
                    clearInterval(timer);
                    reject(err);
                }
            }, during);
        });
    };

    const race = (condition, min, max) => {
        var times = 0;
        var during = 70;
        var minTimes = min || 9;
        var maxTimes = max || 18;

        return new Promise(function (resolve) {
            var timer = setInterval(function () {
                times++;
                if ((typeof condition === 'function' && condition(times) && times > minTimes) || times > maxTimes) {
                    clearInterval(timer);
                    resolve();
                }
            }, during);
        });
    };

    let previewApi;

    const getPreview = () => {
        if (previewApi !== undefined) return previewApi;
        try {
            previewApi = app.get('data.preview');
        } catch (err) {
            previewApi = null;
        }
        return previewApi;
    };

    const yell = async (url, data, callback, type) => {
        var cb = (typeof callback === 'function') ? callback : function () {};
        var method = type || 'POST';
        var shouldMock = (typeof app.isDev === 'function' && app.isDev() && app.onPreview === 1);

        if (shouldMock) {
            var preview = getPreview();
            if (preview && typeof preview.mock === 'function') {
                try {
                    const res = await preview.mock(url, data);
                    cb.call(res);
                    return res;
                } catch (err) {
                    console.warn('[yell] preview mock failed, fallback to gee.yell', err);
                }
            }
        }

        gee.yell(url, data, cb, cb, method);
        return null;
    };

    const setCookie = (key, val, days) => {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = key + '=' + (val || '') + expires + '; path=/';
    };

    const getCookie = (key) => {
        var nameEQ = key + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    const log = (module, txt) => {
        if (!gee || !gee.isset) {
            console.log(module + '::' + JSON.stringify(txt));
            return;
        }
        if (
            app.tracking === module ||
            !gee.isset(app.tracking) ||
            module === '' ||
            module === 'all'
        ) {
            gee.clog(module + '::' + JSON.stringify(txt));
        }
    };

    return {
        yell,
        redirect,
        waitFor,
        race,
        log,
        setCookie,
        getCookie,
    };
};

export { createNet };
