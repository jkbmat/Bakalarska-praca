var efById = function(id)
{
  this.id = id;

  EntityFilter.call(this, arguments, [TYPE_STRING]);
}
efById.prototype = new EntityFilter();
efById.prototype.constructor = efById;

efById.prototype.decide = function(entity)
{
  return entity.id === this.id.evaluate();
}

var efByCollisionGroup = function(group)
{
  this.group = group;

  EntityFilter.call(this, arguments, [TYPE_NUMBER]);
}
efByCollisionGroup.prototype = new EntityFilter();
efByCollisionGroup.prototype.constructor = efByCollisionGroup;

efByCollisionGroup.prototype.decide = function(entity)
{
  return entity.collisionGroup === this.group.evaluate();
}

var efByLogic = function(logic)
{
  this.logic = logic;

  EntityFilter.call(this, arguments, [TYPE_BOOLEAN]);
}
efByLogic.prototype = new EntityFilter();
efByLogic.prototype.constructor = efByLogic;

efByLogic.prototype.decide = function (entity)
{
  return new Behavior(this.logic).check(entity);
};
