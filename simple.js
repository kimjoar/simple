//     Simple
//
//     A simplistic MV* JavaScript library.
//     Simple may be freely distributed under the MIT license.
//
//     Created by Kim Joar Bekkelund <mail@kimjoar.net>
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

    // Events
    // ------

    // A module that can be *mixed in* to *any* object in order to provide it with
    // custom events. You may bind events with with `on`, unbind with `off`, and
    // fire all event callbacks in successtion with `trigger`:
    //
    //     var object = {};
    //     $.extend(object, Simple.Events);
    //     object.on('test', function(){ console.log("testing!"); });
    //     object.trigger('test');
    //     object.off('test');
    //
    var Events = {
        // **Bind an event to a callback**
        //
        // - `event` is the name of the event to bind
        // - `callback` is the function which is called when the event is triggered
        // - `context` (optional) is the scope for the callback, i.e. `this` in the callback
        on: function(event, callback, context) {
            this._events().addListener(event, callback, context);
        },

        // **Unbind an event**
        //
        // - `event` is the name of the event to unbind
        // - `callback` (optional) is the function which was bound
        // - `context` (optional) is the scope the event must have to be removed
        off: function(event, callback, context) {
            if (typeof callback === "undefined") {
                this._events().removeAllListeners(event);
            } else {
                this._events().removeListener(event, callback, context);
            }
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
        //       console.log(name) // "Kim Joar"
        //     });
        //
        trigger: function() {
            var events = this._events();
            events.emit.apply(events, arguments);
        },

        // Helper to create an EventEmitter, which is the library used for events.
        _events: function() {
            if (!this.eventEmitter) this.eventEmitter = new EventEmitter();
            return this.eventEmitter;
        }
    };

    // **Add events to Simple namespace**
    //
    // We can now bind events with
    //
    //     Simple.events.on(...)
    //
    // unbind events with
    //
    //     Simple.events.off(...)
    //
    // and trigger events with
    //
    //     Simple.events.trigger(...)
    Simple.events = $.extend({}, Events);

    // Views
    // -----

    // Create a new view
    var View = Simple.View = function(options) {
        this.el = options.el;

        // All events specified in the `events` hash will be delegated when the
        // view is initialized.
        this.delegateEvents();

        // On initialization the input is passed through to the `initialize`
        // method, which can be overriden when creating new views.
        this.initialize(options);
    };

    // Attach all inheritable methods to the View prototype.
    $.extend(View.prototype, {

        // no-op initialize
        initialize: function() {},

        // **View rendering**
        //
        // `render` is the core function that a view should override in order to
        // populate the HTML element it owns.
        //
        // A simple example of an overridden render when using
        // [Mustache](http://mustache.github.com/):
        //
        //     render: function() {
        //       var template = "<h1>Hi {{name}}</h1>";
        //       var data = {
        //         name: "Kim Joar"
        //       };
        //
        //       this.el.html(Mustache.to_html(template, data));
        //     }
        //
        render: function() {},

        // **DOM lookup**
        //
        // jQuery delegate for element lookup, scoped to DOM elements within
        // the current view.
        DOM: function(selector) {
            return this.el.find(selector);
        },

        // **Event delegation**
        //
        // Set callbacks, where `this.events` is a hash of<br>
        // `{"event selector": "callback"}`-pairs. For example:
        //
        //     {
        //       'mousedown .title': 'edit',
        //       'click .button':    'save'
        //     }
        //
        // To specify an event directly on `el`, leave the selector blank:
        //
        //     {
        //       'submit': 'save'
        //     }
        //
        // Callbacks will be bound to the view, with `this` set properly.
        // Uses event delegation for efficiency.
        delegateEvents: function() {
            if (!this.events) return;

            for (var key in this.events) {
                var methodName = this.events[key],
                    method = $.proxy(this[methodName], this),
                    match = key.match(/^(\w+)(:?\s+(.*))?$/),
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
        // The model's attributes default to the options specified when
        // initializing a model or an empty hash if none is specified.
        this.attributes = options || {};

        // On initialization the input is passed through to the `initialize`
        // method, which can be overriden when creating new models.
        this.initialize(options);
    };

    // Attach all inheritable methods to the Model prototype.
    //
    // We also attach events which means that we can now bind, unbind and
    // trigger events on a model, e.g.
    //
    //     var model = new Simple.Model();
    //     model.on(...)
    //     model.off(...)
    //     model.trigger(...)
    $.extend(Model.prototype, Events, {

        // no-op initialize
        initialize: function() {},

        // **Perform an Ajax GET request**
        //
        // Will trigger the event `fetch:started` when starting. On success or
        // failure either an event is triggered or a callback is executed if
        // one is passed in the options hash.
        //
        // - Success: The event `fetch:finished` or the `success` callback
        // - Failure: The event `fetch:error` or the `error` callback
        //
        // On success the received properties are always set on the model,
        // regardless of whether event or callback is performed.
        //
        // Example with success callback:
        //
        //     var model = new Simple.Model();
        //     model.fetch({
        //       success: function(data) {
        //         // we have a success
        //       }
        //     });
        fetch: function(options) {
            this._performRequest("fetch", this, options || {}, {});
        },

        // **Perform an Ajax POST request**
        //
        // Will trigger the event `save:started` when starting. On success or
        // failure either an event is triggered or a callback is executed if
        // one is passed in the options hash.
        //
        // - Success: The event `save:finished` or the `success` callback
        // - Failure: The event `save:error` or the `error` callback
        //
        // On success the received properties are always set on the model,
        // regardless of whether event or callback is performed.
        //
        // Example with success callback:
        //
        //     var model = new Simple.Model();
        //     model.save({
        //       success: function(data) {
        //         // we have a success
        //       }
        //     });
        save: function(options) {
            this._performRequest("save", this, options || {}, {
              type: "POST",
              data: JSON.stringify(this.attributes),
              contentType: 'application/json'
            });
        },

        // Helper for AJAX requests
        _performRequest: function(type, model, options, additionalParams) {
            this.trigger(type + ':started');

            var params = {
                url: model.url,
                dataType: options.dataType || model.dataType || "json",
                success: function(data) {
                    model.attrs(data);
                    if (typeof options.success !== "undefined") {
                        options.success(data);
                    } else {
                        model.trigger(type + ':finished');
                    }
                },
                error: function(jqXHR, resp) {
                    if (typeof options.error !== "undefined") {
                        options.error();
                    } else {
                        model.trigger(type + ':error', resp);
                    }
                }
            };

            $.ajax($.extend(params, additionalParams));
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

        // Set or get all attributes
        attrs: function(attributes) {
            if (typeof attributes === "undefined") {
                return $.extend({}, this.attributes);
            } else {
                $.extend(this.attributes, attributes);
            }
        }

    });

    // Inheritance
    // -----------
    //
    // Set up inheritance for the model and view.
    View.extend = Model.extend = function(properties) {
        var parent = this;

        // Create child constructor
        var child = function() {
            // … which only job is to call the parent construtor with all
            // the arguments
            parent.apply(this, arguments);
        };

        // Set the prototype chain to inherit from `parent`
        child.prototype = Object.create(parent.prototype);

        // Add prototype properties, i.e. instance properties
        $.extend(child.prototype, properties);

        // The child must also be able to create new subclasses
        child.extend = parent.extend;

        return child;
    };

})(this, jQuery, EventEmitter);
