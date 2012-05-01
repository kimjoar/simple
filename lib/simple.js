(function(root, $, EventEmitter) {

    // The top-level namespace. All public Simple classes and modules will be
    // attached to this.
    var Simple = root.Simple = {};

    // Create a new view
    var View = Simple.View = function(options) {
        this.el = options.el;
        this.initialize(options);
    };

    // Create a new model
    var Model = Simple.Model = function() {
        this.initialize.apply(this, arguments);
        this.events = new EventEmitter();
    };

    // Set up inheritance for the model and view.
    View.extend = Model.extend = function(properties) {
        var obj = $.extend.call({}, this.prototype, properties);
        return obj.constructor;
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
        }

    });

    $.extend(Model.prototype, {

        initialize: function() {},

        // Bind an event to a callback
        on: function(event, callback, context) {
            this.events.addListener(event, callback, context);
        },

        // Unbind an event
        off: function(event, callback) {
            this.events.removeListener(event, callback);
        },

        // Trigger an event
        trigger: function(event) {
            this.events.emit(event);
        }

    });

})(this, jQuery, EventEmitter);
