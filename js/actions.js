var Behavior = require("./behavior.js");
var Action = require("./token.js").Action;
var Type = require("./typing.js").Type;

var aSetColor = function(ef, color) {
  Action.call(this, "setColor", arguments, [Type.ENTITYFILTER, Type.STRING]);

  this.args.push(ef);
  this.args.push(color);
}
aSetColor.prototype = new Action();
aSetColor.prototype.constructor = aSetColor;
Behavior.prototype.registerToken(aSetColor);

aSetColor.prototype.each = function(entity) {
  entity.setColor(this.args[1].evaluate());
}

var aTorque = function(ef, strength) {
  Action.call(this, "applyTorque", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(strength);
}
aTorque.prototype = new Action();
aTorque.prototype.constructor = aTorque;
Behavior.prototype.registerToken(aTorque);

aTorque.prototype.each = function(entity) {
  entity.body.ApplyTorque(entity.getMass() * this.args[1].evaluate());
}

var aAngularImpulse = function(ef, strength) {
  Action.call(this, "applyAngularImpulse", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(strength);
}
aAngularImpulse.prototype = new Action();
aAngularImpulse.prototype.constructor = aAngularImpulse;
Behavior.prototype.registerToken(aAngularImpulse);

aAngularImpulse.prototype.each = function(entity) {
  entity.body.ApplyAngularImpulse(entity.getMass() * this.args[1].evaluate());
}

var aLinearVelocity = function(ef, x, y) {
  Action.call(this, "setLinearVelocity", arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
}
aLinearVelocity.prototype = new Action();
aLinearVelocity.prototype.constructor = aLinearVelocity;
Behavior.prototype.registerToken(aLinearVelocity);

aLinearVelocity.prototype.each = function(entity) {
  entity.setLinearVelocity(new b2Vec2(this.args[1].evaluate(), this.args[2].evaluate()));
}

var aLinearImpulse = function(ef, x, y) {
  Action.call(this, "applyLinearImpulse", ef, arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
}
aLinearImpulse.prototype = new Action();
aLinearImpulse.prototype.constructor = aLinearImpulse;
Behavior.prototype.registerToken(aLinearImpulse);

aLinearImpulse.prototype.each = function(entity) {
  entity.applyLinearImpulse(new b2Vec2(entity.getMass() * this.args[1].evaluate(), entity.getMass() * this.args[2].evaluate()));
}
