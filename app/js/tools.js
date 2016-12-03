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

    if(_engine.selectedEntity) {
      for (var i in _engine.selectedEntity.helpers) {
        if (_engine.selectedEntity.helpers[i].testPoint(_engine.input.mouse.x, _engine.input.mouse.y)) {
          _engine.selectedEntity.helpers[i].click();
          return;
        }
      }
    }

    _engine.selectEntity(null);

    for (var i = Constants.LAYERS_NUMBER - 1; i >= 0; i--) {
      for (var j = 0; j < _engine.layers[i].length; j++) {
        if (_engine.layers[i][j].fixture.TestPoint(
            new b2Vec2(_engine.input.mouse.x, _engine.input.mouse.y))
        ) {
          _engine.selectEntity(_engine.layers[i][j]);

          this.origin = [_engine.input.mouse.x, _engine.input.mouse.y];
          this.offset = [
            _engine.selectedEntity.body.GetPosition().get_x() - this.origin[0],
            _engine.selectedEntity.body.GetPosition().get_y() - this.origin[1]
          ];

          this.mode = "reposition";
          this.origin = [_engine.input.mouse.x, _engine.input.mouse.y];

          return;
        }
      }
    }

    this.mode = "camera";

    this.origin = [_engine.viewport.x, _engine.viewport.y];
    this.offset = [_engine.input.mouse.canvasX, _engine.input.mouse.canvasY];
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
      _engine.viewport.x = this.origin[0] + _engine.viewport.toScale(this.offset[0] - _engine.input.mouse.canvasX);
      _engine.viewport.y = this.origin[1] + _engine.viewport.toScale(this.offset[1] - _engine.input.mouse.canvasY);
    }

    if (this.mode === "reposition") {
      var body = _engine.selectedEntity.body;
      var x = Math.round((_engine.input.mouse.x + this.offset[0]) * 1000) / 1000;
      var y = Math.round((_engine.input.mouse.y + this.offset[1]) * 1000) / 1000;

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

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [_engine.input.mouse.canvasX, _engine.input.mouse.canvasY];
    this.worldOrigin = [_engine.input.mouse.x, _engine.input.mouse.y];
  },

  onrelease: function () {
    if (
      this.w >= _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE) &&
      this.h >= _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE)
    ) {
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
    this.w = _engine.input.mouse.canvasX - this.origin[0];
    this.h = _engine.input.mouse.canvasY - this.origin[1];

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    if (
      this.w < _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE) ||
      this.h < _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE)
    ) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
    }
    ctx.save();
    ctx.fillRect(this.origin[0], this.origin[1], this.w, this.h);
    ctx.restore();
  }
};


var Circle = {
  origin: null,
  worldOrigin: null,
  radius: 0,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [_engine.input.mouse.canvasX, _engine.input.mouse.canvasY];
    this.worldOrigin = [_engine.input.mouse.x, _engine.input.mouse.y];
  },

  onrelease: function () {
    if (this.radius >= _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE) / 2) {
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
    this.radius = Math.min(_engine.input.mouse.canvasX - this.origin[0], _engine.input.mouse.canvasY - this.origin[1]) / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";

    if (this.radius < _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE) / 2) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
    }

    ctx.save();

    ctx.beginPath();

    ctx.arc(this.origin[0] + this.radius, this.origin[1] + this.radius, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.restore();
  }
};

module.exports.Blank = Blank;
module.exports.Selection = Selection;
module.exports.Rectangle = Rectangle;
module.exports.Circle = Circle;