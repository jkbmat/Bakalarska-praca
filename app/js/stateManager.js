var Constants = require("./constants.js");
var Shapes = require("./shapes.js");
var Behavior = require("./behavior.js");
var UpdateEvent = require("./updateEvent.js");
var Joints = require("./joints.js");

var StateManager = function (engine) {
  this.engine = engine;
  this.stateStack = [];
  this.currentState = -1;
};

StateManager.prototype.getCurrentState = function () {
  return this.stateStack[this.currentState];
};

StateManager.prototype.addState = function (state) {
  state = state ? state : this.createState();

  this.currentState += 1;
  this.stateStack.splice(this.currentState, this.stateStack.length - this.currentState, state);

  if (this.stateStack.length > Constants.STATE_STACK_SIZE) {
    this.stateStack.shift();
    this.currentState -= 1;
  }

  UpdateEvent.fire(UpdateEvent.STATE_CHANGE, {
    noState: true,
    first: this.currentState === 0,
    last: this.currentState === this.stateStack.length - 1
  });
};

StateManager.prototype.createState = function () {
  var state = {};

  state.world = {
    gravity: [this.engine.world.GetGravity().get_x(), this.engine.world.GetGravity().get_y()],
    collisionGroups: JSON.parse(JSON.stringify(this.engine.collisionGroups)), // Deep copy trick
    camera: [this.engine.viewport.x, this.engine.viewport.y],
    lifetimeEntities: this.engine.lifetimeEntities,
    cameraStyle: this.engine.viewport.getCameraStyle(),
    cameraEntityId: this.engine.viewport.getCameraEntityId(),
  };

  state.layers = [];

  for (var i = 0; i < Constants.LAYERS_NUMBER; i++) {
    state.layers.push([]);

    for (var j = 0; j < this.engine.layers[i].length; j++) {
      var entity = this.engine.layers[i][j];

      state.layers[i].push({
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

    state.joints = [];

    for (var jointIndex = 0; jointIndex < this.engine.joints.length; jointIndex++) {
      var joint = this.engine.joints[jointIndex];

      state.joints.push({
        type: joint.type,
        entityA: joint.entityA.id,
        entityB: joint.entityB.id,
        localAnchorA: joint.localAnchorA,
        localAnchorB: joint.localAnchorB,
        collide: joint.collide
      });
    }
  }

  return state;
};

StateManager.prototype.buildState = function (state) {
  this.clearWorld(true);

  this.engine.setGravity(state.world.gravity[0], state.world.gravity[1], true);
  this.engine.collisionGroups = state.world.collisionGroups;
  this.engine.viewport.x = state.world.camera[0];
  this.engine.viewport.y = state.world.camera[1];
  this.engine.viewport.setCameraStyle(state.world.cameraStyle, true);
  this.engine.viewport.setCameraEntityId(state.world.cameraEntityId, true);

  for (var i = 0; i < state.layers.length; i++) {
    for (var j = 0; j < state.layers[i].length; j++) {
      var entity = state.layers[i][j];

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

      this.engine.addEntity(newEntity, entity.bodyType, true);
      this.engine.setEntityLayer(newEntity, i, true);

      newEntity.setColor(entity.color, true);
      newEntity.setAngle(entity.angle, false, true);
      newEntity.disableRotation(entity.fixedRotation, true);
      for (var behaviorIndex = 0; behaviorIndex < entity.behaviors.length; behaviorIndex++) {
        var results = _.map(entity.behaviors[behaviorIndex][1], (function (result) {
          return this.engine.tokenManager.parser.parse(result);
        }).bind(this));

        newEntity.addBehavior(new Behavior(
          this.engine.tokenManager.parser.parse(entity.behaviors[behaviorIndex][0]),
          results
        ));
      }
    }
  }

  for (var jointIndex = 0; jointIndex < state.joints.length; jointIndex++) {
    var jointDef = state.joints[jointIndex];
    var joint = null;
    var entityA = this.engine.getEntityById(jointDef.entityA);
    var entityB = this.engine.getEntityById(jointDef.entityB);
    var localAnchorA = jointDef.localAnchorA;
    var localAnchorB = jointDef.localAnchorB;
    var collide = jointDef.collide;

    if (jointDef.type === Joints.REVOLUTE) {
      joint = new Joints.Revolute(entityA, entityB, localAnchorA, localAnchorB, collide);
    }

    this.engine.addJoint(joint, true);
  }

  this.engine.lifetimeEntities = state.world.lifetimeEntities;

  UpdateEvent.fire(UpdateEvent.STATE_CHANGE, {
    noState: true,
    first: this.currentState === 0,
    last: this.currentState === this.stateStack.length - 1
  });
};

StateManager.prototype.undo = function () {
  if (this.currentState === 0)
    return;

  this.currentState -= 1;
  this.buildState(this.stateStack[this.currentState]);
};

StateManager.prototype.redo = function () {
  if (this.currentState === this.stateStack.length - 1)
    return;

  this.currentState += 1;
  this.buildState(this.stateStack[this.currentState]);
};

StateManager.prototype.clearWorld = function (silent) {
  var entities = this.engine.entities();

  for (var i = 0; i < entities.length; i++) {
    this.engine.removeEntity(entities[i], true);
  }

  // (Joints are destroyed automatically when a connected body is destroyed)

  this.engine.lifetimeEntities = 0;
  this.engine.lifetimeJoints = 0;

  if (!silent)
    UpdateEvent.fire(UpdateEvent.WORLD_CLEARED);
};

module.exports = StateManager;