var Constants = require("./constants.js");
var Shapes = require("./shapes.js");
var Behavior = require("./behavior.js");

var StateManager = function (engine) {
  this.engine = engine;
  this.stateStack = [];

  this.addState();
};

StateManager.prototype.addState = function (state) {
  state = state ? state : this.createState();

  this.stateStack.push(state);

  if (this.stateStack.length > Constants.STATE_STACK_SIZE)
    this.stateStack.shift();

  console.log(this.stateStack.length);
};

StateManager.prototype.createState = function () {
  var state = {};

  state.world = {
    gravity: [this.engine.world.GetGravity().get_x(), this.engine.world.GetGravity().get_y()],
    collisionGroups: JSON.parse(JSON.stringify(this.engine.collisionGroups)) // Deep copy trick
  };

  state.entities = [];
  var entities = this.engine.entities();

  for (var i = 0; i < entities.length; i++) {
    var entity = entities[i];

    state.entities.push({
      x: entity.getX(),
      y: entity.getY(),
      width: entity.getWidth(),
      height: entity.getHeight(),
      angle: entity.getAngle(),
      fixedRotation: entity.fixedRotation,
      type: entity.type,
      color: entity.getColor(),
      restitution: entity.getRestitution(),
      friction: entity.getFriction(),
      density: entity.getDensity(),
      bodyType: entity.getBodyType(),
      id: entity.id,
      collisionGroup: entity.collisionGroup,
      behaviors: _.map(entity.behaviors, function (behavior) {
        return [
          behavior.logic.toString(),
          _.map(behavior.results, function (result) {
            return result.toString();
          })
        ];
      })
    });
  }

  return state;
};

StateManager.prototype.buildState = function (state) {
  this.clearWorld();

  this.engine.world.SetGravity(new b2Vec2(state.world.gravity[0], state.world.gravity[1]));
  this.engine.collisionGroups = state.world.collisionGroups;

  for (var i = 0; i < state.entities.length; i++) {
    var entity = state.entities[i];

    var newFixture = new b2FixtureDef();
    newFixture.set_density(entity.density);
    newFixture.set_friction(entity.friction);
    newFixture.set_restitution(entity.restitution);

    var newEntity;

    switch (entity.type) {
      case "CIRCLE":
        newEntity = new Shapes.Circle(
          new b2Vec2(entity.x, entity.y),
          entity.width / 2,
          newFixture,
          entity.id,
          entity.collisionGroup
        );
        break;

      case "RECTANGLE":
        newEntity = new Shapes.Rectangle(
          new b2Vec2(entity.x, entity.y),
          new b2Vec2(entity.width / 2, entity.height / 2),
          newFixture,
          entity.id,
          entity.collisionGroup
        );
        break;

      default:
        throw "Error! Couldn't build a state: unknown entity type " + entity.type;
    }

    this.engine.addEntity(newEntity, entity.bodyType);

    newEntity.setColor(entity.color, true);
    newEntity.setAngle(entity.angle, false, true);
    newEntity.disableRotation(entity.fixedRotation, true);
    for(var j = 0; j < entity.behaviors.length; j++) {
      var results = _.map(entity.behaviors[j][1], (function (result) {
        return this.engine.tokenManager.parser.parse(result);
      }).bind(this));

      newEntity.addBehavior(new Behavior(
        this.engine.tokenManager.parser.parse(entity.behaviors[j][0]),
        results
      ));
    }
  }
};

StateManager.prototype.clearWorld = function () {
  var entities = this.engine.entities();

  for (var i = 0; i < entities.length; i++) {
    this.engine.removeEntity(entities[i]);
  }
};

module.exports = StateManager;