buster.spec.expose();

describe("Simple", function () {
    it("should be defined", function() {
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

        it("enables child creation from a created child", function() {
            var Model = Simple.Model.extend({
                test: function() {
                    return "child1";
                }
            });

            var NewModel = Model.extend({
                test2: function() {
                    return "child2";
                }
            });

            var model = new NewModel();

            expect(model.test()).toMatch("child1");
            expect(model.test2()).toMatch("child2");
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

        it("calls initialize with all parameters when model in initialized", function() {
            var spy = this.spy();

            var Model = Simple.Model.extend({
                initialize: spy
            });

            new Model("test", "test2");

            expect(spy).toHaveBeenCalledOnceWith("test", "test2");
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
            it("should return an instance of the view", function() {
                expect(this.view.render()).toBe(this.view);
            });
        });

        describe("DOM", function() {
            it("enables DOM selector search in the views rendered html", function() {
                this.view.el.html('<h1>Kim Joar</h1>');

                expect(this.view.DOM("h1").text()).toMatch("Kim Joar");
            });
        });
    });

    describe("Model", function() {
        it("enables initialization of models using new", function() {
            var model = new Simple.Model();

            expect(model instanceof Simple.Model).toBeTrue();
        });

        it("enables creation of new models", function() {
            expect(Simple.Model.extend).toBeDefined();
        });

        describe("events", function() {
            it("allows binding and firing of events", function() {
                var model = new Simple.Model();

                var spy = this.spy();

                model.on("test", spy, model);
                model.trigger("test");

                expect(spy).toHaveBeenCalledOnce();
                expect(spy).toHaveBeenCalledOn(model);
            });

            it("allows unbinding of events", function() {
                var model = new Simple.Model();

                var spy = this.spy();

                model.on("test", spy);
                model.off("test", spy);
                model.trigger("test");

                expect(spy).not.toHaveBeenCalled();
            });

            it("creates a unique event handler for each instance", function() {
                var model = new Simple.Model();
                var model2 = new Simple.Model();

                var spy = this.spy();
                var spy2 = this.spy();

                model.on("test", spy);
                model2.on("test", spy2);

                model.trigger("test");

                expect(spy).toHaveBeenCalledOnce();
                expect(spy2).not.toHaveBeenCalled();
            });
        });
    });
});
