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
  entity.body.ApplyTorque(this.strength.evaluate());
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
