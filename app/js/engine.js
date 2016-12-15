var UI = require("./UI.js");
var Tools = require("./tools.js");
var TokenManager = require("./tokenManager.js");
var Constants = require("./constants.js");
var UpdateEvent = require("./updateEvent.js");
var StateManager = require("./stateManager.js");
var CameraStyle = require("./cameraStyle.js");

// ENGINE

// constructor

var Engine = function (viewport, gravity) {
  this.viewport = viewport;
  this.selectedEntity = null;
  this.selectedTool = Tools.Selection;

  this.helpers = [];

  this.bufferVec2 = new b2Vec2(0, 0);

  this.layers = new Array(Constants.LAYERS_NUMBER);
  for (var i = 0; i < Constants.LAYERS_NUMBER; i++) {
    this.layers[i] = [];
  }

  this.joints = [];

  this.collisionGroups = [];
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

  this.lifetimeEntities = 0;
  this.lifetimeJoints = 0;

  this.world = new b2World(gravity, true);
  this.world.paused = true;

  this.tokenManager = new TokenManager();

  var Input = require('./input.js');
  this.input = new Input(viewport);

  this.stateManager = new StateManager(this);

  $(viewport.canvasElement).on("mousedown", (function () {
    this.selectedTool.onclick();
  }).bind(this));

  $(viewport.canvasElement).on("mouseup", (function () {
    this.selectedTool.onrelease();
  }).bind(this));

  $(document).on("update", (function (e) {
    if (!e.detail.noState)
      this.stateManager.addState();
  }).bind(this));
};

// Changes running state of the simulation
Engine.prototype.togglePause = function () {
  this.world.paused = !this.world.paused;
  this.selectEntity(null);

  this.selectTool(this.world.paused ? Tools.Selection : Tools.Blank);
  $("#selectionTool")[0].checked = true;

  if (!this.world.paused) {
    var entities = this.entities();

    entities.forEach(function (entity) {
      entity.body.SetAwake(1);
    });

    $(".sidebar").hide();
  }

  else {
    $(".sidebar").show();
    this.stateManager.buildState(this.stateManager.stateStack[this.stateManager.currentState]);
  }


};

Engine.prototype.getGravityX = function () {
  return this.world.GetGravity().get_x();
};

Engine.prototype.getGravityY = function () {
  return this.world.GetGravity().get_y();
};

Engine.prototype.setGravity = function (x, y, silent) {
  this.world.SetGravity(new b2Vec2(x, y));

  if (!silent) {
    UpdateEvent.fire(UpdateEvent.GRAVITY_CHANGE);
  }
};

Engine.prototype.setGravityX = function (val) {
  this.setGravity(val, this.getGravityY());
};

Engine.prototype.setGravityY = function (val) {
  this.setGravity(this.getGravityX(), val);
};

Engine.prototype.selectTool = function (tool) {
  this.selectedTool = tool;
  this.selectEntity(null);
};

// Adding an entity to the world
Engine.prototype.addEntity = function (entity, type, silent) {
  // generate auto id
  if (entity.id === undefined) {
    entity.id = Constants.AUTO_ID_PREFIX + this.lifetimeEntities;
  }

  this.lifetimeEntities++;

  entity.body.set_type(type);

  entity.body = this.world.CreateBody(entity.body);
  entity.fixture = entity.body.CreateFixture(entity.fixture);

  this.layers[entity.layer].push(entity);

  entity.addHelpers();

  if (!silent)
    UpdateEvent.fire(UpdateEvent.ENTITY_ADD, {entities: [entity]});

  return entity;
};

Engine.prototype.removeEntity = function (entity, silent) {
  this.selectEntity(null);
  this.world.DestroyBody(entity.body);
  this.layers[entity.layer].splice(this.layers[entity.layer].indexOf(entity), 1);

  if (!silent)
    UpdateEvent.fire(UpdateEvent.ENTITY_DELETE, {entities: [entity]});
};

Engine.prototype.addJoint = function (joint, silent) {
  joint.id = joint.id == undefined ? "Joint " + this.lifetimeJoints++ : joint.id;
  joint.jointObject = this.world.CreateJoint(joint.getDefinition());
  this.joints.push(joint);

  if (!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_ADD);
};

Engine.prototype.removeJoint = function (joint) {
  this.world.DestroyJoint(joint.jointObject);
  this.joints.splice(this.joints.indexOf(joint), 1);

  if (!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_REMOVE);
};

Engine.prototype.setEntityLayer = function (entity, newLayer, silent) {
  // Remove from old layer
  this.layers[entity.layer].splice(this.layers[entity.layer].indexOf(entity), 1);

  // Set new layer
  entity.layer = newLayer;
  this.layers[newLayer].push(entity);

  if (!silent)
    UpdateEvent.fire(UpdateEvent.LAYER_CHANGE, {entities: [entity]});
};

// Returns all entities in one array
Engine.prototype.entities = function () {
  return [].concat.apply([], this.layers);
};

// Returns the entity with id specified by argument
Engine.prototype.getEntityById = function (id) {
  var entities = this.entities();

  for (var i = 0; i < entities.length; i++) {
    if (entities[i].id === id)
      return entities[i];
  }

  return null;
};

// Returns an array of entities with specified collisionGroup
Engine.prototype.getEntitiesByCollisionGroup = function (group) {
  var ret = [];
  var entities = this.entities();

  for (var i = 0; i < entities.length; i++) {
    if (entities[i].collisionGroup === group)
      ret.push(entities[i]);
  }

  return ret;
};

// Checks whether two groups should collide
Engine.prototype.getCollision = function (groupA, groupB) {
  return (this.collisionGroups[groupA].mask >> groupB) & 1;
};

