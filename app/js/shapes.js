var Entity = require("./entity.js");
var Constants = require("./constants.js");
var ClickableHelper = require("./clickablehelper.js");
var Geometry = require("./geometry.js");

// Circle entity
var Circle = function (center, radius, fixture, id, collisionGroup) {
  var shape = new b2CircleShape();
  shape.set_m_radius(radius);

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.radius = radius;

  this.nameString = "CIRCLE";

  return this;
};
Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.getWidth = function () {
  return this.radius * 2;
};

Circle.prototype.getHeight = function () {
  return this.radius * 2;
};

Circle.prototype.addHelpers = function () {
  this.helpers = [
    new ClickableHelper(this, 15, 15, Constants.POSITION_TOP_RIGHT, 'img/resize-sw-ne.svg', this.moveResize, this.startResize),
    new ClickableHelper(this, 15, 15, Constants.POSITION_TOP_LEFT, 'img/rotate.svg', this.moveRotate, this.startRotate)
  ];
};

Circle.prototype.draw = function (ctx) {
  ctx.beginPath();

  ctx.arc(0, 0, _engine.viewport.fromScale(this.radius), 0, 2 * Math.PI, false);

  ctx.fill();

  ctx.strokeStyle = "red";
  ctx.globalCompositeOperation = "destination-out";

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, _engine.viewport.fromScale(this.radius));
  ctx.stroke();
  ctx.closePath();
};

Circle.prototype.startResize = function () {
  this.startSize = this.entity.getWidth() / 2;

  this.startDistance = Geometry.pointPointDistance(
    new b2Vec2(this.entity.getX(), this.entity.getY()),

    new b2Vec2(
      _engine.input.mouse.x,
      _engine.input.mouse.y
    )
  );
};

Circle.prototype.moveResize = function () {
  var scale = Geometry.pointPointDistance(
      new b2Vec2(this.entity.getX(), this.entity.getY()),

      new b2Vec2(
        _engine.input.mouse.x,
        _engine.input.mouse.y
      )
    ) / this.startDistance;

  this.entity.resize(this.startSize * scale);
};

Circle.prototype.resize = function (radius) {
  if (radius < Constants.SHAPE_MIN_SIZE / 2)
    return false;

  var newFix = new b2FixtureDef();
  newFix.set_density(this.fixture.GetDensity());
  newFix.set_friction(this.fixture.GetFriction());
  newFix.set_restitution(this.fixture.GetRestitution());
  newFix.set_filter(this.fixture.GetFilterData());

  var shape = new b2CircleShape();
  shape.set_m_radius(radius);
  this.radius = radius;

  newFix.set_shape(shape);

  this.body.DestroyFixture(this.fixture);
  this.fixture = this.body.CreateFixture(newFix);

  this.recalculateHelpers();

  if (this === _engine.selectedEntity) {
    $("#entity_width").val(radius * 2);
    $("#entity_height").val(radius * 2);
  }

  return true;
};


// Rectangle entity
var Rectangle = function (center, extents, fixture, id, collisionGroup) {
  var shape = new b2PolygonShape();
  shape.SetAsBox(extents.get_x(), extents.get_y());

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.extents = extents;

  this.nameString = "RECTANGLE";

  return this;
};
Rectangle.prototype = new Entity();
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.getWidth = function () {
  return this.extents.get_x() * 2;
};

Rectangle.prototype.getHeight = function () {
  return this.extents.get_y() * 2;
};

Rectangle.prototype.addHelpers = function () {
  this.helpers = [
    new ClickableHelper(this, 15, 15, Constants.POSITION_TOP_RIGHT, 'img/resize-sw-ne.svg', this.moveResize, this.startResize),
    new ClickableHelper(this, 15, 15, Constants.POSITION_TOP_LEFT, 'img/rotate.svg', this.moveRotate, this.startRotate),
    new ClickableHelper(this, 7, 7, Constants.POSITION_BOTTOM, 'img/handle.svg', this.moveResizeSide, this.startResizeSide),
    new ClickableHelper(this, 7, 7, Constants.POSITION_TOP, 'img/handle.svg', this.moveResizeSide, this.startResizeSide),
    new ClickableHelper(this, 7, 7, Constants.POSITION_LEFT, 'img/handle.svg', this.moveResizeSide, this.startResizeSide),
    new ClickableHelper(this, 7, 7, Constants.POSITION_RIGHT, 'img/handle.svg', this.moveResizeSide, this.startResizeSide),
  ];
};

