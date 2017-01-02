var Constants = require("./constants.js");
var UpdateEvent = require("./updateEvent");
var _ = require("lodash");

var EntityManager = function (engine) {
  this.engine = engine;
  this.lifetimeEntities = 0;
  this.layers = [];
  this.collisionGroups = [];

  for (var i = 0; i < Constants.LAYERS_NUMBER; i++) {
    this.layers.push([]);
  }

  for (var i = 0; i < Constants.COLLISION_GROUPS_NUMBER - 1; i++) {
    this.collisionGroups.push({
      "name": i + 1,
      "mask": parseInt("0" + Array(Constants.COLLISION_GROUPS_NUMBER).join("1"), 2)
    });
  }
  this.collisionGroups.push({
    "name": "Helpers",
    "mask": parseInt(Array(Constants.COLLISION_GROUPS_NUMBER + 1).join("0"), 2)
  });


};

// Adding an entity to the world
EntityManager.prototype.addEntity = function (entity, type, silent) {
  // generate auto id
  if (entity.id === undefined) {
    entity.id = Constants.AUTO_ID_PREFIX + this.lifetimeEntities;
  }

  this.lifetimeEntities++;

  entity.body.set_type(type);

  entity.body = this.engine.world.CreateBody(entity.body);
  entity.fixture = entity.body.CreateFixture(entity.fixture);

  this.layer(entity.layer).push(entity);

  entity.addHelpers();

  if (!silent)
    UpdateEvent.fire(UpdateEvent.ENTITY_ADD, {entities: [entity]});

  return entity;
};

EntityManager.prototype.removeEntity = function (entity, silent) {
  this.engine.jointManager.getJointsByEntity(entity).forEach(function (joint) {
    this.engine.jointManager.removeJoint(joint, true);
  }.bind(this));

  this.engine.select(null, null, silent);
  this.engine.world.DestroyBody(entity.body);
  this.layer(entity.layer).splice(this.layer(entity.layer).indexOf(entity), 1);

  if (!silent)
    UpdateEvent.fire(UpdateEvent.ENTITY_DELETE, {entities: [entity]});
};

// Updates collision masks for all entities, based on engine's collisionGroups table
EntityManager.prototype.updateCollisions = function () {
  var entities = this.entities();

  for (var i = 0; i < entities.length; i++) {
    this.updateCollision(entities[i]);
  }

  return this;
};

// Updates collision mask for an entity, based on engine's collisionGroups table
EntityManager.prototype.updateCollision = function (entity, silent) {
  var filterData = entity.fixture.GetFilterData();
  filterData.set_maskBits(this.collisionGroups[entity.collisionGroup].mask);
  entity.fixture.SetFilterData(filterData);

  if (!silent)
    UpdateEvent.fire(UpdateEvent.COL_GROUP_CHANGE, {entities: [entity]});

  return this;
};

EntityManager.prototype.setEntityLayer = function (entity, newLayer, silent) {
  // Remove from old layer
  this.layer(entity.layer).splice(this.layer(entity.layer).indexOf(entity), 1);

  // Set new layer
  entity.layer = newLayer;
  this.layer(newLayer).push(entity);

  if (!silent)
    UpdateEvent.fire(UpdateEvent.LAYER_CHANGE, {entities: [entity]});
};

// Returns all entities in one array
EntityManager.prototype.entities = function () {
  return [].concat.apply([], this.layers);
};

EntityManager.prototype.layer = function (i) {
  return this.layers[i];
};

// Returns the entity with id specified by argument
EntityManager.prototype.getEntityById = function (id) {
  var entities = this.entities();

  for (var i = 0; i < entities.length; i++) {
    if (entities[i].id === id)
      return entities[i];
  }

  return null;
};

// Returns an array of entities with specified collisionGroup
EntityManager.prototype.getEntitiesByCollisionGroup = function (group) {
  return _.filter(this.entities(), function (entity) {
    return entity.collisionGroup === group;
  });
};



module.exports = EntityManager;