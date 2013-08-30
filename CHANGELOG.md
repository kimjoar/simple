0.1.5 - 26 Aug 2013
-------------------

[See all commits](https://github.com/kjbekkelund/simple/compare/v0.1.4...v0.1.5)

* Added to Bower. Install with `bower install --save simple.js`
* Switched tests from Buster.js to Karma and Jasmine
* Added support for CommonJS and AMD

0.1.4 - 15 May 2013
-------------------

[See all commits](https://github.com/kjbekkelund/simple/compare/v0.1.3...v0.1.4)

* Deprecated `view.DOM`, use `view.$` instead. Think of it as a scoped
  jQuery selector.

0.1.3 - 15 May 2013
-------------------

[See all commits](https://github.com/kjbekkelund/simple/compare/v0.1.2...v0.1.3)

* Return the [jQuery XMLHttpRequest (`jqXHR`) object](http://api.jquery.com/jQuery.ajax/#jqXHR)
  from `model.save` and `model.fetch`. The `jqXHR` implements the
  Promise interface, so you can write the following instead of relying
  on events or callbacks:

  ```javascript
  this.model.save().then(function(data, textStatus, jqXHR) {
      console.log('success!');
  });
  ```

0.1.2 - 13 May 2013
-------------------

[See all commits](https://github.com/kjbekkelund/simple/compare/v0.1.1...v0.1.2)

* Enable models to have default values specified in a `defaults` hash, e.g.:

  ```javascript
  var Model = Simple.Model.extend({
    defaults: {
      name: "Kim Joar"
    }
  });
  ```
* Removed global variable

0.1.1 - 22 June 2012
--------------------

[See all commits](https://github.com/kjbekkelund/simple/compare/v0.1.0...v0.1.1)

* Get rid of `Object.create` dependency.
* Removed dependency to [EventEmitter](https://github.com/Wolfy87/EventEmitter).
  There are no breaking changes to the event API.
* Expose `Simple.Events` to make it easier to use the event library
  outside of Simple.js itself, e.g. for global event handling. Now
  events can be added to any object:

  ```javascript
  var obj = {};
  $.extend(obj, Simple.Events)
  ```
* URLs can now be defined using a function, not only as a variable, e.g.

  ```javascript
  var MyModel = Simple.Model.extend({
    url: function() {
      return "/url";
    }
  });
  ```
* Add local events to `Simple.View`, which means that you can now bind,
  unbind and trigger events on a view instance:

  ```javascript
  var view = new Simple.View();
  view.on("test", function() { console.log("triggered!") });
  view.trigger("test"); // triggered!
  view.off("test");
  ```

0.1.0 - 14 June 2012
--------------------

* Initial release
