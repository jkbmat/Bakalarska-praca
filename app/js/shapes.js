var Entity = require("./entity.js");
var Constants = require("./constants.js");
var ClickableHelper = require("./clickableHelper.js");
var Geometry = require("./geometry.js");
var UpdateEvent = require("./updateEvent.js");

// Circle entity
var Circle = function (center, radius, fixture, id, collisionGroup) {
  center = center == undefined ? new b2Vec2(0, 0) : center;
  radius = radius == undefined ? 1 : radius;

  var shape = new b2CircleShape();
  shape.set_m_radius(radius);

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.radius = radius;

  this.type = "CIRCLE";

  return this;
};
Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.import = function (obj) {
  var ret = new Circle();

  Entity.import.call(ret, obj);
  ret.resize(obj.width / 2, true);

  return ret;
};

Circle.prototype.export = function() {
  return Entity.export.call(this);
};


Circle.prototype.getWidth = function () {
  return this.radius * 2;
};

Circle.prototype.getHeight = function () {
  return this.radius * 2;
};

Circle.prototype.addHelpers = function () {
  this.helpers = [
    new ClickableHelper(this, 15, 15, Constants.POSITION_TOP_RIGHT, 'img/resize-sw-ne.svg', this.moveResize, this.startResize, endResizeRotate),
    new ClickableHelper(this, 15, 15, Constants.POSITION_TOP_LEFT, 'img/rotate.svg', this.moveRotate, this.startRotate, endResizeRotate)
  ];
};

Circle.prototype.draw = function (ctx) {
  ctx.beginPath();

  ctx.arc(0, 0, _engine.viewport.fromScale(this.radius), 0, 2 * Math.PI, false);

  ctx.closePath();

  ctx.fill();

  ctx.strokeStyle = "red";
  ctx.globalCompositeOperation = "destination-out";

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, _engine.viewport.fromScale(this.radius));
  ctx.closePath();
  ctx.stroke();
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

  this.entity.toggleHelpers(false);
};

Circle.prototype.moveResize = function () {
  var scale = Geometry.pointPointDistance(
      new b2Vec2(this.entity.getX(), this.entity.getY()),

      new b2Vec2(
        _engine.input.mouse.x,
        _engine.input.mouse.y
      )
    ) / this.startDistance;

  this.entity.resize(this.startSize * scale, true);
};

Circle.prototype.resize = function (radius, silent) {
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

  if(!silent)
    UpdateEvent.fire(UpdateEvent.RESIZE, {entities: [this]});

  return true;
};


// Rectangle entity
var Rectangle = function (center, extents, fixture, id, collisionGroup) {
  center = center == undefined ? new b2Vec2(0, 0) : center;
  extents = extents == undefined ? new b2Vec2(1, 1) : extents;

  var shape = new b2PolygonShape();
  shape.SetAsBox(extents.get_x(), extents.get_y());

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.extents = extents;

  this.type = "RECTANGLE";

  return this;
};
Rectangle.prototype = new Entity();
Rectangle.prototype.constructor = Rectangle;

Rectangle.import = function (obj) {
  var ret = new Rectangle();

  Entity.import.call(ret, obj);
  ret.resize(obj.width / 2, obj.height / 2, true);

  return ret;
};

Rectangle.prototype.export = function() {
  return Entity.export.call(this);
};


Rectangle.prototype.getWidth = function () {
  return this.extents.get_x() * 2;
};

Rectangle.prototype.getHeight = function () {
  return this.extents.get_y() * 2;
};

Rectangle.prototype.addHelpers = function () {
  this.helpers = [
    new ClickableHelper(this, 15, 15, Constants.POSITION_TOP_RIGHT, 'img/resize-sw-ne.svg', this.moveResize, this.startResize, endResizeRotate),
    new ClickableHelper(this, 15, 15, Constants.POSITION_TOP_LEFT, 'img/rotate.svg', this.moveRotate, this.startRotate, endResizeRotate),
    new ClickableHelper(this, 7, 7, Constants.POSITION_BOTTOM, 'img/handle.svg', this.moveResizeSide, this.startResizeSide, endResizeRotate),
    new ClickableHelper(this, 7, 7, Constants.POSITION_TOP, 'img/handle.svg', this.moveResizeSide, this.startResizeSide, endResizeRotate),
    new ClickableHelper(this, 7, 7, Constants.POSITION_LEFT, 'img/handle.svg', this.moveResizeSide, this.startResizeSide, endResizeRotate),
    new ClickableHelper(this, 7, 7, Constants.POSITION_RIGHT, 'img/handle.svg', this.moveResizeSide, this.startResizeSide, endResizeRotate),
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

  this.entity.toggleHelpers(false);
};

Rectangle.prototype.moveResizeSide = function () {
  var mouseRotated = Geometry.pointRotate(
    this.startPosition,
    new b2Vec2(_engine.input.mouse.x, _engine.input.mouse.y),
    -(this.entity.getAngle() + Constants.sideOrder.equalIndexOf(this.position) * (Math.PI / 2))
  );

  var distance = this.startPosition.get_y() - mouseRotated.get_y();

  if (this.entity.resize(
      (this.startSize[0] + this.startSize[0] * Math.abs(this.position[1]) + distance * Math.abs(this.position[0])) / 2,
      (this.startSize[1] + this.startSize[1] * Math.abs(this.position[0]) + distance * Math.abs(this.position[1])) / 2,
      true
    )) {

    this.entity.setPosition(
      Geometry.pointRotate(
        this.startPosition,
        new b2Vec2(
          this.startPosition.get_x() + ((distance - this.startSize[0]) / 2) * this.position[0],
          this.startPosition.get_y() + ((distance - this.startSize[1]) / 2) * this.position[1]
        ),
        this.entity.getAngle()
      ), null, true
    );

  }
};

Rectangle.prototype.startResize = function () {
  this.startSize = [
    this.entity.getWidth() / 2,
    this.entity.getHeight() / 2
  ];

  this.startDistance = Geometry.pointPointDistance(
    this.entity.getPosition(),

    new b2Vec2(
      _engine.input.mouse.x,
      _engine.input.mouse.y
    )
  );

  this.entity.toggleHelpers(false);
};

Rectangle.prototype.moveResize = function () {
  var scale = Geometry.pointPointDistance(
      this.entity.getPosition(),

      new b2Vec2(
        _engine.input.mouse.x,
        _engine.input.mouse.y
      )
    ) / this.startDistance;

  this.entity.resize(this.startSize[0] * scale, this.startSize[1] * scale, true);
};

Rectangle.prototype.resize = function (halfWidth, halfHeight, silent) {
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

  if(!silent)
    UpdateEvent.fire(UpdateEvent.RESIZE, {entities: [this]});

  return true;
};

function endResizeRotate() {
  UpdateEvent.fire(UpdateEvent.RESIZE, {entities: [_engine.selected.ptr], noState: true});
  UpdateEvent.fire(UpdateEvent.ROTATE, {entities: [_engine.selected.ptr], noState: true});
  UpdateEvent.fire(UpdateEvent.REPOSITION, {entities: [_engine.selected.ptr]});

  _engine.selected.ptr.toggleHelpers(false);
}

module.exports.Circle = Circle;
module.exports.Rectangle = Rectangle;