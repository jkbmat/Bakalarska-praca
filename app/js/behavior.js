var Behavior = function(logic, results) {
  this.logic = logic;
  this.results = Array.isArray(results) ? results : [results];
};

Behavior.prototype.check = function(entity) {
  return this.logic.evaluate(entity);
};

Behavior.prototype.toString = function() {
  return "Behavior(" + this.logic.toString() + ", " + this.results.toString() + ")";
};

Behavior.prototype.result = function(entity) {
  for (var i = 0; i < this.results.length; i++) {
    if (entity.dead)
      break;

    this.results[i].execute(entity);
  }
};

module.exports = Behavior;