// Sets two groups up to collide
Engine.prototype.setCollision = function (groupA, groupB, value) {
  var maskA = (1 << groupB);
  var maskB = (1 << groupA);

  if (value) {
    this.collisionGroups[groupA].mask = this.collisionGroups[groupA].mask | maskA;
    this.collisionGroups[groupB].mask = this.collisionGroups[groupB].mask | maskB;
  } else {
    this.collisionGroups[groupA].mask = this.collisionGroups[groupA].mask & ~maskA;
    this.collisionGroups[groupB].mask = this.collisionGroups[groupB].mask & ~maskB;
  }
  this.updateCollisions();

  return this;
};

// Selects an entity and shows its properties in the sidebar
Engine.prototype.selectEntity = function (entity, silent) {
  this.selectedEntity = entity;
  UI.buildSidebarTop(this.selectedEntity);

  if (entity)
    entity.recalculateHelpers();

  if (!silent)
    UpdateEvent.fire(UpdateEvent.SELECTION_CHANGE, {noState: true, entities: [entity]});
};

// Updates collision masks for all entities, based on engine's collisionGroups table
Engine.prototype.updateCollisions = function () {
  var entities = this.entities();

  for (var i = 0; i < entities.length; i++) {
    this.updateCollision(entities[i]);
  }

  return this;
};

// Updates collision mask for an entity, based on engine's collisionGroups table
Engine.prototype.updateCollision = function (entity) {
  var filterData = entity.fixture.GetFilterData();
  filterData.set_maskBits(this.collisionGroups[entity.collisionGroup].mask);
  entity.fixture.SetFilterData(filterData);

  UpdateEvent.fire(UpdateEvent.COL_GROUP_CHANGE, {entities: [entity]});

  return this;
};

// One simulation step. Simulation logic happens here.
Engine.prototype.step = function () {
  // FPS timer
  var start = Date.now();

  ctx = this.viewport.context;

  // clear screen
  ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);

  ctx.save();

  if (!this.world.paused) {
    // box2d simulation step
    this.world.Step(1 / Constants.TIME_STEP, 10, 5);

    var entities = this.entities();

    if (this.viewport.getCameraStyle() === CameraStyle.ENTITY) {
      var entity = this.getEntityById(this.viewport.getCameraEntityId());

      this.viewport.x = entity.getX();
      this.viewport.y = entity.getY();
    }

    for (var i = 0; i < entities.length; i++) {
      for (var j = 0; j < entities[i].behaviors.length; j++) {
        var behavior = entities[i].behaviors[j];

        if (behavior.check(entities[i]))
          behavior.result();
      }
    }
  }
  else {
    this.selectedTool.onmove(ctx);
  }

  // draw all entities
  for (var layer = 0; layer < Constants.LAYERS_NUMBER; layer++) {
    for (var entity = this.layers[layer].length - 1; entity >= 0; entity--) {
      this.drawEntity(this.layers[layer][entity], ctx);
    }
  }

  if (this.selectedEntity) {
    this.drawBoundary(ctx);

    if (this.selectedEntity.showHelpers)
      this.drawHelpers(this.selectedEntity, ctx);
  }

  // Released keys are only to be processed once
  this.input.cleanUp();

  var end = Date.now();

  // Call next step
  setTimeout(window.requestAnimationFrame(function () {
    _engine.step();
  }), Math.min(Constants.TIME_STEP - end - start, 0));
};

Engine.prototype.drawBoundary = function (ctx) {
  var halfWidth = this.selectedEntity.getWidth() / 2;
  var halfHeight = this.selectedEntity.getHeight() / 2;
  var x = this.selectedEntity.getX();
  var y = this.selectedEntity.getY();

  ctx.save();

  ctx.translate(
    this.viewport.fromScale(-this.viewport.x + x) + this.viewport.width / 2,
    this.viewport.fromScale(-this.viewport.y + y) + this.viewport.height / 2);

  ctx.rotate(this.selectedEntity.getAngle());

  ctx.globalCompositeOperation = "xor";
  ctx.strokeRect(
    this.viewport.fromScale(-halfWidth),
    this.viewport.fromScale(-halfHeight),
    this.viewport.fromScale(2 * halfWidth),
    this.viewport.fromScale(2 * halfHeight)
  );

  ctx.restore();
};

Engine.prototype.drawHelpers = function (entity, ctx) {
  ctx.save();

  ctx.translate(
    this.viewport.fromScale(-this.viewport.x + entity.getX()) + this.viewport.width / 2,
    this.viewport.fromScale(-this.viewport.y + entity.getY()) + this.viewport.height / 2);
  ctx.rotate(entity.getAngle());

  for (var i = 0; i < entity.helpers.length; i++) {
    ctx.save();

    var x = entity.helpers[i].x;
    var y = entity.helpers[i].y;

    ctx.translate(this.viewport.fromScale(x), this.viewport.fromScale(y));

    entity.helpers[i].draw(ctx);

    ctx.restore();
  }
  ctx.restore();
};

Engine.prototype.drawEntity = function (entity, ctx) {
  ctx.save();

  ctx.translate(
    this.viewport.fromScale(-this.viewport.x + entity.getX()) + this.viewport.width / 2,
    this.viewport.fromScale(-this.viewport.y + entity.getY()) + this.viewport.height / 2);

  ctx.rotate(entity.getAngle());

  if (entity === this.selectedEntity)
    ctx.globalAlpha = 1;

  ctx.fillStyle = entity.color;
  entity.draw(ctx);

  ctx.restore();
};


module.exports = Engine;


