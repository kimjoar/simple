//     Simple
//
//     A simplistic MV* JavaScript library.
//     Simple may be freely distributed under the MIT license.

(function(root, $, EventEmitter) {

    // Namespace
    // ---------

    // The top-level namespace. All public Simple classes and modules will be
    // attached to this.
    var Simple = root.Simple = {};

    // Views
    // -----

    // Create a new view
    var View = Simple.View = function(options) {
        this.el = options.el;
        this.delegateEvents();
        this.initialize(options);
    };

    // Attach all inheritable methods to the View prototype.
    $.extend(View.prototype, {

        initialize: function() {},

        // `render` is the core function that a view should override in order to
        // populate it's element. Should always return `this`.
        render: function() {
            return this;
        },

        // jQuery delegate for element lookup, scoped to DOM elements within
        // the current view.
        DOM: function(selector) {
            return this.el.find(selector);
        },

        // Set callbacks, where `this.events` is a hash of
        // `{"event selector": "callback"}`-pairs. For example:
        //
        //     {
        //       'mousedown .title': 'edit',
        //       'click .button':    'save'
        //     }
        //
        // Callbacks will be bound to the view, with `this` set properly.
        // Uses event delegation for efficiency.
        delegateEvents: function() {
            if (!this.events) return;

            for (var key in this.events) {
                var methodName = this.events[key],
                    method = $.proxy(this[methodName], this),
                    match = key.match(/^(\w+)\s+(.*)$/),
                    eventName = match[1],
                    selector  = match[2];

                this.el.on(eventName, selector, method);
            }
        }

    });

    // Models
    // ------

    // Create a new model
    var Model = Simple.Model = function(options) {
        this._events = new EventEmitter();
        this.attributes = {};
        this.initialize(options);
    };

    $.extend(Model.prototype, {

        initialize: function() {},

        // Bind an event to a callback
        //
        // Accepts three arguments, where the third is optional:
        //
        // - `event` is the name of the event to bind
        // - `callback` is the function which is called when the event is triggered
        // - `context` is the scope for the callback, i.e. `this` in the callback (optional)
        on: function(event, callback, context) {
            this._events.addListener(event, callback, context);
        },

        // Unbind an event
        //
        // Accepts two arguments:
        //
        // - `event` is the name of the event to unbind
        // - `callback` is the function which was bound
        off: function(event, callback) {
            this._events.removeListener(event, callback);
        },

        // Trigger an event
        //
        // Accepts one or more arguments:
        //
        // The first argument is the name of the event to trigger, all the
        // following (optional) arguments will be passed to the bound callback.
        //
        // This means that an event that is triggered like this
        //
        //     model.trigger("test", "Kim Joar")
        //
        // ... can receive the second argument if we have bound the event like this:
        //
        //     model.on("test", function(name) {
        //         console.log(name) // "Kim Joar"
        //     });
        //
        trigger: function() {
            this._events.emit.apply(this._events, arguments);
        },

        // Perform an ajax request
        fetch: function() {
            this.trigger('fetch:started');
            var model = this;

            $.ajax({
                url: model.url,
                dataType: "json",
                success: function(data) {
                    for (var prop in data) {
                        model.attr(prop, data[prop]);
                    }
                    model.trigger('fetch:finished');
                },
                error: function(jqXHR, resp) {
                    model.trigger('fetch:error', resp);
                }
            });
        },

        // Set or get an attribute
        attr: function(name, value) {
            if (typeof value === "undefined") {
                return this.attributes[name];
            } else {
                this.attributes[name] = value;
            }
        },

        // Returns a copy of all the attributes
        toJSON: function() {
            return $.extend({}, this.attributes);
        }

    });

    // Set up inheritance for the model and view.
    View.extend = Model.extend = function(properties) {
        var obj = $.extend.call({}, this.prototype, properties);
        return obj.constructor;
    };

})(this, jQuery, EventEmitter);
