// ENTITY
var Utils = require("./utils.js");
var Constants = require("./constants.js");
var Geometry = require("./geometry.js");
var UpdateEvent = require("./updateEvent.js");
var Behavior = require("./behavior.js");
var _ = require("lodash");

var Entity = function (shape, fixture, body, id, collisionGroup) {
  this.id = id;
  this.dead = false;
  this.layer = 0;
  this.isBullet = false;

  this.helpers = [];
  this.showHelpers = true;

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
    filterData.set_maskBits(_engine.entityManager.collisionGroups[this.collisionGroup].mask);

  this.fixture.set_filter(filterData);

  this.body = body;
  if (this.body !== undefined)
    this.body.set_fixedRotation(false);

  // Auto generate color
  var r = Utils.randomRange(Constants.AUTO_COLOR_RANGE[0], Constants.AUTO_COLOR_RANGE[1]).toString(16);
  r = r.length == 1 ? "0" + r : r;
  var g = Utils.randomRange(Constants.AUTO_COLOR_RANGE[0], Constants.AUTO_COLOR_RANGE[1]).toString(16);
  g = g.length == 1 ? "0" + g : g;
  var b = Utils.randomRange(Constants.AUTO_COLOR_RANGE[0], Constants.AUTO_COLOR_RANGE[1]).toString(16);
  b = b.length == 1 ? "0" + b : b;
  this.color = "#" + r + g + b;
};

Entity.export = function () {
  return {
    x: this.getX(),
    y: this.getY(),
    width: this.getWidth(),
    height: this.getHeight(),
    angle: this.getAngle(),
    fixedRotation: this.fixedRotation,
    type: this.type,
    isBullet: this.isBullet,
    color: this.getColor(),
    restitution: this.getRestitution(),
    friction: this.getFriction(),
    density: this.getDensity(),
    bodyType: this.getBodyType(),
    id: this.id,
    collisionGroup: this.collisionGroup,
    behaviors: _.map(this.behaviors, function (behavior) {
      return [
        behavior.logic.toString(),
        _.map(behavior.results, function (result) {
          return result.toString();
        })
      ];
    })
  };
};

Entity.import = function (obj) {
  _engine.entityManager.addEntity(this, obj.bodyType, true);

  this.setPosition(obj.x, obj.y, true);
  this.setAngle(obj.angle, false, true);
  this.disableRotation(obj.fixedRotation, true);
  this.setId(obj.id, true);
  this.setCollisionGroup(obj.collisionGroup, true);
  this.setColor(obj.color, true);
  this.setBullet(obj.isBullet, true);

  _.each(obj.behaviors, function(behavior) {
    this.addBehavior(new Behavior(
      _engine.tokenManager.parser.parse(behavior[0]),

      _.map(behavior[1], function (result) {
        return _engine.tokenManager.parser.parse(result);
      })
    ));
  }.bind(this));

  this.fixture.SetDensity(obj.density);
  this.fixture.SetFriction(obj.friction);
  this.fixture.SetRestitution(obj.restitution);
};


Entity.prototype.getPosition = function () {
  return this.body.GetPosition();
};

Entity.prototype.setPosition = function (x, y, silent) {
  if(y == undefined) { // supplied a b2Vec2
    y = x.get_y();
    x = x.get_x();
  }

  this.body.SetTransform(new b2Vec2(x, y), this.getAngle());

  if(!silent)
    UpdateEvent.fire(UpdateEvent.REPOSITION, {entities: [this]});
};

Entity.prototype.setBullet = function (val, silent) {
  this.isBullet = val;
  this.body.SetBullet(this.isBullet);

  if(!silent)
    UpdateEvent.fire(UpdateEvent.BULLET_CHANGE, {entities: [this]});
};

Entity.prototype.getAngle = function (degrees) {
  return degrees ?
    Geometry.clampDegrees(Geometry.toDegrees(this.body.GetAngle())) :
    Geometry.clampRadians(this.body.GetAngle());
};

Entity.prototype.setAngle = function (val, degrees, silent) {
  var radians = degrees ? Geometry.toRadians(val) : val;

  this.body.SetTransform(this.getPosition(), Geometry.clampRadians(radians));

  if(!silent)
    UpdateEvent.fire(UpdateEvent.ROTATE, {entities: [this]});
};

Entity.prototype.getX = function () {
  return this.body.GetPosition().get_x();
};

