(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Action = require("./token.js").Action;
var Type = require("./typing.js").Type;

module.exports = [];

var aSetColor = function(ef, color) {
  Action.call(this, "setColor", arguments, [Type.ENTITYFILTER, Type.STRING]);

  this.args.push(ef);
  this.args.push(color);
};
aSetColor.prototype = new Action();

aSetColor.prototype.each = function(entity) {
  entity.setColor(this.args[1].evaluate());
};

aSetColor.prototype.constructor = aSetColor;
module.exports.push(aSetColor);


var aTorque = function(ef, strength) {
  Action.call(this, "applyTorque", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(strength);
};
aTorque.prototype = new Action();

aTorque.prototype.each = function(entity) {
  entity.body.ApplyTorque(entity.getMass() * this.args[1].evaluate());
};

aTorque.prototype.constructor = aTorque;
module.exports.push(aTorque);


var aAngularImpulse = function(ef, strength) {
  Action.call(this, "applyAngularImpulse", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(strength);
};
aAngularImpulse.prototype = new Action();

aAngularImpulse.prototype.each = function(entity) {
  entity.body.ApplyAngularImpulse(entity.getMass() * this.args[1].evaluate());
};

aAngularImpulse.prototype.constructor = aAngularImpulse;
module.exports.push(aAngularImpulse);


var aLinearVelocity = function(ef, x, y) {
  Action.call(this, "setLinearVelocity", arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
};
aLinearVelocity.prototype = new Action();

aLinearVelocity.prototype.each = function(entity) {
  entity.setLinearVelocity(new b2Vec2(this.args[1].evaluate(), this.args[2].evaluate()));
};

aLinearVelocity.prototype.constructor = aLinearVelocity;
module.exports.push(aLinearVelocity);


var aLinearImpulse = function(ef, x, y) {
  Action.call(this, "applyLinearImpulse", ef, arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
};
aLinearImpulse.prototype = new Action();

aLinearImpulse.prototype.each = function(entity) {
  entity.applyLinearImpulse(new b2Vec2(entity.getMass() * this.args[1].evaluate(), entity.getMass() * this.args[2].evaluate()));
};

aLinearImpulse.prototype.constructor = aLinearImpulse;
module.exports.push(aLinearImpulse);


},{"./token.js":12,"./typing.js":15}],2:[function(require,module,exports){
var Type = require("./typing.js").Type;

var Behavior = function(logic, results) {
  this.logic = logic;

  if (this.logic.type !== Type.BOOLEAN)
    throw new TypeException(Type.BOOLEAN, this.logic.type, this);

  this.results = Array.isArray(results) ? results : [results];
};

Behavior.prototype.check = function(entity) {
  return this.logic.evaluate(entity);
};

Behavior.prototype.toString = function() {
  return "Behavior(" + this.logic.toString() + ", " + this.results.toString() + ")";
};

Behavior.prototype.result = function() {
  for (var i = 0; i < this.results.length; i++) {
    this.results[i].execute();
  }
};

module.exports = Behavior;
},{"./typing.js":15}],3:[function(require,module,exports){
var BodyType = {
  DYNAMIC_BODY: Module.b2_dynamicBody,
  STATIC_BODY: Module.b2_staticBody,
  KINEMATIC_BODY: Module.b2_kinematicBody
};

module.exports = BodyType;
},{}],4:[function(require,module,exports){
var UI = require("./ui.js");
var Tools = require("./tools.js");
var TokenManager = require("./tokenmanager.js");


const AUTO_ID_PREFIX = "ENTITY_NUMBER_";

const DISPLAY_RATIO = 20;

/*/ Myslienky

lockovanie kamery na objekt
 * prechody
ako funguje cela kamera?

/*/


// ENGINE

// constructor

var Engine = function(viewport, gravity) {
  this.viewport = viewport;
  this.selectedEntity = null;
  
  this.COLLISION_GROUPS_NUMBER = 16;
  this.LAYERS_NUMBER = 10;

  this.layers = new Array(this.LAYERS_NUMBER);
  for (var i = 0; i < this.LAYERS_NUMBER; i++)
  {
    this.layers[i] = [];
  }

  this.collisionGroups = [];
  for (var i = 0; i < this.COLLISION_GROUPS_NUMBER; i++) {
    this.collisionGroups.push({
      "name": i + 1,
      "mask": parseInt(Array(this.COLLISION_GROUPS_NUMBER + 1).join("1"), 2)
    });
  }

  this.lifetimeEntities = 0;

  this.world = new b2World(gravity, true);
  this.world.paused = true;

  this.tokenManager = new TokenManager();

  Input.initialize(viewport.canvasElement);
};

// Changes running state of the simulation
Engine.prototype.togglePause = function () {
  this.world.paused = !this.world.paused;
  this.selectedEntity = null;

  Input.tool = Tools.Blank;

  if(this.world.paused)
    Input.tool = Tools.Selection;
};

Engine.prototype.removeEntity = function (entity) {
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
Engine.prototype.getEntityById = function(id) {
  var entities = this.entities();

  for (var i = 0; i < entities.length; i++) {
    if (entities[i].id === id)
      return entities[i];
  }

  return null;
};

// Returns an array of entities with specified collisionGroup
Engine.prototype.getEntitiesByCollisionGroup = function(group) {
  var ret = [];
  var entities = this.entities();

  for (var i = 0; i < entities.length; i++) {
    if (entities[i].collisionGroup === group)
      ret.push(entities[i]);
  }

  return ret;
};

// Adding an entity to the world
Engine.prototype.addEntity = function(entity, type) {
  // generate auto id
  if (entity.id === undefined) {
    entity.id = AUTO_ID_PREFIX + this.lifetimeEntities;
  }

  this.lifetimeEntities++;

  entity.body.set_type(type);

  entity.body = this.world.CreateBody(entity.body);
  entity.fixture = entity.body.CreateFixture(entity.fixture);

  this.layers[entity.layer].push(entity);

  return entity;
};

// Checks whether two groups should collide
Engine.prototype.getCollision = function(groupA, groupB) {
  return (this.collisionGroups[groupA].mask >> groupB) & 1;
};

// Sets two groups up to collide
Engine.prototype.setCollision = function(groupA, groupB, value) {
  var maskA = (1 << groupB);
  var maskB = (1 << groupA);

  if (value) {
    this.collisionGroups[groupA].mask = this.collisionGroups[groupA].mask | maskA;
    this.collisionGroups[groupB].mask = this.collisionGroups[groupB].mask | maskB;
  } else {
    this.collisionGroups[groupA].mask = this.collisionGroups[groupA].mask & ~maskA;
    this.collisionGroups[groupB].mask = this.collisionGroups[groupB].mask & ~maskB;
  }
  this.updateCollisions()

  return this;
}

// Changes the ID of an entity
Engine.prototype.changeId = function (entity, id) {
  entity.id = id;
};

// Selects an entity and shows its properties in the sidebar
Engine.prototype.selectEntity = function (entity) {
  this.selectedEntity = entity === null ? null : entity;
  UI.buildSidebar(this.selectedEntity);
}

// Updates collision masks for all entities, based on engine's collisionGroups table
Engine.prototype.updateCollisions = function() {
  var entities = this.entities();

  for (var i = 0; i < entities.length; i++) {
    this.updateCollision(entities[i]);
  }

  return this;
};

// Updates collision mask for an entity, based on engine's collisionGroups table
Engine.prototype.updateCollision = function(entity) {
  var filterData = entity.fixture.GetFilterData();
  filterData.set_maskBits(this.collisionGroups[entity.collisionGroup].mask);
  entity.fixture.SetFilterData(filterData);

  return this;
}

// One simulation step. Simulation logic happens here.
Engine.prototype.step = function() {
  // FPS timer
  var start = Date.now();

  ctx = this.viewport.context;

  // clear screen
  ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);

  ctx.save();

  // draw all entities
  for (var i = 0; i < this.LAYERS_NUMBER; i++)
  {
    this.drawArray(this.layers[i], ctx);
  }

  if (!_engine.world.paused) {
    // box2d simulation step
    this.world.Step(1 / 60, 10, 5);
  }
  else {
    Input.tool.onmove(ctx);
  }
  

  // Released keys are only to be processed once
  Input.mouse.cleanUp();
  Input.keyboard.cleanUp();

  var end = Date.now();

  // Call next step
  setTimeout(window.requestAnimationFrame(function() {
    _engine.step()
  }), Math.min(60 - end - start, 0));
};

Engine.prototype.drawArray = function(array, ctx) {
  for (var i = array.length - 1; i >= 0; i--) {
    ctx.save();
    ctx.translate(this.viewport.x - this.viewport.width / 2, this.viewport.y - this.viewport.height / 2);
    ctx.fillStyle = array[i].color;

    if(this.selectedEntity === array[i]) {
      ctx.shadowColor = "black";
      ctx.shadowBlur = 10;
    }

    var x = array[i].body.GetPosition().get_x();
    var y = array[i].body.GetPosition().get_y();
    ctx.translate(x, y);
    ctx.rotate(array[i].body.GetAngle());

    array[i].draw(ctx);

    ctx.restore();

    for (var j = 0; j < array[i].behaviors.length; j++) {
      var behavior = array[i].behaviors[j];

      if (behavior.check(array[i]))
        behavior.result();
    }
  }
};


module.exports = Engine;
},{"./tokenmanager.js":13,"./tools.js":14,"./ui.js":16}],5:[function(require,module,exports){
// ENTITY
var Utils = require("./utils.js");

const AUTO_COLOR_RANGE = [0, 230];

var Entity = function(shape, fixture, body, id, collisionGroup) {
  this.id = id;
  this.dead = false;
  this.layer = 0;

  this.fixedRotation = false;

  this.collisionGroup = collisionGroup;
  if (this.collisionGroup == undefined) {
    this.collisionGroup = 0;
  }

  this.behaviors = [];

  this.fixture = fixture;
  if (this.fixture == undefined) {
    var fixture = new b2FixtureDef();
    fixture.set_density(10)
    fixture.set_friction(0.5);
    fixture.set_restitution(0.2);

    this.fixture = fixture;
  }
  this.fixture.set_shape(shape);

  var filterData = this.fixture.get_filter();
  filterData.set_categoryBits(1 << collisionGroup);

  // Constructor is called when inheriting, so we need to check for _engine availability
  if (typeof _engine !== 'undefined')
    filterData.set_maskBits(_engine.collisionGroups[this.collisionGroup].mask);

  this.fixture.set_filter(filterData);

  this.body = body;
  if (this.body !== undefined)
    this.body.set_fixedRotation(false);

  // Auto generate color
  var r = Utils.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]).toString(16); r = r.length == 1 ? "0" + r : r;
  var g = Utils.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]).toString(16); g = g.length == 1 ? "0" + g : g;
  var b = Utils.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]).toString(16); b = b.length == 1 ? "0" + b : b;
  this.color = "#" + r  + g + b ;
}

Entity.prototype.die = function() {
  this.dead = true;

  

  return this;
};

Entity.prototype.draw = function() {
  alert("ERROR! Cannot draw Entity: Use derived classes.");
}

Entity.prototype.setColor = function(color) {
  this.color = color;

  return this;
}

Entity.prototype.setId = function(id) {
  this.id = id;

  return this;
}


Entity.prototype.setCollisionGroup = function(group) {
  this.collisionGroup = group;

  var filterData = this.fixture.GetFilterData();
  filterData.set_categoryBits(1 << group);
  this.fixture.SetFilterData(filterData);

  _engine.updateCollision(this);

  return this;
}

Entity.prototype.getLinearVelocity = function() {
  return this.body.GetLinearVelocity();
}

Entity.prototype.getMass = function() {
  return Math.max(1, this.body.GetMass());
}

Entity.prototype.setLinearVelocity = function(vector) {
  this.body.SetLinearVelocity(vector);

  return this;
}

Entity.prototype.applyTorque = function(force) {
  this.body.ApplyTorque(force);

  return this;
}

Entity.prototype.applyLinearImpulse = function(vector) {
  this.body.ApplyLinearImpulse(vector, this.body.GetWorldCenter());

  return this;
}

Entity.prototype.disableRotation = function(value) {
  this.fixedRotation = value;
  this.body.SetFixedRotation(value)

  return this;
}

Entity.prototype.addBehavior = function(behavior) {
  this.behaviors.push(behavior);

  return this;
}


module.exports = Entity;
},{"./utils.js":18}],6:[function(require,module,exports){
var EntityFilter = require("./token.js").EntityFilter;
var Type = require("./typing.js").Type;

module.exports = [];

var efById = function(id) {
  EntityFilter.call(this, "filterById", arguments, [Type.STRING]);

  this.args.push(id);
};
efById.prototype = new EntityFilter();

efById.prototype.decide = function(entity) {
  return entity.id === this.args[0].evaluate();
};

efById.prototype.constructor = efById;
module.exports.push(efById);


var efByCollisionGroup = function(group) {
  EntityFilter.call(this, "filterByGroup", arguments, [Type.NUMBER]);

  this.args.push(group);
};
efByCollisionGroup.prototype = new EntityFilter();

efByCollisionGroup.prototype.decide = function(entity) {
  return entity.collisionGroup === this.args[0].evaluate();
};

efByCollisionGroup.prototype.constructor = efByCollisionGroup;
module.exports.push(efByCollisionGroup);


var efByLayer = function(layer) {
  EntityFilter.call(this, "filterByLayer", arguments, [Type.NUMBER]);

  this.args.push(layer);
};
efByLayer.prototype = new EntityFilter();

efByLayer.prototype.decide = function(entity) {
  return entity.layer === this.args[0].evaluate();
};

efByLayer.prototype.constructor = efByLayer;
module.exports.push(efByLayer);
},{"./token.js":12,"./typing.js":15}],7:[function(require,module,exports){
require("./input.js");

var Engine = require("./engine.js");
var Viewport = require("./viewport.js");
var UI = require("./ui.js");
var BodyType = require("./bodytype.js");
var Behavior = require("./behavior.js");

var Circle = require("./shapes.js").Circle;
var Rectangle = require("./shapes.js").Rectangle;

UI.initialize();

_engine = new Engine(new Viewport($("#mainCanvas")[0]), new b2Vec2(0, 500));

_engine.addEntity(new Circle(new b2Vec2(500, 50), 20), BodyType.DYNAMIC_BODY)
  .setCollisionGroup(2)
  .setId("kruh")
  .disableRotation(false)
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("isButtonUp(number(32))"),
      _engine.tokenManager.parser.parse("setLinearVelocity(filterById(text(kruh)), getVelocityX(filterById(text(kruh))), number(-999999999999999999))")
    )
  )
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("isButtonDown(number(37))"),
      _engine.tokenManager.parser.parse("setLinearVelocity(filterById(text(kruh)), number(-100), getVelocityY(filterById(text(kruh))))")
    )
  )
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("isButtonDown(number(39))"),
      _engine.tokenManager.parser.parse("setLinearVelocity(filterById(text(kruh)), number(100), getVelocityY(filterById(text(kruh))))")
    )
  );

_engine.addEntity(new Rectangle(new b2Vec2(400, 400), new b2Vec2(400, 3)), BodyType.KINEMATIC_BODY)
  .setId("platform")
  .setCollisionGroup(1);

