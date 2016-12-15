module.exports.REVOLUTE = "revolute";

var Joint = function (type, entityA, entityB, localAnchorA, localAnchorB, collide, id) {
  this.id = id;
  this.type = type;
  this.entityA = entityA;
  this.entityB = entityB;
  this.localAnchorA = localAnchorA;
  this.localAnchorB = localAnchorB;
  this.collide = collide;
  this.jointObject = null;
};

Joint.prototype.getDefinition = function (def) {
  def.set_bodyA(this.entityA.body);
  def.set_bodyB(this.entityB.body);
  def.set_localAnchorA(new b2Vec2(this.localAnchorA[0], this.localAnchorA[1]));
  def.set_localAnchorB(new b2Vec2(this.localAnchorB[0], this.localAnchorB[1]));
  def.set_collideConnected(this.collide);
};


var Revolute = function (entityA, entityB, localAnchorA, localAnchorB, collide, id) {
  Joint.call(this, module.exports.REVOLUTE, entityA, entityB, localAnchorA, localAnchorB, collide, id);
};
Revolute.prototype = new Joint();
Revolute.prototype.constructor = Revolute;


Revolute.prototype.getDefinition = function () {
  var def = new b2RevoluteJointDef();

  Joint.prototype.getDefinition.call(this, def);

  return def;
};

module.exports.Revolute = Revolute;

