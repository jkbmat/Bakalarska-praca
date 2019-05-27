var UI = require("./UI.js");
var Tools = require("./tools.js");
var TokenManager = require("./tokenManager.js");
var Constants = require("./constants.js");
var UpdateEvent = require("./updateEvent.js");
var StateManager = require("./stateManager.js");
var CameraStyle = require("./cameraStyle.js");
var Geometry = require("./geometry.js");
var Joints = require("./joints.js");
var EntityManager = require("./entityManager");
var JointManager = require("./jointManager");
var ContactManager = require("./contactManager");
var Input = require("./input");

// ENGINE

// constructor

var Engine = function (viewport, gravity) {
  this.viewport = viewport;
  this.selected = {type: null, ptr: null};
  this.selectedTool = Tools.Selection;

  this.entityManager = new EntityManager(this);
  this.jointManager = new JointManager(this);

  this.contactManager = new ContactManager(this);

  this.world = new b2World(gravity, false);
  this.world.paused = true;
  this.world.SetContactListener(this.contactManager);

  this.tokenManager = new TokenManager();
  this.behaviorCurrentEntity = null; // Ugly hack for this() entityFilter :(

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

  if (!this.world.paused) {
    var entities = this.entityManager.entities();

    entities.forEach(function (entity) {
      entity.body.SetAwake(1);
    });

    this.jointManager.joints.forEach(function (joint) {
      if (joint.type === Joints.WELD) {
        joint.updateObject();
      }
    });
  }

  else {
    this.stateManager.buildState(this.stateManager.stateStack[this.stateManager.currentState]);
  }

  this.select(null, null);
  UI.toggleSidebar();
  this.selectTool(this.world.paused ? Tools.Selection : Tools.Blank);
  $("#selectionTool")[0].checked = true;
};

Engine.prototype.createJoint = function (joint) {
  var newJoint = new joint();
  if (this.selected.type === "entity")
    newJoint.setEntityA(this.selected.ptr, true);

  this.select("joint", newJoint);
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

Engine.prototype.setGravityX = function (val, silent) {
  this.setGravity(val, this.getGravityY(), silent);
};

Engine.prototype.setGravityY = function (val, silent) {
  this.setGravity(this.getGravityX(), val, silent);
};

Engine.prototype.selectTool = function (tool, silent) {
  this.selectedTool = tool;

  if (!silent) {
    UpdateEvent.fire(UpdateEvent.TOOL_CHANGE, {noState: true, tool: tool.type});
  }
};

Engine.prototype.select = function (type, ptr, silent) {
  this.selected = {type: type, ptr: ptr};

  if (type === "entity") {
    ptr.recalculateHelpers();
  }

  if (!silent)
    UpdateEvent.fire(UpdateEvent.SELECTION_CHANGE, {noState: true});
};

// One simulation step. Simulation logic happens here.
Engine.prototype.step = function () {
  // FPS timer
  var start = Date.now();

  var ctx = this.viewport.context;

  // clear screen
  ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);

  ctx.save();

  var entities = this.entityManager.entities();

  if (!this.world.paused) {
    // box2d simulation step
    this.world.Step(1 / Constants.TIME_STEP, 10, 5);


    for (var i = 0; i < entities.length; i++) {
      for (var j = 0; j < entities[i].behaviors.length; j++) {
        var behavior = entities[i].behaviors[j];

        this.behaviorCurrentEntity = entities[i]; // Ugly hack to get this() entityFilter :(
        if (behavior.check())
          behavior.result(entities[i]);
      }
    }

    if (this.viewport.getCameraStyle() === CameraStyle.ENTITY) {
      var entity = this.entityManager.getEntityById(this.viewport.getCameraEntityId());

      this.viewport.setPosition(entity.getX(), entity.getY(), true);
    }
  }
  else {
    this.selectedTool.onmove(ctx);
  }

  // draw all entities
  for (var index = 0; index < entities.length; index++) {
    this.drawEntity(entities[index], ctx);
  }

  for (var joint = 0; joint < this.jointManager.joints.length; joint++) {
    this.jointManager.joints[joint].draw(ctx);
  }

  if (this.selected.type === "entity") {
    this.drawBoundary(ctx);

    if (this.selected.ptr.showHelpers)
      this.drawHelpers(this.selected.ptr, ctx);
  }

  // Released keys are only to be processed once
  this.input.cleanUp();

  var end = Date.now();

  // Call next step
  setTimeout(window.requestAnimationFrame(function () {
    _engine.step();
  }), Math.max(Constants.TIME_STEP - (end - start), 0));
};

Engine.prototype.drawBoundary = function (ctx) {
  var halfWidth = this.selected.ptr.getWidth() / 2;
  var halfHeight = this.selected.ptr.getHeight() / 2;
  var x = this.selected.ptr.getX();
  var y = this.selected.ptr.getY();

  ctx.save();

  ctx.translate(
    this.viewport.fromScale(-this.viewport.x + x) + this.viewport.width / 2,
    this.viewport.fromScale(-this.viewport.y + y) + this.viewport.height / 2);

  ctx.rotate(this.selected.ptr.getAngle());

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

  if (entity === this.selected.ptr)
    ctx.globalAlpha = 1;

  ctx.fillStyle = entity.color;
  entity.draw(ctx);

  ctx.restore();
};

Engine.prototype.drawJoint = function (joint, ctx) {

};

module.exports = Engine;

