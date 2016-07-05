var Shape = require("./shapes.js");
var Type = require("./bodytype.js");

var Blank = {
  onclick: function () {},
  onrelease: function () {},
  onmove: function () {}
};


var Selection = {
  onclick: function () {
    _engine.selectEntity(null);

    for (var i = _engine.entities.length - 1; i >= 0; i--) {
      if (_engine.entities[i].fixture.TestPoint(
          new b2Vec2(_engine.viewport.x - _engine.viewport.width / 2 + window.Input.mouse.x, _engine.viewport.y - _engine.viewport.height / 2  + window.Input.mouse.y))
      ) {
        _engine.selectEntity(i);
      }
    }
  },
  onrelease: function () {},
  onmove: function () {}
};


var Rectangle = {
  origin: null,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [window.Input.mouse.x, window.Input.mouse.y];
  },

  onrelease: function () {
    var w = window.Input.mouse.x - this.origin[0];
    var h = window.Input.mouse.y - this.origin[1];

    _engine.addEntity(new Shape.Rectangle(
      new b2Vec2(this.origin[0] + w / 2, this.origin[1] + h / 2),
      new b2Vec2(w / 2, h / 2)), Type.DYNAMIC_BODY);

    this.onmove = function(){};
    this.origin = null;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(this.origin[0], this.origin[1], window.Input.mouse.x - this.origin[0], window.Input.mouse.y - this.origin[1]);
    ctx.restore();
  }
};


var Circle = {
  origin: null,
  radius: 0,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [window.Input.mouse.x, window.Input.mouse.y];
  },

  onrelease: function () {
    _engine.addEntity(new Shape.Circle(
      new b2Vec2(this.origin[0] + this.radius, this.origin[1] + this.radius),
      this.radius), Type.DYNAMIC_BODY);

    this.onmove = function(){};
    this.origin = null;
    this.radius = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.radius = Math.min(window.Input.mouse.x - this.origin[0], window.Input.mouse.y - this.origin[1]) / 2;

    ctx.save();
    ctx.beginPath();

    ctx.arc(this.origin[0] + this.radius, this.origin[1] + this.radius, this.radius, 0, 2 * Math.PI, false);

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fill();

    ctx.restore();
  }
};

module.exports.Blank = Blank;
module.exports.Selection = Selection;
module.exports.Rectangle = Rectangle;
module.exports.Circle = Circle;