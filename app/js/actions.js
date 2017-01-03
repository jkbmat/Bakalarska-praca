var Action = require("./token.js").Action;
var Type = require("./typing.js").Type;

module.exports = [];

var aSetColor = function(ef, color) {
  Action.call(this, "setColor", arguments, [Type.ENTITYFILTER, Type.STRING]);

  this.args.push(ef);
  this.args.push(color);
};
aSetColor.prototype = new Action();

aSetColor.prototype.each = function(entity) {
  entity.setColor(this.args[1].evaluate(), true);
};

aSetColor.prototype.constructor = aSetColor;
module.exports.push(aSetColor);


var aTorque = function(ef, strength) {
  Action.call(this, "applyTorque", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(strength);
};
aTorque.prototype = new Action();

aTorque.prototype.each = function(entity) {
  entity.body.SetAwake(1);
  entity.body.ApplyTorque(entity.getMass() * this.args[1].evaluate());
};

aTorque.prototype.constructor = aTorque;
module.exports.push(aTorque);


var aAngularImpulse = function(ef, strength) {
  Action.call(this, "applyAngularImpulse", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(strength);
};
aAngularImpulse.prototype = new Action();

aAngularImpulse.prototype.each = function(entity) {
  entity.body.SetAwake(1);
  entity.body.ApplyAngularImpulse(entity.getMass() * this.args[1].evaluate());
};

aAngularImpulse.prototype.constructor = aAngularImpulse;
module.exports.push(aAngularImpulse);


var aLinearVelocity = function(ef, x, y) {
  Action.call(this, "setLinearVelocity", arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
};
aLinearVelocity.prototype = new Action();

aLinearVelocity.prototype.each = function(entity) {
  entity.body.SetAwake(1);
  entity.setLinearVelocity(new b2Vec2(this.args[1].evaluate(), this.args[2].evaluate()));
};

aLinearVelocity.prototype.constructor = aLinearVelocity;
module.exports.push(aLinearVelocity);


var aLinearImpulse = function(ef, x, y) {
  Action.call(this, "applyLinearImpulse", arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
};
aLinearImpulse.prototype = new Action();

aLinearImpulse.prototype.each = function(entity) {
  entity.body.SetAwake(1);
  entity.applyLinearImpulse(new b2Vec2(entity.getMass() * this.args[1].evaluate(), entity.getMass() * this.args[2].evaluate()));
};

aLinearImpulse.prototype.constructor = aLinearImpulse;
module.exports.push(aLinearImpulse);


var aLinearForce = function(ef, x, y) {
  Action.call(this, "applyLinearForce", arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
};
aLinearForce.prototype = new Action();

aLinearForce.prototype.each = function(entity) {
  entity.body.SetAwake(1);
  entity.body.ApplyForceToCenter(new b2Vec2(entity.getMass() * this.args[1].evaluate(), entity.getMass() * this.args[2].evaluate()));
};

aLinearForce.prototype.constructor = aLinearForce;
module.exports.push(aLinearForce);


var aSetPosition = function(ef, x, y) {
  Action.call(this, "setPosition", arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
};
aSetPosition.prototype = new Action();

aSetPosition.prototype.each = function(entity) {console.log(entity.id, _engine.world.IsLocked())
  entity.setPosition(this.args[1].evaluate(), this.args[2].evaluate(), true);
};

aSetPosition.prototype.constructor = aSetPosition;
module.exports.push(aSetPosition);

