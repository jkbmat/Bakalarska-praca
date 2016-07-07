var FixType = require("./typing").FixType;
var Type = require("./typing").Type;

var TypeException = function(expected, received, token) {
  this.expected = expected;
  this.received = received;
  this.token = token;
};

var Parser = function (tokenManager) {
  this.tokenManager = tokenManager;

  this.stopChars = ["(", ")", ","];

  this.parserInput = "";
  this.parserInputWhole = "";
  this.parserStack = [];
};

Parser.prototype.parse = function(input) {
  this.parserInput = input;
  this.parserInputWhole = input;
  this.parserStack = [];

  do {
    this.parseStep();
  } while (this.parserInput.length);

  var ret = this.parserStack.pop();

  if (this.parserStack.length)
    throw "Unexpected " + ret.name;

  return ret;
};

Parser.prototype.readWhitespace = function() {
  while (/\s/.test(this.parserInput[0]) && this.parserInput.length) {
    this.parserInput = this.parserInput.slice(1);
  }
};

Parser.prototype.parseName = function() {
  this.readWhitespace();

  var ret = "";

  while (!/\s/.test(this.parserInput[0]) && this.parserInput.length && this.stopChars.indexOf(this.parserInput[0]) === -1) // read until a whitespace occurs
  {
    ret += this.parserInput[0];
    this.parserInput = this.parserInput.slice(1);
  }

  this.readWhitespace();

  return ret;
};

Parser.prototype.readChar = function(char) {
  this.readWhitespace();

  if (this.parserInput[0] !== char) {
    var position = this.parserInputWhole.length - this.parserInput.length;
    throw "Expected '" + char + "' at position " + position + " at '" + this.parserInputWhole.substr(position) + "'";
  }

  this.parserInput = this.parserInput.slice(1);

  this.readWhitespace();
};

Parser.prototype.parseStep = function(expectedType) {
  var name = this.parseName();
  var token = this.tokenManager.getTokenByName(name);

  if (token === undefined && expectedType === Type.LITERAL) {
    return name;
  }

  if (token == undefined) {
    throw "Expected argument with type " + expectedType;
  }

  if (expectedType !== undefined && token.type !== expectedType) {
    throw "Unexpected " + token.type + " (was expecting " + expectedType + ")";
  }

  var numArgs = token.argument_types.length;

  var args = [];

  if (token.fixType === FixType.INFIX) {
    var a = this.parserStack.pop();

    if (a.type !== token.argument_types[0])
      throw "Unexpected " + a.type + " (was expecting " + token.argument_types[0] + ")";

    args = [a, this.parseStep(token.argument_types[1])];
    this.parserStack.pop();
  }

  if (token.fixType === FixType.PREFIX) {
    this.readChar("(");

    for (i = 0; i < numArgs; i++) {
      args.push(this.parseStep(token.argument_types[i]));

      this.readWhitespace();

      if (this.parserInput[0] === ",")
        this.parserInput = this.parserInput.slice(1);
    }

    this.readChar(")");
  }

  var newToken = new token.constructor();
  for (var i = 0; i < args.length; i++) {
    newToken.args[i] = args[i];

    this.parserStack.pop();
  }
  this.parserStack.push(newToken);

  return newToken;
};

module.exports = Parser;