window.requestAnimationFrame(function() {
  _engine.step();
});





},{"./behavior.js":2,"./bodytype.js":3,"./engine.js":4,"./input.js":8,"./shapes.js":11,"./ui.js":16,"./viewport.js":19}],8:[function(require,module,exports){
// INPUT CAPTURING

var Tools = require("./tools.js");

window.Input = {
  tool: Tools.Selection,

  mouse: {
    x: 0,
    y: 0,
    leftDown: false,
    rightDown: false,
    leftUp: false,
    rightUp: false,

    updatePosition: function (event) {
      this.x = event.pageX - _engine.viewport.canvasElement.getBoundingClientRect().left;
      this.y = event.pageY - _engine.viewport.canvasElement.getBoundingClientRect().top;
    },

    updateButtonsDown: function (event) {
      if (event.target != _engine.viewport.canvasElement)
        return true;

      if (event.which === 1) {
        this.leftDown = true;

        Input.tool.onclick();
      }

      if (event.which === 3)
        this.rightDown = true;

      event.preventDefault();
    },

    updateButtonsUp: function (event) {
      if (event.target != _engine.viewport.canvasElement)
        return true;

      if (event.which === 1) {
        this.leftDown = false;
        this.leftUp = true;

        Input.tool.onrelease();
      }

      if (event.which === 3) {
        this.rightDown = false;
        this.rightUp = true;
      }
    },

    cleanUp: function () {
      this.leftUp = false;
      this.rightUp = false;
    }
  },

  keyboard: {
    down: new Set(),
    up: new Set(),

    isDown: function (keyCode) {
      return this.down.has(keyCode)
    },

    isUp: function (keyCode) {
      return this.up.has(keyCode);
    },

    updateButtonsDown: function (event) {
      this.down.add(event.which);

      if(event.which === 32)
        event.preventDefault();
    },

    updateButtonsUp: function (event) {
      this.down.delete(event.which);
      this.up.add(event.which);
    },

    cleanUp: function () {
      this.up.clear();
    }
  },

  initialize: function(element) {
    element.onmousemove = function(e) {
      Input.mouse.updatePosition(e);
    };
    element.onmousedown = function(e) {
      Input.mouse.updateButtonsDown(e);
    };
    element.onmouseup = function(e) {
      Input.mouse.updateButtonsUp(e);
    };

    document.onkeydown = function(e) {
      Input.keyboard.updateButtonsDown(e);
    };
    document.onkeyup = function(e) {
      Input.keyboard.updateButtonsUp(e);
    };
  }
};


},{"./tools.js":14}],9:[function(require,module,exports){
var Logic = require("./token.js").Logic;
var Type = require("./typing.js").Type;
var FixType = require("./typing.js").FixType;

module.exports = [];

var lAnd = function (a, b) {
  Logic.call(this, "AND", Type.BOOLEAN, arguments, [Type.BOOLEAN, Type.BOOLEAN]);

  this.fixType = FixType.INFIX;

  this.args.push(a);
  this.args.push(b);
};
lAnd.prototype = new Logic();

lAnd.prototype.evaluate = function () {
  return (this.args[0].evaluate() && this.args[1].evaluate());
};

lAnd.prototype.constructor = lAnd;
module.exports.push(lAnd);


var lOr = function (a, b) {
  Logic.call(this, "OR", Type.BOOLEAN, arguments, [Type.BOOLEAN, Type.BOOLEAN]);

  this.fixType = FixType.INFIX;

  this.args.push(a);
  this.args.push(b);
};
lOr.prototype = new Logic();

lOr.prototype.evaluate = function () {
  if (this.args[0].evaluate() || this.args[1].evaluate())
    return true;

  return false;
};

lOr.prototype.constructor = lOr;
module.exports.push(lOr);


var lNot = function (a) {
  Logic.call(this, "NOT", Type.BOOLEAN, arguments, [Type.BOOLEAN]);

  this.args.push(a);
};
lNot.prototype = new Logic();

lNot.prototype.evaluate = function () {
  return !this.args[0].evaluate();
};

lNot.prototype.constructor = lNot;
module.exports.push(lNot);


var lString = function (value) {
  Logic.call(this, "text", Type.STRING, arguments, [Type.LITERAL]);

  this.args.push(value);
};
lString.prototype = new Logic();

lString.prototype.evaluate = function () {
  return this.args[0];
};

lString.prototype.constructor = lString;
module.exports.push(lString);


var lNumber = function (value) {
  Logic.call(this, "number", Type.NUMBER, arguments, [Type.LITERAL]);

  this.args.push(value);
};
lNumber.prototype = new Logic();

lNumber.prototype.evaluate = function () {
  return parseFloat(this.args[0]);
};

lNumber.prototype.constructor = lNumber;
module.exports.push(lNumber);


var lBool = function (value) {
  Logic.call(this, "boolean", Type.BOOLEAN, arguments, [Type.LITERAL]);

  this.args.push(value);
};
lBool.prototype = new Logic();

lBool.prototype.evaluate = function () {
  return this.args[0] === "true";
};

lBool.prototype.constructor = lBool;
module.exports.push(lBool);


var lButtonDown = function (button) {
  Logic.call(this, "isButtonDown", Type.BOOLEAN, arguments, [Type.NUMBER]);

  this.args.push(button);
};
lButtonDown.prototype = new Logic();

lButtonDown.prototype.evaluate = function () {
  return Input.keyboard.isDown(this.args[0].evaluate());
};

lButtonDown.prototype.constructor = lButtonDown;
module.exports.push(lButtonDown);


var lButtonUp = function (button) {
  Logic.call(this, "isButtonUp", Type.BOOLEAN, arguments, [Type.NUMBER]);

  this.args.push(button);
};
lButtonUp.prototype = new Logic();

lButtonUp.prototype.evaluate = function () {
  return Input.keyboard.isUp(this.args[0].evaluate());
};

lButtonUp.prototype.constructor = lButtonUp;
module.exports.push(lButtonUp);


var lRandom = function (min, max) {
  Logic.call(this, "randomNumber", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(min);
  this.args.push(max);
};
lRandom.prototype = new Logic();

lRandom.prototype.evaluate = function () {
  return Utils.randomRange(this.args[0].evaluate() && this.args[1].evaluate());
};

lRandom.prototype.constructor = lRandom;
module.exports.push(lRandom);


var lVelocityX = function (ef) {
  Logic.call(this, "getVelocityX", Type.NUMBER, arguments, [Type.ENTITYFILTER]);

  this.args.push(ef);
};
lVelocityX.prototype = new Logic();

lVelocityX.prototype.evaluate = function () {
  var entity = this.args[0].filter()[0];

  return entity.body.GetLinearVelocity().get_x();
};

lVelocityX.prototype.constructor = lVelocityX;
module.exports.push(lVelocityX);


var lVelocityY = function (ef) {
  Logic.call(this, "getVelocityY", Type.NUMBER, arguments, [Type.ENTITYFILTER]);

  this.args.push(ef);
};
lVelocityY.prototype = new Logic();

lVelocityY.prototype.evaluate = function () {
  var entity = this.args[0].filter()[0];

  return entity.body.GetLinearVelocity().get_y();
};

lVelocityY.prototype.constructor = lVelocityY;
module.exports.push(lVelocityY);


var lPlus = function (a, b) {
  Logic.call(this, "+", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lPlus.prototype = new Logic();

lPlus.prototype.evaluate = function () {
  return this.args[0].evaluate() + this.args[1].evaluate();
};

lPlus.prototype.constructor = lPlus;
module.exports.push(lPlus);


var lMultiply = function (a, b) {
  Logic.call(this, "*", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lMultiply.prototype = new Logic();

lMultiply.prototype.evaluate = function () {
  return this.args[0].evaluate() * this.args[1].evaluate();
};

lMultiply.prototype.constructor = lMultiply;
module.exports.push(lMultiply);


var lDivide = function (a, b) {
  Logic.call(this, "/", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lDivide.prototype = new Logic();

lDivide.prototype.evaluate = function () {
  return this.args[0].evaluate() / this.args[1].evaluate();
};

lDivide.prototype.constructor = lDivide;
module.exports.push(lDivide);


var lMinus = function (a, b) {
  Logic.call(this, "-", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
};
lMinus.prototype = new Logic();

lMinus.prototype.evaluate = function () {
  return this.args[0].evaluate() + this.args[1].evaluate();
};

lMinus.prototype.constructor = lMinus;
module.exports.push(lMinus);
},{"./token.js":12,"./typing.js":15}],10:[function(require,module,exports){
var FixType = require("./typing").FixType;
var Type = require("./typing").Type;

var TypeException = function(expected, received, token) {
  this.expected = expected;
  this.received = received;
  this.token = token;
};

var Parser = function (tokenManager) {
  this.tokenManager = tokenManager;

  this.stopChars = ["(", ")", ","];

  this.parserInput = "";
  this.parserInputWhole = "";
  this.parserStack = [];
};

Parser.prototype.parse = function(input) {
  this.parserInput = input;
  this.parserInputWhole = input;
  this.parserStack = [];

  do {
    this.parseStep();
  } while (this.parserInput.length);

  var ret = this.parserStack.pop();

  if (this.parserStack.length)
    throw "Unexpected " + ret.name;

  return ret;
};

Parser.prototype.readWhitespace = function() {
  while (/\s/.test(this.parserInput[0]) && this.parserInput.length) {
    this.parserInput = this.parserInput.slice(1);
  }
};

Parser.prototype.parseName = function() {
  this.readWhitespace();

  var ret = "";

  while (!/\s/.test(this.parserInput[0]) && this.parserInput.length && this.stopChars.indexOf(this.parserInput[0]) === -1) // read until a whitespace occurs
  {
    ret += this.parserInput[0];
    this.parserInput = this.parserInput.slice(1);
  }

  this.readWhitespace();

  return ret;
};

Parser.prototype.readChar = function(char) {
  this.readWhitespace();

  if (this.parserInput[0] !== char) {
    var position = this.parserInputWhole.length - this.parserInput.length;
    throw "Expected '" + char + "' at position " + position + " at '" + this.parserInputWhole.substr(position) + "'";
  }

  this.parserInput = this.parserInput.slice(1);

  this.readWhitespace();
};

Parser.prototype.parseStep = function(expectedType) {
  var name = this.parseName();
  var token = this.tokenManager.getTokenByName(name);

  if (token === undefined && expectedType === Type.LITERAL) {
    return name;
  }

  if (token == undefined) {
    throw "Expected argument with type " + expectedType;
  }

  if (expectedType !== undefined && token.type !== expectedType) {
    throw "Unexpected " + token.type + " (was expecting " + expectedType + ")";
  }

  var numArgs = token.argument_types.length;

  var args = [];

  if (token.fixType === FixType.INFIX) {
    var a = this.parserStack.pop();

    if (a.type !== token.argument_types[0])
      throw "Unexpected " + a.type + " (was expecting " + token.argument_types[0] + ")";

    args = [a, this.parseStep(token.argument_types[1])];
    this.parserStack.pop();
  }

  if (token.fixType === FixType.PREFIX) {
    this.readChar("(");

    for (i = 0; i < numArgs; i++) {
      args.push(this.parseStep(token.argument_types[i]));

      this.readWhitespace();

      if (this.parserInput[0] === ",")
        this.parserInput = this.parserInput.slice(1);
    }

    this.readChar(")");
  }

  var newToken = new token.constructor();
  for (var i = 0; i < args.length; i++) {
    newToken.args[i] = args[i];

    this.parserStack.pop();
  }
  this.parserStack.push(newToken);

  return newToken;
};

module.exports = Parser;
},{"./typing":15}],11:[function(require,module,exports){
var Entity = require("./entity.js");

// Circle entity
var Circle = function(center, radius, fixture, id, collisionGroup) {
  var shape = new b2CircleShape();
  shape.set_m_radius(radius);

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.radius = radius;

  return this;
}
Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.draw = function(ctx) {
  ctx.beginPath();

  ctx.arc(0, 0, this.radius, 0, 2 * Math.PI, false);

  ctx.fill();

  ctx.strokeStyle = "red";
  ctx.globalCompositeOperation = "destination-out";

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, this.radius);
  ctx.stroke();
  ctx.closePath();
}


// Rectangle entity
var Rectangle = function(center, extents, fixture, id, collisionGroup) {
  var shape = new b2PolygonShape();
  shape.SetAsBox(extents.get_x(), extents.get_y())

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.extents = extents;

  return this;
}
Rectangle.prototype = new Entity();
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.draw = function(ctx) {
  var halfWidth = this.extents.get_x();
  var halfHeight = this.extents.get_y();

  ctx.fillRect(-halfWidth, -halfHeight, halfWidth * 2, halfHeight * 2);
}


module.exports.Circle = Circle;
module.exports.Rectangle = Rectangle;
},{"./entity.js":5}],12:[function(require,module,exports){
var FixType = require("./typing.js").FixType;
var Type = require("./typing.js").Type;

var Token = function(name, type, args, argument_types) {
  this.type = type;
  this.fixType = FixType.PREFIX;
  this.name = name;
  this.args = args == undefined ? [] : args;
  this.argument_types = argument_types;
  this.args = [];

  for (var i = 0; i < this.args.length; i++) {
    if (args[i].type !== argument_types[i] && argument_types[i] !== Type.LITERAL)
      throw new TypeException(argument_types[i], args[i].type, this);
  }
};

Token.prototype.toString = function() {
  var ret = "";
  var argStrings = [];

  for (var i = 0; i < this.args.length; i++) {
    argStrings.push(this.args[i].toString());
  }

  argStrings = argStrings.join(", ");

  switch (this.fixType) {
    case FixType.PREFIX:
      ret = this.name + "(" + argStrings + ")";
      break;
    case FixType.INFIX:
      ret = this.args[0].toString() + " " + this.name + " " + this.args[1].toString();
      break;
  }

  return ret;
};



var Logic = function(name, type, args, argument_types) {
  Token.call(this, name, type, args, argument_types);
};
Logic.prototype = new Token();
Logic.prototype.constructor = Logic;

Logic.prototype.evaluate = function() { // Use a derived class
  return false;
};


var Action = function(name, args, argument_types) {
  Token.call(this, name, Type.ACTION, args, argument_types);
};
Action.prototype = new Token();
Action.prototype.constructor = Action;

Action.prototype.each = function(entity) { // Use a derived class
  return false;
};

Action.prototype.execute = function() {
  var entities = this.args[0].filter();
  for (var i = 0; i < entities.length; i++) {
    this.each(entities[i]);
  }
};


var EntityFilter = function(name, args, argument_types) {
  Token.call(this, name, Type.ENTITYFILTER, args, argument_types);
};
EntityFilter.prototype = new Token();
EntityFilter.prototype.constructor = EntityFilter;

EntityFilter.prototype.decide = function(entity) { // Use derived class
  return false;
};

EntityFilter.prototype.filter = function() {
  var ret = [];
  var entities = _engine.entities();
  
  for (var i = 0; i < entities.length; i++) {
    if (this.decide(entities[i]))
      ret.push(entities[i]);
  }
  return ret;
};

module.exports.Token = Token;
module.exports.Action = Action;
module.exports.Logic = Logic;
module.exports.EntityFilter = EntityFilter;

// TODO: linear action, porovnavanie, uhly, plus, minus , deleno, krat, x na n
},{"./typing.js":15}],13:[function(require,module,exports){
var Parser = require("./parser.js");

var TokenManager = function () {
  this.tokens = [];

  this.registerTokens(require("./logic.js"));
  this.registerTokens(require("./actions.js"));
  this.registerTokens(require("./entityfilters.js"));

  this.parser = new Parser(this);
};

TokenManager.prototype.registerTokens = function (tokens) {
  tokens.forEach(function (token) {
    this.tokens.push(new token());
  }, this);
};

TokenManager.prototype.getTokenByName = function (name) {
  for (var i = 0; i < this.tokens.length; i++)
  {
    if (this.tokens[i].name === name)
      return this.tokens[i];
  }
};

TokenManager.prototype.getTokensByType = function (type) {
  var ret = [];

  this.tokens.forEach(function (token) {
    if (token.type === type)
      ret.push(token);
  });

  return ret;
};

module.exports = TokenManager;
},{"./actions.js":1,"./entityfilters.js":6,"./logic.js":9,"./parser.js":10}],14:[function(require,module,exports){
var Shape = require("./shapes.js");
var Type = require("./bodytype.js");

var Blank = {
  onclick: function () {},
  onrelease: function () {},
  onmove: function () {}
};


var Selection = {
  onclick: function () {
    _engine.selectEntity(null);

    for (var i = _engine.LAYERS_NUMBER - 1; i >= 0; i--) {
      for (var j = 0; j < _engine.layers[i].length; j++) {
        if (_engine.layers[i][j].fixture.TestPoint(
            new b2Vec2(_engine.viewport.x - _engine.viewport.width / 2 + Input.mouse.x, _engine.viewport.y - _engine.viewport.height / 2 + Input.mouse.y))
        ) {
          _engine.selectEntity(_engine.layers[i][j]);
          return;
        }
      }
    }
  },
  onrelease: function () {},
  onmove: function () {}
};


var Rectangle = {
  origin: null,
  w: 0,
  h: 0,
  minSize: 5,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [Input.mouse.x, Input.mouse.y];
  },

  onrelease: function () {
    if (this.w >= this.minSize && this.h >= this.minSize)
      _engine.addEntity(new Shape.Rectangle(
        new b2Vec2(this.origin[0] + this.w / 2, this.origin[1] + this.h / 2),
        new b2Vec2(this.w / 2, this.h / 2)), Type.DYNAMIC_BODY);

    this.onmove = function(){};
    this.origin = null;
    this.w = this.h = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.w = Input.mouse.x - this.origin[0];
    this.h = Input.mouse.y - this.origin[1];

    if (this.w < this.minSize || this.h < this.minSize)
      return;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(this.origin[0], this.origin[1], this.w, this.h);
    ctx.restore();
  }
};


var Circle = {
  origin: null,
  radius: 0,
  minRadius: 5,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [Input.mouse.x, Input.mouse.y];
  },

  onrelease: function () {
    if (this.radius >= this.minRadius)
      _engine.addEntity(new Shape.Circle(
        new b2Vec2(this.origin[0] + this.radius, this.origin[1] + this.radius),
        this.radius), Type.DYNAMIC_BODY);

    this.onmove = function(){};
    this.origin = null;
    this.radius = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.radius = Math.min(Input.mouse.x - this.origin[0], Input.mouse.y - this.origin[1]) / 2;

    if (this.radius < this.minRadius)
      return;

    ctx.save();
    ctx.beginPath();

    ctx.arc(this.origin[0] + this.radius, this.origin[1] + this.radius, this.radius, 0, 2 * Math.PI, false);

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fill();

    ctx.restore();
  }
};

module.exports.Blank = Blank;
module.exports.Selection = Selection;
module.exports.Rectangle = Rectangle;
module.exports.Circle = Circle;
},{"./bodytype.js":3,"./shapes.js":11}],15:[function(require,module,exports){
var Type = {
  BOOLEAN: "boolean",
  NUMBER: "number",
  STRING: "string",
  ARRAY: "array",
  ACTION: "action",
  ENTITYFILTER: "entityFilter",
  LITERAL: "literal"
};

var FixType = {
  INFIX: "infix",
  PREFIX: "prefix"
};

module.exports.Type = Type;
module.exports.FixType = FixType;
},{}],16:[function(require,module,exports){
var Tools = require("./tools.js");
var BodyType = require("./bodytype.js");
var UIBuilder = require("./uibuilder.js");

// Object for building the UI
var UI = {
  // UI initialisation
  initialize: function() {
    var languages = [];
    for (var i = 0; i < Translations.strings.length; i++) {
      languages.push({text: Translations.getTranslated(0, i), value: i});
    }

    var properties = [
      {
        type: "button",

        id: "play",
        text: Translations.getTranslatedWrapped(2),
        onclick: function () {
          _engine.togglePause();

          if (_engine.world.paused) {
            $("#play").html(Translations.getTranslatedWrapped(2));

            $("#collisions, #tool").each(function () {
              this.enable();
            });
          }
          else {
            $("#play").html(Translations.getTranslatedWrapped(3));

            $("#collisions, #tool").each(function () {
              this.disable();
            });
          }
        }
      },
      {type: "break"},
      {
        type: "button",

        id: "collisions",
        text: Translations.getTranslatedWrapped(1),
        onclick: function () {
          UIBuilder.popup(UI.createCollisions());
        }
      },
      {type: "break"},
      {
        type: "radio",

        id: "tool",
        elements: [
          {
            text: Translations.getTranslatedWrapped(17), checked: true, onclick: function () {
            Input.tool = Tools.Selection;
          }
          },
          {
            text: Translations.getTranslatedWrapped(18), onclick: function () {
            Input.tool = Tools.Rectangle;
          }
          },
          {
            text: Translations.getTranslatedWrapped(19), onclick: function () {
            Input.tool = Tools.Circle;
          }
          },
        ]
      },
      {type: "break"},
      {
        type: "select",
        options: languages,

        onchange: function (value) {
          Translations.setLanguage(value * 1);
        },
      }
    ];

    UIBuilder.buildLayout();
    $(".ui.toolbar")[0].appendChild(UIBuilder.build(properties));
    $(".ui.content")[0].appendChild(el("canvas#mainCanvas"));

  },

  // Building the collision group table
  createCollisions: function() {
    var table = el("table.collisionTable");

    for (var i = 0; i < _engine.COLLISION_GROUPS_NUMBER + 1; i++) {
      var tr = el("tr");

      for (var j = 0; j < _engine.COLLISION_GROUPS_NUMBER + 1; j++) {
        var td = el("td");

        // first row
        if (i === 0 && j > 0) {
          td.innerHTML = "<div><span>" + _engine.collisionGroups[j - 1].name + "</span></div>";
        }

        // first column
        else if (j === 0 && i !== 0)
          td.innerHTML = _engine.collisionGroups[i - 1].name;

        // relevant triangle
        else if (i <= j && j !== 0 && i !== 0) {
          td.row = i;
          td.col = j;

          // highlighting
          td.onmouseover = function(i, j, table) {
            return function() {
              var tds = table.getElementsByTagName("td");
              for (var n = 0; n < tds.length; n++) {
                tds[n].className = "";

                // only highlight up to the relevant cell
                if ((tds[n].row === i && tds[n].col <= j) || (tds[n].col === j && tds[n].row <= i))
                  tds[n].className = "highlight";
              }
            }
          }(i, j, table);

          // more highlighting
          td.onmouseout = function(table) {
            return function() {
              var tds = table.getElementsByTagName("td");
              for (var n = 0; n < tds.length; n++) {
                tds[n].className = "";
              }
            }
          }(table);

          // checkbox for collision toggling
          var checkbox = el("input", {type: "checkbox"});

          if (_engine.getCollision(i - 1, j - 1))
            checkbox.setAttribute("checked", "checked");

          checkbox.onchange = function(i, j, checkbox) {
            return function() {
              _engine.setCollision(i - 1, j - 1, checkbox.checked ? 1 : 0);
            }
          }(i, j, checkbox);

          // clicking the checkbox's cell should work as well
          td.onclick = function(checkbox) {
            return function(e) {
              if (e.target === checkbox)
                return true;

              checkbox.checked = !checkbox.checked;
              checkbox.onchange();
            };
          }(checkbox);

          td.appendChild(checkbox);
        }

        // fix for also highlighting cells without checkboxes
        else {
          td.row = i;
          td.col = j;
        }

        tr.appendChild(td);
      }

      table.appendChild(tr);
    }

    return table;
  },

  createBehavior: function (entity) {
    return "TODO";

    var logic = el("textarea");
    logic.innerHTML = entity.behaviors[0].toString();

    return el("div", [
      Translations.getTranslatedWrapped(5), el("br"),
      logic,
      el.p(),
      Translations.getTranslatedWrapped(6), el("br"),

    ]);
  },

  buildSidebar: function (entity) {
    var sidebar = $(".sidebar.ui .content");

    sidebar.html("");

    if (entity === null) {
      return;
    }

    var properties = [
      // ID
      { type: "html", content: Translations.getTranslatedWrapped(7)},
      { type: "inputText", value: entity.id, oninput: function (val) {_engine.changeId(entity, val);}},
      { type: "html", content: el("p")},

      // Collision group
      { type: "html", content: Translations.getTranslatedWrapped(8)},
      { type: "inputNumber", value: entity.collisionGroup + 1, min: 1, max: _engine.COLLISION_GROUPS_NUMBER,
        oninput: function (val) {entity.setCollisionGroup(val * 1 - 1);}},
      { type: "html", content: el("p")},

      // Layer
      { type: "html", content: Translations.getTranslatedWrapped(21)},
      { type: "inputNumber", value: entity.layer + 1, min: 1, max: _engine.LAYERS_NUMBER,
        oninput: function (val) { _engine.setEntityLayer(entity, val*1 - 1); }},
      { type: "html", content: el("p")},

      // X
      { type: "html", content: Translations.getTranslatedWrapped(9)},
      { type: "inputNumber", value: entity.body.GetPosition().get_x(),
        oninput: function (val) {
          entity.body.SetTransform(new b2Vec2(val * 1, entity.body.GetPosition().get_y()), entity.body.GetAngle());
        }},
      { type: "html", content: el("p")},

      // Y
      { type: "html", content: Translations.getTranslatedWrapped(10)},
      { type: "inputNumber", value: entity.body.GetPosition().get_y(),
        oninput: function (val) {
          entity.body.SetTransform(new b2Vec2(entity.body.GetPosition().get_x(), val * 1), entity.body.GetAngle());
        }},
      { type: "html", content: el("p")},

      // Rotation
      { type: "html", content: Translations.getTranslatedWrapped(11)},
      { type: "inputNumber", value: entity.body.GetAngle() * 180 / Math.PI,
        oninput: function (val) {entity.body.SetTransform(entity.body.GetPosition(), (val * 1) * Math.PI / 180);}},
      { type: "html", content: el("p")},

      // Fixed rotation
      { type: "html", content: Translations.getTranslatedWrapped(12)},
      { type: "checkbox", checked: entity.fixedRotation, onchange: function(val) { entity.disableRotation(val); } },
      { type: "html", content: el("p")},

      // Color
      { type: "html", content: Translations.getTranslatedWrapped(13)},
      { type: "inputColor", value: entity.color, oninput: function (val) {entity.color = val}},
      { type: "html", content: el("p")},

      // Body type
      { type: "html", content: Translations.getTranslatedWrapped(14)},
      {
        type: "select", selected: entity.body.GetType(), onchange: function (val) {entity.body.SetType(val * 1)},
        options: [
          { text: Translations.getTranslatedWrapped(15), value: BodyType.DYNAMIC_BODY },
          { text: Translations.getTranslatedWrapped(20), value: BodyType.KINEMATIC_BODY },
          { text: Translations.getTranslatedWrapped(16), value: BodyType.STATIC_BODY },
        ]
      },
      { type: "html", content: el("p")},

      { type: "button", text: Translations.getTranslatedWrapped(22), onclick: function () {
        if(confirm(Translations.getTranslated(23)))
          _engine.removeEntity(entity);
      }},
      { type: "html", content: el("p")},

    ];

    sidebar[0].appendChild(UIBuilder.build(properties));
  }
};

module.exports = UI;
},{"./bodytype.js":3,"./tools.js":14,"./uibuilder.js":17}],17:[function(require,module,exports){
var UIBuilder = {
  radio: function (properties) {
    properties = $.extend({}, {
      id: "radioGroup-" + $(".radioGroup").length,
    }, properties);

    var ret = el("div.ui.radioGroup", {id: properties.id});

    ret.disable = function () {
      $("input[type=radio]", this).each(function(){
        this.disable();
      });
    };

    ret.enable = function () {
      $("input[type=radio]", this).each(function(){
        this.enable();
      });
    };
    
    var idCount = $("input[type=radio]").length;

    properties.elements.forEach(function(element) {
      element = $.extend({}, {
        id: "radio-" + idCount++,
        checked: false,
        onclick: function(){}
      }, element);

      var input = el("input.ui", {type: "radio", id: element.id, name: properties.id});
      var label = el("label.ui.button", {for: element.id}, [element.text]);

      input.enable = function() {
        this.disabled = false;
        $("+label", this).removeClass("disabled");
      };

      input.disable = function() {
        this.disabled = true;
        $("+label", this).addClass("disabled");
      };

      label.onclick = function () {
        if($(this).hasClass("disabled"))
          return;

        element.onclick();
      };

      input.checked = element.checked;

      ret.appendChild(input);
      ret.appendChild(label);
    });

    return ret;
  },
  
  button: function (properties) {
    properties = $.extend({}, {
      id: "button-" + $(".button").length,
      onclick: function(){}
    }, properties);

    var ret = el("span.ui.button", { id: properties.id }, [properties.text]);

    ret.disable = function ()
    {
      $(this).addClass("disabled");
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
    };

    ret.onclick = function () {
      if($(this).hasClass("disabled"))
        return;

      properties.onclick();
    };

    return ret;
  },

  select: function (properties) {
    properties = $.extend({}, {
      id: "select-" + $("select").length,
      selected: "",
      onchange: function(){}
    }, properties);

    var ret = el("select.ui", { id: properties.id });

    ret.onchange = function () {
      properties.onchange(this.value);
    };

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = enable;
    };

    properties.options.forEach(function (option, index) {
      ret.appendChild(el("option", {value: option.value}, [option.text]));

      if (option.value == properties.selected)
        ret.selectedIndex = index;
    });

    return ret;
  },

  break: function () {
    return el("span.ui.break");
  },

  inputText: function (properties) {
    properties = $.extend({}, {
      id: "inputText-" + $("input[type=text]").length,
      value: "",
      oninput: function(){}
    }, properties);

    var ret = el("input.ui", { type: "text", id: properties.id, value: properties.value });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    ret.oninput = function () {
      properties.oninput(this.value);
    };

    return ret;
  },

  inputNumber: function (properties) {
    properties = $.extend({}, {
      id: "inputNumber-" + $("input[type=number]").length,
      value: 0,
      min: -Infinity,
      max: Infinity,
      oninput: function(){}
    }, properties);

    var ret = el("input.ui", { type: "number", id: properties.id, value: properties.value, min: properties.min, max: properties.max });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    ret.oninput = function (e) {
      properties.oninput(this.value);
    };

    return ret;
  },

  html: function (properties) {
    properties = $.extend({}, {
      content: ""
    }, properties);

    return properties.content;
  },

  inputColor: function (properties) {
    properties = $.extend({}, {
      id: "inputColor-" + $("input[type=color]").length,
      value: "#000000",
      oninput: function(){}
    }, properties);

    var ret = el("input.ui", { type: "color", id: properties.id, value: properties.value });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    ret.oninput = function () {
      properties.oninput(this.value);
    };

    return ret;
  },

  checkbox: function (properties) {
    properties = $.extend({}, {
      id: "checkbox-" + $("input[type=checkbox]").length,
      checked: false,
      onchange: function(){}
    }, properties);

    var ret = el("span");
    var checkbox = el("input.ui", { type: "checkbox", id: properties.id });
    var label = el("label.ui.button", { for: properties.id });

    ret.appendChild(checkbox);
    ret.appendChild(label);

    checkbox.disable = function () {
      $("+label", this).addClass("disabled");
      this.disabled = true;
    };

    checkbox.enable = function () {
      $("+label", this).removeClass("disabled");
      this.disabled = false;
    };

    checkbox.checked = properties.checked;

    checkbox.onchange = function () {
      properties.onchange(this.checked);
    };

    return ret;
  },

  build: function (properties) {
    var ret = el.div();

    properties.forEach(function (element) {
      var generated;
      
      switch (element.type) {
        case "radio":
          generated = this.radio(element);
          break;

        case "button":
          generated = this.button(element);
          break;

        case "select":
          generated = this.select(element);
          break;

        case "inputText":
          generated = this.inputText(element);
          break;

        case "inputNumber":
          generated = this.inputNumber(element);
          break;

        case "inputColor":
          generated = this.inputColor(element);
          break;

        case "checkbox":
          generated = this.checkbox(element);
          break;

        case "html":
          generated = this.html(element);
          break;

        case "break":
          generated = this.break();
          break;
      }
      
      ret.appendChild(generated);
    }, this);
    
    return ret;
  },
  
  buildLayout: function() {
    var content = el("div.ui.content.panel");
    var sidebar = el("div.ui.sidebar.panel", {}, [ el("div.content") ]);
    var resizer = el("div.ui.resizer");
    var toolbar = el("div.ui.toolbar");

    var w = $("body").outerWidth();
    var sidebarWidth = 250;

    content.style.width = w - 250 + "px";
    sidebar.style.width = sidebarWidth + "px";

    var sidebarResizeEvent = function (e) {
      e.preventDefault();

      var windowWidth = $("body").outerWidth();
      var sidebarWidth = Math.max(30, Math.min(windowWidth * 0.6, windowWidth - e.clientX));
      var contentWidth = windowWidth - sidebarWidth;

      sidebar.style.width = sidebarWidth + "px";
      content.style.width = contentWidth + "px";

      window.onresize();
    };

    var mouseUpEvent = function (e) {
      sidebar.resizing = false;

      $(".resizer.ui").removeClass("resizing");

      window.removeEventListener("mousemove", sidebarResizeEvent);
      window.removeEventListener("mouseup", mouseUpEvent);
    };

    var windowResizeEvent = function () {
      var windowWidth = $("body").outerWidth();
      var contentWidth = Math.max(windowWidth * 0.4, Math.min(
        windowWidth - 30,
        windowWidth - $(".sidebar.ui").outerWidth()
      ));
      var sidebarWidth = windowWidth - contentWidth;

      sidebar.style.width = sidebarWidth + "px";
      content.style.width = contentWidth + "px";
    }

    resizer.onmousedown = function (e) {
      sidebar.resizing = true;

      $(this).addClass("resizing");

      window.addEventListener("mousemove", sidebarResizeEvent);
      window.addEventListener("mouseup", mouseUpEvent);
    };

    window.addEventListener("resize", windowResizeEvent);

    content.appendChild(toolbar);
    sidebar.appendChild(resizer);
    document.body.appendChild(content);
    document.body.appendChild(sidebar);
  },

  // Creating a popup message
  popup: function(data) {
    var overlay = el("div#popupOverlay", [el("div#popupContent", [data])]);
    overlay.onclick = function(e) {
      UIBuilder.closePopup(e);
    };

    document.body.insertBefore(overlay, document.body.firstChild);

    Translations.refresh();
  },

  // Closing a popup message
  closePopup: function(e) {
    var overlay = document.getElementById("popupOverlay");
    var content = document.getElementById("popupContent");

    // Make sure it was the overlay that was clicked, not an element above it
    if (typeof e !== "undefined" && e.target !== overlay)
      return true;

    content.parentNode.removeChild(content);
    overlay.parentNode.removeChild(overlay);
  },



};

module.exports = UIBuilder;
},{}],18:[function(require,module,exports){
// Object containing useful methods
var Utils = {
  getBrowserWidth: function() {
    return $(".ui.content").outerWidth();
  },

  getBrowserHeight: function() {
    return $(".ui.content").outerHeight() - $(".ui.toolbar").outerHeight();
  },

  randomRange: function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },
}

module.exports = Utils;
},{}],19:[function(require,module,exports){
var Utils = require("./utils.js");

// VIEWPORT
// This is basically camera + projector

var Viewport = function(canvasElement, width, height, x, y) {
  // Canvas dimensions
  if (width != undefined && height != undefined) {
    this.setAutoResize(false);
    this.width = width;
    this.height = height;
  } else {
    this.setAutoResize(true);
    this.autoResize();
  }

  // Center point of the camera
  if (x !== undefined && y !== undefined) {
    this.x = x;
    this.y = y;
  } else {
    this.x = Math.floor(this.width / 2);
    this.y = Math.floor(this.height / 2);
  }

  // Canvas element
  this.canvasElement = canvasElement;

  if (canvasElement === undefined) {
    this.canvasElement = document.createElement("canvas");
    document.body.appendChild(this.canvasElement);
  }

  this.resetElement(); // Resize to new dimensions

  this.context = this.canvasElement.getContext("2d");
};

// Reloads values for the canvas element
Viewport.prototype.resetElement = function() {
  this.canvasElement.width = this.width;
  this.canvasElement.height = this.height;
}

// Automatically resizes the viewport to fill the screen
Viewport.prototype.autoResize = function() {
  this.width = Utils.getBrowserWidth();
  this.height = Utils.getBrowserHeight();
  this.x = Math.floor(this.width / 2);
  this.y = Math.floor(this.height / 2);
};

// Toggles viewport auto resizing
Viewport.prototype.setAutoResize = function(value) {

  this.autoResizeActive = value;

  if (this.autoResizeActive) {
    var t = this;
    window.onresize = function() {
      t.autoResize();
      t.resetElement();
    }
  } else {
    window.onresize = null;
  }
};

module.exports = Viewport;
},{"./utils.js":18}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1VzZXJzL0pha3ViIE1hdHXFoWthL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2FjdGlvbnMuanMiLCJqcy9iZWhhdmlvci5qcyIsImpzL2JvZHl0eXBlLmpzIiwianMvZW5naW5lLmpzIiwianMvZW50aXR5LmpzIiwianMvZW50aXR5ZmlsdGVycy5qcyIsImpzL2VudHJ5LmpzIiwianMvaW5wdXQuanMiLCJqcy9sb2dpYy5qcyIsImpzL3BhcnNlci5qcyIsImpzL3NoYXBlcy5qcyIsImpzL3Rva2VuLmpzIiwianMvdG9rZW5tYW5hZ2VyLmpzIiwianMvdG9vbHMuanMiLCJqcy90eXBpbmcuanMiLCJqcy91aS5qcyIsImpzL3VpYnVpbGRlci5qcyIsImpzL3V0aWxzLmpzIiwianMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25SQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEFjdGlvbiA9IHJlcXVpcmUoXCIuL3Rva2VuLmpzXCIpLkFjdGlvbjtcclxudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gW107XHJcblxyXG52YXIgYVNldENvbG9yID0gZnVuY3Rpb24oZWYsIGNvbG9yKSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJzZXRDb2xvclwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5TVFJJTkddKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKGNvbG9yKTtcclxufTtcclxuYVNldENvbG9yLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuXHJcbmFTZXRDb2xvci5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5zZXRDb2xvcih0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XHJcbn07XHJcblxyXG5hU2V0Q29sb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYVNldENvbG9yO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFTZXRDb2xvcik7XHJcblxyXG5cclxudmFyIGFUb3JxdWUgPSBmdW5jdGlvbihlZiwgc3RyZW5ndGgpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5VG9ycXVlXCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goc3RyZW5ndGgpO1xyXG59O1xyXG5hVG9ycXVlLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuXHJcbmFUb3JxdWUucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuYm9keS5BcHBseVRvcnF1ZShlbnRpdHkuZ2V0TWFzcygpICogdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xyXG59O1xyXG5cclxuYVRvcnF1ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhVG9ycXVlO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFUb3JxdWUpO1xyXG5cclxuXHJcbnZhciBhQW5ndWxhckltcHVsc2UgPSBmdW5jdGlvbihlZiwgc3RyZW5ndGgpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5QW5ndWxhckltcHVsc2VcIiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaChzdHJlbmd0aCk7XHJcbn07XHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUgPSBuZXcgQWN0aW9uKCk7XHJcblxyXG5hQW5ndWxhckltcHVsc2UucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuYm9keS5BcHBseUFuZ3VsYXJJbXB1bHNlKGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XHJcbn07XHJcblxyXG5hQW5ndWxhckltcHVsc2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYUFuZ3VsYXJJbXB1bHNlO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFBbmd1bGFySW1wdWxzZSk7XHJcblxyXG5cclxudmFyIGFMaW5lYXJWZWxvY2l0eSA9IGZ1bmN0aW9uKGVmLCB4LCB5KSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJzZXRMaW5lYXJWZWxvY2l0eVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaCh4KTtcclxuICB0aGlzLmFyZ3MucHVzaCh5KTtcclxufTtcclxuYUxpbmVhclZlbG9jaXR5LnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuXHJcbmFMaW5lYXJWZWxvY2l0eS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5zZXRMaW5lYXJWZWxvY2l0eShuZXcgYjJWZWMyKHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpLCB0aGlzLmFyZ3NbMl0uZXZhbHVhdGUoKSkpO1xyXG59O1xyXG5cclxuYUxpbmVhclZlbG9jaXR5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFMaW5lYXJWZWxvY2l0eTtcclxubW9kdWxlLmV4cG9ydHMucHVzaChhTGluZWFyVmVsb2NpdHkpO1xyXG5cclxuXHJcbnZhciBhTGluZWFySW1wdWxzZSA9IGZ1bmN0aW9uKGVmLCB4LCB5KSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJhcHBseUxpbmVhckltcHVsc2VcIiwgZWYsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHgpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHkpO1xyXG59O1xyXG5hTGluZWFySW1wdWxzZS5wcm90b3R5cGUgPSBuZXcgQWN0aW9uKCk7XHJcblxyXG5hTGluZWFySW1wdWxzZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5hcHBseUxpbmVhckltcHVsc2UobmV3IGIyVmVjMihlbnRpdHkuZ2V0TWFzcygpICogdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCksIGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMl0uZXZhbHVhdGUoKSkpO1xyXG59O1xyXG5cclxuYUxpbmVhckltcHVsc2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYUxpbmVhckltcHVsc2U7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goYUxpbmVhckltcHVsc2UpO1xyXG5cclxuIiwidmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcblxudmFyIEJlaGF2aW9yID0gZnVuY3Rpb24obG9naWMsIHJlc3VsdHMpIHtcbiAgdGhpcy5sb2dpYyA9IGxvZ2ljO1xuXG4gIGlmICh0aGlzLmxvZ2ljLnR5cGUgIT09IFR5cGUuQk9PTEVBTilcbiAgICB0aHJvdyBuZXcgVHlwZUV4Y2VwdGlvbihUeXBlLkJPT0xFQU4sIHRoaXMubG9naWMudHlwZSwgdGhpcyk7XG5cbiAgdGhpcy5yZXN1bHRzID0gQXJyYXkuaXNBcnJheShyZXN1bHRzKSA/IHJlc3VsdHMgOiBbcmVzdWx0c107XG59O1xuXG5CZWhhdmlvci5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgcmV0dXJuIHRoaXMubG9naWMuZXZhbHVhdGUoZW50aXR5KTtcbn07XG5cbkJlaGF2aW9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXCJCZWhhdmlvcihcIiArIHRoaXMubG9naWMudG9TdHJpbmcoKSArIFwiLCBcIiArIHRoaXMucmVzdWx0cy50b1N0cmluZygpICsgXCIpXCI7XG59O1xuXG5CZWhhdmlvci5wcm90b3R5cGUucmVzdWx0ID0gZnVuY3Rpb24oKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGhpcy5yZXN1bHRzW2ldLmV4ZWN1dGUoKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCZWhhdmlvcjsiLCJ2YXIgQm9keVR5cGUgPSB7XHJcbiAgRFlOQU1JQ19CT0RZOiBNb2R1bGUuYjJfZHluYW1pY0JvZHksXHJcbiAgU1RBVElDX0JPRFk6IE1vZHVsZS5iMl9zdGF0aWNCb2R5LFxyXG4gIEtJTkVNQVRJQ19CT0RZOiBNb2R1bGUuYjJfa2luZW1hdGljQm9keVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCb2R5VHlwZTsiLCJ2YXIgVUkgPSByZXF1aXJlKFwiLi91aS5qc1wiKTtcclxudmFyIFRvb2xzID0gcmVxdWlyZShcIi4vdG9vbHMuanNcIik7XHJcbnZhciBUb2tlbk1hbmFnZXIgPSByZXF1aXJlKFwiLi90b2tlbm1hbmFnZXIuanNcIik7XHJcblxyXG5cclxuY29uc3QgQVVUT19JRF9QUkVGSVggPSBcIkVOVElUWV9OVU1CRVJfXCI7XHJcblxyXG5jb25zdCBESVNQTEFZX1JBVElPID0gMjA7XHJcblxyXG4vKi8gTXlzbGllbmt5XHJcblxyXG5sb2Nrb3ZhbmllIGthbWVyeSBuYSBvYmpla3RcclxuICogcHJlY2hvZHlcclxuYWtvIGZ1bmd1amUgY2VsYSBrYW1lcmE/XHJcblxyXG4vKi9cclxuXHJcblxyXG4vLyBFTkdJTkVcclxuXHJcbi8vIGNvbnN0cnVjdG9yXHJcblxyXG52YXIgRW5naW5lID0gZnVuY3Rpb24odmlld3BvcnQsIGdyYXZpdHkpIHtcclxuICB0aGlzLnZpZXdwb3J0ID0gdmlld3BvcnQ7XHJcbiAgdGhpcy5zZWxlY3RlZEVudGl0eSA9IG51bGw7XHJcbiAgXHJcbiAgdGhpcy5DT0xMSVNJT05fR1JPVVBTX05VTUJFUiA9IDE2O1xyXG4gIHRoaXMuTEFZRVJTX05VTUJFUiA9IDEwO1xyXG5cclxuICB0aGlzLmxheWVycyA9IG5ldyBBcnJheSh0aGlzLkxBWUVSU19OVU1CRVIpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5MQVlFUlNfTlVNQkVSOyBpKyspXHJcbiAge1xyXG4gICAgdGhpcy5sYXllcnNbaV0gPSBbXTtcclxuICB9XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXBzID0gW107XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSOyBpKyspIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzLnB1c2goe1xyXG4gICAgICBcIm5hbWVcIjogaSArIDEsXHJcbiAgICAgIFwibWFza1wiOiBwYXJzZUludChBcnJheSh0aGlzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSICsgMSkuam9pbihcIjFcIiksIDIpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHRoaXMubGlmZXRpbWVFbnRpdGllcyA9IDA7XHJcblxyXG4gIHRoaXMud29ybGQgPSBuZXcgYjJXb3JsZChncmF2aXR5LCB0cnVlKTtcclxuICB0aGlzLndvcmxkLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gIHRoaXMudG9rZW5NYW5hZ2VyID0gbmV3IFRva2VuTWFuYWdlcigpO1xyXG5cclxuICBJbnB1dC5pbml0aWFsaXplKHZpZXdwb3J0LmNhbnZhc0VsZW1lbnQpO1xyXG59O1xyXG5cclxuLy8gQ2hhbmdlcyBydW5uaW5nIHN0YXRlIG9mIHRoZSBzaW11bGF0aW9uXHJcbkVuZ2luZS5wcm90b3R5cGUudG9nZ2xlUGF1c2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdGhpcy53b3JsZC5wYXVzZWQgPSAhdGhpcy53b3JsZC5wYXVzZWQ7XHJcbiAgdGhpcy5zZWxlY3RlZEVudGl0eSA9IG51bGw7XHJcblxyXG4gIElucHV0LnRvb2wgPSBUb29scy5CbGFuaztcclxuXHJcbiAgaWYodGhpcy53b3JsZC5wYXVzZWQpXHJcbiAgICBJbnB1dC50b29sID0gVG9vbHMuU2VsZWN0aW9uO1xyXG59O1xyXG5cclxuRW5naW5lLnByb3RvdHlwZS5yZW1vdmVFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgdGhpcy53b3JsZC5EZXN0cm95Qm9keShlbnRpdHkuYm9keSk7XHJcbiAgdGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5zcGxpY2UodGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5pbmRleE9mKGVudGl0eSksIDEpO1xyXG59O1xyXG5cclxuRW5naW5lLnByb3RvdHlwZS5zZXRFbnRpdHlMYXllciA9IGZ1bmN0aW9uIChlbnRpdHksIG5ld0xheWVyKSB7XHJcbiAgLy8gUmVtb3ZlIGZyb20gb2xkIGxheWVyXHJcbiAgdGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5zcGxpY2UodGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5pbmRleE9mKGVudGl0eSksIDEpO1xyXG5cclxuICAvLyBTZXQgbmV3IGxheWVyXHJcbiAgZW50aXR5LmxheWVyID0gbmV3TGF5ZXI7XHJcbiAgdGhpcy5sYXllcnNbbmV3TGF5ZXJdLnB1c2goZW50aXR5KTtcclxufTtcclxuXHJcbi8vIFJldHVybnMgYWxsIGVudGl0aWVzIGluIG9uZSBhcnJheVxyXG5FbmdpbmUucHJvdG90eXBlLmVudGl0aWVzID0gZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiBbXS5jb25jYXQuYXBwbHkoW10sIHRoaXMubGF5ZXJzKTtcclxufTtcclxuXHJcblxyXG4vLyBSZXR1cm5zIHRoZSBlbnRpdHkgd2l0aCBpZCBzcGVjaWZpZWQgYnkgYXJndW1lbnRcclxuRW5naW5lLnByb3RvdHlwZS5nZXRFbnRpdHlCeUlkID0gZnVuY3Rpb24oaWQpIHtcclxuICB2YXIgZW50aXRpZXMgPSB0aGlzLmVudGl0aWVzKCk7XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChlbnRpdGllc1tpXS5pZCA9PT0gaWQpXHJcbiAgICAgIHJldHVybiBlbnRpdGllc1tpXTtcclxuICB9XHJcblxyXG4gIHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuLy8gUmV0dXJucyBhbiBhcnJheSBvZiBlbnRpdGllcyB3aXRoIHNwZWNpZmllZCBjb2xsaXNpb25Hcm91cFxyXG5FbmdpbmUucHJvdG90eXBlLmdldEVudGl0aWVzQnlDb2xsaXNpb25Hcm91cCA9IGZ1bmN0aW9uKGdyb3VwKSB7XHJcbiAgdmFyIHJldCA9IFtdO1xyXG4gIHZhciBlbnRpdGllcyA9IHRoaXMuZW50aXRpZXMoKTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKGVudGl0aWVzW2ldLmNvbGxpc2lvbkdyb3VwID09PSBncm91cClcclxuICAgICAgcmV0LnB1c2goZW50aXRpZXNbaV0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcbi8vIEFkZGluZyBhbiBlbnRpdHkgdG8gdGhlIHdvcmxkXHJcbkVuZ2luZS5wcm90b3R5cGUuYWRkRW50aXR5ID0gZnVuY3Rpb24oZW50aXR5LCB0eXBlKSB7XHJcbiAgLy8gZ2VuZXJhdGUgYXV0byBpZFxyXG4gIGlmIChlbnRpdHkuaWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgZW50aXR5LmlkID0gQVVUT19JRF9QUkVGSVggKyB0aGlzLmxpZmV0aW1lRW50aXRpZXM7XHJcbiAgfVxyXG5cclxuICB0aGlzLmxpZmV0aW1lRW50aXRpZXMrKztcclxuXHJcbiAgZW50aXR5LmJvZHkuc2V0X3R5cGUodHlwZSk7XHJcblxyXG4gIGVudGl0eS5ib2R5ID0gdGhpcy53b3JsZC5DcmVhdGVCb2R5KGVudGl0eS5ib2R5KTtcclxuICBlbnRpdHkuZml4dHVyZSA9IGVudGl0eS5ib2R5LkNyZWF0ZUZpeHR1cmUoZW50aXR5LmZpeHR1cmUpO1xyXG5cclxuICB0aGlzLmxheWVyc1tlbnRpdHkubGF5ZXJdLnB1c2goZW50aXR5KTtcclxuXHJcbiAgcmV0dXJuIGVudGl0eTtcclxufTtcclxuXHJcbi8vIENoZWNrcyB3aGV0aGVyIHR3byBncm91cHMgc2hvdWxkIGNvbGxpZGVcclxuRW5naW5lLnByb3RvdHlwZS5nZXRDb2xsaXNpb24gPSBmdW5jdGlvbihncm91cEEsIGdyb3VwQikge1xyXG4gIHJldHVybiAodGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID4+IGdyb3VwQikgJiAxO1xyXG59O1xyXG5cclxuLy8gU2V0cyB0d28gZ3JvdXBzIHVwIHRvIGNvbGxpZGVcclxuRW5naW5lLnByb3RvdHlwZS5zZXRDb2xsaXNpb24gPSBmdW5jdGlvbihncm91cEEsIGdyb3VwQiwgdmFsdWUpIHtcclxuICB2YXIgbWFza0EgPSAoMSA8PCBncm91cEIpO1xyXG4gIHZhciBtYXNrQiA9ICgxIDw8IGdyb3VwQSk7XHJcblxyXG4gIGlmICh2YWx1ZSkge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrIHwgbWFza0E7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgPSB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgfCBtYXNrQjtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrICYgfm1hc2tBO1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrICYgfm1hc2tCO1xyXG4gIH1cclxuICB0aGlzLnVwZGF0ZUNvbGxpc2lvbnMoKVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuLy8gQ2hhbmdlcyB0aGUgSUQgb2YgYW4gZW50aXR5XHJcbkVuZ2luZS5wcm90b3R5cGUuY2hhbmdlSWQgPSBmdW5jdGlvbiAoZW50aXR5LCBpZCkge1xyXG4gIGVudGl0eS5pZCA9IGlkO1xyXG59O1xyXG5cclxuLy8gU2VsZWN0cyBhbiBlbnRpdHkgYW5kIHNob3dzIGl0cyBwcm9wZXJ0aWVzIGluIHRoZSBzaWRlYmFyXHJcbkVuZ2luZS5wcm90b3R5cGUuc2VsZWN0RW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gIHRoaXMuc2VsZWN0ZWRFbnRpdHkgPSBlbnRpdHkgPT09IG51bGwgPyBudWxsIDogZW50aXR5O1xyXG4gIFVJLmJ1aWxkU2lkZWJhcih0aGlzLnNlbGVjdGVkRW50aXR5KTtcclxufVxyXG5cclxuLy8gVXBkYXRlcyBjb2xsaXNpb24gbWFza3MgZm9yIGFsbCBlbnRpdGllcywgYmFzZWQgb24gZW5naW5lJ3MgY29sbGlzaW9uR3JvdXBzIHRhYmxlXHJcbkVuZ2luZS5wcm90b3R5cGUudXBkYXRlQ29sbGlzaW9ucyA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBlbnRpdGllcyA9IHRoaXMuZW50aXRpZXMoKTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdGhpcy51cGRhdGVDb2xsaXNpb24oZW50aXRpZXNbaV0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vLyBVcGRhdGVzIGNvbGxpc2lvbiBtYXNrIGZvciBhbiBlbnRpdHksIGJhc2VkIG9uIGVuZ2luZSdzIGNvbGxpc2lvbkdyb3VwcyB0YWJsZVxyXG5FbmdpbmUucHJvdG90eXBlLnVwZGF0ZUNvbGxpc2lvbiA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHZhciBmaWx0ZXJEYXRhID0gZW50aXR5LmZpeHR1cmUuR2V0RmlsdGVyRGF0YSgpO1xyXG4gIGZpbHRlckRhdGEuc2V0X21hc2tCaXRzKHRoaXMuY29sbGlzaW9uR3JvdXBzW2VudGl0eS5jb2xsaXNpb25Hcm91cF0ubWFzayk7XHJcbiAgZW50aXR5LmZpeHR1cmUuU2V0RmlsdGVyRGF0YShmaWx0ZXJEYXRhKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbi8vIE9uZSBzaW11bGF0aW9uIHN0ZXAuIFNpbXVsYXRpb24gbG9naWMgaGFwcGVucyBoZXJlLlxyXG5FbmdpbmUucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpIHtcclxuICAvLyBGUFMgdGltZXJcclxuICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpO1xyXG5cclxuICBjdHggPSB0aGlzLnZpZXdwb3J0LmNvbnRleHQ7XHJcblxyXG4gIC8vIGNsZWFyIHNjcmVlblxyXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy52aWV3cG9ydC53aWR0aCwgdGhpcy52aWV3cG9ydC5oZWlnaHQpO1xyXG5cclxuICBjdHguc2F2ZSgpO1xyXG5cclxuICAvLyBkcmF3IGFsbCBlbnRpdGllc1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5MQVlFUlNfTlVNQkVSOyBpKyspXHJcbiAge1xyXG4gICAgdGhpcy5kcmF3QXJyYXkodGhpcy5sYXllcnNbaV0sIGN0eCk7XHJcbiAgfVxyXG5cclxuICBpZiAoIV9lbmdpbmUud29ybGQucGF1c2VkKSB7XHJcbiAgICAvLyBib3gyZCBzaW11bGF0aW9uIHN0ZXBcclxuICAgIHRoaXMud29ybGQuU3RlcCgxIC8gNjAsIDEwLCA1KTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBJbnB1dC50b29sLm9ubW92ZShjdHgpO1xyXG4gIH1cclxuICBcclxuXHJcbiAgLy8gUmVsZWFzZWQga2V5cyBhcmUgb25seSB0byBiZSBwcm9jZXNzZWQgb25jZVxyXG4gIElucHV0Lm1vdXNlLmNsZWFuVXAoKTtcclxuICBJbnB1dC5rZXlib2FyZC5jbGVhblVwKCk7XHJcblxyXG4gIHZhciBlbmQgPSBEYXRlLm5vdygpO1xyXG5cclxuICAvLyBDYWxsIG5leHQgc3RlcFxyXG4gIHNldFRpbWVvdXQod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICAgIF9lbmdpbmUuc3RlcCgpXHJcbiAgfSksIE1hdGgubWluKDYwIC0gZW5kIC0gc3RhcnQsIDApKTtcclxufTtcclxuXHJcbkVuZ2luZS5wcm90b3R5cGUuZHJhd0FycmF5ID0gZnVuY3Rpb24oYXJyYXksIGN0eCkge1xyXG4gIGZvciAodmFyIGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC50cmFuc2xhdGUodGhpcy52aWV3cG9ydC54IC0gdGhpcy52aWV3cG9ydC53aWR0aCAvIDIsIHRoaXMudmlld3BvcnQueSAtIHRoaXMudmlld3BvcnQuaGVpZ2h0IC8gMik7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gYXJyYXlbaV0uY29sb3I7XHJcblxyXG4gICAgaWYodGhpcy5zZWxlY3RlZEVudGl0eSA9PT0gYXJyYXlbaV0pIHtcclxuICAgICAgY3R4LnNoYWRvd0NvbG9yID0gXCJibGFja1wiO1xyXG4gICAgICBjdHguc2hhZG93Qmx1ciA9IDEwO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB4ID0gYXJyYXlbaV0uYm9keS5HZXRQb3NpdGlvbigpLmdldF94KCk7XHJcbiAgICB2YXIgeSA9IGFycmF5W2ldLmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpO1xyXG4gICAgY3R4LnRyYW5zbGF0ZSh4LCB5KTtcclxuICAgIGN0eC5yb3RhdGUoYXJyYXlbaV0uYm9keS5HZXRBbmdsZSgpKTtcclxuXHJcbiAgICBhcnJheVtpXS5kcmF3KGN0eCk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuXHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFycmF5W2ldLmJlaGF2aW9ycy5sZW5ndGg7IGorKykge1xyXG4gICAgICB2YXIgYmVoYXZpb3IgPSBhcnJheVtpXS5iZWhhdmlvcnNbal07XHJcblxyXG4gICAgICBpZiAoYmVoYXZpb3IuY2hlY2soYXJyYXlbaV0pKVxyXG4gICAgICAgIGJlaGF2aW9yLnJlc3VsdCgpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTsiLCIvLyBFTlRJVFlcclxudmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHMuanNcIik7XHJcblxyXG5jb25zdCBBVVRPX0NPTE9SX1JBTkdFID0gWzAsIDIzMF07XHJcblxyXG52YXIgRW50aXR5ID0gZnVuY3Rpb24oc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCkge1xyXG4gIHRoaXMuaWQgPSBpZDtcclxuICB0aGlzLmRlYWQgPSBmYWxzZTtcclxuICB0aGlzLmxheWVyID0gMDtcclxuXHJcbiAgdGhpcy5maXhlZFJvdGF0aW9uID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXAgPSBjb2xsaXNpb25Hcm91cDtcclxuICBpZiAodGhpcy5jb2xsaXNpb25Hcm91cCA9PSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXAgPSAwO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5iZWhhdmlvcnMgPSBbXTtcclxuXHJcbiAgdGhpcy5maXh0dXJlID0gZml4dHVyZTtcclxuICBpZiAodGhpcy5maXh0dXJlID09IHVuZGVmaW5lZCkge1xyXG4gICAgdmFyIGZpeHR1cmUgPSBuZXcgYjJGaXh0dXJlRGVmKCk7XHJcbiAgICBmaXh0dXJlLnNldF9kZW5zaXR5KDEwKVxyXG4gICAgZml4dHVyZS5zZXRfZnJpY3Rpb24oMC41KTtcclxuICAgIGZpeHR1cmUuc2V0X3Jlc3RpdHV0aW9uKDAuMik7XHJcblxyXG4gICAgdGhpcy5maXh0dXJlID0gZml4dHVyZTtcclxuICB9XHJcbiAgdGhpcy5maXh0dXJlLnNldF9zaGFwZShzaGFwZSk7XHJcblxyXG4gIHZhciBmaWx0ZXJEYXRhID0gdGhpcy5maXh0dXJlLmdldF9maWx0ZXIoKTtcclxuICBmaWx0ZXJEYXRhLnNldF9jYXRlZ29yeUJpdHMoMSA8PCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIC8vIENvbnN0cnVjdG9yIGlzIGNhbGxlZCB3aGVuIGluaGVyaXRpbmcsIHNvIHdlIG5lZWQgdG8gY2hlY2sgZm9yIF9lbmdpbmUgYXZhaWxhYmlsaXR5XHJcbiAgaWYgKHR5cGVvZiBfZW5naW5lICE9PSAndW5kZWZpbmVkJylcclxuICAgIGZpbHRlckRhdGEuc2V0X21hc2tCaXRzKF9lbmdpbmUuY29sbGlzaW9uR3JvdXBzW3RoaXMuY29sbGlzaW9uR3JvdXBdLm1hc2spO1xyXG5cclxuICB0aGlzLmZpeHR1cmUuc2V0X2ZpbHRlcihmaWx0ZXJEYXRhKTtcclxuXHJcbiAgdGhpcy5ib2R5ID0gYm9keTtcclxuICBpZiAodGhpcy5ib2R5ICE9PSB1bmRlZmluZWQpXHJcbiAgICB0aGlzLmJvZHkuc2V0X2ZpeGVkUm90YXRpb24oZmFsc2UpO1xyXG5cclxuICAvLyBBdXRvIGdlbmVyYXRlIGNvbG9yXHJcbiAgdmFyIHIgPSBVdGlscy5yYW5kb21SYW5nZShBVVRPX0NPTE9SX1JBTkdFWzBdLCBBVVRPX0NPTE9SX1JBTkdFWzFdKS50b1N0cmluZygxNik7IHIgPSByLmxlbmd0aCA9PSAxID8gXCIwXCIgKyByIDogcjtcclxuICB2YXIgZyA9IFV0aWxzLnJhbmRvbVJhbmdlKEFVVE9fQ09MT1JfUkFOR0VbMF0sIEFVVE9fQ09MT1JfUkFOR0VbMV0pLnRvU3RyaW5nKDE2KTsgZyA9IGcubGVuZ3RoID09IDEgPyBcIjBcIiArIGcgOiBnO1xyXG4gIHZhciBiID0gVXRpbHMucmFuZG9tUmFuZ2UoQVVUT19DT0xPUl9SQU5HRVswXSwgQVVUT19DT0xPUl9SQU5HRVsxXSkudG9TdHJpbmcoMTYpOyBiID0gYi5sZW5ndGggPT0gMSA/IFwiMFwiICsgYiA6IGI7XHJcbiAgdGhpcy5jb2xvciA9IFwiI1wiICsgciAgKyBnICsgYiA7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5kZWFkID0gdHJ1ZTtcclxuXHJcbiAgXHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XHJcbiAgYWxlcnQoXCJFUlJPUiEgQ2Fubm90IGRyYXcgRW50aXR5OiBVc2UgZGVyaXZlZCBjbGFzc2VzLlwiKTtcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRDb2xvciA9IGZ1bmN0aW9uKGNvbG9yKSB7XHJcbiAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRJZCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgdGhpcy5pZCA9IGlkO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXAgPSBncm91cDtcclxuXHJcbiAgdmFyIGZpbHRlckRhdGEgPSB0aGlzLmZpeHR1cmUuR2V0RmlsdGVyRGF0YSgpO1xyXG4gIGZpbHRlckRhdGEuc2V0X2NhdGVnb3J5Qml0cygxIDw8IGdyb3VwKTtcclxuICB0aGlzLmZpeHR1cmUuU2V0RmlsdGVyRGF0YShmaWx0ZXJEYXRhKTtcclxuXHJcbiAgX2VuZ2luZS51cGRhdGVDb2xsaXNpb24odGhpcyk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmdldExpbmVhclZlbG9jaXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMuYm9keS5HZXRMaW5lYXJWZWxvY2l0eSgpO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmdldE1hc3MgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gTWF0aC5tYXgoMSwgdGhpcy5ib2R5LkdldE1hc3MoKSk7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0TGluZWFyVmVsb2NpdHkgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICB0aGlzLmJvZHkuU2V0TGluZWFyVmVsb2NpdHkodmVjdG9yKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuYXBwbHlUb3JxdWUgPSBmdW5jdGlvbihmb3JjZSkge1xyXG4gIHRoaXMuYm9keS5BcHBseVRvcnF1ZShmb3JjZSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFwcGx5TGluZWFySW1wdWxzZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gIHRoaXMuYm9keS5BcHBseUxpbmVhckltcHVsc2UodmVjdG9yLCB0aGlzLmJvZHkuR2V0V29ybGRDZW50ZXIoKSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmRpc2FibGVSb3RhdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgdGhpcy5maXhlZFJvdGF0aW9uID0gdmFsdWU7XHJcbiAgdGhpcy5ib2R5LlNldEZpeGVkUm90YXRpb24odmFsdWUpXHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFkZEJlaGF2aW9yID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcclxuICB0aGlzLmJlaGF2aW9ycy5wdXNoKGJlaGF2aW9yKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVudGl0eTsiLCJ2YXIgRW50aXR5RmlsdGVyID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuRW50aXR5RmlsdGVyO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBbXTtcclxuXHJcbnZhciBlZkJ5SWQgPSBmdW5jdGlvbihpZCkge1xyXG4gIEVudGl0eUZpbHRlci5jYWxsKHRoaXMsIFwiZmlsdGVyQnlJZFwiLCBhcmd1bWVudHMsIFtUeXBlLlNUUklOR10pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChpZCk7XHJcbn07XHJcbmVmQnlJZC5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcblxyXG5lZkJ5SWQucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkuaWQgPT09IHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xyXG59O1xyXG5cclxuZWZCeUlkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGVmQnlJZDtcclxubW9kdWxlLmV4cG9ydHMucHVzaChlZkJ5SWQpO1xyXG5cclxuXHJcbnZhciBlZkJ5Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gIEVudGl0eUZpbHRlci5jYWxsKHRoaXMsIFwiZmlsdGVyQnlHcm91cFwiLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChncm91cCk7XHJcbn07XHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcblxyXG5lZkJ5Q29sbGlzaW9uR3JvdXAucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkuY29sbGlzaW9uR3JvdXAgPT09IHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xyXG59O1xyXG5cclxuZWZCeUNvbGxpc2lvbkdyb3VwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGVmQnlDb2xsaXNpb25Hcm91cDtcclxubW9kdWxlLmV4cG9ydHMucHVzaChlZkJ5Q29sbGlzaW9uR3JvdXApO1xyXG5cclxuXHJcbnZhciBlZkJ5TGF5ZXIgPSBmdW5jdGlvbihsYXllcikge1xyXG4gIEVudGl0eUZpbHRlci5jYWxsKHRoaXMsIFwiZmlsdGVyQnlMYXllclwiLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChsYXllcik7XHJcbn07XHJcbmVmQnlMYXllci5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcblxyXG5lZkJ5TGF5ZXIucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkubGF5ZXIgPT09IHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xyXG59O1xyXG5cclxuZWZCeUxheWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGVmQnlMYXllcjtcclxubW9kdWxlLmV4cG9ydHMucHVzaChlZkJ5TGF5ZXIpOyIsInJlcXVpcmUoXCIuL2lucHV0LmpzXCIpO1xyXG5cclxudmFyIEVuZ2luZSA9IHJlcXVpcmUoXCIuL2VuZ2luZS5qc1wiKTtcclxudmFyIFZpZXdwb3J0ID0gcmVxdWlyZShcIi4vdmlld3BvcnQuanNcIik7XHJcbnZhciBVSSA9IHJlcXVpcmUoXCIuL3VpLmpzXCIpO1xyXG52YXIgQm9keVR5cGUgPSByZXF1aXJlKFwiLi9ib2R5dHlwZS5qc1wiKTtcclxudmFyIEJlaGF2aW9yID0gcmVxdWlyZShcIi4vYmVoYXZpb3IuanNcIik7XHJcblxyXG52YXIgQ2lyY2xlID0gcmVxdWlyZShcIi4vc2hhcGVzLmpzXCIpLkNpcmNsZTtcclxudmFyIFJlY3RhbmdsZSA9IHJlcXVpcmUoXCIuL3NoYXBlcy5qc1wiKS5SZWN0YW5nbGU7XHJcblxyXG5VSS5pbml0aWFsaXplKCk7XHJcblxyXG5fZW5naW5lID0gbmV3IEVuZ2luZShuZXcgVmlld3BvcnQoJChcIiNtYWluQ2FudmFzXCIpWzBdKSwgbmV3IGIyVmVjMigwLCA1MDApKTtcclxuXHJcbl9lbmdpbmUuYWRkRW50aXR5KG5ldyBDaXJjbGUobmV3IGIyVmVjMig1MDAsIDUwKSwgMjApLCBCb2R5VHlwZS5EWU5BTUlDX0JPRFkpXHJcbiAgLnNldENvbGxpc2lvbkdyb3VwKDIpXHJcbiAgLnNldElkKFwia3J1aFwiKVxyXG4gIC5kaXNhYmxlUm90YXRpb24oZmFsc2UpXHJcbiAgLmFkZEJlaGF2aW9yKFxyXG4gICAgbmV3IEJlaGF2aW9yKFxyXG4gICAgICBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UoXCJpc0J1dHRvblVwKG51bWJlcigzMikpXCIpLFxyXG4gICAgICBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UoXCJzZXRMaW5lYXJWZWxvY2l0eShmaWx0ZXJCeUlkKHRleHQoa3J1aCkpLCBnZXRWZWxvY2l0eVgoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSksIG51bWJlcigtOTk5OTk5OTk5OTk5OTk5OTk5KSlcIilcclxuICAgIClcclxuICApXHJcbiAgLmFkZEJlaGF2aW9yKFxyXG4gICAgbmV3IEJlaGF2aW9yKFxyXG4gICAgICBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UoXCJpc0J1dHRvbkRvd24obnVtYmVyKDM3KSlcIiksXHJcbiAgICAgIF9lbmdpbmUudG9rZW5NYW5hZ2VyLnBhcnNlci5wYXJzZShcInNldExpbmVhclZlbG9jaXR5KGZpbHRlckJ5SWQodGV4dChrcnVoKSksIG51bWJlcigtMTAwKSwgZ2V0VmVsb2NpdHlZKGZpbHRlckJ5SWQodGV4dChrcnVoKSkpKVwiKVxyXG4gICAgKVxyXG4gIClcclxuICAuYWRkQmVoYXZpb3IoXHJcbiAgICBuZXcgQmVoYXZpb3IoXHJcbiAgICAgIF9lbmdpbmUudG9rZW5NYW5hZ2VyLnBhcnNlci5wYXJzZShcImlzQnV0dG9uRG93bihudW1iZXIoMzkpKVwiKSxcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwic2V0TGluZWFyVmVsb2NpdHkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSwgbnVtYmVyKDEwMCksIGdldFZlbG9jaXR5WShmaWx0ZXJCeUlkKHRleHQoa3J1aCkpKSlcIilcclxuICAgIClcclxuICApO1xyXG5cclxuX2VuZ2luZS5hZGRFbnRpdHkobmV3IFJlY3RhbmdsZShuZXcgYjJWZWMyKDQwMCwgNDAwKSwgbmV3IGIyVmVjMig0MDAsIDMpKSwgQm9keVR5cGUuS0lORU1BVElDX0JPRFkpXHJcbiAgLnNldElkKFwicGxhdGZvcm1cIilcclxuICAuc2V0Q29sbGlzaW9uR3JvdXAoMSk7XHJcblxyXG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gIF9lbmdpbmUuc3RlcCgpO1xyXG59KTtcclxuXHJcblxyXG5cclxuXHJcbiIsIi8vIElOUFVUIENBUFRVUklOR1xyXG5cclxudmFyIFRvb2xzID0gcmVxdWlyZShcIi4vdG9vbHMuanNcIik7XHJcblxyXG53aW5kb3cuSW5wdXQgPSB7XHJcbiAgdG9vbDogVG9vbHMuU2VsZWN0aW9uLFxyXG5cclxuICBtb3VzZToge1xyXG4gICAgeDogMCxcclxuICAgIHk6IDAsXHJcbiAgICBsZWZ0RG93bjogZmFsc2UsXHJcbiAgICByaWdodERvd246IGZhbHNlLFxyXG4gICAgbGVmdFVwOiBmYWxzZSxcclxuICAgIHJpZ2h0VXA6IGZhbHNlLFxyXG5cclxuICAgIHVwZGF0ZVBvc2l0aW9uOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgdGhpcy54ID0gZXZlbnQucGFnZVggLSBfZW5naW5lLnZpZXdwb3J0LmNhbnZhc0VsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgdGhpcy55ID0gZXZlbnQucGFnZVkgLSBfZW5naW5lLnZpZXdwb3J0LmNhbnZhc0VsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVCdXR0b25zRG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC50YXJnZXQgIT0gX2VuZ2luZS52aWV3cG9ydC5jYW52YXNFbGVtZW50KVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxKSB7XHJcbiAgICAgICAgdGhpcy5sZWZ0RG93biA9IHRydWU7XHJcblxyXG4gICAgICAgIElucHV0LnRvb2wub25jbGljaygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDMpXHJcbiAgICAgICAgdGhpcy5yaWdodERvd24gPSB0cnVlO1xyXG5cclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc1VwOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPSBfZW5naW5lLnZpZXdwb3J0LmNhbnZhc0VsZW1lbnQpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEpIHtcclxuICAgICAgICB0aGlzLmxlZnREb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5sZWZ0VXAgPSB0cnVlO1xyXG5cclxuICAgICAgICBJbnB1dC50b29sLm9ucmVsZWFzZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDMpIHtcclxuICAgICAgICB0aGlzLnJpZ2h0RG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucmlnaHRVcCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYW5VcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLmxlZnRVcCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnJpZ2h0VXAgPSBmYWxzZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBrZXlib2FyZDoge1xyXG4gICAgZG93bjogbmV3IFNldCgpLFxyXG4gICAgdXA6IG5ldyBTZXQoKSxcclxuXHJcbiAgICBpc0Rvd246IGZ1bmN0aW9uIChrZXlDb2RlKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRvd24uaGFzKGtleUNvZGUpXHJcbiAgICB9LFxyXG5cclxuICAgIGlzVXA6IGZ1bmN0aW9uIChrZXlDb2RlKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnVwLmhhcyhrZXlDb2RlKTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc0Rvd246IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICB0aGlzLmRvd24uYWRkKGV2ZW50LndoaWNoKTtcclxuXHJcbiAgICAgIGlmKGV2ZW50LndoaWNoID09PSAzMilcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVCdXR0b25zVXA6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICB0aGlzLmRvd24uZGVsZXRlKGV2ZW50LndoaWNoKTtcclxuICAgICAgdGhpcy51cC5hZGQoZXZlbnQud2hpY2gpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhblVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMudXAuY2xlYXIoKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBpbml0aWFsaXplOiBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBlbGVtZW50Lm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICBJbnB1dC5tb3VzZS51cGRhdGVQb3NpdGlvbihlKTtcclxuICAgIH07XHJcbiAgICBlbGVtZW50Lm9ubW91c2Vkb3duID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICBJbnB1dC5tb3VzZS51cGRhdGVCdXR0b25zRG93bihlKTtcclxuICAgIH07XHJcbiAgICBlbGVtZW50Lm9ubW91c2V1cCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgSW5wdXQubW91c2UudXBkYXRlQnV0dG9uc1VwKGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBkb2N1bWVudC5vbmtleWRvd24gPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIElucHV0LmtleWJvYXJkLnVwZGF0ZUJ1dHRvbnNEb3duKGUpO1xyXG4gICAgfTtcclxuICAgIGRvY3VtZW50Lm9ua2V5dXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIElucHV0LmtleWJvYXJkLnVwZGF0ZUJ1dHRvbnNVcChlKTtcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG5cclxuIiwidmFyIExvZ2ljID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuTG9naWM7XG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xudmFyIEZpeFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuRml4VHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBbXTtcblxudmFyIGxBbmQgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiQU5EXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOLCBUeXBlLkJPT0xFQU5dKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcbn07XG5sQW5kLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sQW5kLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICh0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSAmJiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XG59O1xuXG5sQW5kLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxBbmQ7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxBbmQpO1xuXG5cbnZhciBsT3IgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiT1JcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLkJPT0xFQU4sIFR5cGUuQk9PTEVBTl0pO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xufTtcbmxPci5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubE9yLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpIHx8IHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmxPci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsT3I7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxPcik7XG5cblxudmFyIGxOb3QgPSBmdW5jdGlvbiAoYSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiTk9UXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG59O1xubE5vdC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubE5vdC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAhdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCk7XG59O1xuXG5sTm90LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxOb3Q7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxOb3QpO1xuXG5cbnZhciBsU3RyaW5nID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJ0ZXh0XCIsIFR5cGUuU1RSSU5HLCBhcmd1bWVudHMsIFtUeXBlLkxJVEVSQUxdKTtcblxuICB0aGlzLmFyZ3MucHVzaCh2YWx1ZSk7XG59O1xubFN0cmluZy5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubFN0cmluZy5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF07XG59O1xuXG5sU3RyaW5nLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxTdHJpbmc7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxTdHJpbmcpO1xuXG5cbnZhciBsTnVtYmVyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJudW1iZXJcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTElURVJBTF0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKHZhbHVlKTtcbn07XG5sTnVtYmVyLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sTnVtYmVyLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5hcmdzWzBdKTtcbn07XG5cbmxOdW1iZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE51bWJlcjtcbm1vZHVsZS5leHBvcnRzLnB1c2gobE51bWJlcik7XG5cblxudmFyIGxCb29sID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJib29sZWFuXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5MSVRFUkFMXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2godmFsdWUpO1xufTtcbmxCb29sLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sQm9vbC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0gPT09IFwidHJ1ZVwiO1xufTtcblxubEJvb2wucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbEJvb2w7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxCb29sKTtcblxuXG52YXIgbEJ1dHRvbkRvd24gPSBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJpc0J1dHRvbkRvd25cIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGJ1dHRvbik7XG59O1xubEJ1dHRvbkRvd24ucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxCdXR0b25Eb3duLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIElucHV0LmtleWJvYXJkLmlzRG93bih0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSk7XG59O1xuXG5sQnV0dG9uRG93bi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQnV0dG9uRG93bjtcbm1vZHVsZS5leHBvcnRzLnB1c2gobEJ1dHRvbkRvd24pO1xuXG5cbnZhciBsQnV0dG9uVXAgPSBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJpc0J1dHRvblVwXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChidXR0b24pO1xufTtcbmxCdXR0b25VcC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubEJ1dHRvblVwLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIElucHV0LmtleWJvYXJkLmlzVXAodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkpO1xufTtcblxubEJ1dHRvblVwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxCdXR0b25VcDtcbm1vZHVsZS5leHBvcnRzLnB1c2gobEJ1dHRvblVwKTtcblxuXG52YXIgbFJhbmRvbSA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwicmFuZG9tTnVtYmVyXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChtaW4pO1xuICB0aGlzLmFyZ3MucHVzaChtYXgpO1xufTtcbmxSYW5kb20ucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxSYW5kb20ucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gVXRpbHMucmFuZG9tUmFuZ2UodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgJiYgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xufTtcblxubFJhbmRvbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsUmFuZG9tO1xubW9kdWxlLmV4cG9ydHMucHVzaChsUmFuZG9tKTtcblxuXG52YXIgbFZlbG9jaXR5WCA9IGZ1bmN0aW9uIChlZikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiZ2V0VmVsb2NpdHlYXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcbn07XG5sVmVsb2NpdHlYLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sVmVsb2NpdHlYLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVudGl0eSA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKVswXTtcblxuICByZXR1cm4gZW50aXR5LmJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKS5nZXRfeCgpO1xufTtcblxubFZlbG9jaXR5WC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsVmVsb2NpdHlYO1xubW9kdWxlLmV4cG9ydHMucHVzaChsVmVsb2NpdHlYKTtcblxuXG52YXIgbFZlbG9jaXR5WSA9IGZ1bmN0aW9uIChlZikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiZ2V0VmVsb2NpdHlZXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcbn07XG5sVmVsb2NpdHlZLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sVmVsb2NpdHlZLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVudGl0eSA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKVswXTtcblxuICByZXR1cm4gZW50aXR5LmJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKS5nZXRfeSgpO1xufTtcblxubFZlbG9jaXR5WS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsVmVsb2NpdHlZO1xubW9kdWxlLmV4cG9ydHMucHVzaChsVmVsb2NpdHlZKTtcblxuXG52YXIgbFBsdXMgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiK1wiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59O1xubFBsdXMucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxQbHVzLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICsgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59O1xuXG5sUGx1cy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsUGx1cztcbm1vZHVsZS5leHBvcnRzLnB1c2gobFBsdXMpO1xuXG5cbnZhciBsTXVsdGlwbHkgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiKlwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59O1xubE11bHRpcGx5LnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sTXVsdGlwbHkucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKTtcbn07XG5cbmxNdWx0aXBseS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTXVsdGlwbHk7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxNdWx0aXBseSk7XG5cblxudmFyIGxEaXZpZGUgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiL1wiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59O1xubERpdmlkZS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubERpdmlkZS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSAvIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpO1xufTtcblxubERpdmlkZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsRGl2aWRlO1xubW9kdWxlLmV4cG9ydHMucHVzaChsRGl2aWRlKTtcblxuXG52YXIgbE1pbnVzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIi1cIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xufTtcbmxNaW51cy5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubE1pbnVzLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICsgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59O1xuXG5sTWludXMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE1pbnVzO1xubW9kdWxlLmV4cG9ydHMucHVzaChsTWludXMpOyIsInZhciBGaXhUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nXCIpLkZpeFR5cGU7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nXCIpLlR5cGU7XHJcblxyXG52YXIgVHlwZUV4Y2VwdGlvbiA9IGZ1bmN0aW9uKGV4cGVjdGVkLCByZWNlaXZlZCwgdG9rZW4pIHtcclxuICB0aGlzLmV4cGVjdGVkID0gZXhwZWN0ZWQ7XHJcbiAgdGhpcy5yZWNlaXZlZCA9IHJlY2VpdmVkO1xyXG4gIHRoaXMudG9rZW4gPSB0b2tlbjtcclxufTtcclxuXHJcbnZhciBQYXJzZXIgPSBmdW5jdGlvbiAodG9rZW5NYW5hZ2VyKSB7XHJcbiAgdGhpcy50b2tlbk1hbmFnZXIgPSB0b2tlbk1hbmFnZXI7XHJcblxyXG4gIHRoaXMuc3RvcENoYXJzID0gW1wiKFwiLCBcIilcIiwgXCIsXCJdO1xyXG5cclxuICB0aGlzLnBhcnNlcklucHV0ID0gXCJcIjtcclxuICB0aGlzLnBhcnNlcklucHV0V2hvbGUgPSBcIlwiO1xyXG4gIHRoaXMucGFyc2VyU3RhY2sgPSBbXTtcclxufTtcclxuXHJcblBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihpbnB1dCkge1xyXG4gIHRoaXMucGFyc2VySW5wdXQgPSBpbnB1dDtcclxuICB0aGlzLnBhcnNlcklucHV0V2hvbGUgPSBpbnB1dDtcclxuICB0aGlzLnBhcnNlclN0YWNrID0gW107XHJcblxyXG4gIGRvIHtcclxuICAgIHRoaXMucGFyc2VTdGVwKCk7XHJcbiAgfSB3aGlsZSAodGhpcy5wYXJzZXJJbnB1dC5sZW5ndGgpO1xyXG5cclxuICB2YXIgcmV0ID0gdGhpcy5wYXJzZXJTdGFjay5wb3AoKTtcclxuXHJcbiAgaWYgKHRoaXMucGFyc2VyU3RhY2subGVuZ3RoKVxyXG4gICAgdGhyb3cgXCJVbmV4cGVjdGVkIFwiICsgcmV0Lm5hbWU7XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5QYXJzZXIucHJvdG90eXBlLnJlYWRXaGl0ZXNwYWNlID0gZnVuY3Rpb24oKSB7XHJcbiAgd2hpbGUgKC9cXHMvLnRlc3QodGhpcy5wYXJzZXJJbnB1dFswXSkgJiYgdGhpcy5wYXJzZXJJbnB1dC5sZW5ndGgpIHtcclxuICAgIHRoaXMucGFyc2VySW5wdXQgPSB0aGlzLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG4gIH1cclxufTtcclxuXHJcblBhcnNlci5wcm90b3R5cGUucGFyc2VOYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICB2YXIgcmV0ID0gXCJcIjtcclxuXHJcbiAgd2hpbGUgKCEvXFxzLy50ZXN0KHRoaXMucGFyc2VySW5wdXRbMF0pICYmIHRoaXMucGFyc2VySW5wdXQubGVuZ3RoICYmIHRoaXMuc3RvcENoYXJzLmluZGV4T2YodGhpcy5wYXJzZXJJbnB1dFswXSkgPT09IC0xKSAvLyByZWFkIHVudGlsIGEgd2hpdGVzcGFjZSBvY2N1cnNcclxuICB7XHJcbiAgICByZXQgKz0gdGhpcy5wYXJzZXJJbnB1dFswXTtcclxuICAgIHRoaXMucGFyc2VySW5wdXQgPSB0aGlzLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuUGFyc2VyLnByb3RvdHlwZS5yZWFkQ2hhciA9IGZ1bmN0aW9uKGNoYXIpIHtcclxuICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gIGlmICh0aGlzLnBhcnNlcklucHV0WzBdICE9PSBjaGFyKSB7XHJcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLnBhcnNlcklucHV0V2hvbGUubGVuZ3RoIC0gdGhpcy5wYXJzZXJJbnB1dC5sZW5ndGg7XHJcbiAgICB0aHJvdyBcIkV4cGVjdGVkICdcIiArIGNoYXIgKyBcIicgYXQgcG9zaXRpb24gXCIgKyBwb3NpdGlvbiArIFwiIGF0ICdcIiArIHRoaXMucGFyc2VySW5wdXRXaG9sZS5zdWJzdHIocG9zaXRpb24pICsgXCInXCI7XHJcbiAgfVxyXG5cclxuICB0aGlzLnBhcnNlcklucHV0ID0gdGhpcy5wYXJzZXJJbnB1dC5zbGljZSgxKTtcclxuXHJcbiAgdGhpcy5yZWFkV2hpdGVzcGFjZSgpO1xyXG59O1xyXG5cclxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZVN0ZXAgPSBmdW5jdGlvbihleHBlY3RlZFR5cGUpIHtcclxuICB2YXIgbmFtZSA9IHRoaXMucGFyc2VOYW1lKCk7XHJcbiAgdmFyIHRva2VuID0gdGhpcy50b2tlbk1hbmFnZXIuZ2V0VG9rZW5CeU5hbWUobmFtZSk7XHJcblxyXG4gIGlmICh0b2tlbiA9PT0gdW5kZWZpbmVkICYmIGV4cGVjdGVkVHlwZSA9PT0gVHlwZS5MSVRFUkFMKSB7XHJcbiAgICByZXR1cm4gbmFtZTtcclxuICB9XHJcblxyXG4gIGlmICh0b2tlbiA9PSB1bmRlZmluZWQpIHtcclxuICAgIHRocm93IFwiRXhwZWN0ZWQgYXJndW1lbnQgd2l0aCB0eXBlIFwiICsgZXhwZWN0ZWRUeXBlO1xyXG4gIH1cclxuXHJcbiAgaWYgKGV4cGVjdGVkVHlwZSAhPT0gdW5kZWZpbmVkICYmIHRva2VuLnR5cGUgIT09IGV4cGVjdGVkVHlwZSkge1xyXG4gICAgdGhyb3cgXCJVbmV4cGVjdGVkIFwiICsgdG9rZW4udHlwZSArIFwiICh3YXMgZXhwZWN0aW5nIFwiICsgZXhwZWN0ZWRUeXBlICsgXCIpXCI7XHJcbiAgfVxyXG5cclxuICB2YXIgbnVtQXJncyA9IHRva2VuLmFyZ3VtZW50X3R5cGVzLmxlbmd0aDtcclxuXHJcbiAgdmFyIGFyZ3MgPSBbXTtcclxuXHJcbiAgaWYgKHRva2VuLmZpeFR5cGUgPT09IEZpeFR5cGUuSU5GSVgpIHtcclxuICAgIHZhciBhID0gdGhpcy5wYXJzZXJTdGFjay5wb3AoKTtcclxuXHJcbiAgICBpZiAoYS50eXBlICE9PSB0b2tlbi5hcmd1bWVudF90eXBlc1swXSlcclxuICAgICAgdGhyb3cgXCJVbmV4cGVjdGVkIFwiICsgYS50eXBlICsgXCIgKHdhcyBleHBlY3RpbmcgXCIgKyB0b2tlbi5hcmd1bWVudF90eXBlc1swXSArIFwiKVwiO1xyXG5cclxuICAgIGFyZ3MgPSBbYSwgdGhpcy5wYXJzZVN0ZXAodG9rZW4uYXJndW1lbnRfdHlwZXNbMV0pXTtcclxuICAgIHRoaXMucGFyc2VyU3RhY2sucG9wKCk7XHJcbiAgfVxyXG5cclxuICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5QUkVGSVgpIHtcclxuICAgIHRoaXMucmVhZENoYXIoXCIoXCIpO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBudW1BcmdzOyBpKyspIHtcclxuICAgICAgYXJncy5wdXNoKHRoaXMucGFyc2VTdGVwKHRva2VuLmFyZ3VtZW50X3R5cGVzW2ldKSk7XHJcblxyXG4gICAgICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5wYXJzZXJJbnB1dFswXSA9PT0gXCIsXCIpXHJcbiAgICAgICAgdGhpcy5wYXJzZXJJbnB1dCA9IHRoaXMucGFyc2VySW5wdXQuc2xpY2UoMSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZWFkQ2hhcihcIilcIik7XHJcbiAgfVxyXG5cclxuICB2YXIgbmV3VG9rZW4gPSBuZXcgdG9rZW4uY29uc3RydWN0b3IoKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIG5ld1Rva2VuLmFyZ3NbaV0gPSBhcmdzW2ldO1xyXG5cclxuICAgIHRoaXMucGFyc2VyU3RhY2sucG9wKCk7XHJcbiAgfVxyXG4gIHRoaXMucGFyc2VyU3RhY2sucHVzaChuZXdUb2tlbik7XHJcblxyXG4gIHJldHVybiBuZXdUb2tlbjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyOyIsInZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi9lbnRpdHkuanNcIik7XHJcblxyXG4vLyBDaXJjbGUgZW50aXR5XHJcbnZhciBDaXJjbGUgPSBmdW5jdGlvbihjZW50ZXIsIHJhZGl1cywgZml4dHVyZSwgaWQsIGNvbGxpc2lvbkdyb3VwKSB7XHJcbiAgdmFyIHNoYXBlID0gbmV3IGIyQ2lyY2xlU2hhcGUoKTtcclxuICBzaGFwZS5zZXRfbV9yYWRpdXMocmFkaXVzKTtcclxuXHJcbiAgdmFyIGJvZHkgPSBuZXcgYjJCb2R5RGVmKCk7XHJcbiAgYm9keS5zZXRfcG9zaXRpb24oY2VudGVyKTtcclxuXHJcbiAgRW50aXR5LmNhbGwodGhpcywgc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5DaXJjbGUucHJvdG90eXBlID0gbmV3IEVudGl0eSgpO1xyXG5DaXJjbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2lyY2xlO1xyXG5cclxuQ2lyY2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY3R4KSB7XHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG5cclxuICBjdHguYXJjKDAsIDAsIHRoaXMucmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG5cclxuICBjdHguZmlsbCgpO1xyXG5cclxuICBjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xyXG4gIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSBcImRlc3RpbmF0aW9uLW91dFwiO1xyXG5cclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4Lm1vdmVUbygwLCAwKTtcclxuICBjdHgubGluZVRvKDAsIHRoaXMucmFkaXVzKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbiAgY3R4LmNsb3NlUGF0aCgpO1xyXG59XHJcblxyXG5cclxuLy8gUmVjdGFuZ2xlIGVudGl0eVxyXG52YXIgUmVjdGFuZ2xlID0gZnVuY3Rpb24oY2VudGVyLCBleHRlbnRzLCBmaXh0dXJlLCBpZCwgY29sbGlzaW9uR3JvdXApIHtcclxuICB2YXIgc2hhcGUgPSBuZXcgYjJQb2x5Z29uU2hhcGUoKTtcclxuICBzaGFwZS5TZXRBc0JveChleHRlbnRzLmdldF94KCksIGV4dGVudHMuZ2V0X3koKSlcclxuXHJcbiAgdmFyIGJvZHkgPSBuZXcgYjJCb2R5RGVmKCk7XHJcbiAgYm9keS5zZXRfcG9zaXRpb24oY2VudGVyKTtcclxuXHJcbiAgRW50aXR5LmNhbGwodGhpcywgc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIHRoaXMuZXh0ZW50cyA9IGV4dGVudHM7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblJlY3RhbmdsZS5wcm90b3R5cGUgPSBuZXcgRW50aXR5KCk7XHJcblJlY3RhbmdsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZWN0YW5nbGU7XHJcblxyXG5SZWN0YW5nbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcclxuICB2YXIgaGFsZldpZHRoID0gdGhpcy5leHRlbnRzLmdldF94KCk7XHJcbiAgdmFyIGhhbGZIZWlnaHQgPSB0aGlzLmV4dGVudHMuZ2V0X3koKTtcclxuXHJcbiAgY3R4LmZpbGxSZWN0KC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0LCBoYWxmV2lkdGggKiAyLCBoYWxmSGVpZ2h0ICogMik7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cy5DaXJjbGUgPSBDaXJjbGU7XHJcbm1vZHVsZS5leHBvcnRzLlJlY3RhbmdsZSA9IFJlY3RhbmdsZTsiLCJ2YXIgRml4VHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5GaXhUeXBlO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxudmFyIFRva2VuID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuUFJFRklYO1xyXG4gIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgdGhpcy5hcmdzID0gYXJncyA9PSB1bmRlZmluZWQgPyBbXSA6IGFyZ3M7XHJcbiAgdGhpcy5hcmd1bWVudF90eXBlcyA9IGFyZ3VtZW50X3R5cGVzO1xyXG4gIHRoaXMuYXJncyA9IFtdO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKGFyZ3NbaV0udHlwZSAhPT0gYXJndW1lbnRfdHlwZXNbaV0gJiYgYXJndW1lbnRfdHlwZXNbaV0gIT09IFR5cGUuTElURVJBTClcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFeGNlcHRpb24oYXJndW1lbnRfdHlwZXNbaV0sIGFyZ3NbaV0udHlwZSwgdGhpcyk7XHJcbiAgfVxyXG59O1xyXG5cclxuVG9rZW4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIHJldCA9IFwiXCI7XHJcbiAgdmFyIGFyZ1N0cmluZ3MgPSBbXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFyZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGFyZ1N0cmluZ3MucHVzaCh0aGlzLmFyZ3NbaV0udG9TdHJpbmcoKSk7XHJcbiAgfVxyXG5cclxuICBhcmdTdHJpbmdzID0gYXJnU3RyaW5ncy5qb2luKFwiLCBcIik7XHJcblxyXG4gIHN3aXRjaCAodGhpcy5maXhUeXBlKSB7XHJcbiAgICBjYXNlIEZpeFR5cGUuUFJFRklYOlxyXG4gICAgICByZXQgPSB0aGlzLm5hbWUgKyBcIihcIiArIGFyZ1N0cmluZ3MgKyBcIilcIjtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIEZpeFR5cGUuSU5GSVg6XHJcbiAgICAgIHJldCA9IHRoaXMuYXJnc1swXS50b1N0cmluZygpICsgXCIgXCIgKyB0aGlzLm5hbWUgKyBcIiBcIiArIHRoaXMuYXJnc1sxXS50b1N0cmluZygpO1xyXG4gICAgICBicmVhaztcclxuICB9XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5cclxuXHJcbnZhciBMb2dpYyA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgVG9rZW4uY2FsbCh0aGlzLCBuYW1lLCB0eXBlLCBhcmdzLCBhcmd1bWVudF90eXBlcyk7XHJcbn07XHJcbkxvZ2ljLnByb3RvdHlwZSA9IG5ldyBUb2tlbigpO1xyXG5Mb2dpYy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMb2dpYztcclxuXHJcbkxvZ2ljLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uKCkgeyAvLyBVc2UgYSBkZXJpdmVkIGNsYXNzXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuXHJcbnZhciBBY3Rpb24gPSBmdW5jdGlvbihuYW1lLCBhcmdzLCBhcmd1bWVudF90eXBlcykge1xyXG4gIFRva2VuLmNhbGwodGhpcywgbmFtZSwgVHlwZS5BQ1RJT04sIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKTtcclxufTtcclxuQWN0aW9uLnByb3RvdHlwZSA9IG5ldyBUb2tlbigpO1xyXG5BY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQWN0aW9uO1xyXG5cclxuQWN0aW9uLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7IC8vIFVzZSBhIGRlcml2ZWQgY2xhc3NcclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5BY3Rpb24ucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgZW50aXRpZXMgPSB0aGlzLmFyZ3NbMF0uZmlsdGVyKCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdGhpcy5lYWNoKGVudGl0aWVzW2ldKTtcclxuICB9XHJcbn07XHJcblxyXG5cclxudmFyIEVudGl0eUZpbHRlciA9IGZ1bmN0aW9uKG5hbWUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgVG9rZW4uY2FsbCh0aGlzLCBuYW1lLCBUeXBlLkVOVElUWUZJTFRFUiwgYXJncywgYXJndW1lbnRfdHlwZXMpO1xyXG59O1xyXG5FbnRpdHlGaWx0ZXIucHJvdG90eXBlID0gbmV3IFRva2VuKCk7XHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbnRpdHlGaWx0ZXI7XHJcblxyXG5FbnRpdHlGaWx0ZXIucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkgeyAvLyBVc2UgZGVyaXZlZCBjbGFzc1xyXG4gIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIHJldCA9IFtdO1xyXG4gIHZhciBlbnRpdGllcyA9IF9lbmdpbmUuZW50aXRpZXMoKTtcclxuICBcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAodGhpcy5kZWNpZGUoZW50aXRpZXNbaV0pKVxyXG4gICAgICByZXQucHVzaChlbnRpdGllc1tpXSk7XHJcbiAgfVxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5Ub2tlbiA9IFRva2VuO1xyXG5tb2R1bGUuZXhwb3J0cy5BY3Rpb24gPSBBY3Rpb247XHJcbm1vZHVsZS5leHBvcnRzLkxvZ2ljID0gTG9naWM7XHJcbm1vZHVsZS5leHBvcnRzLkVudGl0eUZpbHRlciA9IEVudGl0eUZpbHRlcjtcclxuXHJcbi8vIFRPRE86IGxpbmVhciBhY3Rpb24sIHBvcm92bmF2YW5pZSwgdWhseSwgcGx1cywgbWludXMgLCBkZWxlbm8sIGtyYXQsIHggbmEgbiIsInZhciBQYXJzZXIgPSByZXF1aXJlKFwiLi9wYXJzZXIuanNcIik7XHJcblxyXG52YXIgVG9rZW5NYW5hZ2VyID0gZnVuY3Rpb24gKCkge1xyXG4gIHRoaXMudG9rZW5zID0gW107XHJcblxyXG4gIHRoaXMucmVnaXN0ZXJUb2tlbnMocmVxdWlyZShcIi4vbG9naWMuanNcIikpO1xyXG4gIHRoaXMucmVnaXN0ZXJUb2tlbnMocmVxdWlyZShcIi4vYWN0aW9ucy5qc1wiKSk7XHJcbiAgdGhpcy5yZWdpc3RlclRva2VucyhyZXF1aXJlKFwiLi9lbnRpdHlmaWx0ZXJzLmpzXCIpKTtcclxuXHJcbiAgdGhpcy5wYXJzZXIgPSBuZXcgUGFyc2VyKHRoaXMpO1xyXG59O1xyXG5cclxuVG9rZW5NYW5hZ2VyLnByb3RvdHlwZS5yZWdpc3RlclRva2VucyA9IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICB0b2tlbnMuZm9yRWFjaChmdW5jdGlvbiAodG9rZW4pIHtcclxuICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IHRva2VuKCkpO1xyXG4gIH0sIHRoaXMpO1xyXG59O1xyXG5cclxuVG9rZW5NYW5hZ2VyLnByb3RvdHlwZS5nZXRUb2tlbkJ5TmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRva2Vucy5sZW5ndGg7IGkrKylcclxuICB7XHJcbiAgICBpZiAodGhpcy50b2tlbnNbaV0ubmFtZSA9PT0gbmFtZSlcclxuICAgICAgcmV0dXJuIHRoaXMudG9rZW5zW2ldO1xyXG4gIH1cclxufTtcclxuXHJcblRva2VuTWFuYWdlci5wcm90b3R5cGUuZ2V0VG9rZW5zQnlUeXBlID0gZnVuY3Rpb24gKHR5cGUpIHtcclxuICB2YXIgcmV0ID0gW107XHJcblxyXG4gIHRoaXMudG9rZW5zLmZvckVhY2goZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICBpZiAodG9rZW4udHlwZSA9PT0gdHlwZSlcclxuICAgICAgcmV0LnB1c2godG9rZW4pO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUb2tlbk1hbmFnZXI7IiwidmFyIFNoYXBlID0gcmVxdWlyZShcIi4vc2hhcGVzLmpzXCIpO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL2JvZHl0eXBlLmpzXCIpO1xyXG5cclxudmFyIEJsYW5rID0ge1xyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHt9LFxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge30sXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7fVxyXG59O1xyXG5cclxuXHJcbnZhciBTZWxlY3Rpb24gPSB7XHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgX2VuZ2luZS5zZWxlY3RFbnRpdHkobnVsbCk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IF9lbmdpbmUuTEFZRVJTX05VTUJFUiAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX2VuZ2luZS5sYXllcnNbaV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBpZiAoX2VuZ2luZS5sYXllcnNbaV1bal0uZml4dHVyZS5UZXN0UG9pbnQoXHJcbiAgICAgICAgICAgIG5ldyBiMlZlYzIoX2VuZ2luZS52aWV3cG9ydC54IC0gX2VuZ2luZS52aWV3cG9ydC53aWR0aCAvIDIgKyBJbnB1dC5tb3VzZS54LCBfZW5naW5lLnZpZXdwb3J0LnkgLSBfZW5naW5lLnZpZXdwb3J0LmhlaWdodCAvIDIgKyBJbnB1dC5tb3VzZS55KSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgIF9lbmdpbmUuc2VsZWN0RW50aXR5KF9lbmdpbmUubGF5ZXJzW2ldW2pdKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge30sXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7fVxyXG59O1xyXG5cclxuXHJcbnZhciBSZWN0YW5nbGUgPSB7XHJcbiAgb3JpZ2luOiBudWxsLFxyXG4gIHc6IDAsXHJcbiAgaDogMCxcclxuICBtaW5TaXplOiA1LFxyXG5cclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm9ubW92ZSA9IHRoaXMuZHJhZ2dpbmc7XHJcbiAgICB0aGlzLm9yaWdpbiA9IFtJbnB1dC5tb3VzZS54LCBJbnB1dC5tb3VzZS55XTtcclxuICB9LFxyXG5cclxuICBvbnJlbGVhc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLncgPj0gdGhpcy5taW5TaXplICYmIHRoaXMuaCA+PSB0aGlzLm1pblNpemUpXHJcbiAgICAgIF9lbmdpbmUuYWRkRW50aXR5KG5ldyBTaGFwZS5SZWN0YW5nbGUoXHJcbiAgICAgICAgbmV3IGIyVmVjMih0aGlzLm9yaWdpblswXSArIHRoaXMudyAvIDIsIHRoaXMub3JpZ2luWzFdICsgdGhpcy5oIC8gMiksXHJcbiAgICAgICAgbmV3IGIyVmVjMih0aGlzLncgLyAyLCB0aGlzLmggLyAyKSksIFR5cGUuRFlOQU1JQ19CT0RZKTtcclxuXHJcbiAgICB0aGlzLm9ubW92ZSA9IGZ1bmN0aW9uKCl7fTtcclxuICAgIHRoaXMub3JpZ2luID0gbnVsbDtcclxuICAgIHRoaXMudyA9IHRoaXMuaCA9IDA7XHJcbiAgfSxcclxuXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIH0sXHJcblxyXG4gIGRyYWdnaW5nOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICB0aGlzLncgPSBJbnB1dC5tb3VzZS54IC0gdGhpcy5vcmlnaW5bMF07XHJcbiAgICB0aGlzLmggPSBJbnB1dC5tb3VzZS55IC0gdGhpcy5vcmlnaW5bMV07XHJcblxyXG4gICAgaWYgKHRoaXMudyA8IHRoaXMubWluU2l6ZSB8fCB0aGlzLmggPCB0aGlzLm1pblNpemUpXHJcbiAgICAgIHJldHVybjtcclxuXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLCAwLCAwLCAwLjQpXCI7XHJcbiAgICBjdHguZmlsbFJlY3QodGhpcy5vcmlnaW5bMF0sIHRoaXMub3JpZ2luWzFdLCB0aGlzLncsIHRoaXMuaCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG52YXIgQ2lyY2xlID0ge1xyXG4gIG9yaWdpbjogbnVsbCxcclxuICByYWRpdXM6IDAsXHJcbiAgbWluUmFkaXVzOiA1LFxyXG5cclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm9ubW92ZSA9IHRoaXMuZHJhZ2dpbmc7XHJcbiAgICB0aGlzLm9yaWdpbiA9IFtJbnB1dC5tb3VzZS54LCBJbnB1dC5tb3VzZS55XTtcclxuICB9LFxyXG5cclxuICBvbnJlbGVhc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnJhZGl1cyA+PSB0aGlzLm1pblJhZGl1cylcclxuICAgICAgX2VuZ2luZS5hZGRFbnRpdHkobmV3IFNoYXBlLkNpcmNsZShcclxuICAgICAgICBuZXcgYjJWZWMyKHRoaXMub3JpZ2luWzBdICsgdGhpcy5yYWRpdXMsIHRoaXMub3JpZ2luWzFdICsgdGhpcy5yYWRpdXMpLFxyXG4gICAgICAgIHRoaXMucmFkaXVzKSwgVHlwZS5EWU5BTUlDX0JPRFkpO1xyXG5cclxuICAgIHRoaXMub25tb3ZlID0gZnVuY3Rpb24oKXt9O1xyXG4gICAgdGhpcy5vcmlnaW4gPSBudWxsO1xyXG4gICAgdGhpcy5yYWRpdXMgPSAwO1xyXG4gIH0sXHJcblxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICB9LFxyXG5cclxuICBkcmFnZ2luZzogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgdGhpcy5yYWRpdXMgPSBNYXRoLm1pbihJbnB1dC5tb3VzZS54IC0gdGhpcy5vcmlnaW5bMF0sIElucHV0Lm1vdXNlLnkgLSB0aGlzLm9yaWdpblsxXSkgLyAyO1xyXG5cclxuICAgIGlmICh0aGlzLnJhZGl1cyA8IHRoaXMubWluUmFkaXVzKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuXHJcbiAgICBjdHguYXJjKHRoaXMub3JpZ2luWzBdICsgdGhpcy5yYWRpdXMsIHRoaXMub3JpZ2luWzFdICsgdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG5cclxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgMC40KVwiO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLkJsYW5rID0gQmxhbms7XHJcbm1vZHVsZS5leHBvcnRzLlNlbGVjdGlvbiA9IFNlbGVjdGlvbjtcclxubW9kdWxlLmV4cG9ydHMuUmVjdGFuZ2xlID0gUmVjdGFuZ2xlO1xyXG5tb2R1bGUuZXhwb3J0cy5DaXJjbGUgPSBDaXJjbGU7IiwidmFyIFR5cGUgPSB7XHJcbiAgQk9PTEVBTjogXCJib29sZWFuXCIsXHJcbiAgTlVNQkVSOiBcIm51bWJlclwiLFxyXG4gIFNUUklORzogXCJzdHJpbmdcIixcclxuICBBUlJBWTogXCJhcnJheVwiLFxyXG4gIEFDVElPTjogXCJhY3Rpb25cIixcclxuICBFTlRJVFlGSUxURVI6IFwiZW50aXR5RmlsdGVyXCIsXHJcbiAgTElURVJBTDogXCJsaXRlcmFsXCJcclxufTtcclxuXHJcbnZhciBGaXhUeXBlID0ge1xyXG4gIElORklYOiBcImluZml4XCIsXHJcbiAgUFJFRklYOiBcInByZWZpeFwiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5UeXBlID0gVHlwZTtcclxubW9kdWxlLmV4cG9ydHMuRml4VHlwZSA9IEZpeFR5cGU7IiwidmFyIFRvb2xzID0gcmVxdWlyZShcIi4vdG9vbHMuanNcIik7XHJcbnZhciBCb2R5VHlwZSA9IHJlcXVpcmUoXCIuL2JvZHl0eXBlLmpzXCIpO1xyXG52YXIgVUlCdWlsZGVyID0gcmVxdWlyZShcIi4vdWlidWlsZGVyLmpzXCIpO1xyXG5cclxuLy8gT2JqZWN0IGZvciBidWlsZGluZyB0aGUgVUlcclxudmFyIFVJID0ge1xyXG4gIC8vIFVJIGluaXRpYWxpc2F0aW9uXHJcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbGFuZ3VhZ2VzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IFRyYW5zbGF0aW9ucy5zdHJpbmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGxhbmd1YWdlcy5wdXNoKHt0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZCgwLCBpKSwgdmFsdWU6IGl9KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcHJvcGVydGllcyA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXHJcblxyXG4gICAgICAgIGlkOiBcInBsYXlcIixcclxuICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMiksXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgX2VuZ2luZS50b2dnbGVQYXVzZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChfZW5naW5lLndvcmxkLnBhdXNlZCkge1xyXG4gICAgICAgICAgICAkKFwiI3BsYXlcIikuaHRtbChUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMikpO1xyXG5cclxuICAgICAgICAgICAgJChcIiNjb2xsaXNpb25zLCAjdG9vbFwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0aGlzLmVuYWJsZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiI3BsYXlcIikuaHRtbChUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMykpO1xyXG5cclxuICAgICAgICAgICAgJChcIiNjb2xsaXNpb25zLCAjdG9vbFwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0aGlzLmRpc2FibGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7dHlwZTogXCJicmVha1wifSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXHJcblxyXG4gICAgICAgIGlkOiBcImNvbGxpc2lvbnNcIixcclxuICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMSksXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgVUlCdWlsZGVyLnBvcHVwKFVJLmNyZWF0ZUNvbGxpc2lvbnMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7dHlwZTogXCJicmVha1wifSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwicmFkaW9cIixcclxuXHJcbiAgICAgICAgaWQ6IFwidG9vbFwiLFxyXG4gICAgICAgIGVsZW1lbnRzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxNyksIGNoZWNrZWQ6IHRydWUsIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgSW5wdXQudG9vbCA9IFRvb2xzLlNlbGVjdGlvbjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxOCksIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgSW5wdXQudG9vbCA9IFRvb2xzLlJlY3RhbmdsZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxOSksIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgSW5wdXQudG9vbCA9IFRvb2xzLkNpcmNsZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB7dHlwZTogXCJicmVha1wifSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwic2VsZWN0XCIsXHJcbiAgICAgICAgb3B0aW9uczogbGFuZ3VhZ2VzLFxyXG5cclxuICAgICAgICBvbmNoYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICBUcmFuc2xhdGlvbnMuc2V0TGFuZ3VhZ2UodmFsdWUgKiAxKTtcclxuICAgICAgICB9LFxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIFVJQnVpbGRlci5idWlsZExheW91dCgpO1xyXG4gICAgJChcIi51aS50b29sYmFyXCIpWzBdLmFwcGVuZENoaWxkKFVJQnVpbGRlci5idWlsZChwcm9wZXJ0aWVzKSk7XHJcbiAgICAkKFwiLnVpLmNvbnRlbnRcIilbMF0uYXBwZW5kQ2hpbGQoZWwoXCJjYW52YXMjbWFpbkNhbnZhc1wiKSk7XHJcblxyXG4gIH0sXHJcblxyXG4gIC8vIEJ1aWxkaW5nIHRoZSBjb2xsaXNpb24gZ3JvdXAgdGFibGVcclxuICBjcmVhdGVDb2xsaXNpb25zOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0YWJsZSA9IGVsKFwidGFibGUuY29sbGlzaW9uVGFibGVcIik7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZW5naW5lLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSICsgMTsgaSsrKSB7XHJcbiAgICAgIHZhciB0ciA9IGVsKFwidHJcIik7XHJcblxyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF9lbmdpbmUuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgKyAxOyBqKyspIHtcclxuICAgICAgICB2YXIgdGQgPSBlbChcInRkXCIpO1xyXG5cclxuICAgICAgICAvLyBmaXJzdCByb3dcclxuICAgICAgICBpZiAoaSA9PT0gMCAmJiBqID4gMCkge1xyXG4gICAgICAgICAgdGQuaW5uZXJIVE1MID0gXCI8ZGl2PjxzcGFuPlwiICsgX2VuZ2luZS5jb2xsaXNpb25Hcm91cHNbaiAtIDFdLm5hbWUgKyBcIjwvc3Bhbj48L2Rpdj5cIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpcnN0IGNvbHVtblxyXG4gICAgICAgIGVsc2UgaWYgKGogPT09IDAgJiYgaSAhPT0gMClcclxuICAgICAgICAgIHRkLmlubmVySFRNTCA9IF9lbmdpbmUuY29sbGlzaW9uR3JvdXBzW2kgLSAxXS5uYW1lO1xyXG5cclxuICAgICAgICAvLyByZWxldmFudCB0cmlhbmdsZVxyXG4gICAgICAgIGVsc2UgaWYgKGkgPD0gaiAmJiBqICE9PSAwICYmIGkgIT09IDApIHtcclxuICAgICAgICAgIHRkLnJvdyA9IGk7XHJcbiAgICAgICAgICB0ZC5jb2wgPSBqO1xyXG5cclxuICAgICAgICAgIC8vIGhpZ2hsaWdodGluZ1xyXG4gICAgICAgICAgdGQub25tb3VzZW92ZXIgPSBmdW5jdGlvbihpLCBqLCB0YWJsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHRkcyA9IHRhYmxlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGRcIik7XHJcbiAgICAgICAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCB0ZHMubGVuZ3RoOyBuKyspIHtcclxuICAgICAgICAgICAgICAgIHRkc1tuXS5jbGFzc05hbWUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG9ubHkgaGlnaGxpZ2h0IHVwIHRvIHRoZSByZWxldmFudCBjZWxsXHJcbiAgICAgICAgICAgICAgICBpZiAoKHRkc1tuXS5yb3cgPT09IGkgJiYgdGRzW25dLmNvbCA8PSBqKSB8fCAodGRzW25dLmNvbCA9PT0gaiAmJiB0ZHNbbl0ucm93IDw9IGkpKVxyXG4gICAgICAgICAgICAgICAgICB0ZHNbbl0uY2xhc3NOYW1lID0gXCJoaWdobGlnaHRcIjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0oaSwgaiwgdGFibGUpO1xyXG5cclxuICAgICAgICAgIC8vIG1vcmUgaGlnaGxpZ2h0aW5nXHJcbiAgICAgICAgICB0ZC5vbm1vdXNlb3V0ID0gZnVuY3Rpb24odGFibGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHZhciB0ZHMgPSB0YWJsZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRkXCIpO1xyXG4gICAgICAgICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgdGRzLmxlbmd0aDsgbisrKSB7XHJcbiAgICAgICAgICAgICAgICB0ZHNbbl0uY2xhc3NOYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0odGFibGUpO1xyXG5cclxuICAgICAgICAgIC8vIGNoZWNrYm94IGZvciBjb2xsaXNpb24gdG9nZ2xpbmdcclxuICAgICAgICAgIHZhciBjaGVja2JveCA9IGVsKFwiaW5wdXRcIiwge3R5cGU6IFwiY2hlY2tib3hcIn0pO1xyXG5cclxuICAgICAgICAgIGlmIChfZW5naW5lLmdldENvbGxpc2lvbihpIC0gMSwgaiAtIDEpKVxyXG4gICAgICAgICAgICBjaGVja2JveC5zZXRBdHRyaWJ1dGUoXCJjaGVja2VkXCIsIFwiY2hlY2tlZFwiKTtcclxuXHJcbiAgICAgICAgICBjaGVja2JveC5vbmNoYW5nZSA9IGZ1bmN0aW9uKGksIGosIGNoZWNrYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBfZW5naW5lLnNldENvbGxpc2lvbihpIC0gMSwgaiAtIDEsIGNoZWNrYm94LmNoZWNrZWQgPyAxIDogMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0oaSwgaiwgY2hlY2tib3gpO1xyXG5cclxuICAgICAgICAgIC8vIGNsaWNraW5nIHRoZSBjaGVja2JveCdzIGNlbGwgc2hvdWxkIHdvcmsgYXMgd2VsbFxyXG4gICAgICAgICAgdGQub25jbGljayA9IGZ1bmN0aW9uKGNoZWNrYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0ID09PSBjaGVja2JveClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gIWNoZWNrYm94LmNoZWNrZWQ7XHJcbiAgICAgICAgICAgICAgY2hlY2tib3gub25jaGFuZ2UoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0oY2hlY2tib3gpO1xyXG5cclxuICAgICAgICAgIHRkLmFwcGVuZENoaWxkKGNoZWNrYm94KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpeCBmb3IgYWxzbyBoaWdobGlnaHRpbmcgY2VsbHMgd2l0aG91dCBjaGVja2JveGVzXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0ZC5yb3cgPSBpO1xyXG4gICAgICAgICAgdGQuY29sID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGFibGUuYXBwZW5kQ2hpbGQodHIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YWJsZTtcclxuICB9LFxyXG5cclxuICBjcmVhdGVCZWhhdmlvcjogZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gICAgcmV0dXJuIFwiVE9ET1wiO1xyXG5cclxuICAgIHZhciBsb2dpYyA9IGVsKFwidGV4dGFyZWFcIik7XHJcbiAgICBsb2dpYy5pbm5lckhUTUwgPSBlbnRpdHkuYmVoYXZpb3JzWzBdLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgcmV0dXJuIGVsKFwiZGl2XCIsIFtcclxuICAgICAgVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDUpLCBlbChcImJyXCIpLFxyXG4gICAgICBsb2dpYyxcclxuICAgICAgZWwucCgpLFxyXG4gICAgICBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoNiksIGVsKFwiYnJcIiksXHJcblxyXG4gICAgXSk7XHJcbiAgfSxcclxuXHJcbiAgYnVpbGRTaWRlYmFyOiBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgICB2YXIgc2lkZWJhciA9ICQoXCIuc2lkZWJhci51aSAuY29udGVudFwiKTtcclxuXHJcbiAgICBzaWRlYmFyLmh0bWwoXCJcIik7XHJcblxyXG4gICAgaWYgKGVudGl0eSA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHByb3BlcnRpZXMgPSBbXHJcbiAgICAgIC8vIElEXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg3KX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dFRleHRcIiwgdmFsdWU6IGVudGl0eS5pZCwgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge19lbmdpbmUuY2hhbmdlSWQoZW50aXR5LCB2YWwpO319LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gQ29sbGlzaW9uIGdyb3VwXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg4KX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmNvbGxpc2lvbkdyb3VwICsgMSwgbWluOiAxLCBtYXg6IF9lbmdpbmUuQ09MTElTSU9OX0dST1VQU19OVU1CRVIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5zZXRDb2xsaXNpb25Hcm91cCh2YWwgKiAxIC0gMSk7fX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBMYXllclxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMjEpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkubGF5ZXIgKyAxLCBtaW46IDEsIG1heDogX2VuZ2luZS5MQVlFUlNfTlVNQkVSLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHsgX2VuZ2luZS5zZXRFbnRpdHlMYXllcihlbnRpdHksIHZhbCoxIC0gMSk7IH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gWFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoOSl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXROdW1iZXJcIiwgdmFsdWU6IGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3goKSxcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgICBlbnRpdHkuYm9keS5TZXRUcmFuc2Zvcm0obmV3IGIyVmVjMih2YWwgKiAxLCBlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF95KCkpLCBlbnRpdHkuYm9keS5HZXRBbmdsZSgpKTtcclxuICAgICAgICB9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIFlcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDEwKX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtcclxuICAgICAgICAgIGVudGl0eS5ib2R5LlNldFRyYW5zZm9ybShuZXcgYjJWZWMyKGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3goKSwgdmFsICogMSksIGVudGl0eS5ib2R5LkdldEFuZ2xlKCkpO1xyXG4gICAgICAgIH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gUm90YXRpb25cclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDExKX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmJvZHkuR2V0QW5nbGUoKSAqIDE4MCAvIE1hdGguUEksXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5ib2R5LlNldFRyYW5zZm9ybShlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLCAodmFsICogMSkgKiBNYXRoLlBJIC8gMTgwKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIEZpeGVkIHJvdGF0aW9uXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxMil9LFxyXG4gICAgICB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogZW50aXR5LmZpeGVkUm90YXRpb24sIG9uY2hhbmdlOiBmdW5jdGlvbih2YWwpIHsgZW50aXR5LmRpc2FibGVSb3RhdGlvbih2YWwpOyB9IH0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBDb2xvclxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTMpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0Q29sb3JcIiwgdmFsdWU6IGVudGl0eS5jb2xvciwgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5jb2xvciA9IHZhbH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gQm9keSB0eXBlXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxNCl9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogXCJzZWxlY3RcIiwgc2VsZWN0ZWQ6IGVudGl0eS5ib2R5LkdldFR5cGUoKSwgb25jaGFuZ2U6IGZ1bmN0aW9uICh2YWwpIHtlbnRpdHkuYm9keS5TZXRUeXBlKHZhbCAqIDEpfSxcclxuICAgICAgICBvcHRpb25zOiBbXHJcbiAgICAgICAgICB7IHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxNSksIHZhbHVlOiBCb2R5VHlwZS5EWU5BTUlDX0JPRFkgfSxcclxuICAgICAgICAgIHsgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIwKSwgdmFsdWU6IEJvZHlUeXBlLktJTkVNQVRJQ19CT0RZIH0sXHJcbiAgICAgICAgICB7IHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxNiksIHZhbHVlOiBCb2R5VHlwZS5TVEFUSUNfQk9EWSB9LFxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIHsgdHlwZTogXCJidXR0b25cIiwgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIyKSwgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmKGNvbmZpcm0oVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWQoMjMpKSlcclxuICAgICAgICAgIF9lbmdpbmUucmVtb3ZlRW50aXR5KGVudGl0eSk7XHJcbiAgICAgIH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgIF07XHJcblxyXG4gICAgc2lkZWJhclswXS5hcHBlbmRDaGlsZChVSUJ1aWxkZXIuYnVpbGQocHJvcGVydGllcykpO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUk7IiwidmFyIFVJQnVpbGRlciA9IHtcclxuICByYWRpbzogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJyYWRpb0dyb3VwLVwiICsgJChcIi5yYWRpb0dyb3VwXCIpLmxlbmd0aCxcclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcImRpdi51aS5yYWRpb0dyb3VwXCIsIHtpZDogcHJvcGVydGllcy5pZH0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKFwiaW5wdXRbdHlwZT1yYWRpb11cIiwgdGhpcykuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcImlucHV0W3R5cGU9cmFkaW9dXCIsIHRoaXMpLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmVuYWJsZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIHZhciBpZENvdW50ID0gJChcImlucHV0W3R5cGU9cmFkaW9dXCIpLmxlbmd0aDtcclxuXHJcbiAgICBwcm9wZXJ0aWVzLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICBlbGVtZW50ID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgICBpZDogXCJyYWRpby1cIiArIGlkQ291bnQrKyxcclxuICAgICAgICBjaGVja2VkOiBmYWxzZSxcclxuICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbigpe31cclxuICAgICAgfSwgZWxlbWVudCk7XHJcblxyXG4gICAgICB2YXIgaW5wdXQgPSBlbChcImlucHV0LnVpXCIsIHt0eXBlOiBcInJhZGlvXCIsIGlkOiBlbGVtZW50LmlkLCBuYW1lOiBwcm9wZXJ0aWVzLmlkfSk7XHJcbiAgICAgIHZhciBsYWJlbCA9IGVsKFwibGFiZWwudWkuYnV0dG9uXCIsIHtmb3I6IGVsZW1lbnQuaWR9LCBbZWxlbWVudC50ZXh0XSk7XHJcblxyXG4gICAgICBpbnB1dC5lbmFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgaW5wdXQuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICQoXCIrbGFiZWxcIiwgdGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGxhYmVsLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcyhcImRpc2FibGVkXCIpKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBlbGVtZW50Lm9uY2xpY2soKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlucHV0LmNoZWNrZWQgPSBlbGVtZW50LmNoZWNrZWQ7XHJcblxyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQoaW5wdXQpO1xyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQobGFiZWwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG4gIFxyXG4gIGJ1dHRvbjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJidXR0b24tXCIgKyAkKFwiLmJ1dHRvblwiKS5sZW5ndGgsXHJcbiAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwic3Bhbi51aS5idXR0b25cIiwgeyBpZDogcHJvcGVydGllcy5pZCB9LCBbcHJvcGVydGllcy50ZXh0XSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKVxyXG4gICAge1xyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0Lm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmKCQodGhpcykuaGFzQ2xhc3MoXCJkaXNhYmxlZFwiKSlcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICBwcm9wZXJ0aWVzLm9uY2xpY2soKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBzZWxlY3Q6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwic2VsZWN0LVwiICsgJChcInNlbGVjdFwiKS5sZW5ndGgsXHJcbiAgICAgIHNlbGVjdGVkOiBcIlwiLFxyXG4gICAgICBvbmNoYW5nZTogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJzZWxlY3QudWlcIiwgeyBpZDogcHJvcGVydGllcy5pZCB9KTtcclxuXHJcbiAgICByZXQub25jaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25jaGFuZ2UodGhpcy52YWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBlbmFibGU7XHJcbiAgICB9O1xyXG5cclxuICAgIHByb3BlcnRpZXMub3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvcHRpb24sIGluZGV4KSB7XHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChlbChcIm9wdGlvblwiLCB7dmFsdWU6IG9wdGlvbi52YWx1ZX0sIFtvcHRpb24udGV4dF0pKTtcclxuXHJcbiAgICAgIGlmIChvcHRpb24udmFsdWUgPT0gcHJvcGVydGllcy5zZWxlY3RlZClcclxuICAgICAgICByZXQuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBicmVhazogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGVsKFwic3Bhbi51aS5icmVha1wiKTtcclxuICB9LFxyXG5cclxuICBpbnB1dFRleHQ6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwiaW5wdXRUZXh0LVwiICsgJChcImlucHV0W3R5cGU9dGV4dF1cIikubGVuZ3RoLFxyXG4gICAgICB2YWx1ZTogXCJcIixcclxuICAgICAgb25pbnB1dDogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJpbnB1dC51aVwiLCB7IHR5cGU6IFwidGV4dFwiLCBpZDogcHJvcGVydGllcy5pZCwgdmFsdWU6IHByb3BlcnRpZXMudmFsdWUgfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQub25pbnB1dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcHJvcGVydGllcy5vbmlucHV0KHRoaXMudmFsdWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGlucHV0TnVtYmVyOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImlucHV0TnVtYmVyLVwiICsgJChcImlucHV0W3R5cGU9bnVtYmVyXVwiKS5sZW5ndGgsXHJcbiAgICAgIHZhbHVlOiAwLFxyXG4gICAgICBtaW46IC1JbmZpbml0eSxcclxuICAgICAgbWF4OiBJbmZpbml0eSxcclxuICAgICAgb25pbnB1dDogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJpbnB1dC51aVwiLCB7IHR5cGU6IFwibnVtYmVyXCIsIGlkOiBwcm9wZXJ0aWVzLmlkLCB2YWx1ZTogcHJvcGVydGllcy52YWx1ZSwgbWluOiBwcm9wZXJ0aWVzLm1pbiwgbWF4OiBwcm9wZXJ0aWVzLm1heCB9KTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5vbmlucHV0ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgcHJvcGVydGllcy5vbmlucHV0KHRoaXMudmFsdWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGh0bWw6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgY29udGVudDogXCJcIlxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgcmV0dXJuIHByb3BlcnRpZXMuY29udGVudDtcclxuICB9LFxyXG5cclxuICBpbnB1dENvbG9yOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImlucHV0Q29sb3ItXCIgKyAkKFwiaW5wdXRbdHlwZT1jb2xvcl1cIikubGVuZ3RoLFxyXG4gICAgICB2YWx1ZTogXCIjMDAwMDAwXCIsXHJcbiAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwiaW5wdXQudWlcIiwgeyB0eXBlOiBcImNvbG9yXCIsIGlkOiBwcm9wZXJ0aWVzLmlkLCB2YWx1ZTogcHJvcGVydGllcy52YWx1ZSB9KTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5vbmlucHV0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uaW5wdXQodGhpcy52YWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgY2hlY2tib3g6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwiY2hlY2tib3gtXCIgKyAkKFwiaW5wdXRbdHlwZT1jaGVja2JveF1cIikubGVuZ3RoLFxyXG4gICAgICBjaGVja2VkOiBmYWxzZSxcclxuICAgICAgb25jaGFuZ2U6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwic3BhblwiKTtcclxuICAgIHZhciBjaGVja2JveCA9IGVsKFwiaW5wdXQudWlcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGlkOiBwcm9wZXJ0aWVzLmlkIH0pO1xyXG4gICAgdmFyIGxhYmVsID0gZWwoXCJsYWJlbC51aS5idXR0b25cIiwgeyBmb3I6IHByb3BlcnRpZXMuaWQgfSk7XHJcblxyXG4gICAgcmV0LmFwcGVuZENoaWxkKGNoZWNrYm94KTtcclxuICAgIHJldC5hcHBlbmRDaGlsZChsYWJlbCk7XHJcblxyXG4gICAgY2hlY2tib3guZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgY2hlY2tib3guZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKFwiK2xhYmVsXCIsIHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgY2hlY2tib3guY2hlY2tlZCA9IHByb3BlcnRpZXMuY2hlY2tlZDtcclxuXHJcbiAgICBjaGVja2JveC5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcHJvcGVydGllcy5vbmNoYW5nZSh0aGlzLmNoZWNrZWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGJ1aWxkOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgdmFyIHJldCA9IGVsLmRpdigpO1xyXG5cclxuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICB2YXIgZ2VuZXJhdGVkO1xyXG4gICAgICBcclxuICAgICAgc3dpdGNoIChlbGVtZW50LnR5cGUpIHtcclxuICAgICAgICBjYXNlIFwicmFkaW9cIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMucmFkaW8oZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImJ1dHRvblwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5idXR0b24oZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcInNlbGVjdFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5zZWxlY3QoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImlucHV0VGV4dFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5pbnB1dFRleHQoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImlucHV0TnVtYmVyXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmlucHV0TnVtYmVyKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJpbnB1dENvbG9yXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmlucHV0Q29sb3IoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImNoZWNrYm94XCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmNoZWNrYm94KGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJodG1sXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmh0bWwoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImJyZWFrXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmJyZWFrKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0LmFwcGVuZENoaWxkKGdlbmVyYXRlZCk7XHJcbiAgICB9LCB0aGlzKTtcclxuICAgIFxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG4gIFxyXG4gIGJ1aWxkTGF5b3V0OiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb250ZW50ID0gZWwoXCJkaXYudWkuY29udGVudC5wYW5lbFwiKTtcclxuICAgIHZhciBzaWRlYmFyID0gZWwoXCJkaXYudWkuc2lkZWJhci5wYW5lbFwiLCB7fSwgWyBlbChcImRpdi5jb250ZW50XCIpIF0pO1xyXG4gICAgdmFyIHJlc2l6ZXIgPSBlbChcImRpdi51aS5yZXNpemVyXCIpO1xyXG4gICAgdmFyIHRvb2xiYXIgPSBlbChcImRpdi51aS50b29sYmFyXCIpO1xyXG5cclxuICAgIHZhciB3ID0gJChcImJvZHlcIikub3V0ZXJXaWR0aCgpO1xyXG4gICAgdmFyIHNpZGViYXJXaWR0aCA9IDI1MDtcclxuXHJcbiAgICBjb250ZW50LnN0eWxlLndpZHRoID0gdyAtIDI1MCArIFwicHhcIjtcclxuICAgIHNpZGViYXIuc3R5bGUud2lkdGggPSBzaWRlYmFyV2lkdGggKyBcInB4XCI7XHJcblxyXG4gICAgdmFyIHNpZGViYXJSZXNpemVFdmVudCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHZhciB3aW5kb3dXaWR0aCA9ICQoXCJib2R5XCIpLm91dGVyV2lkdGgoKTtcclxuICAgICAgdmFyIHNpZGViYXJXaWR0aCA9IE1hdGgubWF4KDMwLCBNYXRoLm1pbih3aW5kb3dXaWR0aCAqIDAuNiwgd2luZG93V2lkdGggLSBlLmNsaWVudFgpKTtcclxuICAgICAgdmFyIGNvbnRlbnRXaWR0aCA9IHdpbmRvd1dpZHRoIC0gc2lkZWJhcldpZHRoO1xyXG5cclxuICAgICAgc2lkZWJhci5zdHlsZS53aWR0aCA9IHNpZGViYXJXaWR0aCArIFwicHhcIjtcclxuICAgICAgY29udGVudC5zdHlsZS53aWR0aCA9IGNvbnRlbnRXaWR0aCArIFwicHhcIjtcclxuXHJcbiAgICAgIHdpbmRvdy5vbnJlc2l6ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgbW91c2VVcEV2ZW50ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgc2lkZWJhci5yZXNpemluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgJChcIi5yZXNpemVyLnVpXCIpLnJlbW92ZUNsYXNzKFwicmVzaXppbmdcIik7XHJcblxyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBzaWRlYmFyUmVzaXplRXZlbnQpO1xyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbW91c2VVcEV2ZW50KTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHdpbmRvd1Jlc2l6ZUV2ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgd2luZG93V2lkdGggPSAkKFwiYm9keVwiKS5vdXRlcldpZHRoKCk7XHJcbiAgICAgIHZhciBjb250ZW50V2lkdGggPSBNYXRoLm1heCh3aW5kb3dXaWR0aCAqIDAuNCwgTWF0aC5taW4oXHJcbiAgICAgICAgd2luZG93V2lkdGggLSAzMCxcclxuICAgICAgICB3aW5kb3dXaWR0aCAtICQoXCIuc2lkZWJhci51aVwiKS5vdXRlcldpZHRoKClcclxuICAgICAgKSk7XHJcbiAgICAgIHZhciBzaWRlYmFyV2lkdGggPSB3aW5kb3dXaWR0aCAtIGNvbnRlbnRXaWR0aDtcclxuXHJcbiAgICAgIHNpZGViYXIuc3R5bGUud2lkdGggPSBzaWRlYmFyV2lkdGggKyBcInB4XCI7XHJcbiAgICAgIGNvbnRlbnQuc3R5bGUud2lkdGggPSBjb250ZW50V2lkdGggKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplci5vbm1vdXNlZG93biA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHNpZGViYXIucmVzaXppbmcgPSB0cnVlO1xyXG5cclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcInJlc2l6aW5nXCIpO1xyXG5cclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2lkZWJhclJlc2l6ZUV2ZW50KTtcclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG1vdXNlVXBFdmVudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHdpbmRvd1Jlc2l6ZUV2ZW50KTtcclxuXHJcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKHRvb2xiYXIpO1xyXG4gICAgc2lkZWJhci5hcHBlbmRDaGlsZChyZXNpemVyKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNpZGViYXIpO1xyXG4gIH0sXHJcblxyXG4gIC8vIENyZWF0aW5nIGEgcG9wdXAgbWVzc2FnZVxyXG4gIHBvcHVwOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICB2YXIgb3ZlcmxheSA9IGVsKFwiZGl2I3BvcHVwT3ZlcmxheVwiLCBbZWwoXCJkaXYjcG9wdXBDb250ZW50XCIsIFtkYXRhXSldKTtcclxuICAgIG92ZXJsYXkub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgVUlCdWlsZGVyLmNsb3NlUG9wdXAoZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKG92ZXJsYXksIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgVHJhbnNsYXRpb25zLnJlZnJlc2goKTtcclxuICB9LFxyXG5cclxuICAvLyBDbG9zaW5nIGEgcG9wdXAgbWVzc2FnZVxyXG4gIGNsb3NlUG9wdXA6IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3B1cE92ZXJsYXlcIik7XHJcbiAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9wdXBDb250ZW50XCIpO1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSBpdCB3YXMgdGhlIG92ZXJsYXkgdGhhdCB3YXMgY2xpY2tlZCwgbm90IGFuIGVsZW1lbnQgYWJvdmUgaXRcclxuICAgIGlmICh0eXBlb2YgZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBlLnRhcmdldCAhPT0gb3ZlcmxheSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgY29udGVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNvbnRlbnQpO1xyXG4gICAgb3ZlcmxheS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG92ZXJsYXkpO1xyXG4gIH0sXHJcblxyXG5cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJQnVpbGRlcjsiLCIvLyBPYmplY3QgY29udGFpbmluZyB1c2VmdWwgbWV0aG9kc1xyXG52YXIgVXRpbHMgPSB7XHJcbiAgZ2V0QnJvd3NlcldpZHRoOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkKFwiLnVpLmNvbnRlbnRcIikub3V0ZXJXaWR0aCgpO1xyXG4gIH0sXHJcblxyXG4gIGdldEJyb3dzZXJIZWlnaHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICQoXCIudWkuY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gJChcIi51aS50b29sYmFyXCIpLm91dGVySGVpZ2h0KCk7XHJcbiAgfSxcclxuXHJcbiAgcmFuZG9tUmFuZ2U6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pO1xyXG4gIH0sXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7IiwidmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHMuanNcIik7XHJcblxyXG4vLyBWSUVXUE9SVFxyXG4vLyBUaGlzIGlzIGJhc2ljYWxseSBjYW1lcmEgKyBwcm9qZWN0b3JcclxuXHJcbnZhciBWaWV3cG9ydCA9IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIHgsIHkpIHtcclxuICAvLyBDYW52YXMgZGltZW5zaW9uc1xyXG4gIGlmICh3aWR0aCAhPSB1bmRlZmluZWQgJiYgaGVpZ2h0ICE9IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5zZXRBdXRvUmVzaXplKGZhbHNlKTtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnNldEF1dG9SZXNpemUodHJ1ZSk7XHJcbiAgICB0aGlzLmF1dG9SZXNpemUoKTtcclxuICB9XHJcblxyXG4gIC8vIENlbnRlciBwb2ludCBvZiB0aGUgY2FtZXJhXHJcbiAgaWYgKHggIT09IHVuZGVmaW5lZCAmJiB5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnggPSBNYXRoLmZsb29yKHRoaXMud2lkdGggLyAyKTtcclxuICAgIHRoaXMueSA9IE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyAyKTtcclxuICB9XHJcblxyXG4gIC8vIENhbnZhcyBlbGVtZW50XHJcbiAgdGhpcy5jYW52YXNFbGVtZW50ID0gY2FudmFzRWxlbWVudDtcclxuXHJcbiAgaWYgKGNhbnZhc0VsZW1lbnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5jYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXNFbGVtZW50KTtcclxuICB9XHJcblxyXG4gIHRoaXMucmVzZXRFbGVtZW50KCk7IC8vIFJlc2l6ZSB0byBuZXcgZGltZW5zaW9uc1xyXG5cclxuICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG59O1xyXG5cclxuLy8gUmVsb2FkcyB2YWx1ZXMgZm9yIHRoZSBjYW52YXMgZWxlbWVudFxyXG5WaWV3cG9ydC5wcm90b3R5cGUucmVzZXRFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5jYW52YXNFbGVtZW50LndpZHRoID0gdGhpcy53aWR0aDtcclxuICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbn1cclxuXHJcbi8vIEF1dG9tYXRpY2FsbHkgcmVzaXplcyB0aGUgdmlld3BvcnQgdG8gZmlsbCB0aGUgc2NyZWVuXHJcblZpZXdwb3J0LnByb3RvdHlwZS5hdXRvUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy53aWR0aCA9IFV0aWxzLmdldEJyb3dzZXJXaWR0aCgpO1xyXG4gIHRoaXMuaGVpZ2h0ID0gVXRpbHMuZ2V0QnJvd3NlckhlaWdodCgpO1xyXG4gIHRoaXMueCA9IE1hdGguZmxvb3IodGhpcy53aWR0aCAvIDIpO1xyXG4gIHRoaXMueSA9IE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyAyKTtcclxufTtcclxuXHJcbi8vIFRvZ2dsZXMgdmlld3BvcnQgYXV0byByZXNpemluZ1xyXG5WaWV3cG9ydC5wcm90b3R5cGUuc2V0QXV0b1Jlc2l6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblxyXG4gIHRoaXMuYXV0b1Jlc2l6ZUFjdGl2ZSA9IHZhbHVlO1xyXG5cclxuICBpZiAodGhpcy5hdXRvUmVzaXplQWN0aXZlKSB7XHJcbiAgICB2YXIgdCA9IHRoaXM7XHJcbiAgICB3aW5kb3cub25yZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdC5hdXRvUmVzaXplKCk7XHJcbiAgICAgIHQucmVzZXRFbGVtZW50KCk7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHdpbmRvdy5vbnJlc2l6ZSA9IG51bGw7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWV3cG9ydDsiXX0=
