var Geometry = require("./geometry");
var UpdateEvent = require("./updateEvent");
var Constants = require("./constants");

module.exports.REVOLUTE = "REVOLUTE";
module.exports.ROPE = "ROPE";
module.exports.WELD = "WELD";

var Joint = function (type, entityA, entityB, localAnchorA, localAnchorB, collide, id) {
  this.id = id;
  this.type = type == undefined ? "" : type;
  this.entityA = entityA == undefined ?  null : entityA;
  this.entityB = entityB == undefined ?  null : entityB;
  this.localAnchorA = localAnchorA == undefined ?  [0, 0] : localAnchorA;
  this.localAnchorB = localAnchorB == undefined ?  [0, 0] : localAnchorB;
  this.collide = collide == undefined ?  false : collide;
  this.jointObject = null;
  this.color = "black";
};

Joint.getDefinition = function (def) {
  def.set_bodyA(this.entityA.body);
  def.set_bodyB(this.entityB.body);
  def.set_localAnchorA(new b2Vec2(this.localAnchorA[0], this.localAnchorA[1]));
  def.set_localAnchorB(new b2Vec2(this.localAnchorB[0], this.localAnchorB[1]));
  def.set_collideConnected(this.collide);
};

Joint.isCorrect = function () {
  return this.entityA && this.entityB && this.localAnchorA.length === 2 && this.localAnchorB.length === 2;
};

Joint.export = function () {
  return {
    type: this.type,
    id: this.id,
    entityA: this.entityA.id,
    entityB: this.entityB.id,
    localAnchorA: this.localAnchorA,
    localAnchorB: this.localAnchorB,
    collide: this.collide
  };
};

Joint.import = function (obj) {
  this.entityA = _engine.entityManager.getEntityById(obj.entityA);
  this.entityB = _engine.entityManager.getEntityById(obj.entityB);
  this.localAnchorA = obj.localAnchorA;
  this.localAnchorB = obj.localAnchorB;
  this.collide = obj.collide;
  this.id = obj.id;

  _engine.jointManager.addJoint(this, true);
};

