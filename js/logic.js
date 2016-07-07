var Logic = require("./token.js").Logic;
var Type = require("./typing.js").Type;
var FixType = require("./typing.js").FixType;

module.exports = [];

var lAnd = function (a, b) {
  Logic.call(this, "AND", Type.BOOLEAN, arguments, [Type.BOOLEAN, Type.BOOLEAN]);

  this.fixType = FixType.INFIX;

  this.args.push(a);
  this.args.push(b);
};
lAnd.prototype = new Logic();

lAnd.prototype.evaluate = function () {
  return (this.args[0].evaluate() && this.args[1].evaluate());
};

lAnd.prototype.constructor = lAnd;
module.exports.push(lAnd);


var lOr = function (a, b) {
  Logic.call(this, "OR", Type.BOOLEAN, arguments, [Type.BOOLEAN, Type.BOOLEAN]);

  this.fixType = FixType.INFIX;

  this.args.push(a);
  this.args.push(b);
};
lOr.prototype = new Logic();

lOr.prototype.evaluate = function () {
  if (this.args[0].evaluate() || this.args[1].evaluate())
    return true;

  return false;
};

lOr.prototype.constructor = lOr;
module.exports.push(lOr);


var lNot = function (a) {
  Logic.call(this, "NOT", Type.BOOLEAN, arguments, [Type.BOOLEAN]);

  this.args.push(a);
};
lNot.prototype = new Logic();

lNot.prototype.evaluate = function () {
  return !this.args[0].evaluate();
};

lNot.prototype.constructor = lNot;
module.exports.push(lNot);


var lString = function (value) {
  Logic.call(this, "text", Type.STRING, arguments, [Type.LITERAL]);

  this.args.push(value);
};
lString.prototype = new Logic();

lString.prototype.evaluate = function () {
  return this.args[0];
};

lString.prototype.constructor = lString;
module.exports.push(lString);


var lNumber = function (value) {
  Logic.call(this, "number", Type.NUMBER, arguments, [Type.LITERAL]);

  this.args.push(value);
};
lNumber.prototype = new Logic();

lNumber.prototype.evaluate = function () {
  return parseFloat(this.args[0]);
};

lNumber.prototype.constructor = lNumber;
module.exports.push(lNumber);


var lBool = function (value) {
  Logic.call(this, "boolean", Type.BOOLEAN, arguments, [Type.LITERAL]);

  this.args.push(value);
};
lBool.prototype = new Logic();

lBool.prototype.evaluate = function () {
  return this.args[0] === "true";
};

lBool.prototype.constructor = lBool;
module.exports.push(lBool);


var lButtonDown = function (button) {
  Logic.call(this, "isButtonDown", Type.BOOLEAN, arguments, [Type.NUMBER]);

  this.args.push(button);
};
lButtonDown.prototype = new Logic();

lButtonDown.prototype.evaluate = function () {
  return Input.keyboard.isDown(this.args[0].evaluate());
};

lButtonDown.prototype.constructor = lButtonDown;
module.exports.push(lButtonDown);


var lButtonUp = function (button) {
  Logic.call(this, "isButtonUp", Type.BOOLEAN, arguments, [Type.NUMBER]);

  this.args.push(button);
};
lButtonUp.prototype = new Logic();

lButtonUp.prototype.evaluate = function () {
  return Input.keyboard.isUp(this.args[0].evaluate());
};

lButtonUp.prototype.constructor = lButtonUp;
module.exports.push(lButtonUp);


var lRandom = function (min, max) {
  Logic.call(this, "randomNumber", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(min);
  this.args.push(max);
};
lRandom.prototype = new Logic();

lRandom.prototype.evaluate = function () {
  return Utils.randomRange(this.args[0].evaluate() && this.args[1].evaluate());
};

lRandom.prototype.constructor = lRandom;
module.exports.push(lRandom);


var lVelocityX = function (ef) {
  Logic.call(this, "getVelocityX", Type.NUMBER, arguments, [Type.ENTITYFILTER]);

  this.args.push(ef);
};
lVelocityX.prototype = new Logic();

lVelocityX.prototype.evaluate = function () {
  var entity = this.args[0].filter()[0];

  return entity.body.GetLinearVelocity().get_x();
};

lVelocityX.prototype.constructor = lVelocityX;
module.exports.push(lVelocityX);


var lVelocityY = function (ef) {
  Logic.call(this, "getVelocityY", Type.NUMBER, arguments, [Type.ENTITYFILTER]);

  this.args.push(ef);
};
lVelocityY.prototype = new Logic();

lVelocityY.prototype.evaluate = function () {
  var entity = this.args[0].filter()[0];

  return entity.body.GetLinearVelocity().get_y();
};

lVelocityY.prototype.constructor = lVelocityY;
module.exports.push(lVelocityY);


var lPlus = function (a, b) {
  Logic.call(this, "+", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lPlus.prototype = new Logic();

lPlus.prototype.evaluate = function () {
  return this.args[0].evaluate() + this.args[1].evaluate();
};

lPlus.prototype.constructor = lPlus;
module.exports.push(lPlus);


var lMultiply = function (a, b) {
  Logic.call(this, "*", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lMultiply.prototype = new Logic();

lMultiply.prototype.evaluate = function () {
  return this.args[0].evaluate() * this.args[1].evaluate();
};

lMultiply.prototype.constructor = lMultiply;
module.exports.push(lMultiply);


var lDivide = function (a, b) {
  Logic.call(this, "/", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lDivide.prototype = new Logic();

lDivide.prototype.evaluate = function () {
  return this.args[0].evaluate() / this.args[1].evaluate();
};

lDivide.prototype.constructor = lDivide;
module.exports.push(lDivide);


var lMinus = function (a, b) {
  Logic.call(this, "-", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lMinus.prototype = new Logic();

lMinus.prototype.evaluate = function () {
  return this.args[0].evaluate() + this.args[1].evaluate();
};

lMinus.prototype.constructor = lMinus;
module.exports.push(lMinus);