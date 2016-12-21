module.exports.REVOLUTE = "revolute";
module.exports.ROPE = "rope";

var Joint = function (type, entityA, entityB, localAnchorA, localAnchorB, collide, id) {
  this.id = id;
  this.type = type;
  this.entityA = entityA;
  this.entityB = entityB;
  this.localAnchorA = localAnchorA;
  this.localAnchorB = localAnchorB;
  this.collide = collide;
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
  this.entityA = _engine.getEntityById(obj.entityA);
  this.entityB = _engine.getEntityById(obj.entityB);
  this.localAnchorA = obj.localAnchorA;
  this.localAnchorB = obj.localAnchorB;
  this.collide = obj.collide;
  this.id = obj.id;

  _engine.addJoint(this, true);
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

Revolute.prototype.getDefinition = function () {
  var def = new b2RevoluteJointDef();

  Joint.getDefinition.call(this, def);

  return def;
};

module.exports.Revolute = Revolute;



var Rope = function (entityA, entityB, localAnchorA, localAnchorB, collide, maxLength, id) {
  Joint.call(this, module.exports.ROPE, entityA, entityB, localAnchorA, localAnchorB, collide, id);
  this.maxLength = maxLength;
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

Rope.prototype.getDefinition = function () {
  var def = new b2RopeJointDef();

  Joint.getDefinition.call(this, def);
  def.set_maxLength(this.maxLength);

  return def;
};


module.exports.Rope = Rope;

