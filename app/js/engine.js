var UI = require("./ui.js");
var Tools = require("./tools.js");
var TokenManager = require("./tokenmanager.js");
var Constants = require("./constants.js");

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

  this.world = new b2World(gravity, true);
  this.world.paused = true;

  this.tokenManager = new TokenManager();

  var Input = require('./input.js');
  this.input = new Input(viewport);

  $(viewport.canvasElement).on("mousedown", (function () {
    this.selectedTool.onclick();
  }).bind(this));
  $(viewport.canvasElement).on("mouseup", (function () {
    this.selectedTool.onrelease();
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
  }
};

Engine.prototype.vec2 = function (x, y) {
  this.bufferVec2.set_x(x);
  this.bufferVec2.set_y(y);

  return this.bufferVec2;
};

Engine.prototype.selectTool = function (tool) {
  this.selectedTool = tool;
  this.selectEntity(null);
};

Engine.prototype.removeEntity = function (entity) {
  this.selectEntity(null);
  this.world.DestroyBody(entity.body);
  this.layers[entity.layer].splice(this.layers[entity.layer].indexOf(entity), 1);
};

Engine.prototype.setEntityLayer = function (entity, newLayer) {
  // Remove from old layer
  this.layers[entity.layer].splice(this.layers[entity.layer].indexOf(entity), 1);

  // Set new layer
  entity.layer = newLayer;
  this.layers[newLayer].push(entity);
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

// Adding an entity to the world
Engine.prototype.addEntity = function (entity, type) {
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

  return entity;
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

// Changes the ID of an entity
Engine.prototype.changeId = function (entity, id) {
  entity.id = id;
};

// Selects an entity and shows its properties in the sidebar
Engine.prototype.selectEntity = function (entity) {
  this.selectedEntity = entity;

  UI.buildSidebar(this.selectedEntity);
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

  if (!_engine.world.paused) {
    // box2d simulation step
    this.world.Step(1 / Constants.TIME_STEP, 10, 5);
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

  ctx.rotate(this.selectedEntity.body.GetAngle());

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

  var entityX = entity.body.GetPosition().get_x();
  var entityY = entity.body.GetPosition().get_y();

  ctx.translate(
    this.viewport.fromScale(-this.viewport.x + entityX) + this.viewport.width / 2,
    this.viewport.fromScale(-this.viewport.y + entityY) + this.viewport.height / 2);
  ctx.rotate(entity.body.GetAngle());

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

  var x = entity.body.GetPosition().get_x();
  var y = entity.body.GetPosition().get_y();

  ctx.translate(
    this.viewport.fromScale(-this.viewport.x + x) + this.viewport.width / 2,
    this.viewport.fromScale(-this.viewport.y + y) + this.viewport.height / 2);

  ctx.rotate(entity.body.GetAngle());

  if (entity === this.selectedEntity)
    ctx.globalAlpha = 1;

  ctx.fillStyle = entity.color;
  entity.draw(ctx);

  ctx.restore();

  for (var j = 0; j < entity.behaviors.length; j++) {
    var behavior = entity.behaviors[j];

    if (behavior.check(entity))
      behavior.result();
  }
};


module.exports = Engine;


