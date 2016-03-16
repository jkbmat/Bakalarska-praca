var lAnd = function(a, b) {
  Logic.call(this, "AND", TYPE_BOOLEAN, arguments, [TYPE_BOOLEAN, TYPE_BOOLEAN]);

  this.fixType = INFIX;

  this.params.push(a);
  this.params.push(b);
}
lAnd.prototype = new Logic();
lAnd.prototype.constructor = lAnd;
Behavior.registerToken(lAnd);

lAnd.prototype.evaluate = function() {
  if (this.params[0].evaluate() && this.params[1].evaluate())
    return true;

  return false;
}

var lOr = function(a, b) {
  Logic.call(this, "OR", TYPE_BOOLEAN, arguments, [TYPE_BOOLEAN, TYPE_BOOLEAN]);

  this.fixType = INFIX;

  this.params.push(a);
  this.params.push(b);
}
lOr.prototype = new Logic();
lOr.prototype.constructor = lOr;
Behavior.registerToken(lOr);

lOr.prototype.evaluate = function() {
  if (this.params[0].evaluate() || this.params[1].evaluate())
    return true;

  return false;
}

var lNot = function(a) {
  Logic.call(this, "NOT", TYPE_BOOLEAN, arguments, [TYPE_BOOLEAN]);

  this.params.push(a);
}
lNot.prototype = new Logic();
lNot.prototype.constructor = lNot;
Behavior.registerToken(lNot);

lNot.prototype.evaluate = function() {
  return !this.params[0].evaluate();
}

var lString = function(value) {
  Logic.call(this, "text", TYPE_STRING, arguments, [TYPE_LITERAL]);

  this.params.push(value);
}
lString.prototype = new Logic();
lString.prototype.constructor = lString;
Behavior.registerToken(lString);

lString.prototype.evaluate = function() {
  return this.params[0];
}

var lNumber = function(value) {
  Logic.call(this, "number", TYPE_NUMBER, arguments, [TYPE_LITERAL]);

  this.params.push(value);
}
lNumber.prototype = new Logic();
lNumber.prototype.constructor = lNumber;
Behavior.registerToken(lNumber);

lNumber.prototype.evaluate = function() {
  return parseFloat(this.params[0]);
}

var lBool = function(value) {
  Logic.call(this, "boolean", TYPE_BOOLEAN, arguments, [TYPE_LITERAL]);

  this.params.push(value);
}
lBool.prototype = new Logic();
lBool.prototype.constructor = lBool;
Behavior.registerToken(lBool);

lBool.prototype.evaluate = function() {
  return this.params[0] === "true";
}

var lButtonDown = function(button) {
  Logic.call(this, "isButtonDown", TYPE_BOOLEAN, arguments, [TYPE_NUMBER]);

  this.params.push(button);
}
lButtonDown.prototype = new Logic();
lButtonDown.prototype.constructor = lButtonDown;
Behavior.registerToken(lButtonDown);

lButtonDown.prototype.evaluate = function() {
  return _keyboard.isDown(this.params[0].evaluate());
}

var lButtonUp = function(button) {
  Logic.call(this, "isButtonUp", TYPE_BOOLEAN, arguments, [TYPE_NUMBER]);

  this.params.push(button);
}
lButtonUp.prototype = new Logic();
lButtonUp.prototype.constructor = lButtonUp;
Behavior.registerToken(lButtonUp);

lButtonUp.prototype.evaluate = function() {
  return _keyboard.isUp(this.params[0].evaluate());
}

var lRandom = function(min, max) {
  Logic.call(this, "randomNumber", TYPE_NUMBER, arguments, [TYPE_NUMBER, TYPE_NUMBER]);

  this.params.push(min);
  this.params.push(max);
}
lRandom.prototype = new Logic();
lRandom.prototype.constructor = lRandom;
Behavior.registerToken(lRandom);

lRandom.prototype.evaluate = function() {
  return Tools.randomRange(this.params[0].evaluate() && this.params[1].evaluate());
}

var lVelocityX = function(ef) {
  Logic.call(this, "getVelocityX", TYPE_NUMBER, arguments, [TYPE_ENTITYFILTER]);

  this.params.push(ef);
}
lVelocityX.prototype = new Logic();
lVelocityX.prototype.constructor = lVelocityX;
Behavior.registerToken(lVelocityX);

lVelocityX.prototype.evaluate = function() {
  var entity = this.params[0].filter()[0];

  return entity.body.GetLinearVelocity().get_x();
}

var lVelocityY = function(ef) {
  Logic.call(this, "getVelocityY", TYPE_NUMBER, arguments, [TYPE_ENTITYFILTER]);

  this.params.push(ef);
}
lVelocityY.prototype = new Logic();
lVelocityY.prototype.constructor = lVelocityY;
Behavior.registerToken(lVelocityY);

lVelocityY.prototype.evaluate = function() {
  var entity = this.params[0].filter()[0];

  return entity.body.GetLinearVelocity().get_y();
}

var lPlus = function(a, b) {
  Logic.call(this, "+", TYPE_NUMBER, arguments, [TYPE_NUMBER, TYPE_NUMBER]);

  this.params.push(a);
  this.params.push(b);

  this.fixType = INFIX;
}
lPlus.prototype = new Logic();
lPlus.prototype.constructor = lPlus;
Behavior.registerToken(lPlus);

lPlus.prototype.evaluate = function() {
  return this.params[0].evaluate() + this.params[1].evaluate();
}

var lMultiply = function(a, b) {
  Logic.call(this, "*", TYPE_NUMBER, arguments, [TYPE_NUMBER, TYPE_NUMBER]);

  this.params.push(a);
  this.params.push(b);

  this.fixType = INFIX;
}
lMultiply.prototype = new Logic();
lMultiply.prototype.constructor = lMultiply;
Behavior.registerToken(lMultiply);

lMultiply.prototype.evaluate = function() {
  return this.params[0].evaluate() * this.params[1].evaluate();
}

var lDivide = function(a, b) {
  Logic.call(this, "/", TYPE_NUMBER, arguments, [TYPE_NUMBER, TYPE_NUMBER]);

  this.params.push(a);
  this.params.push(b);

  this.fixType = INFIX;
}
lDivide.prototype = new Logic();
lDivide.prototype.constructor = lDivide;
Behavior.registerToken(lDivide);

lDivide.prototype.evaluate = function() {
  return this.params[0].evaluate() / this.params[1].evaluate();
}

var lMinus = function(a, b) {
  Logic.call(this, "-", TYPE_NUMBER, arguments, [TYPE_NUMBER, TYPE_NUMBER]);

  this.params.push(a);
  this.params.push(b);

  this.fixType = INFIX;
}
lMinus.prototype = new Logic();
lMinus.prototype.constructor = lMinus;
Behavior.registerToken(lMinus);

lMinus.prototype.evaluate = function() {
  return this.params[0].evaluate() + this.params[1].evaluate();
}