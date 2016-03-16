var aSetColor = function(ef, color) {
  Action.call(this, "setColor", arguments, [TYPE_ENTITYFILTER, TYPE_STRING]);

  this.params.push(ef);
  this.params.push(color);
}
aSetColor.prototype = new Action();
aSetColor.prototype.constructor = aSetColor;
Behavior.registerToken(aSetColor);

aSetColor.prototype.each = function(entity) {
  entity.setColor(this.params[1].evaluate());
}

var aTorque = function(ef, strength) {
  Action.call(this, "applyTorque", arguments, [TYPE_ENTITYFILTER, TYPE_NUMBER]);

  this.params.push(ef);
  this.params.push(strength);
}
aTorque.prototype = new Action();
aTorque.prototype.constructor = aTorque;
Behavior.registerToken(aTorque);

aTorque.prototype.each = function(entity) {
  entity.body.ApplyTorque(entity.getMass() * this.params[1].evaluate());
}

var aAngularImpulse = function(ef, strength) {
  Action.call(this, "applyAngularImpulse", arguments, [TYPE_ENTITYFILTER, TYPE_NUMBER]);

  this.params.push(ef);
  this.params.push(strength);
}
aAngularImpulse.prototype = new Action();
aAngularImpulse.prototype.constructor = aAngularImpulse;
Behavior.registerToken(aAngularImpulse);

aAngularImpulse.prototype.each = function(entity) {
  entity.body.ApplyAngularImpulse(entity.getMass() * this.params[1].evaluate());
}

var aLinearVelocity = function(ef, x, y) {
  Action.call(this, "setLinearVelocity", arguments, [TYPE_ENTITYFILTER, TYPE_NUMBER, TYPE_NUMBER]);

  this.params.push(ef);
  this.params.push(x);
  this.params.push(y);
}
aLinearVelocity.prototype = new Action();
aLinearVelocity.prototype.constructor = aLinearVelocity;
Behavior.registerToken(aLinearVelocity);

aLinearVelocity.prototype.each = function(entity) {
  entity.setLinearVelocity(new b2Vec2(this.params[1].evaluate(), this.params[2].evaluate()));
}

var aLinearImpulse = function(ef, x, y) {
  Action.call(this, "applyLinearImpulse", ef, arguments, [TYPE_ENTITYFILTER, TYPE_NUMBER, TYPE_NUMBER]);

  this.params.push(ef);
  this.params.push(x);
  this.params.push(y);
}
aLinearImpulse.prototype = new Action();
aLinearImpulse.prototype.constructor = aLinearImpulse;
Behavior.registerToken(aLinearImpulse);

aLinearImpulse.prototype.each = function(entity) {
  entity.applyLinearImpulse(new b2Vec2(entity.getMass() * this.params[1].evaluate(), entity.getMass() * this.params[2].evaluate()));
}
