;

var gee = gee || $.fn.gene;

(function(gee, $) {
    'use strict';

    var eventProvider = function() {
        var obj = {
            /**
             * Returns the internal subscriber array that can be directly manipulated by
             * adding/removing things.
             *
             * @access private
             * @return {Object}
             */
            subscribers: function() {
                // this odd looking logic is to allow instances to lazily have a map of
                // their events. if subscribers were an object literal itself, we would
                // have issues with instances sharing the subscribers when its being used
                // in a mixin style.
                if (!this._subscribersMap) {
                    this._subscribersMap = {};
                }
                return this._subscribersMap;
            },

            /**
             * Subscribe to a given event name, invoking your callback function whenever
             * the event is fired.
             *
             * @access public
             * @param name {String} Name of the event.
             * @param cb {Function} The handler function.
             */
            subscribe: function(name, cb) {
                var subs = this.subscribers();

                if (!subs[name]) {
                    subs[name] = [cb];
                } else {
                    subs[name].push(cb);
                }
            },

            /**
             * Removes subscribers.
             *
             * @access public
             * @param name {String} Name of the event.
             * @param cb {Function} The handler function.
             */
            unsubscribe: function(name, cb) {
                var subs = this.subscribers()[name];

                $.each(subs, function(key, value) {
                    if (value == cb) {
                        subs[key] = null;
                    }
                });
            },

            /**
             * Repeatedly listen for an event over time. The callback is invoked
             * immediately when monitor is called, and then every time the event
             * fires. The subscription is canceled when the callback returns true.
             *
             * @access private
             * @param {string} name Name of event.
             * @param {function} callback A callback function. Any additional arguments
             * to monitor() will be passed on to the callback. When the callback returns
             * true, the monitoring will cease.
             */
            monitor: function(name, callback) {
                if (!callback()) {
                    var
                        ctx = this,
                        fn = function() {
                            if (callback.apply(callback, arguments)) {
                                ctx.unsubscribe(name, fn);
                            }
                        };

                    this.subscribe(name, fn);
                }
            },

            /**
             * Removes all subscribers for named event.
             *
             * @access private
             * @param name    {String}   name of the event
             */
            clear: function(name) {
                delete this.subscribers()[name];
            },

            /**
             * Fires a named event. The first argument is the name, the rest of the
             * arguments are passed to the subscribers.
             *
             * @access private
             * @param name {String} the event name
             */
            fire: function() {
                var
                    args = Array.prototype.slice.call(arguments),
                    name = args.shift();

                $.each(this.subscribers()[name], function(idx, sub) {
                    // this is because we sometimes null out unsubscribed rather than jiggle
                    // the array
                    if (sub) {
                        sub.apply(this, args);
                    }
                });
            }
        };
        return obj;
    };

    gee.event = new eventProvider();

}(gee, jQuery));
