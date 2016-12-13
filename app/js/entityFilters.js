var EntityFilter = require("./token.js").EntityFilter;
var Type = require("./typing.js").Type;

module.exports = [];

var efById = function(id) {
  EntityFilter.call(this, "filterById", arguments, [Type.STRING]);

  this.args.push(id);
};
efById.prototype = new EntityFilter();

efById.prototype.decide = function(entity) {
  return entity.id === this.args[0].evaluate();
};

efById.prototype.constructor = efById;
module.exports.push(efById);


var efByCollisionGroup = function(group) {
  EntityFilter.call(this, "filterByGroup", arguments, [Type.NUMBER]);

  this.args.push(group);
};
efByCollisionGroup.prototype = new EntityFilter();

efByCollisionGroup.prototype.decide = function(entity) {
  return entity.collisionGroup + 1 === this.args[0].evaluate();
};

efByCollisionGroup.prototype.constructor = efByCollisionGroup;
module.exports.push(efByCollisionGroup);


var efByLayer = function(layer) {
  EntityFilter.call(this, "filterByLayer", arguments, [Type.NUMBER]);

  this.args.push(layer);
};
efByLayer.prototype = new EntityFilter();

efByLayer.prototype.decide = function(entity) {
  return entity.layer + 1 === this.args[0].evaluate();
};

efByLayer.prototype.constructor = efByLayer;
module.exports.push(efByLayer);