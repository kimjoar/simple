//     Simple
//
//     A simplistic MV* JavaScript library.
//     Simple may be freely distributed under the MIT license.
//
//  The primary function of *Simple* is to create simple abstractions for
//  models and views. The primary goal is to create a an easily understandable
//  MV* JavaScript library which, happily, ignore a lot of real-world problems
//  in order to focus on simplicity and learnability.
//
//  When you understand this, go enjoy [Backbone.js](http://backbonejs.org/),
//  [Spine.js](http://spinejs.com/) or some other library which is far more
//  suited for real-world JavaScript applications.

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

        // **View rendering**
        //
        // `render` is the core function that a view should override in order to
        // populate it's element. Should always return `this`.
        render: function() {
            return this;
        },

        // **DOM lookup**
        //
        // jQuery delegate for element lookup, scoped to DOM elements within
        // the current view.
        DOM: function(selector) {
            return this.el.find(selector);
        },

        // **Event delegation**
        //
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

    // Attach all inheritable methods to the Model prototype.
    $.extend(Model.prototype, {

        initialize: function() {},

        // **Bind an event to a callback**
        //
        // - `event` is the name of the event to bind
        // - `callback` is the function which is called when the event is triggered
        // - `context` (optional) is the scope for the callback, i.e. `this` in the callback
        on: function(event, callback, context) {
            this._events.addListener(event, callback, context);
        },

        // **Unbind an event**
        //
        // - `event` is the name of the event to unbind
        // - `callback` is the function which was bound
        off: function(event, callback) {
            this._events.removeListener(event, callback);
        },

        // **Trigger an event**
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

        // **Perform an Ajax GET request**
        //
        // Will trigger the event `fetch:started` when starting, and
        // `fetch:finished` on success or `fetch:error` if the Ajax request
        // fails.
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

        // **Attributes**
        //
        // Set or get an attribute
        attr: function(name, value) {
            if (typeof value === "undefined") {
                return this.attributes[name];
            } else {
                this.attributes[name] = value;
            }
        },

        // Return a copy of all the attributes
        toJSON: function() {
            return $.extend({}, this.attributes);
        }

    });

    // Inheritance
    // -----------
    //
    // Set up inheritance for the model and view.
    View.extend = Model.extend = function(properties) {
        var obj = $.extend.call({}, this.prototype, properties);
        return obj.constructor;
    };

})(this, jQuery, EventEmitter);
