require("chai").should();
require("./setup/base");

module.exports = {
  "before": function () {
    setup = require("./setup/entity");

    addToWorld = function(entity) {
      world = new b2World(new b2Vec2(0, 0), true);
      entity.body = world.CreateBody(entity.body);
    };
  },

  "Circle": {
    "beforeEach": function () {
      circle = new setup.Circle();
      addToWorld(circle);
    },

    "sets color correctly": function () {
      circle.setColor("test", true);

      circle.getColor().should.equal("test");
      circle.color.should.equal("test");
    },

    "sets position correctly": function () {
      circle.setPosition(1, 2, true);

      circle.getX().should.equal(1);
      circle.getY().should.equal(2);
    }
  },

  "Rectangle": {
    "beforeEach": function () {
      rectangle = new setup.Rectangle();
      addToWorld(rectangle);
    },

    "sets color correctly": function () {
      rectangle.setColor("test", true);

      rectangle.getColor().should.equal("test");
      rectangle.color.should.equal("test");
    },

    "sets position correctly": function () {
      rectangle.setPosition(1, 2, true);

      rectangle.getX().should.equal(1);
      rectangle.getY().should.equal(2);
    }
  }
};