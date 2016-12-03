var Entity = require("./entity.js");
var Constants = require("./constants.js");
var ClickableHelper = require("./clickablehelper.js");

// Circle entity
var Circle = function(center, radius, fixture, id, collisionGroup) {
  var shape = new b2CircleShape();
  shape.set_m_radius(radius);

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.radius = radius;

  this.nameString = 19;

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
  ];
};

Circle.prototype.draw = function(ctx) {
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
  this.startSize = _engine.selectedEntity.getWidth() / 2;

  this.startDistance = _engine.getDistance(
    new b2Vec2(_engine.selectedEntity.getX(), _engine.selectedEntity.getY()),

    new b2Vec2(
      _engine.input.mouse.x,
      _engine.input.mouse.y
    )
  );
};

Circle.prototype.moveResize = function () {
  var scale = _engine.getDistance(
      new b2Vec2(_engine.selectedEntity.getX(), _engine.selectedEntity.getY()),

      new b2Vec2(
        _engine.input.mouse.x,
        _engine.input.mouse.y
      )
    ) / this.startDistance;

  _engine.selectedEntity.resize(this.startSize * scale);
};

Circle.prototype.resize = function(radius) {
  if(radius < Constants.SHAPE_MIN_SIZE / 2)
    return;

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
};


// Rectangle entity
var Rectangle = function(center, extents, fixture, id, collisionGroup) {
  var shape = new b2PolygonShape();
  shape.SetAsBox(extents.get_x(), extents.get_y());

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.extents = extents;

  this.nameString = 18;

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
    new ClickableHelper(this, 7, 7, Constants.POSITION_BOTTOM, 'img/handle.svg'),
    new ClickableHelper(this, 7, 7, Constants.POSITION_TOP, 'img/handle.svg'),
    new ClickableHelper(this, 7, 7, Constants.POSITION_LEFT, 'img/handle.svg'),
    new ClickableHelper(this, 7, 7, Constants.POSITION_RIGHT, 'img/handle.svg'),
  ];
};

Rectangle.prototype.draw = function(ctx) {
  var halfWidth = _engine.viewport.fromScale(this.extents.get_x());
  var halfHeight = _engine.viewport.fromScale(this.extents.get_y());

  ctx.fillRect(-halfWidth, -halfHeight, halfWidth * 2, halfHeight * 2);
};

Rectangle.prototype.startResize = function () {
  this.startSize = [
    _engine.selectedEntity.extents.get_x(),
    _engine.selectedEntity.extents.get_y()
  ];

  this.startDistance = _engine.getDistance(
    _engine.selectedEntity.body.GetPosition(),

    new b2Vec2(
      _engine.input.mouse.x,
      _engine.input.mouse.y
    )
  );
};

Rectangle.prototype.moveResize = function () {
  var scale = _engine.getDistance(
    _engine.selectedEntity.body.GetPosition(),

    new b2Vec2(
      _engine.input.mouse.x,
      _engine.input.mouse.y
    )
  ) / this.startDistance;

  _engine.selectedEntity.resize(this.startSize[0] * scale, this.startSize[1] * scale);
};

Rectangle.prototype.resize = function (halfWidth, halfHeight) {
  if(
    halfWidth * 2 < Constants.SHAPE_MIN_SIZE ||
    halfHeight * 2 < Constants.SHAPE_MIN_SIZE
  )
    return;

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
};


module.exports.Circle = Circle;
module.exports.Rectangle = Rectangle;