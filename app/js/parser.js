var Type = require("./typing").Type;
var Literal = require("./token.js").Literal;

var Parser = function (tokenManager) {
  this.tokenManager = tokenManager;

  this.parserInput = "";
  this.parserStack = [];
};

Parser.prototype.fail = function (message) {
  throw new Error(message + "\nRemaining input: " + this.parserInput);
};

Parser.prototype.currentChar = function() {
  return this.parserInput.length ? this.parserInput[0] : "";
};

Parser.prototype.nextChar = function () {
  return this.parserInput[1];
};

Parser.prototype.removeChar = function () {
  this.parserInput = this.parserInput.slice(1);
};

Parser.prototype.readChar = function() {
  var ret = this.currentChar();

  this.removeChar();

  return ret;
};

Parser.prototype.readWhitespace = function () {
  while (this.currentChar() === " ")
    this.removeChar();
};

Parser.prototype.readName = function () {
  this.readWhitespace();

  var ret = "";

  while(/[^ ,)("]/.test(this.currentChar()))
    ret += this.readChar();

  if (this.currentChar() === '"') {
    this.readChar();

    while (this.currentChar() !== '"') {
      if (this.currentChar() === "\\" && this.nextChar() === "\"") {
        this.readChar();
        this.readChar();

        ret += "\"";
      }

      else
        ret += this.readChar();
    }

    this.readChar();
  }
  else if(ret === ""){
    ret = false;
  }

  this.readWhitespace();

  return ret;
};

Parser.prototype.readParentheses = function () {
  this.readWhitespace();

  if (this.currentChar() !== "(")
    return;

  this.readChar();

  while (this.currentChar() !== ")"){
    this.readWhitespace();

    this.parseToken();

    this.readWhitespace();

    if (this.currentChar() === ",") {
      this.readChar();
      this.readWhitespace();
    }
  }

  this.readChar();
};

Parser.prototype.parseToken = function () {
  this.readParentheses();

  var name = this.readName();

  if (name === false)
    return null;

  var token = this.tokenManager.getTokenByName(name);
  token = token == undefined ? new Literal(name) : new token.constructor();

  this.readParentheses();

  if (token.type !== Type.LITERAL)
  {
    for(var i = token.argument_types.length - 1; i >= 0; i--) {
      var arg = this.parserStack.pop();

      if ((token.argument_types[i] !== arg.type))
        this.fail("Expected " + token.argument_types[i] + ", got " + arg.type);
      
      token.args[i] = arg;
    }
  }

  this.parserStack.push(token);

  return token;
};

Parser.prototype.parse = function (input) {
  this.parserInput = input;
  this.parserStack = [];

  return this.parseToken();
};


module.exports = Parser;