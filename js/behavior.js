const TYPE_BOOLEAN = "boolean";
const TYPE_NUMBER = "number";
const TYPE_STRING = "string";
const TYPE_ARRAY = "array";
const TYPE_ACTION = "action";
const TYPE_ENTITYFILTER = "entityFilter";
const TYPE_LITERAL = "literal";

const INFIX = "infix";
const PREFIX = "prefix";

var Behavior = function(logic, results) {
  this.logic = logic;

  if (this.logic.type !== TYPE_BOOLEAN)
    throw new TypeError(TYPE_BOOLEAN, this.logic.type, this)

  this.results = Array.isArray(results) ? results : [results];
}

Behavior.tokens = {};

Behavior.registerToken = function(token) {
  var t = new token();
  Behavior.tokens[t.name] = t;
}


Behavior.prototype.check = function(entity) {
  return this.logic.evaluate(entity);
}

Behavior.prototype.toString = function() {
  return "Behavior(" + this.logic.toString() + ", " + this.results.toString() + ")";
}

Behavior.prototype.result = function() {
  for (var i = 0; i < this.results.length; i++) {
    this.results[i].execute()
  }
}

var TypeError = function(expected, received, token) {
  this.expected = expected;
  this.received = received;
  this.token = token;
}

// TODO: linear action, porovnavanie, uhly, plus, minus , deleno, krat, x na n

var Token = function(name, type, args, argument_types) {
  this.type = type;
  this.fixType = PREFIX;
  this.name = name;
  this.args = args == undefined ? [] : args;
  this.argument_types = argument_types;
  this.params = [];

  for (var i = 0; i < this.args.length; i++) {
    if (args[i].type !== argument_types[i] && argument_types[i] !== TYPE_LITERAL)
      throw new TypeError(argument_types[i], args[i].type, this);
  }
}

Token.prototype.toString = function() {
  var ret = "";
  var argStrings = [];

  for (var i = 0; i < this.args.length; i++) {
    argStrings.push(this.args[i].toString());
  }

  argStrings = argStrings.join(", ");

  switch (this.fixType) {
    case PREFIX:
      ret = this.name + "(" + argStrings + ")";
      break;
    case INFIX:
      ret = this.args[0].toString() + " " + this.name + " " + this.args[1].toString();
      break;
  }

  return ret;
}

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
}

Token.readWhitespace = function() {
  while (/\s/.test(Token.parserInput[0]) && Token.parserInput.length) {
    Token.parserInput = Token.parserInput.slice(1);
  }
}

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
}

Token.readChar = function(char) {
  Token.readWhitespace();

  if (Token.parserInput[0] !== char) {
    var position = Token.parserInputWhole.length - Token.parserInput.length;
    throw "Expected '" + char + "' at position " + position + " at '" + Token.parserInputWhole.substr(position) + "'";
  }

  Token.parserInput = Token.parserInput.slice(1);

  Token.readWhitespace();
}

Token.parseStep = function(expectedType) {
  var name = Token.parseName();
  var token = Behavior.tokens[name];

  if (token == undefined && expectedType === TYPE_LITERAL) {
    return name;
  }

  if (token == undefined) {
    throw "Expected argument with type " + expectedType;
  }

  if (expectedType != undefined && token.type !== expectedType) {
    throw "Unexpected " + token.type + " (was expecting " + expectedType + ")";
  }

  var numArgs = token.argument_types.length;

  var args = [];

  if (token.fixType === INFIX) {
    var a = Token.parserStack.pop();

    if (a.type !== token.argument_types[0])
      throw "Unexpected " + a.type + " (was expecting " + token.argument_types[0] + ")";

    args = [a, Token.parseStep(token.argument_types[1])];
    Token.parserStack.pop();
  }

  if (token.fixType === PREFIX) {
    Token.readChar("(");

    for (var i = 0; i < numArgs; i++) {
      args.push(Token.parseStep(token.argument_types[i]));

      Token.readWhitespace();

      if (Token.parserInput[0] === ",")
        Token.parserInput = Token.parserInput.slice(1);
    }

    Token.readChar(")");
  }

  var newToken = new token.constructor();
  for (var i = 0; i < args.length; i++) {
    newToken.params[i] = args[i];

    Token.parserStack.pop();
  }
  Token.parserStack.push(newToken);

  return newToken;
}


var Logic = function(name, type, args, argument_types) {
  Token.call(this, name, type, args, argument_types);
}
Logic.prototype = new Token();
Logic.prototype.constructor = Logic;

Logic.prototype.evaluate = function() // Use a derived class
  {
    return false;
  }


var Action = function(name, args, argument_types) {
  Token.call(this, name, TYPE_ACTION, args, argument_types);
}
Action.prototype = new Token();
Action.prototype.constructor = Action;

Action.prototype.each = function(entity) // Use a derived class
  {
    return false;
  }

Action.prototype.execute = function() {
  var entities = this.params[0].filter();
  for (var i = 0; i < entities.length; i++) {
    this.each(entities[i]);
  }
};


var EntityFilter = function(name, args, argument_types) {
  Token.call(this, name, TYPE_ENTITYFILTER, args, argument_types);
}
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