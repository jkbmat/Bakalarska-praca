var EntityFilter = require("./token.js").EntityFilter;
var Type = require("./typing.js").Type;
var _ = require("lodash");

module.exports = [];

var efThis = function() {
  EntityFilter.call(this, "thisEntity", arguments, []);
};
efThis.prototype = new EntityFilter();

efThis.prototype.filter = function() {
  return [_engine.behaviorCurrentEntity];
};

efThis.prototype.constructor = efThis;
module.exports.push(efThis);


var efAll = function() {
  EntityFilter.call(this, "allEntities", arguments, []);
};
efAll.prototype = new EntityFilter();

efAll.prototype.filter = function() {
  return _engine.entityManager.entities();
};

efAll.prototype.constructor = efAll;
module.exports.push(efAll);


var efById = function(ef, id) {
  EntityFilter.call(this, "filterById", arguments, [Type.ENTITYFILTER, Type.STRING]);

  this.args.push(ef);
  this.args.push(id);
};
efById.prototype = new EntityFilter();

efById.prototype.decide = function(entity) {
  return entity.id === this.args[1].evaluate();
};

efById.prototype.constructor = efById;
module.exports.push(efById);


var efByCollisionGroup = function(ef, group) {
  EntityFilter.call(this, "filterByGroup", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(group);
};
efByCollisionGroup.prototype = new EntityFilter();

efByCollisionGroup.prototype.decide = function(entity) {
  return entity.collisionGroup + 1 === this.args[1].evaluate();
};

efByCollisionGroup.prototype.constructor = efByCollisionGroup;
module.exports.push(efByCollisionGroup);


var efByLayer = function(ef, layer) {
  EntityFilter.call(this, "filterByLayer", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(layer);
};
efByLayer.prototype = new EntityFilter();

efByLayer.prototype.decide = function(entity) {
  return entity.layer + 1 === this.args[1].evaluate();
};

efByLayer.prototype.constructor = efByLayer;


var efTouching = function(ef, layer) {
  EntityFilter.call(this, "filterByContactWith", arguments, [Type.ENTITYFILTER, Type.ENTITYFILTER]);

  this.args.push(ef);
  this.args.push(layer);
};
efTouching.prototype = new EntityFilter();
module.exports.push(efByLayer);

efTouching.prototype.filter = function() {
  var toCheck = this.args[1].filter();

  return _.filter(this.args[0].filter(), function(entity) {
    return _engine.contactManager.anyContact(toCheck, [entity]);
  });
};

efTouching.prototype.constructor = efTouching;
module.exports.push(efTouching);