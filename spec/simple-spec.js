buster.spec.expose();

describe("Simple", function () {
    it("is defined", function() {
        expect(Simple).toBeDefined();
    });

    it("exposes a view", function () {
        expect(Simple.View).toBeDefined();
    });

    it("exposes a model", function () {
        expect(Simple.Model).toBeDefined();
    });

    describe("Creation of new children", function() {
        it("enables creation of new children by using extend", function() {
            var Model = Simple.Model.extend({
                test: function() {
                    return "test";
                }
            });

            var model = new Model();

            expect(model.test).toBeDefined();
        });

        it("has correct instanceof when extending Simple.Model", function() {
            var Model = Simple.Model.extend({});
            var model = new Model();

            expect(model instanceof Simple.Model).toBeTrue();
        });

        it("has correct instanceof when extending child", function() {
            var Model = Simple.Model.extend({});
            var Child = Model.extend({});
            var child = new Child();

            expect(child instanceof Simple.Model).toBeTrue();
        });

        it("enables child creation from a created child", function() {
            var Model = Simple.Model.extend({
                test: function() {
                    return "child1";
                },

                override: function() {
                    return "#1";
                }
            });

            var NewModel = Model.extend({
                test2: function() {
                    return "child2";
                },

                override: function() {
                    return "#2";
                }
            });

            var model = new NewModel();

            expect(model.test()).toMatch("child1");
            expect(model.test2()).toMatch("child2");
            expect(model.override()).toMatch("#2");
        });

        it("can call properties on parent", function() {
            Simple.Model.prototype.test = function() {
                return "test";
            };

            var Model = Simple.Model.extend({});

            var model = new Model();

            expect(model.test()).toMatch("test");
        });

        it("favors properties in child over properties in parent", function() {
            Simple.Model.prototype.test = function() {
                return "parent";
            };

            var Model = Simple.Model.extend({
                test: function() {
                    return "child";
                }
            });

            var model = new Model();

            expect(model.test()).toMatch("child");

            delete Simple.Model.prototype.test;
        });

        it("reflects the parent's prototype changes after child is created", function() {
            var Model = Simple.Model.extend({});
            var model = new Model();

            Simple.Model.prototype.test = function() {
                return "parent";
            };

            expect(model.test()).toMatch("parent");
        });

        it("calls initialize with first parameter when model in initialized", function() {
            var spy = this.spy();

            var Model = Simple.Model.extend({
                initialize: spy
            });

            var opts = { test: "testing", test2: "testing" };
            new Model(opts);

            expect(spy).toHaveBeenCalledOnceWith(opts);
        });

        it("does not add properties to parent", function() {
            expect(Simple.Model.prototype.abc).not.toBeDefined("pre-check");

            var Model = Simple.Model.extend({
                abc: function() {}
            });

            expect(Simple.Model.prototype.abc).not.toBeDefined("post-check");
        });

    });

    describe("Events", function() {
        it("exposes events", function() {
            expect(Simple.events).toBeDefined();
        });

        it("allows binding and firing of events", function() {
            var spy = this.spy();

            Simple.events.on("test", spy);
            Simple.events.trigger("test");

            expect(spy).toHaveBeenCalledOnce();
        });

        it("allows firing of several callbacks for same event", function() {
            var spy = this.spy(),
                spy2 = this.spy();

            Simple.events.on("test", spy);
            Simple.events.on("test", spy);
            Simple.events.on("test", spy2);
            Simple.events.trigger("test");

            expect(spy).toHaveBeenCalledTwice();
            expect(spy2).toHaveBeenCalledOnce();
        });

        it("allows arguments to be sent when triggering event", function() {
            var spy = this.spy();

            Simple.events.on("test", spy);
            Simple.events.trigger("test", "Kim Joar");

            expect(spy).toHaveBeenCalledOnceWith("Kim Joar");
        });

        it("allows unbinding of events with listener specified", function() {
            var spy = this.spy();

            Simple.events.on("test", spy);
            Simple.events.off("test", spy);
            Simple.events.trigger("test");

            expect(spy).not.toHaveBeenCalled();
        });

        it("allows unbinding of all events when no listener is specified", function() {
            var spy = this.spy(),
                spy2 = this.spy();

            Simple.events.on("test", spy);
            Simple.events.on("test", spy);
            Simple.events.on("test", spy2);
            Simple.events.off("test");
            Simple.events.trigger("test");

            expect(spy).not.toHaveBeenCalled();
            expect(spy2).not.toHaveBeenCalled();
        });

        it("allows specifying which scope the unbind should have", function() {
            var spy = this.spy(),
                scope = {},
                scope2 = {};

            Simple.events.on("test", spy, scope);
            Simple.events.on("test", spy, scope2);
            Simple.events.off("test", spy, scope2);
            Simple.events.trigger("test");

            expect(spy).toHaveBeenCalledOn(scope);
            expect(spy).toHaveBeenCalledOnce();

            Simple.events.off("test", spy, scope);
            Simple.events.trigger("test");

            expect(spy).toHaveBeenCalledOnce();
        });
    });

    describe("View", function() {
        beforeEach(function() {
            this.view = new Simple.View({ el: $('<div></div>') });
        });

        it("enables initialization of views using new", function() {
            expect(this.view instanceof Simple.View).toBeTrue();
        });

        it("enables creation of new views", function() {
            expect(Simple.View.extend).toBeDefined();
        });

        describe("render", function() {
            it("is defined", function() {
                expect(this.view.render).toBeDefined();
            });
        });

        describe("DOM", function() {
            it("returns a jQuery object", function() {
                this.view.el.html('<h1>Kim Joar</h1>');

                expect(this.view.DOM("h1") instanceof jQuery).toBeTrue();
            });

            it("enables DOM selector search in the views rendered html", function() {
                this.view.el.html('<h1>Kim Joar</h1>');

                expect(this.view.DOM("h1").text()).toMatch("Kim Joar");
            });
        });

        describe("event delegation", function() {
            it("binds DOM events to specified selector", function() {
                var spy = this.spy();

                var View = Simple.View.extend({
                    events: {
                        "click h1": "test"
                    },

                    test: spy
                });

                var view = new View({ el: $('<div></div>') });

                view.el.html('<h1>Kim Joar</h1>');

                view.DOM("h1").click();

                expect(spy).toHaveBeenCalledOnce();
            });

            it("binds DOM events to `el` when no selector is specified", function() {
                var spy = this.spy();

                var View = Simple.View.extend({
                    events: {
                        "click": "test"
                    },

                    test: spy
                });

                var view = new View({ el: $('<div></div>') });

                view.el.html('<h1>Kim Joar</h1>');

                view.el.click();

                expect(spy).toHaveBeenCalledOnce();
            });
        });
    });

    describe("Model", function() {
        beforeEach(function() {
            this.model = new Simple.Model();
        });

        it("enables initialization of models using new", function() {
            expect(this.model instanceof Simple.Model).toBeTrue();
        });

        it("sets attributes on initialization", function() {
            var options = {
              name: "Kim Joar",
              work: "BEKK"
            };

            var model = new Simple.Model(options);

            expect(model.attr("name")).toEqual("Kim Joar");
            expect(model.attr("work")).toEqual("BEKK");
        });

        it("enables creation of new models", function() {
            expect(Simple.Model.extend).toBeDefined();
        });

        describe("events", function() {
            it("allows binding and firing of events", function() {
                var spy = this.spy();

                this.model.on("test", spy, this.model);
                this.model.trigger("test");

                expect(spy).toHaveBeenCalledOnce();
                expect(spy).toHaveBeenCalledOn(this.model);
            });

            it("allows arguments to be sent when triggering event", function() {
                var spy = this.spy();

                this.model.on("test", spy);
                this.model.trigger("test", "Kim Joar");

                expect(spy).toHaveBeenCalledOnceWith("Kim Joar");
            });

            it("allows unbinding of events", function() {
                var spy = this.spy();

                this.model.on("test", spy);
                this.model.off("test", spy);
                this.model.trigger("test");

                expect(spy).not.toHaveBeenCalled();
            });

            it("creates a unique event handler for each instance", function() {
                var model2 = new Simple.Model();

                var spy = this.spy();
                var spy2 = this.spy();

                this.model.on("test", spy);
                model2.on("test", spy2);

                this.model.trigger("test");

                expect(spy).toHaveBeenCalledOnce();
                expect(spy2).not.toHaveBeenCalled();
            });
        });

        describe("fetch", function() {
            beforeEach(function() {
                var Model = Simple.Model.extend({
                    url: "/test"
                });
                this.model = new Model();

                this.fakeXhr = sinon.useFakeXMLHttpRequest();
                var requests = this.requests = [];

                this.fakeXhr.onCreate = function (xhr) {
                    requests.push(xhr);
                };
            });

            afterEach(function() {
                this.fakeXhr.restore();
            });

            it("performs an ajax request to the model's url", function() {
                this.model.fetch();

                expect(this.requests.length).toBe(1);
                expect(this.requests[0].url).toMatch(this.model.url);
            });

            it("triggers 'fetch:started' before request", function() {
                var spy = this.spy();
                this.model.on("fetch:started", spy);

                this.model.fetch();

                expect(spy).toHaveBeenCalledOnce();
            });

            it("triggers 'fetch:finished' on success", function() {
                var spy = this.spy();
                this.model.on("fetch:finished", spy);

                this.model.fetch();

                this.requests[0].respond();

                expect(spy).toHaveBeenCalledOnce();
            });

            it("executes success callback if one is set and fetch is successful", function() {
                var callbackSpy = this.spy();
                var eventSpy = this.spy();

                this.model.on("fetch:finished", eventSpy);

                this.model.fetch({ success: callbackSpy });

                var data = { id: 12, name: "Kim Joar" };

                this.requests[0].respond(200, { "Content-Type": "application/json" },
                                 JSON.stringify(data));

                expect(callbackSpy).toHaveBeenCalledOnceWith(data);
                expect(eventSpy).not.toHaveBeenCalled();
            });

            it("sets attributes on success", function() {
                this.model.fetch();

                this.requests[0].respond(200, { "Content-Type": "application/json" },
                                 '{ "id": 12, "name": "Kim Joar" }');

                expect(this.model.attr("id")).toMatch(12);
                expect(this.model.attr("name")).toMatch("Kim Joar");
            });

            it("triggers 'fetch:error' on failure", function() {
                var spy = this.spy();
                this.model.on("fetch:error", spy);

                this.model.fetch();

                this.requests[0].respond(404);

                expect(spy).toHaveBeenCalledOnce();
            });

            it("executes error callback if one is set and fetch is not successful", function() {
                var callbackSpy = this.spy();
                var eventSpy = this.spy();

                this.model.on("fetch:error", eventSpy);

                this.model.fetch({ error: callbackSpy });

                this.requests[0].respond(404);

                expect(callbackSpy).toHaveBeenCalledOnce();
                expect(eventSpy).not.toHaveBeenCalled();
            });

            it("includes response in 'fetch:error' event", function() {
                var spy = this.spy();
                this.model.on("fetch:error", spy);

                this.model.fetch();

                this.requests[0].respond(404);

                expect(spy).toHaveBeenCalledOnceWith("error");
            });
        });

        describe("save", function() {
            beforeEach(function() {
                var Model = Simple.Model.extend({
                    url: "/test"
                });
                this.model = new Model();

                this.fakeXhr = sinon.useFakeXMLHttpRequest();
                var requests = this.requests = [];

                this.fakeXhr.onCreate = function (xhr) {
                    requests.push(xhr);
                };
            });

            afterEach(function() {
                this.fakeXhr.restore();
            });

            it("performs an ajax POST request to the model's url", function() {
                this.model.save();

                expect(this.requests.length).toBe(1);
                expect(this.requests[0].url).toMatch(this.model.url);
                expect(this.requests[0].method).toBe("POST");
            });

            it("triggers 'save:started' before request", function() {
                var spy = this.spy();
                this.model.on("save:started", spy);

                this.model.save();

                expect(spy).toHaveBeenCalledOnce();
            });

            it("triggers 'save:finished' on success", function() {
                var spy = this.spy();
                this.model.on("save:finished", spy);

                this.model.save();
                this.requests[0].respond();

                expect(spy).toHaveBeenCalledOnce();
            });

            it("executes success callback if one is set and save is successful", function() {
                var callbackSpy = this.spy();
                var eventSpy = this.spy();

                this.model.on("save:finished", eventSpy);

                this.model.save({ success: callbackSpy });

                var data = { id: 12, name: "Kim Joar" };

                this.requests[0].respond(200, { "Content-Type": "application/json" },
                                 JSON.stringify(data));

                expect(callbackSpy).toHaveBeenCalledOnceWith(data);
                expect(eventSpy).not.toHaveBeenCalled();
            });

            it("sets attributes on success", function() {
                this.model.save();

                this.requests[0].respond(200, { "Content-Type": "application/json" },
                                 '{ "id": 12, "name": "Kim Joar" }');

                expect(this.model.attr("id")).toMatch(12);
                expect(this.model.attr("name")).toMatch("Kim Joar");
            });

            it("sends all attributes", function() {
                this.model.attr("name", "Kim Joar");
                this.model.attr("work", "BEKK");

                this.model.save();

                var body = JSON.parse(this.requests[0].requestBody);
                expect(body.name).toEqual("Kim Joar");
                expect(body.work).toEqual("BEKK");
            });

            it("triggers 'save:error' on failure", function() {
                var spy = this.spy();
                this.model.on("save:error", spy);

                this.model.save();
                this.requests[0].respond(404);

                expect(spy).toHaveBeenCalledOnce();
            });

            it("executes error callback if one is set and save is not successful", function() {
                var callbackSpy = this.spy();
                var eventSpy = this.spy();

                this.model.on("save:error", eventSpy);

                this.model.save({ error: callbackSpy });

                this.requests[0].respond(404);

                expect(callbackSpy).toHaveBeenCalledOnce();
                expect(eventSpy).not.toHaveBeenCalled();
            });

        });

        describe("attr", function() {
            it("can get and set a paramter", function() {
                var model = new Simple.Model();

                model.attr("name", "Kim Joar");

                expect(model.attr("name")).toMatch("Kim Joar");
            });
        });

        describe("attrs", function() {
            it("returns all attributes when no arguments", function() {
                var model = new Simple.Model();

                model.attr("name", "Kim Joar");
                model.attr("employer", "BEKK");

                var data = model.attrs();
                expect(data.name).toMatch("Kim Joar");
                expect(data.employer).toMatch("BEKK");
            });

            it("sets all attributes", function() {
                var model = new Simple.Model();
                var attributes = {
                    name: "Kim Joar",
                    work: "BEKK"
                };

                model.attrs(attributes);
                expect(model.attr("name")).toMatch("Kim Joar");
                expect(model.attr("work")).toMatch("BEKK");
            });

            it("overwrites existing attributes", function() {
                var model = new Simple.Model();

                model.attr("name", "Kim");
                expect(model.attr("name")).toMatch("Kim");

                model.attrs({ name: "Kim Joar" });
                expect(model.attr("name")).toMatch("Kim Joar");
            });
        });
    });
});
