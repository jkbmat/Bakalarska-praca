// ENTITY
var Utils = require("./utils.js");
var Constants = require("./constants.js");
var Geometry = require("./geometry.js");

var AUTO_COLOR_RANGE = [0, 230];

var Entity = function (shape, fixture, body, id, collisionGroup) {
  this.id = id;
  this.dead = false;
  this.layer = 0;
  this.helpers = [];

  this.fixedRotation = false;

  this.collisionGroup = collisionGroup;
  if (this.collisionGroup == undefined) {
    this.collisionGroup = 0;
  }

  this.behaviors = [];

  this.fixture = fixture;
  if (this.fixture == undefined) {
    var fix = new b2FixtureDef();
    fix.set_density(10);
    fix.set_friction(0.5);
    fix.set_restitution(0.2);

    this.fixture = fix;
  }
  this.fixture.set_shape(shape);

  var filterData = this.fixture.get_filter();
  filterData.set_categoryBits(1 << collisionGroup);

  // Constructor is called when inheriting, so we need to check for _engine availability
  if (typeof _engine !== 'undefined')
    filterData.set_maskBits(_engine.collisionGroups[this.collisionGroup].mask);

  this.fixture.set_filter(filterData);

  this.body = body;
  if (this.body !== undefined)
    this.body.set_fixedRotation(false);

  // Auto generate color
  var r = Utils.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]).toString(16);
  r = r.length == 1 ? "0" + r : r;
  var g = Utils.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]).toString(16);
  g = g.length == 1 ? "0" + g : g;
  var b = Utils.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]).toString(16);
  b = b.length == 1 ? "0" + b : b;
  this.color = "#" + r + g + b;
};

Entity.prototype.getX = function () {
  return this.body.GetPosition().get_x();
};

Entity.prototype.getY = function () {
  return this.body.GetPosition().get_y();
};

Entity.prototype.getWidth = function () {
  throw "ERROR! Cannot get width: Use derived class.";
};

Entity.prototype.getHeight = function () {
  throw "ERROR! Cannot get height: Use derived class.";
};

Entity.prototype.addHelpers = function () {
  throw "ERROR! Cannot add helpers: Use derived class.";
};

Entity.prototype.recalculateHelpers = function () {
  for (var i = 0; i < this.helpers.length; i++) {
    this.helpers[i].recalculatePosition();
  }
};

Entity.prototype.startRotate = function () {
  this.startRotation = this.entity.body.GetAngle();
  this.startPosition = new b2Vec2(_engine.input.mouse.x, _engine.input.mouse.y);
};

Entity.prototype.moveRotate = function () {
  this.entity.rotate(
    this.startRotation + Geometry.findAngleWithNegative(
      this.startPosition,
      new b2Vec2(_engine.input.mouse.x, _engine.input.mouse.y),
      this.entity.body.GetPosition()
    )
  );
};

Entity.prototype.rotate = function (angle) {console.log(angle);
  var radians = (angle + 2 * Math.PI) % (2 * Math.PI);
  var degrees = radians * (180 / Math.PI);

  this.body.SetTransform(this.body.GetPosition(), radians);

  if(this === _engine.selectedEntity) {
    $("#entity_rotation").val(degrees);
    $("#entity_rotation-input").val(degrees);
  }
};

Entity.prototype.getSide = function (position) {
  var centerX = this.getX();
  var centerY = this.getY();
  var center = new b2Vec2(centerX, centerY);
  var width = this.getWidth();
  var height = this.getHeight();

  var rotation = Constants.sideOrder.equalIndexOf(position) * (Math.PI / 2);
  var topA = new b2Vec2(centerX - (width / 2), centerY - (height / 2));
  var topB = new b2Vec2(centerX + (width / 2), centerY - (height / 2));
  var a = Geometry.pointRotate(center, topA, rotation);
  var b = Geometry.pointRotate(center, topB, rotation);

  return [a, b];
};

Entity.prototype.die = function () {
  this.dead = true;

  return this;
};

Entity.prototype.draw = function () {
  throw "ERROR! Cannot draw Entity: Use derived classes.";
};

Entity.prototype.setColor = function (color) {
  this.color = color;

  return this;
};

Entity.prototype.setId = function (id) {
  this.id = id;

  return this;
};


Entity.prototype.setCollisionGroup = function (group) {
  this.collisionGroup = group;

  var filterData = this.fixture.GetFilterData();
  filterData.set_categoryBits(1 << group);
  this.fixture.SetFilterData(filterData);

  _engine.updateCollision(this);

  return this;
};

Entity.prototype.getLinearVelocity = function () {
  return this.body.GetLinearVelocity();
};

Entity.prototype.getMass = function () {
  return Math.max(1, this.body.GetMass());
};

Entity.prototype.setLinearVelocity = function (vector) {
  this.body.SetLinearVelocity(vector);

  return this;
};

Entity.prototype.applyTorque = function (force) {
  this.body.ApplyTorque(force);

  return this;
};

Entity.prototype.applyLinearImpulse = function (vector) {
  this.body.ApplyLinearImpulse(vector, this.body.GetWorldCenter());

  return this;
};

Entity.prototype.disableRotation = function (value) {
  this.fixedRotation = value;
  this.body.SetFixedRotation(value)

  return this;
};

Entity.prototype.addBehavior = function (behavior) {
  this.behaviors.push(behavior);

  return this;
};


module.exports = Entity;