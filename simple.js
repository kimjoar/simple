//     Simple.js
//
//     A simplistic MV* JavaScript library.
//     Simple may be freely distributed under the MIT license.
//
//     Created by Kim Joar Bekkelund <mail@kimjoar.net>
//
// The primary function of *Simple.js* is to create simple abstractions for
// models and views. It aims to be a JavaScript MV* library which is both easy
// to understand and easy to extend.
//
// Simple.js is (currently) 123 [thoroughly tested](https://github.com/kjbekkelund/simple/blob/master/spec/simple-spec.js)
// lines of code. The project is [hosted on Github](https://github.com/kjbekkelund/simple),
// where you can also find the [changelog](https://github.com/kjbekkelund/simple/blob/master/CHANGELOG.md).
//
// Simple.js depends on [jQuery](http://jquery.com/) 1.7.0. Remember to include
// it before you include Simple.js itself.
//
// You can install Simple.js using Bower: `bower install --save simple.js`
//
// This library is heavily inspired by [Backbone.js](http://backbonejs.org/)
// and [Spine.js](http://spinejs.com/).

(function (root, factory) {

    // Export magic
    // ------------
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // enviroments that support module.exports, like Node.
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals (root is window)
        root.Simple = factory(root.jQuery);
    }
}(this, function ($) {

    // Namespace
    // ---------

    // The top-level namespace. All public Simple classes and modules will be
    // attached to this.
    var Simple = {};

    // Events
    // ------

    // A module that can be *mixed in* to *any* object in order to provide it with
    // custom events:
    //
    //     var object = {};
    //     $.extend(object, Simple.Events);
    //
    // You may bind events with with `on`, unbind with `off`, and fire all
    // event callbacks in successtion with `trigger`:
    //
    //     object.on('test', function(){ console.log("testing!"); });
    //     object.trigger('test');
    //     object.off('test');
    var Events = Simple.Events = {
        // **Bind an event to a callback**
        //
        // - `event` is the name of the event to bind
        // - `callback` is the function which is called when the event is triggered
        // - `context` (optional) is the scope for the callback, i.e. the
        //   meaning of `this` in the callback
        on: function(event, callback, context) {
          var callbacks = this._callbacks || (this._callbacks = {});
          var events = callbacks[event] || (callbacks[event] = []);
          events.push({ callback: callback, context: context });
        },

        // **Unbind an event**
        //
        // - `event` is the name of the event to unbind
        // - `callback` (optional) is the function which was bound
        // - `context` (optional) is the scope the event must have to be removed
        off: function(event, callback, context) {
          // If neither callback nor context is specified we remove all
          // callbacks for an event.
          if (!callback && !context) {
            delete this._callbacks[event];
          }

          // If there are callbacks specified for an event, we loop through
          // them and remove the callback if
          //
          // * callback and context matches
          // * callback matches and context is not specified
          // * callback is not specified and context matches
          var events = this._callbacks[event] || [];
          for (var i = 0; i < events.length; i++) {
            if (!(callback && events[i].callback !== callback || context && events[i].context !== context)) {
              events.splice(i, 1);
            }
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
        trigger: function(event) {
          var args = Array.prototype.slice.call(arguments, 1);
          var callbacks = this._callbacks || {};
          var events = callbacks[event] || [];
          for (var i = 0; i < events.length; i++) {
            events[i].callback.apply(events[i].context || this, args);
          }
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
    //
    // You should start by reading
    // [A view’s responsibility](http://open.bekk.no/a-views-responsibility/)
    // to understand the philosophy these views are based on.

    // Create a new view. This constructor is called whenever a view is
    // initialized, so we can use it set up some basic state that is common
    // among all views.
    var View = Simple.View = function(options) {
        // We always expect to receive the view's `el`, so we just set it
        // right away.
        this.el = options.el;

        // All events specified in the `events` hash will be delegated when the
        // view is initialized.
        this.delegateEvents();

        // On initialization the input is passed through to the `initialize`
        // method, which can be overriden when creating new views.
        this.initialize(options);
    };

    // Attach all inheritable methods to the View prototype.
    //
    // We also attach events which means that we can now bind, unbind and
    // trigger events on a view, e.g.
    //
    //     var view = new Simple.View();
    //     view.on(...)
    //     view.off(...)
    //     view.trigger(...)
    $.extend(View.prototype, Events, {

        // no-op initialize
        initialize: function() {},

        // **View rendering**
        //
        // `render` is responsible for populating the view's HTML element.
        // The default implementation is a no-op, which means that:
        //
        // 1. A view must override this function with its specific view
        //    rendering implemenation.
        // 2. Simple.js works with whatever HTML templating method you like (as
        //    long as it updates `view.el`, of course).
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
        // the current view. You can think of `view.$` as a scoped jQuery
        // lookup. Example:
        //
        //     var view = new Simple.View({ el: $(".user") });
        //
        //     // instead of
        //     $(".user form")
        //
        //     // we should now do
        //     view.$("form")
        $: function(selector) {
            return this.el.find(selector);
        },

        // Alias for `view.$`. Deprecated.
        DOM: function() {
            return this.$.apply(this, arguments);
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

    // Create a new model. This constructor is called whenever a model is
    // initialized, so we can use it set up some basic state that is common
    // among all models.
    var Model = Simple.Model = function(options) {
        // The model's attributes default to the to those specified in the
        // `defaults` hash, e.g. as follows:
        //
        //     var Model = Simple.Model.extend({
        //       defaults: {
        //         name: "Kim Joar"
        //       }
        //     });
        this.attributes = this.defaults || {};

        // We set the attributes specified when initializing the model, or an
        // empty hash if none is specified.
        this.attrs(options || {});

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
        //
        // Fetch returns the [jQuery XMLHttpRequest object](http://api.jquery.com/jQuery.ajax/#jqXHR),
        // `jqXHR`, which implements the Promise interface.
        //
        // Example using promises:
        //
        //     var model = new Simple.Model();
        //     this.model.fetch().then(function(data, textStatus, jqXHR) {
        //       // we have a success
        //     });
        fetch: function(options) {
            return this._performRequest("fetch", this, options || {}, {});
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
        //
        // Save returns the [jQuery XMLHttpRequest object](http://api.jquery.com/jQuery.ajax/#jqXHR),
        // `jqXHR`, which implements the Promise interface.
        //
        // Example using promises:
        //
        //     var model = new Simple.Model();
        //     this.model.save().then(function(data, textStatus, jqXHR) {
        //       // we have a success
        //     });
        save: function(options) {
            return this._performRequest("save", this, options || {}, {
              type: "POST",
              data: JSON.stringify(this.attributes),
              contentType: 'application/json'
            });
        },

        // Helper for AJAX requests
        _performRequest: function(type, model, options, additionalParams) {
            this.trigger(type + ':started');

            var params = {
                url: (typeof model.url === "function") ? model.url() : model.url,
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

            return $.ajax($.extend(params, additionalParams));
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

        // Set several or get all attributes
        attrs: function(attributes) {
            if (typeof attributes === "undefined") {
                // Return a copy of the attributes as we want all adding and
                // removing of attributes to go through `attr` and `attrs`.
                return $.extend({}, this.attributes);
            } else {
                $.extend(this.attributes, attributes);
            }
        }

    });

    // Inheritance
    // -----------

    // Shared empty constructor function to aid in prototype-chain creation.
    var ctor = function() {};

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
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        // Add prototype properties, i.e. instance properties
        $.extend(child.prototype, properties);

        // The child must also be able to create new subclasses
        child.extend = parent.extend;

        return child;
    };

    return Simple;

}));
