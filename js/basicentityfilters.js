var efById = function(id)
{
  EntityFilter.call(this, "filterById", arguments, [TYPE_STRING]);

  this.params.push(id);
}
efById.prototype = new EntityFilter();
efById.prototype.constructor = efById;
Behavior.registerToken(efById);

efById.prototype.decide = function(entity)
{
  return entity.id === this.params[0].evaluate();
}

var efByCollisionGroup = function(group)
{
  EntityFilter.call(this, "filterByGroup", arguments, [TYPE_NUMBER]);

  this.params.push(group);
}
efByCollisionGroup.prototype = new EntityFilter();
efByCollisionGroup.prototype.constructor = efByCollisionGroup;
Behavior.registerToken(efByCollisionGroup);

efByCollisionGroup.prototype.decide = function(entity)
{
  return entity.collisionGroup === this.params[0].evaluate();
}

var efByLogic = function(logic)
{
  EntityFilter.call(this, "filterByCondition", arguments, [TYPE_BOOLEAN]);

  this.params.push(logic);
}
efByLogic.prototype = new EntityFilter();
efByLogic.prototype.constructor = efByLogic;
Behavior.registerToken(efByLogic);

efByLogic.prototype.decide = function (entity)
{
  return new Behavior(this.params[0]).check(entity);
};
