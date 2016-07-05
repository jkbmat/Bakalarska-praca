var Type = require("./typing.js").Type;

var Behavior = function(logic, results) {
  this.logic = logic;

  if (this.logic.type !== Type.BOOLEAN)
    throw new TypeException(Type.BOOLEAN, this.logic.type, this);

  this.results = Array.isArray(results) ? results : [results];
};

window.tokens = {};

Behavior.prototype.registerToken = function(token) {
  var t = new token();
  window.tokens[t.name] = t;
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

module.exports = Behavior;

require("./logic.js");
require("./actions.js");
require("./entityfilters.js");