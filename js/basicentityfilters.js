var efById = function(id) {
  EntityFilter.call(this, "filterById", arguments, [Type.STRING]);

  this.args.push(id);
}
efById.prototype = new EntityFilter();
efById.prototype.constructor = efById;
Behavior.registerToken(efById);

efById.prototype.decide = function(entity) {
  return entity.id === this.args[0].evaluate();
}

var efByCollisionGroup = function(group) {
  EntityFilter.call(this, "filterByGroup", arguments, [Type.NUMBER]);

  this.args.push(group);
}
efByCollisionGroup.prototype = new EntityFilter();
efByCollisionGroup.prototype.constructor = efByCollisionGroup;
Behavior.registerToken(efByCollisionGroup);

efByCollisionGroup.prototype.decide = function(entity) {
  return entity.collisionGroup === this.args[0].evaluate();
}

var efByLogic = function(logic) {
  EntityFilter.call(this, "filterByCondition", arguments, [Type.BOOLEAN]);

  this.args.push(logic);
}
efByLogic.prototype = new EntityFilter();
efByLogic.prototype.constructor = efByLogic;
Behavior.registerToken(efByLogic);

efByLogic.prototype.decide = function(entity) {
  return new Behavior(this.args[0]).check(entity);
};