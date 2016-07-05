var Behavior = require("./behavior.js");
var Logic = require("./token.js").Logic;
var Type = require("./typing.js").Type;
var FixType = require("./typing.js").FixType;

var lAnd = function (a, b) {
  Logic.call(this, "AND", Type.BOOLEAN, arguments, [Type.BOOLEAN, Type.BOOLEAN]);

  this.fixType = FixType.INFIX;

  this.args.push(a);
  this.args.push(b);
};
lAnd.prototype = new Logic();
lAnd.prototype.constructor = lAnd;
Behavior.prototype.registerToken(lAnd);

lAnd.prototype.evaluate = function () {
  return (this.args[0].evaluate() && this.args[1].evaluate());
}

var lOr = function (a, b) {
  Logic.call(this, "OR", Type.BOOLEAN, arguments, [Type.BOOLEAN, Type.BOOLEAN]);

  this.fixType = FixType.INFIX;

  this.args.push(a);
  this.args.push(b);
}
lOr.prototype = new Logic();
lOr.prototype.constructor = lOr;
Behavior.prototype.registerToken(lOr);

lOr.prototype.evaluate = function () {
  if (this.args[0].evaluate() || this.args[1].evaluate())
    return true;

  return false;
}

var lNot = function (a) {
  Logic.call(this, "NOT", Type.BOOLEAN, arguments, [Type.BOOLEAN]);

  this.args.push(a);
}
lNot.prototype = new Logic();
lNot.prototype.constructor = lNot;
Behavior.prototype.registerToken(lNot);

lNot.prototype.evaluate = function () {
  return !this.args[0].evaluate();
}

var lString = function (value) {
  Logic.call(this, "text", Type.STRING, arguments, [Type.LITERAL]);

  this.args.push(value);
}
lString.prototype = new Logic();
lString.prototype.constructor = lString;
Behavior.prototype.registerToken(lString);

lString.prototype.evaluate = function () {
  return this.args[0];
}

var lNumber = function (value) {
  Logic.call(this, "number", Type.NUMBER, arguments, [Type.LITERAL]);

  this.args.push(value);
}
lNumber.prototype = new Logic();
lNumber.prototype.constructor = lNumber;
Behavior.prototype.registerToken(lNumber);

lNumber.prototype.evaluate = function () {
  return parseFloat(this.args[0]);
}

var lBool = function (value) {
  Logic.call(this, "boolean", Type.BOOLEAN, arguments, [Type.LITERAL]);

  this.args.push(value);
}
lBool.prototype = new Logic();
lBool.prototype.constructor = lBool;
Behavior.prototype.registerToken(lBool);

lBool.prototype.evaluate = function () {
  return this.args[0] === "true";
}

var lButtonDown = function (button) {
  Logic.call(this, "isButtonDown", Type.BOOLEAN, arguments, [Type.NUMBER]);

  this.args.push(button);
}
lButtonDown.prototype = new Logic();
lButtonDown.prototype.constructor = lButtonDown;
Behavior.prototype.registerToken(lButtonDown);

lButtonDown.prototype.evaluate = function () {
  return window.Input.keyboard.isDown(this.args[0].evaluate());
}

var lButtonUp = function (button) {
  Logic.call(this, "isButtonUp", Type.BOOLEAN, arguments, [Type.NUMBER]);

  this.args.push(button);
}
lButtonUp.prototype = new Logic();
lButtonUp.prototype.constructor = lButtonUp;
Behavior.prototype.registerToken(lButtonUp);

lButtonUp.prototype.evaluate = function () {
  return window.Input.keyboard.isUp(this.args[0].evaluate());
}

var lRandom = function (min, max) {
  Logic.call(this, "randomNumber", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(min);
  this.args.push(max);
}
lRandom.prototype = new Logic();
lRandom.prototype.constructor = lRandom;
Behavior.prototype.registerToken(lRandom);

lRandom.prototype.evaluate = function () {
  return Utils.randomRange(this.args[0].evaluate() && this.args[1].evaluate());
}

var lVelocityX = function (ef) {
  Logic.call(this, "getVelocityX", Type.NUMBER, arguments, [Type.ENTITYFILTER]);

  this.args.push(ef);
}
lVelocityX.prototype = new Logic();
lVelocityX.prototype.constructor = lVelocityX;
Behavior.prototype.registerToken(lVelocityX);

lVelocityX.prototype.evaluate = function () {
  var entity = this.args[0].filter()[0];

  return entity.body.GetLinearVelocity().get_x();
}

var lVelocityY = function (ef) {
  Logic.call(this, "getVelocityY", Type.NUMBER, arguments, [Type.ENTITYFILTER]);

  this.args.push(ef);
}
lVelocityY.prototype = new Logic();
lVelocityY.prototype.constructor = lVelocityY;
Behavior.prototype.registerToken(lVelocityY);

lVelocityY.prototype.evaluate = function () {
  var entity = this.args[0].filter()[0];

  return entity.body.GetLinearVelocity().get_y();
}

var lPlus = function (a, b) {
  Logic.call(this, "+", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
}
lPlus.prototype = new Logic();
lPlus.prototype.constructor = lPlus;
Behavior.prototype.registerToken(lPlus);

lPlus.prototype.evaluate = function () {
  return this.args[0].evaluate() + this.args[1].evaluate();
}

var lMultiply = function (a, b) {
  Logic.call(this, "*", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
}
lMultiply.prototype = new Logic();
lMultiply.prototype.constructor = lMultiply;
Behavior.prototype.registerToken(lMultiply);

lMultiply.prototype.evaluate = function () {
  return this.args[0].evaluate() * this.args[1].evaluate();
}

var lDivide = function (a, b) {
  Logic.call(this, "/", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
}
lDivide.prototype = new Logic();
lDivide.prototype.constructor = lDivide;
Behavior.prototype.registerToken(lDivide);

lDivide.prototype.evaluate = function () {
  return this.args[0].evaluate() / this.args[1].evaluate();
}

var lMinus = function (a, b) {
  Logic.call(this, "-", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
}
lMinus.prototype = new Logic();
lMinus.prototype.constructor = lMinus;
Behavior.prototype.registerToken(lMinus);

lMinus.prototype.evaluate = function () {
  return this.args[0].evaluate() + this.args[1].evaluate();
}