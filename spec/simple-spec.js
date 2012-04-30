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

    describe("View", function() {
        it("enables initialization of views using new", function() {
            var view = new Simple.View();

            expect(view instanceof Simple.View).toEqual(true);
        });

        it("enables creation of new view classes through extend", function() {
            var View = Simple.View.extend({
                test: function() {
                    return "test";
                }
            });

            var view = new View();

            expect(view.test).toBeDefined();
        });

        it("favors properties in child over properties in parent", function() {
            Simple.View.prototype.test = function() {
                return "parent";
            };

            var View = Simple.View.extend({
                test: function() {
                    return "child";
                }
            });

            var view = new View();

            expect(view.test()).toMatch("child");

            delete Simple.View.prototype.test;
        });

        it("calls initialize with all parameters when view in initialized", function() {
            var spy = this.spy();

            var View = Simple.View.extend({
                initialize: spy
            });

            new View("test", "test2");

            expect(spy).toHaveBeenCalledOnceWith("test", "test2");
        });
    });

    describe("Model", function() {
        it("enables initialization of models using new", function() {
            var model = new Simple.Model();

            expect(model instanceof Simple.Model).toEqual(true);
        });

        it("enables creation of new model classes through extend", function() {
            var Model = Simple.Model.extend({
                test: function() {
                    return "test";
                }
            });

            var model = new Model();

            expect(model.test).toBeDefined();
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

        it("calls initialize with all parameters when model in initialized", function() {
            var spy = this.spy();

            var Model = Simple.Model.extend({
                initialize: spy
            });

            new Model("test", "test2");

            expect(spy).toHaveBeenCalledOnceWith("test", "test2");
        });

    });
});