Rectangle.prototype.draw = function (ctx) {
  var halfWidth = _engine.viewport.fromScale(this.extents.get_x());
  var halfHeight = _engine.viewport.fromScale(this.extents.get_y());

  ctx.fillRect(-halfWidth, -halfHeight, halfWidth * 2, halfHeight * 2);
};

Rectangle.prototype.startResizeSide = function () {
  this.startSize = [
    this.entity.getWidth() / 2,
    this.entity.getHeight() / 2
  ];

  this.startPosition = new b2Vec2(
    this.entity.getX(),
    this.entity.getY()
  );
};

Rectangle.prototype.moveResizeSide = function () {
  var mouseRotated = Geometry.pointRotate(
    this.startPosition,
    new b2Vec2(_engine.input.mouse.x, _engine.input.mouse.y),
    -(this.entity.body.GetAngle() + Constants.sideOrder.equalIndexOf(this.position) * (Math.PI / 2))
  );

  var distance = this.startPosition.get_y() - mouseRotated.get_y();

  if (this.entity.resize(
      (this.startSize[0] + this.startSize[0] * Math.abs(this.position[1]) + distance * Math.abs(this.position[0])) / 2,
      (this.startSize[1] + this.startSize[1] * Math.abs(this.position[0]) + distance * Math.abs(this.position[1])) / 2
    )) {

    this.entity.body.SetTransform(
      Geometry.pointRotate(
        this.startPosition,
        new b2Vec2(
          this.startPosition.get_x() + ((distance - this.startSize[0]) / 2) * this.position[0],
          this.startPosition.get_y() + ((distance - this.startSize[1]) / 2) * this.position[1]
        ),
        this.entity.body.GetAngle()
      ),

      this.entity.body.GetAngle()
    );

  }
};

Rectangle.prototype.startResize = function () {
  this.startSize = [
    this.entity.getWidth() / 2,
    this.entity.getHeight() / 2
  ];

  this.startDistance = Geometry.pointPointDistance(
    this.entity.body.GetPosition(),

    new b2Vec2(
      _engine.input.mouse.x,
      _engine.input.mouse.y
    )
  );
};

Rectangle.prototype.moveResize = function () {
  var scale = Geometry.pointPointDistance(
      this.entity.body.GetPosition(),

      new b2Vec2(
        _engine.input.mouse.x,
        _engine.input.mouse.y
      )
    ) / this.startDistance;

  this.entity.resize(this.startSize[0] * scale, this.startSize[1] * scale);
};

Rectangle.prototype.resize = function (halfWidth, halfHeight) {
  if (
    halfWidth * 2 < Constants.SHAPE_MIN_SIZE ||
    halfHeight * 2 < Constants.SHAPE_MIN_SIZE
  )
    return false;

  var newFix = new b2FixtureDef();
  newFix.set_density(this.fixture.GetDensity());
  newFix.set_friction(this.fixture.GetFriction());
  newFix.set_restitution(this.fixture.GetRestitution());
  newFix.set_filter(this.fixture.GetFilterData());

  var shape = new b2PolygonShape();
  shape.SetAsBox(halfWidth, halfHeight);
  this.extents = new b2Vec2(halfWidth, halfHeight);

  newFix.set_shape(shape);

  this.body.DestroyFixture(this.fixture);
  this.fixture = this.body.CreateFixture(newFix);

  this.recalculateHelpers();

  if (this === _engine.selectedEntity) {
    $("#entity_width").val(halfWidth * 2);
    $("#entity_height").val(halfHeight * 2);
  }

  return true;
};


module.exports.Circle = Circle;
module.exports.Rectangle = Rectangle;