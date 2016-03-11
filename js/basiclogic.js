var lAnd = function(a, b)
{
  this.a = a;
  this.b = b;

  Logic.call(this, TYPE_BOOLEAN, arguments, [TYPE_BOOLEAN, TYPE_BOOLEAN]);
}
lAnd.prototype = new Logic();
lAnd.prototype.constructor = lAnd;

lAnd.prototype.evaluate = function()
{
  if(this.a.evaluate() && this.b.evaluate())
    return true;

  return false;
}

var lOr = function(a, b)
{
  this.a = a;
  this.b = b;

  Logic.call(this, TYPE_BOOLEAN, arguments, [TYPE_BOOLEAN, TYPE_BOOLEAN]);
}
lOr.prototype = new Logic();
lOr.prototype.constructor = lOr;

lOr.prototype.evaluate = function()
{
  if(this.a.evaluate() || this.b.evaluate())
    return true;

  return false;
}

var lNot = function(a)
{
  this.a = a;

  Logic.call(this, TYPE_BOOLEAN, arguments, [TYPE_BOOLEAN]);
}
lNot.prototype = new Logic();
lNot.prototype.constructor = lNot;

lNot.prototype.evaluate = function()
{
  return !this.a.evaluate();
}

var lString = function(value)
{
  this.value = value;

  Logic.call(this, TYPE_STRING);
}
lString.prototype = new Logic();
lString.prototype.constructor = lString;

lString.prototype.evaluate = function()
{
  return this.value;
}

var lNumber = function(value, type)
{
  this.value = value;

  Logic.call(this, TYPE_NUMBER);
}
lNumber.prototype = new Logic();
lNumber.prototype.constructor = lNumber;

lNumber.prototype.evaluate = function()
{
  return this.value;
}

var lButtonDown = function(button)
{
  this.button = button;

  Logic.call(this, TYPE_BOOLEAN, arguments, [TYPE_NUMBER]);
}
lButtonDown.prototype = new Logic();
lButtonDown.prototype.constructor = lButtonDown;

lButtonDown.prototype.evaluate = function()
{
  return _keyboard.isDown(this.button.evaluate());
}

var lButtonUp = function(button)
{
  this.button = button;

  Logic.call(this, TYPE_BOOLEAN, arguments, [TYPE_NUMBER]);
}
lButtonUp.prototype = new Logic();
lButtonUp.prototype.constructor = lButtonUp;

lButtonUp.prototype.evaluate = function()
{
  return _keyboard.isUp(this.button.evaluate());
}
