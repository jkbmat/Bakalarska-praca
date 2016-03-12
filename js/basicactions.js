var aSetColor = function(ef, color)
{
  this.color = color;

  Action.call(this, ef, arguments, [TYPE_ENTITYFILTER, TYPE_STRING]);
}
aSetColor.prototype = new Action();
aSetColor.prototype.constructor = aSetColor;

aSetColor.prototype.each = function(entity)
{
  entity.setColor(this.color.evaluate());
}

var aTorque = function(ef, strength)
{
  this.strength = strength;

  Action.call(this, ef, arguments, [TYPE_ENTITYFILTER, TYPE_NUMBER]);
}
aTorque.prototype = new Action();
aTorque.prototype.constructor = aTorque;

aTorque.prototype.each = function(entity)
{
  entity.body.ApplyTorque(entity.getMass() * this.strength.evaluate());
}

var aAngularImpulse = function(ef, strength)
{
  this.strength = strength;

  Action.call(this, ef, arguments, [TYPE_ENTITYFILTER, TYPE_NUMBER]);
}
aAngularImpulse.prototype = new Action();
aAngularImpulse.prototype.constructor = aAngularImpulse;

aAngularImpulse.prototype.each = function(entity)
{
  entity.body.ApplyAngularImpulse(entity.getMass() * this.strength.evaluate());
}

var aLinearVelocity = function(ef, x, y)
{
  this.x = x;
  this.y = y;

  Action.call(this, ef, arguments, [TYPE_ENTITYFILTER, TYPE_NUMBER, TYPE_NUMBER]);
}
aLinearVelocity.prototype = new Action();
aLinearVelocity.prototype.constructor = aLinearVelocity;

aLinearVelocity.prototype.each = function(entity)
{
  entity.setLinearVelocity(new b2Vec2(this.x.evaluate(), this.y.evaluate()));
}

var aLinearVelocityX = function(ef, x)
{
  this.x = x;

  Action.call(this, ef, arguments, [TYPE_ENTITYFILTER, TYPE_NUMBER]);
}
aLinearVelocityX.prototype = new Action();
aLinearVelocityX.prototype.constructor = aLinearVelocityX;

aLinearVelocityX.prototype.each = function(entity)
{
  var v = entity.getLinearVelocity();
  v.set_x(this.x.evaluate());
  entity.setLinearVelocity(v);
}

var aLinearVelocityY = function(ef, y)
{
  this.y = y;

  Action.call(this, ef, arguments, [TYPE_ENTITYFILTER, TYPE_NUMBER]);
}
aLinearVelocityY.prototype = new Action();
aLinearVelocityY.prototype.constructor = aLinearVelocityY;

aLinearVelocityY.prototype.each = function(entity)
{
  var v = entity.getLinearVelocity();
  v.set_y(this.y.evaluate());
  entity.setLinearVelocity(v);
}

var aLinearImpulse = function(ef, x, y)
{
  this.x = x;
  this.y = y;

  Action.call(this, ef, arguments, [TYPE_ENTITYFILTER, TYPE_NUMBER, TYPE_NUMBER]);
}
aLinearImpulse.prototype = new Action();
aLinearImpulse.prototype.constructor = aLinearImpulse;

aLinearImpulse.prototype.each = function(entity)
{
  entity.applyLinearImpulse(new b2Vec2(entity.getMass() * this.x.evaluate(), entity.getMass() * this.y.evaluate()));
}
