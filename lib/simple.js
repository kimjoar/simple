(function(root, $, Mustache) {

    var Simple = root.Simple = {};

    var View = Simple.View = function() {
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }
    };

    var Model = Simple.Model = function() {
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }
    };

    View.extend = Model.extend = function(properties) {
        var obj = $.extend.call({}, this.prototype, properties);
        return obj.constructor;
    };

    $.extend(View.prototype, {
        renderTemplate: function(data) {
            var template = this.template;
            var html = Mustache.to_html(template, data);
            this.el = $(html);
            return html;
        },

        DOM: function(selector) {
            return this.el.find(selector);
        }
    });

})(this, jQuery, Mustache);
