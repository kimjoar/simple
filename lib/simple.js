Simple = {};

Simple.View = function() {
    if (this.initialize) {
        this.initialize.apply(this, arguments);
    }
};

Simple.Model = function() {
    if (this.initialize) {
        this.initialize.apply(this, arguments);
    }
};

Simple.View.extend = Simple.Model.extend = function(properties) {
    var obj = $.extend.call({}, this.prototype, properties);
    return obj.constructor;
};
