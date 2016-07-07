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

    for (var i = _engine.LAYERS_NUMBER - 1; i >= 0; i--) {
      for (var j = 0; j < _engine.layers[i].length; j++) {
        if (_engine.layers[i][j].fixture.TestPoint(
            new b2Vec2(_engine.viewport.x - _engine.viewport.width / 2 + Input.mouse.x, _engine.viewport.y - _engine.viewport.height / 2 + Input.mouse.y))
        ) {
          _engine.selectEntity(_engine.layers[i][j]);
          return;
        }
      }
    }
  },
  onrelease: function () {},
  onmove: function () {}
};


var Rectangle = {
  origin: null,
  w: 0,
  h: 0,
  minSize: 5,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [Input.mouse.x, Input.mouse.y];
  },

  onrelease: function () {
    if (this.w >= this.minSize && this.h >= this.minSize)
      _engine.addEntity(new Shape.Rectangle(
        new b2Vec2(this.origin[0] + this.w / 2, this.origin[1] + this.h / 2),
        new b2Vec2(this.w / 2, this.h / 2)), Type.DYNAMIC_BODY);

    this.onmove = function(){};
    this.origin = null;
    this.w = this.h = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.w = Input.mouse.x - this.origin[0];
    this.h = Input.mouse.y - this.origin[1];

    if (this.w < this.minSize || this.h < this.minSize)
      return;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(this.origin[0], this.origin[1], this.w, this.h);
    ctx.restore();
  }
};


var Circle = {
  origin: null,
  radius: 0,
  minRadius: 5,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [Input.mouse.x, Input.mouse.y];
  },

  onrelease: function () {
    if (this.radius >= this.minRadius)
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
    this.radius = Math.min(Input.mouse.x - this.origin[0], Input.mouse.y - this.origin[1]) / 2;

    if (this.radius < this.minRadius)
      return;

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