Entity.prototype.getY = function () {
  return this.body.GetPosition().get_y();
};

Entity.prototype.setX = function (val) {
  this.setPosition(val, this.getY());
};

Entity.prototype.setY = function (val) {
  this.setPosition(this.getX(), val);
};

Entity.prototype.getWidth = function () {
  throw new Error("ERROR! Cannot get width: Use derived class.");
};

Entity.prototype.getHeight = function () {
  throw new Error("ERROR! Cannot get height: Use derived class.");
};

Entity.prototype.getRestitution = function () {
  return this.fixture.GetRestitution();
};

Entity.prototype.setRestitution = function (val) {
  this.fixture.SetRestitution(val);
  this.body.ResetMassData();
  this.resize(this.getWidth() / 2, this.getHeight() / 2);
  _engine.world.Step(0, 0, 0);

  UpdateEvent.fire(UpdateEvent.RESTITUTION_CHANGE, {entities: [this]});
};

Entity.prototype.getFriction = function () {
  return this.fixture.GetFriction();
};

Entity.prototype.setFriction = function (val) {
  this.fixture.SetFriction(val);
  this.body.ResetMassData();
  this.resize(this.getWidth() / 2, this.getHeight() / 2);
  _engine.world.Step(0, 0, 0);

  UpdateEvent.fire(UpdateEvent.FRICTION_CHANGE, {entities: [this]});
};

Entity.prototype.getDensity = function () {
  return this.fixture.GetDensity();
};

Entity.prototype.setDensity = function (val) {
  this.fixture.SetDensity(val);
  this.body.ResetMassData();
  this.resize(this.getWidth() / 2, this.getHeight() / 2);
  _engine.world.Step(0, 0, 0);

  UpdateEvent.fire(UpdateEvent.DENSITY_CHANGE, {entities: [this]});
};

Entity.prototype.getColor = function () {
  return this.color;
};

Entity.prototype.setColor = function (color, silent) {
  this.color = color;

  if(!silent)
    UpdateEvent.fire(UpdateEvent.COLOR_CHANGE, {entities: [this]});

  return this;
};

Entity.prototype.getBodyType = function () {
  return this.body.GetType();
};

Entity.prototype.setBodyType = function (type, silent) {
  this.body.SetType(type);

  if (!silent)
    UpdateEvent.fire(UpdateEvent.BODY_TYPE_CHANGE, {entities: [this]});
};

Entity.prototype.addHelpers = function () {
  throw new Error("ERROR! Cannot add helpers: Use derived class.");
};

Entity.prototype.toggleHelpers = function (val) {
  _engine.selected.ptr.showHelpers = val ? val : !_engine.selected.ptr.showHelpers;
};

Entity.prototype.recalculateHelpers = function () {
  for (var i = 0; i < this.helpers.length; i++) {
    this.helpers[i].recalculatePosition();
  }
};

Entity.prototype.startRotate = function () {
  this.startRotation = this.entity.getAngle();
  this.startPosition = new b2Vec2(_engine.input.mouse.x, _engine.input.mouse.y);
  this.entity.toggleHelpers(false);
};

Entity.prototype.moveRotate = function () {
  this.entity.setAngle(
    this.startRotation + Geometry.findAngleWithNegative(
      this.startPosition,
      new b2Vec2(_engine.input.mouse.x, _engine.input.mouse.y),
      this.entity.getPosition()
    ),
    false, true
  );
};

Entity.prototype.draw = function () {
  throw new Error("ERROR! Cannot draw Entity: Use derived classes.");
};

Entity.prototype.setId = function (id, silent) {
  this.id = id;

  if (!silent)
    UpdateEvent.fire(UpdateEvent.ID_CHANGE, {entities: [this]});

  return this;
};


Entity.prototype.setCollisionGroup = function (group, silent) {
  this.collisionGroup = group;

  _engine.entityManager.updateCollision(this, silent);

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

Entity.prototype.disableRotation = function (value, silent) {
  this.fixedRotation = value;
  this.body.SetFixedRotation(value);

  if(!silent)
    UpdateEvent.fire(UpdateEvent.ROTATION_LOCKED, {entities: [this]});

  return this;
};

Entity.prototype.addBehavior = function (behavior) {
  this.behaviors.push(behavior);

  return this;
};


module.exports = Entity;