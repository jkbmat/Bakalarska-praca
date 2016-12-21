var Shape = require("./shapes.js");
var Type = require("./bodyType.js");
var Constants = require("./constants.js");
var UpdateEvent = require("./updateEvent.js");

var Blank = {
  onclick: function () {
  },
  onrelease: function () {
  },
  onmove: function () {
  }
};


var Selection = {
  origin: null,
  offset: null,
  mode: null,

  onclick: function () {

    if (_engine.selected.type === "entity") {
      for (var i = _engine.selected.ptr.helpers.length - 1; i >= 0; i--) {
        if (_engine.selected.ptr.helpers[i].testPoint(_engine.input.mouse.x, _engine.input.mouse.y)) {
          _engine.selected.ptr.helpers[i].click();
          return;
        }
      }
    }

    _engine.selectEntity(null, true);

    for (var i = Constants.LAYERS_NUMBER - 1; i >= 0; i--) {
      for (var j = 0; j < _engine.layers[i].length; j++) {
        if (_engine.layers[i][j].fixture.TestPoint(
            new b2Vec2(_engine.input.mouse.x, _engine.input.mouse.y))
        ) {
          if (this.mode === "entity-pick") {
            UpdateEvent.fire(UpdateEvent.ENTITY_PICKED, {noState: true, entityId: _engine.layers[i][j].id});
            this.mode = "";
            return;
          }

          _engine.selectEntity(_engine.layers[i][j]);

          this.origin = [_engine.input.mouse.x, _engine.input.mouse.y];
          this.offset = [
            _engine.selected.ptr.body.GetPosition().get_x() - this.origin[0],
            _engine.selected.ptr.body.GetPosition().get_y() - this.origin[1]
          ];

          this.mode = "reposition-start";
          this.origin = [_engine.input.mouse.x, _engine.input.mouse.y];
          _engine.selected.ptr.toggleHelpers(false);

          return;
        }
      }
    }

    if (this.mode === "entity-pick") {
      return;
    }

    this.mode = "camera";

    this.origin = [_engine.viewport.x, _engine.viewport.y];
    this.offset = [_engine.input.mouse.canvasX, _engine.input.mouse.canvasY];
    _engine.viewport.canvasElement.style.cursor = "url(img/grabbingcursor.png), move";
  },
  onrelease: function () {
    if (this.mode === "entity-pick") {
      return;
    }

    if (this.mode === "reposition") {
      _engine.selected.ptr.toggleHelpers(true);
      UpdateEvent.fire(UpdateEvent.REPOSITION, {entities: [_engine.selected.ptr]});
    }

    if (this.mode === "reposition-start") {
      _engine.selected.ptr.toggleHelpers(true);
    }

    if (this.mode === "camera") {
      UpdateEvent.fire(UpdateEvent.CAMERA_MOVE);
    }

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

    if (
      this.mode === "reposition-start" && !this.origin.equalTo([_engine.input.mouse.x, _engine.input.mouse.y])
    ) {
      this.mode = "reposition";
    }

    if (this.mode === "reposition") {
      var x = Math.round((_engine.input.mouse.x + this.offset[0]) * 1000) / 1000;
      var y = Math.round((_engine.input.mouse.y + this.offset[1]) * 1000) / 1000;

      _engine.selected.ptr.setPosition(x, y, true);
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

      var x = Math.min(_engine.input.mouse.x, this.worldOrigin[0]);
      var y = Math.min(_engine.input.mouse.y, this.worldOrigin[1]);

      _engine.addEntity(new Shape.Rectangle(
        new b2Vec2(x + this.w / 2, y + this.h / 2),
        new b2Vec2(this.w / 2, this.h / 2)), Type.DYNAMIC_BODY);
    }

    this.onmove = function () {
    };
    this.origin = null;
    this.worldOrigin = null;
    this.w = this.h = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.w = Math.abs(_engine.input.mouse.canvasX - this.origin[0]);
    this.h = Math.abs(_engine.input.mouse.canvasY - this.origin[1]);

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    if (
      this.w < _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE) ||
      this.h < _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE)
    ) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
    }
    ctx.save();
    ctx.fillRect(
      Math.min(_engine.input.mouse.canvasX, this.origin[0]),
      Math.min(_engine.input.mouse.canvasY, this.origin[1]),
      this.w,
      this.h
    );
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

      var x = Math.min(this.worldOrigin[0], _engine.input.mouse.x);
      var y = Math.min(this.worldOrigin[1], _engine.input.mouse.y);

      _engine.addEntity(new Shape.Circle(
        new b2Vec2(x + this.radius, y + this.radius),
        this.radius), Type.DYNAMIC_BODY);
    }

    this.onmove = function () {
    };
    this.origin = null;
    this.worldOrigin = null;
    this.radius = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.radius = Math.min(
        Math.abs(_engine.input.mouse.canvasX - this.origin[0]),
        Math.abs(_engine.input.mouse.canvasY - this.origin[1])
      ) / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";

    if (this.radius < _engine.viewport.fromScale(Constants.SHAPE_MIN_SIZE) / 2) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
    }

    ctx.save();

    ctx.beginPath();

    var x = Math.min(this.origin[0], _engine.input.mouse.canvasX);
    var y = Math.min(this.origin[1], _engine.input.mouse.canvasY);

    ctx.arc(x + this.radius, y + this.radius, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.restore();
  }
};

module.exports.Blank = Blank;
module.exports.Selection = Selection;
module.exports.Rectangle = Rectangle;
module.exports.Circle = Circle;