Joint.draw = function (ctx) {
  ctx.save();

  var A = this.getWorldPosA();
  var B = this.getWorldPosB();

  ctx.translate(
    _engine.viewport.fromScale(-_engine.viewport.x) + _engine.viewport.width / 2,
    _engine.viewport.fromScale(-_engine.viewport.y) + _engine.viewport.height / 2);

  ctx.strokeStyle = this.color;
  ctx.lineWidth = 2;

  if (_engine.selected.ptr === this) {
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    ctx.strokeStyle = "white";
  }

  ctx.globalAlpha = 0.3;

  ctx.beginPath();
  ctx.moveTo(_engine.viewport.fromScale(A.get_x()), _engine.viewport.fromScale(A.get_y()));
  ctx.lineTo(_engine.viewport.fromScale(B.get_x()), _engine.viewport.fromScale(B.get_y()));
  ctx.closePath();
  ctx.stroke();

  if(!_engine.world.paused) {
    ctx.restore();
    destroy(A);
    destroy(B);

    return;
  }

  ctx.globalAlpha = 1;

  ctx.fillStyle = this.entityA.getColor();

  ctx.beginPath();
  ctx.arc(_engine.viewport.fromScale(A.get_x()), _engine.viewport.fromScale(A.get_y()), Constants.JOINT_HEAD_RADIUS, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = this.entityB.getColor();

  ctx.beginPath();
  ctx.arc(_engine.viewport.fromScale(B.get_x()), _engine.viewport.fromScale(B.get_y()), Constants.JOINT_HEAD_RADIUS, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  destroy(A);
  destroy(B);
};

Joint.prototype.draw = function (ctx) {
  Joint.draw.call(this, ctx);
};

Joint.prototype.setId = function (id) {
  this.id = id;
};

Joint.prototype.setCollide = function (val, silent) {
  this.collide = val;

  this.updateObject();

  if(!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_ENTITY_CHANGE);
};

Joint.prototype.getIDA = function () {
  return this.entityA == undefined ? "" : this.entityA.id;
};

Joint.prototype.getIDB = function () {
  return this.entityB == undefined ? "" : this.entityB.id;
};

Joint.prototype.setEntityA = function (entity, silent) {
  this.entityA = entity;

  this.updateObject();

  if(!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_ENTITY_CHANGE);
};

Joint.prototype.setEntityB = function (entity, silent) {
  this.entityB = entity;

  this.updateObject();

  if(!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_ENTITY_CHANGE);
};

Joint.prototype.setPosA = function (x, y, silent) {
  this.localAnchorA = [x, y];

  this.updateObject();

  if(!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_REPOSITION);
};

Joint.prototype.setPosB = function (x, y, silent) {
  this.localAnchorB = [x, y];

  this.updateObject();

  if(!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_REPOSITION);
};


Joint.prototype.getWorldPosA = function () {
  return Geometry.pointRotate(
    this.entityA.getPosition(),
    new b2Vec2(this.entityA.getX() + this.localAnchorA[0], this.entityA.getY() + this.localAnchorA[1]),
    this.entityA.getAngle()
  );
};

Joint.prototype.getWorldPosB = function () {
  return Geometry.pointRotate(
    this.entityB.getPosition(),
    new b2Vec2(this.entityB.getX() + this.localAnchorB[0], this.entityB.getY() + this.localAnchorB[1]),
    this.entityB.getAngle()
  );
};

Joint.prototype.setWorldPosA = function (x, y, silent) {
  var rotated = Geometry.pointRotate(this.entityA.getPosition(), new b2Vec2(x, y), -this.entityA.getAngle());
  this.setPosA(rotated.get_x() - this.entityA.getX(), rotated.get_y() - this.entityA.getY(), silent);
};

Joint.prototype.setWorldPosB = function (x, y, silent) {
  var rotated = Geometry.pointRotate(this.entityB.getPosition(), new b2Vec2(x, y), -this.entityB.getAngle());
  this.setPosB(rotated.get_x() - this.entityB.getX(), rotated.get_y() - this.entityB.getY(), silent);
};

Joint.prototype.getXA = function () {
  return this.localAnchorA[0];
};

Joint.prototype.getYA = function () {
  return this.localAnchorA[1];
};

Joint.prototype.getXB = function () {
  return this.localAnchorB[0];
};

Joint.prototype.getYB = function () {
  return this.localAnchorB[1];
};

Joint.prototype.setXA = function (val, silent) {
  this.setPosA(val, this.getYA(), silent);
};

Joint.prototype.setYA = function (val, silent) {
  this.setPosA(this.getXA(), val, silent);
};

Joint.prototype.setXB = function (val, silent) {
  this.setPosB(val, this.getYB(), silent);
};

Joint.prototype.setYB = function (val, silent) {
  this.setPosB(this.getXB(), val, silent);
};

Joint.prototype.updateObject = function () {
  if (this.jointObject == undefined)
    return;

  _engine.jointManager.removeJoint(this, true);
  _engine.jointManager.addJoint(this, true);
};



var Revolute = function (entityA, entityB, localAnchorA, localAnchorB, collide, id) {
  Joint.call(this, module.exports.REVOLUTE, entityA, entityB, localAnchorA, localAnchorB, collide, id);
  this.color = "green";
};
Revolute.prototype = new Joint();
Revolute.prototype.constructor = Revolute;

Revolute.import = function (obj) {
  var ret = new Revolute();

  Joint.import.call(ret, obj);

  return ret;
};


Revolute.prototype.export = function () {
  var ret = Joint.export.call(this);

  return ret;
};

Revolute.prototype.isCorrect = function() {
  return Joint.isCorrect.call(this);
};

Revolute.prototype.getDefinition = function () {
  var def = new b2RevoluteJointDef();

  Joint.getDefinition.call(this, def);

  return def;
};

module.exports.Revolute = Revolute;



var Rope = function (entityA, entityB, localAnchorA, localAnchorB, collide, maxLength, id) {
  Joint.call(this, module.exports.ROPE, entityA, entityB, localAnchorA, localAnchorB, collide, id);
  this.maxLength = maxLength == undefined ? 1 : maxLength;
  this.color = "orange";
};
Rope.prototype = new Joint();
Rope.prototype.constructor = Rope;

Rope.import = function (obj) {
  var ret = new Rope();

  ret.maxLength = obj.maxLength;
  Joint.import.call(ret, obj);

  return ret;
};


Rope.prototype.export = function () {
  var ret = Joint.export.call(this);
  ret.maxLength = this.maxLength;

  return ret;
};

Rope.prototype.isCorrect = function() {
  return Joint.isCorrect.call(this) && this.maxLength > 0;
};

Rope.prototype.getDefinition = function () {
  var def = new b2RopeJointDef();

  Joint.getDefinition.call(this, def);
  def.set_maxLength(this.maxLength, true);

  return def;
};

Rope.prototype.setMaxLength = function (val, silent) {
  this.maxLength = val;

  this.updateObject();

  if (!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_PROPERTY_CHANGE);
};

module.exports.Rope = Rope;



var Weld = function (entityA, entityB, localAnchorA, localAnchorB, collide, id) {
  Joint.call(this, module.exports.WELD, entityA, entityB, localAnchorA, localAnchorB, collide, id);
  this.color = "blue";

  this.damping = 0;
  this.dampingFrequency = 0;
};
Weld.prototype = new Joint();
Weld.prototype.constructor = Weld;

Weld.import = function (obj) {
  var ret = new Weld();

  Joint.import.call(ret, obj);
  ret.setDamping(obj.damping, true);
  ret.setDampingFrequency(obj.dampingFrequency, true);

  return ret;
};

Weld.prototype.setDamping = function (val, silent) {
  this.damping = (val <= 1 && val >= 0) ? val : this.damping;

  this.updateObject();

  if (!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_PROPERTY_CHANGE);
};

Weld.prototype.setDampingFrequency = function (val, silent) {
  this.dampingFrequency = val >= 0 ? val : this.dampingFrequency;

  this.updateObject();

  if (!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_PROPERTY_CHANGE);
};


Weld.prototype.export = function () {
  var ret = Joint.export.call(this);
  ret.damping = this.damping;
  ret.dampingFrequency = this.dampingFrequency;

  return ret;
};

Weld.prototype.isCorrect = function() {
  return Joint.isCorrect.call(this);
};

Weld.prototype.getDefinition = function () {
  var def = new b2WeldJointDef();

  Joint.getDefinition.call(this, def);
  def.set_referenceAngle(this.entityB.getAngle() - this.entityA.getAngle());
  def.set_dampingRatio(this.damping);
  def.set_frequencyHz(this.dampingFrequency);

  return def;
};

module.exports.Weld = Weld;