var Shape = require("./shapes.js");
var Type = require("./bodytype.js");
var Constants = require("./constants.js");

var Blank = {
  onclick: function () {},
  onrelease: function () {},
  onmove: function () {}
};


var Selection = {
  origin: null,
  offset: null,
  mode: null,

  onclick: function () {
    _engine.selectEntity(null);

    for (var i = Constants.LAYERS_NUMBER - 1; i >= 0; i--) {
      for (var j = 0; j < _engine.layers[i].length; j++) {
        // console.log([Input.mouse.x, Input.mouse.y], _engine.viewport.x);
        if (_engine.layers[i][j].fixture.TestPoint(
            new b2Vec2(Input.mouse.x, Input.mouse.y))
        ) {
          _engine.selectEntity(_engine.layers[i][j]);

          this.origin = [Input.mouse.x, Input.mouse.y];
          this.offset = [
            _engine.selectedEntity.body.GetPosition().get_x() - this.origin[0],
            _engine.selectedEntity.body.GetPosition().get_y() - this.origin[1]
          ];

          this.mode = "reposition";
          this.origin = [Input.mouse.x, Input.mouse.y];

          return;
        }
      }
    }

    this.mode = "camera";

    this.origin = [_engine.viewport.x, _engine.viewport.y];
    this.offset = [Input.mouse.canvasX, Input.mouse.canvasY];
    _engine.viewport.canvasElement.style.cursor = "url(img/grabbingcursor.png), move";
  },
  onrelease: function () {
    this.origin = this.offset = this.mode = null;
    _engine.viewport.canvasElement.style.cursor = "default";
  },
  onmove: function () {
    if (this.mode === null)
      return;

    if (this.mode === "camera") {
      _engine.viewport.x = this.origin[0] + (this.offset[0] - Input.mouse.canvasX) * _engine.viewport.scale;
      _engine.viewport.y = this.origin[1] + (this.offset[1] - Input.mouse.canvasY) * _engine.viewport.scale;
    }

    if (this.mode === "reposition") {
      var body = _engine.selectedEntity.body;
      var x = Math.round((Input.mouse.x + this.offset[0]) * 1000) / 1000;
      var y = Math.round((Input.mouse.y + this.offset[1]) * 1000) / 1000;

      body.SetTransform(new b2Vec2(x, y), body.GetAngle());
      $("#entity_x").val(x);
      $("#entity_y").val(y);
    }
  }
};


var Rectangle = {
  origin: null,
  worldOrigin: null,
  w: 0,
  h: 0,
  minSize: 5,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [Input.mouse.canvasX, Input.mouse.canvasY];
    this.worldOrigin = [Input.mouse.x, Input.mouse.y];
  },

  onrelease: function () {
    if (this.w >= this.minSize && this.h >= this.minSize) {
      this.w *= _engine.viewport.scale;
      this.h *= _engine.viewport.scale;

      _engine.addEntity(new Shape.Rectangle(
        new b2Vec2(this.worldOrigin[0] + this.w / 2, this.worldOrigin[1] + this.h / 2),
        new b2Vec2(this.w / 2, this.h / 2)), Type.DYNAMIC_BODY);
    }

    this.onmove = function(){};
    this.origin = null;
    this.worldOrigin = null;
    this.w = this.h = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.w = Input.mouse.canvasX - this.origin[0];
    this.h = Input.mouse.canvasY - this.origin[1];

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
  worldOrigin: null,
  radius: 0,
  minRadius: 5,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [Input.mouse.canvasX, Input.mouse.canvasY];
    this.worldOrigin = [Input.mouse.x, Input.mouse.y];
  },

  onrelease: function () {
    if (this.radius >= this.minRadius) {
      this.radius *= _engine.viewport.scale;

      _engine.addEntity(new Shape.Circle(
        new b2Vec2(this.worldOrigin[0] + this.radius, this.worldOrigin[1] + this.radius),
        this.radius), Type.DYNAMIC_BODY);
    }

    this.onmove = function(){};
    this.origin = null;
    this.worldOrigin = null;
    this.radius = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.radius = Math.min(Input.mouse.canvasX - this.origin[0], Input.mouse.canvasY - this.origin[1]) / 2;

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