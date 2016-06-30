var Type = {
  BOOLEAN: "boolean",
  NUMBER: "number",
  STRING: "string",
  ARRAY: "array",
  ACTION: "action",
  ENTITYFILTER: "entityFilter",
  LITERAL: "literal"
};

var FixType = {
  INFIX: "infix",
  PREFIX: "prefix"
};

var Behavior = function(logic, results) {
  this.logic = logic;

  if (this.logic.type !== Type.BOOLEAN)
    throw new TypeException(Type.BOOLEAN, this.logic.type, this);

  this.results = Array.isArray(results) ? results : [results];
};

Behavior.tokens = {};

Behavior.registerToken = function(token) {
  var t = new token();
  Behavior.tokens[t.name] = t;
};


Behavior.prototype.check = function(entity) {
  return this.logic.evaluate(entity);
};

Behavior.prototype.toString = function() {
  return "Behavior(" + this.logic.toString() + ", " + this.results.toString() + ")";
};

Behavior.prototype.result = function() {
  for (var i = 0; i < this.results.length; i++) {
    this.results[i].execute()
  }
};

var TypeException = function(expected, received, token) {
  this.expected = expected;
  this.received = received;
  this.token = token;
};

// TODO: linear action, porovnavanie, uhly, plus, minus , deleno, krat, x na n

var Token = function(name, type, args, argument_types) {
  this.type = type;
  this.fixType = FixType.PREFIX;
  this.name = name;
  this.args = args == undefined ? [] : args;
  this.argument_types = argument_types;
  this.args = [];

  for (var i = 0; i < this.args.length; i++) {
    if (args[i].type !== argument_types[i] && argument_types[i] !== Type.LITERAL)
      throw new TypeException(argument_types[i], args[i].type, this);
  }
};

Token.prototype.toString = function() {
  var ret = "";
  var argStrings = [];

  for (var i = 0; i < this.args.length; i++) {
    argStrings.push(this.args[i].toString());
  }

  argStrings = argStrings.join(", ");

  switch (this.fixType) {
    case FixType.PREFIX:
      ret = this.name + "(" + argStrings + ")";
      break;
    case FixType.INFIX:
      ret = this.args[0].toString() + " " + this.name + " " + this.args[1].toString();
      break;
  }

  return ret;
};

Token.stopChars = ["(", ")", ","];

Token.parse = function(input) {
  Token.parserInput = input;
  Token.parserInputWhole = input;
  Token.parserStack = [];

  do {
    Token.parseStep()
  } while (Token.parserInput.length);

  var ret = Token.parserStack.pop();

  if (Token.parserStack.length)
    throw "Unexpected " + ret.name;

  return ret;
};

Token.readWhitespace = function() {
  while (/\s/.test(Token.parserInput[0]) && Token.parserInput.length) {
    Token.parserInput = Token.parserInput.slice(1);
  }
};

Token.parseName = function() {
  Token.readWhitespace();

  var ret = "";

  while (!/\s/.test(Token.parserInput[0]) && Token.parserInput.length && Token.stopChars.indexOf(Token.parserInput[0]) === -1) // read until a whitespace occurs
  {
    ret += Token.parserInput[0]
    Token.parserInput = Token.parserInput.slice(1);
  }

  Token.readWhitespace();

  return ret;
};

Token.readChar = function(char) {
  Token.readWhitespace();

  if (Token.parserInput[0] !== char) {
    var position = Token.parserInputWhole.length - Token.parserInput.length;
    throw "Expected '" + char + "' at position " + position + " at '" + Token.parserInputWhole.substr(position) + "'";
  }

  Token.parserInput = Token.parserInput.slice(1);

  Token.readWhitespace();
};

Token.parseStep = function(expectedType) {
  var name = Token.parseName();
  var token = Behavior.tokens[name];

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
    var a = Token.parserStack.pop();

    if (a.type !== token.argument_types[0])
      throw "Unexpected " + a.type + " (was expecting " + token.argument_types[0] + ")";

    args = [a, Token.parseStep(token.argument_types[1])];
    Token.parserStack.pop();
  }

  if (token.fixType === FixType.PREFIX) {
    Token.readChar("(");

    for (i = 0; i < numArgs; i++) {
      args.push(Token.parseStep(token.argument_types[i]));

      Token.readWhitespace();

      if (Token.parserInput[0] === ",")
        Token.parserInput = Token.parserInput.slice(1);
    }

    Token.readChar(")");
  }

  var newToken = new token.constructor();
  for (var i = 0; i < args.length; i++) {
    newToken.args[i] = args[i];

    Token.parserStack.pop();
  }
  Token.parserStack.push(newToken);

  return newToken;
};


var Logic = function(name, type, args, argument_types) {
  Token.call(this, name, type, args, argument_types);
};
Logic.prototype = new Token();
Logic.prototype.constructor = Logic;

Logic.prototype.evaluate = function() // Use a derived class
  {
    return false;
  };


var Action = function(name, args, argument_types) {
  Token.call(this, name, Type.ACTION, args, argument_types);
};
Action.prototype = new Token();
Action.prototype.constructor = Action;

Action.prototype.each = function(entity) // Use a derived class
{
  return false;
};

Action.prototype.execute = function() {
  var entities = this.args[0].filter();
  for (var i = 0; i < entities.length; i++) {
    this.each(entities[i]);
  }
};


var EntityFilter = function(name, args, argument_types) {
  Token.call(this, name, Type.ENTITYFILTER, args, argument_types);
};
EntityFilter.prototype = new Token();
EntityFilter.prototype.constructor = EntityFilter;

EntityFilter.prototype.decide = function(entity) // Use derived class
{
  return false;
};

EntityFilter.prototype.filter = function() {
  var ret = [];
  for (var i = 0; i < _engine.entities.length; i++) {
    if (this.decide(_engine.entities[i]))
      ret.push(_engine.entities[i]);
  }
  return ret;
};