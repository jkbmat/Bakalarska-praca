(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Behavior = require("./behavior.js");
var Action = require("./token.js").Action;
var Type = require("./typing.js").Type;

var aSetColor = function(ef, color) {
  Action.call(this, "setColor", arguments, [Type.ENTITYFILTER, Type.STRING]);

  this.args.push(ef);
  this.args.push(color);
}
aSetColor.prototype = new Action();
aSetColor.prototype.constructor = aSetColor;
Behavior.prototype.registerToken(aSetColor);

aSetColor.prototype.each = function(entity) {
  entity.setColor(this.args[1].evaluate());
}

var aTorque = function(ef, strength) {
  Action.call(this, "applyTorque", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(strength);
}
aTorque.prototype = new Action();
aTorque.prototype.constructor = aTorque;
Behavior.prototype.registerToken(aTorque);

aTorque.prototype.each = function(entity) {
  entity.body.ApplyTorque(entity.getMass() * this.args[1].evaluate());
}

var aAngularImpulse = function(ef, strength) {
  Action.call(this, "applyAngularImpulse", arguments, [Type.ENTITYFILTER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(strength);
}
aAngularImpulse.prototype = new Action();
aAngularImpulse.prototype.constructor = aAngularImpulse;
Behavior.prototype.registerToken(aAngularImpulse);

aAngularImpulse.prototype.each = function(entity) {
  entity.body.ApplyAngularImpulse(entity.getMass() * this.args[1].evaluate());
}

var aLinearVelocity = function(ef, x, y) {
  Action.call(this, "setLinearVelocity", arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
}
aLinearVelocity.prototype = new Action();
aLinearVelocity.prototype.constructor = aLinearVelocity;
Behavior.prototype.registerToken(aLinearVelocity);

aLinearVelocity.prototype.each = function(entity) {
  entity.setLinearVelocity(new b2Vec2(this.args[1].evaluate(), this.args[2].evaluate()));
}

var aLinearImpulse = function(ef, x, y) {
  Action.call(this, "applyLinearImpulse", ef, arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

  this.args.push(ef);
  this.args.push(x);
  this.args.push(y);
}
aLinearImpulse.prototype = new Action();
aLinearImpulse.prototype.constructor = aLinearImpulse;
Behavior.prototype.registerToken(aLinearImpulse);

aLinearImpulse.prototype.each = function(entity) {
  entity.applyLinearImpulse(new b2Vec2(entity.getMass() * this.args[1].evaluate(), entity.getMass() * this.args[2].evaluate()));
}

},{"./behavior.js":2,"./token.js":11,"./typing.js":13}],2:[function(require,module,exports){
var Type = require("./typing.js").Type;

var Behavior = function(logic, results) {
  this.logic = logic;

  if (this.logic.type !== Type.BOOLEAN)
    throw new TypeException(Type.BOOLEAN, this.logic.type, this);

  this.results = Array.isArray(results) ? results : [results];
};

window.tokens = {};

Behavior.prototype.registerToken = function(token) {
  var t = new token();
  window.tokens[t.name] = t;
};


Behavior.prototype.check = function(entity) {
  return this.logic.evaluate(entity);
};

Behavior.prototype.toString = function() {
  return "Behavior(" + this.logic.toString() + ", " + this.results.toString() + ")";
};

Behavior.prototype.result = function() {
  for (var i = 0; i < this.results.length; i++) {
    this.results[i].execute()
  }
};

module.exports = Behavior;

require("./logic.js");
require("./actions.js");
require("./entityfilters.js");
},{"./actions.js":1,"./entityfilters.js":6,"./logic.js":9,"./typing.js":13}],3:[function(require,module,exports){
var BodyType = {
  DYNAMIC_BODY: Module.b2_dynamicBody,
  STATIC_BODY: Module.b2_staticBody,
  KINEMATIC_BODY: Module.b2_kinematicBody
};

module.exports = BodyType;
},{}],4:[function(require,module,exports){
var UI = require("./ui.js");
var Tools = require("./tools.js");


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

  window.Input.initialize(viewport.canvasElement);
};

// Changes running state of the simulation
Engine.prototype.togglePause = function () {
  this.world.paused = !this.world.paused;
  this.selectedEntity = null;

  window.Input.tool = Tools.Blank;

  if(this.world.paused)
    window.Input.tool = Tools.Selection;
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
    window.Input.tool.onmove(ctx);
  }
  

  // Released keys are only to be processed once
  window.Input.mouse.cleanUp();
  window.Input.keyboard.cleanUp();

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
},{"./tools.js":12,"./ui.js":14}],5:[function(require,module,exports){
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
},{"./utils.js":16}],6:[function(require,module,exports){
var Behavior = require("./behavior.js");
var EntityFilter = require("./token.js").EntityFilter;
var Type = require("./typing.js").Type;

var efById = function(id) {
  EntityFilter.call(this, "filterById", arguments, [Type.STRING]);

  this.args.push(id);
}
efById.prototype = new EntityFilter();
efById.prototype.constructor = efById;
Behavior.prototype.registerToken(efById);

efById.prototype.decide = function(entity) {
  return entity.id === this.args[0].evaluate();
}

var efByCollisionGroup = function(group) {
  EntityFilter.call(this, "filterByGroup", arguments, [Type.NUMBER]);

  this.args.push(group);
}
efByCollisionGroup.prototype = new EntityFilter();
efByCollisionGroup.prototype.constructor = efByCollisionGroup;
Behavior.prototype.registerToken(efByCollisionGroup);

efByCollisionGroup.prototype.decide = function(entity) {
  return entity.collisionGroup === this.args[0].evaluate();
}

var efByLogic = function(logic) {
  EntityFilter.call(this, "filterByCondition", arguments, [Type.BOOLEAN]);

  this.args.push(logic);
}
efByLogic.prototype = new EntityFilter();
efByLogic.prototype.constructor = efByLogic;
Behavior.prototype.registerToken(efByLogic);

efByLogic.prototype.decide = function(entity) {
  return new Behavior(this.args[0]).check(entity);
};
},{"./behavior.js":2,"./token.js":11,"./typing.js":13}],7:[function(require,module,exports){
require("./input.js");

var Engine = require("./engine.js");
var Viewport = require("./viewport.js");
var UI = require("./ui.js");
var BodyType = require("./bodytype.js");
var Behavior = require("./behavior.js");
var Token = require("./token.js").Token;

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
      Token.parse("isButtonUp(number(32))"),
      Token.parse("setLinearVelocity(filterById(text(kruh)), getVelocityX(filterById(text(kruh))), number(-999999999999999999))")
    )
  )
  .addBehavior(
    new Behavior(
      Token.parse("isButtonDown(number(37))"),
      Token.parse("setLinearVelocity(filterById(text(kruh)), number(-100), getVelocityY(filterById(text(kruh))))")
    )
  )
  .addBehavior(
    new Behavior(
      Token.parse("isButtonDown(number(39))"),
      Token.parse("setLinearVelocity(filterById(text(kruh)), number(100), getVelocityY(filterById(text(kruh))))")
    )
  );

_engine.addEntity(new Rectangle(new b2Vec2(400, 400), new b2Vec2(400, 3)), BodyType.KINEMATIC_BODY)
  .setId("platform")
  .setCollisionGroup(1);

window.requestAnimationFrame(function() {
  _engine.step();
});





},{"./behavior.js":2,"./bodytype.js":3,"./engine.js":4,"./input.js":8,"./shapes.js":10,"./token.js":11,"./ui.js":14,"./viewport.js":17}],8:[function(require,module,exports){
// INPUT CAPTURING

var Tools = require("./tools.js");

window.window.Input = {
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

        window.Input.tool.onclick();
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

        window.Input.tool.onrelease();
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
      window.window.Input.mouse.updatePosition(e);
    };
    element.onmousedown = function(e) {
      window.window.Input.mouse.updateButtonsDown(e);
    };
    element.onmouseup = function(e) {
      window.window.Input.mouse.updateButtonsUp(e);
    };

    document.onkeydown = function(e) {
      window.window.Input.keyboard.updateButtonsDown(e);
    };
    document.onkeyup = function(e) {
      window.window.Input.keyboard.updateButtonsUp(e);
    };
  }
};


},{"./tools.js":12}],9:[function(require,module,exports){
var Behavior = require("./behavior.js");
var Logic = require("./token.js").Logic;
var Type = require("./typing.js").Type;
var FixType = require("./typing.js").FixType;

var lAnd = function (a, b) {
  Logic.call(this, "AND", Type.BOOLEAN, arguments, [Type.BOOLEAN, Type.BOOLEAN]);

  this.fixType = FixType.INFIX;

  this.args.push(a);
  this.args.push(b);
};
lAnd.prototype = new Logic();
lAnd.prototype.constructor = lAnd;
Behavior.prototype.registerToken(lAnd);

lAnd.prototype.evaluate = function () {
  return (this.args[0].evaluate() && this.args[1].evaluate());
}

var lOr = function (a, b) {
  Logic.call(this, "OR", Type.BOOLEAN, arguments, [Type.BOOLEAN, Type.BOOLEAN]);

  this.fixType = FixType.INFIX;

  this.args.push(a);
  this.args.push(b);
}
lOr.prototype = new Logic();
lOr.prototype.constructor = lOr;
Behavior.prototype.registerToken(lOr);

lOr.prototype.evaluate = function () {
  if (this.args[0].evaluate() || this.args[1].evaluate())
    return true;

  return false;
}

var lNot = function (a) {
  Logic.call(this, "NOT", Type.BOOLEAN, arguments, [Type.BOOLEAN]);

  this.args.push(a);
}
lNot.prototype = new Logic();
lNot.prototype.constructor = lNot;
Behavior.prototype.registerToken(lNot);

lNot.prototype.evaluate = function () {
  return !this.args[0].evaluate();
}

var lString = function (value) {
  Logic.call(this, "text", Type.STRING, arguments, [Type.LITERAL]);

  this.args.push(value);
}
lString.prototype = new Logic();
lString.prototype.constructor = lString;
Behavior.prototype.registerToken(lString);

lString.prototype.evaluate = function () {
  return this.args[0];
}

var lNumber = function (value) {
  Logic.call(this, "number", Type.NUMBER, arguments, [Type.LITERAL]);

  this.args.push(value);
}
lNumber.prototype = new Logic();
lNumber.prototype.constructor = lNumber;
Behavior.prototype.registerToken(lNumber);

lNumber.prototype.evaluate = function () {
  return parseFloat(this.args[0]);
}

var lBool = function (value) {
  Logic.call(this, "boolean", Type.BOOLEAN, arguments, [Type.LITERAL]);

  this.args.push(value);
}
lBool.prototype = new Logic();
lBool.prototype.constructor = lBool;
Behavior.prototype.registerToken(lBool);

lBool.prototype.evaluate = function () {
  return this.args[0] === "true";
}

var lButtonDown = function (button) {
  Logic.call(this, "isButtonDown", Type.BOOLEAN, arguments, [Type.NUMBER]);

  this.args.push(button);
}
lButtonDown.prototype = new Logic();
lButtonDown.prototype.constructor = lButtonDown;
Behavior.prototype.registerToken(lButtonDown);

lButtonDown.prototype.evaluate = function () {
  return window.Input.keyboard.isDown(this.args[0].evaluate());
}

var lButtonUp = function (button) {
  Logic.call(this, "isButtonUp", Type.BOOLEAN, arguments, [Type.NUMBER]);

  this.args.push(button);
}
lButtonUp.prototype = new Logic();
lButtonUp.prototype.constructor = lButtonUp;
Behavior.prototype.registerToken(lButtonUp);

lButtonUp.prototype.evaluate = function () {
  return window.Input.keyboard.isUp(this.args[0].evaluate());
}

var lRandom = function (min, max) {
  Logic.call(this, "randomNumber", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(min);
  this.args.push(max);
}
lRandom.prototype = new Logic();
lRandom.prototype.constructor = lRandom;
Behavior.prototype.registerToken(lRandom);

lRandom.prototype.evaluate = function () {
  return Utils.randomRange(this.args[0].evaluate() && this.args[1].evaluate());
}

var lVelocityX = function (ef) {
  Logic.call(this, "getVelocityX", Type.NUMBER, arguments, [Type.ENTITYFILTER]);

  this.args.push(ef);
}
lVelocityX.prototype = new Logic();
lVelocityX.prototype.constructor = lVelocityX;
Behavior.prototype.registerToken(lVelocityX);

lVelocityX.prototype.evaluate = function () {
  var entity = this.args[0].filter()[0];

  return entity.body.GetLinearVelocity().get_x();
}

var lVelocityY = function (ef) {
  Logic.call(this, "getVelocityY", Type.NUMBER, arguments, [Type.ENTITYFILTER]);

  this.args.push(ef);
}
lVelocityY.prototype = new Logic();
lVelocityY.prototype.constructor = lVelocityY;
Behavior.prototype.registerToken(lVelocityY);

lVelocityY.prototype.evaluate = function () {
  var entity = this.args[0].filter()[0];

  return entity.body.GetLinearVelocity().get_y();
}

var lPlus = function (a, b) {
  Logic.call(this, "+", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
}
lPlus.prototype = new Logic();
lPlus.prototype.constructor = lPlus;
Behavior.prototype.registerToken(lPlus);

lPlus.prototype.evaluate = function () {
  return this.args[0].evaluate() + this.args[1].evaluate();
}

var lMultiply = function (a, b) {
  Logic.call(this, "*", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
}
lMultiply.prototype = new Logic();
lMultiply.prototype.constructor = lMultiply;
Behavior.prototype.registerToken(lMultiply);

lMultiply.prototype.evaluate = function () {
  return this.args[0].evaluate() * this.args[1].evaluate();
}

var lDivide = function (a, b) {
  Logic.call(this, "/", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
}
lDivide.prototype = new Logic();
lDivide.prototype.constructor = lDivide;
Behavior.prototype.registerToken(lDivide);

lDivide.prototype.evaluate = function () {
  return this.args[0].evaluate() / this.args[1].evaluate();
}

var lMinus = function (a, b) {
  Logic.call(this, "-", Type.NUMBER, arguments, [Type.NUMBER, Type.NUMBER]);

  this.args.push(a);
  this.args.push(b);

  this.fixType = FixType.INFIX;
}
lMinus.prototype = new Logic();
lMinus.prototype.constructor = lMinus;
Behavior.prototype.registerToken(lMinus);

lMinus.prototype.evaluate = function () {
  return this.args[0].evaluate() + this.args[1].evaluate();
}
},{"./behavior.js":2,"./token.js":11,"./typing.js":13}],10:[function(require,module,exports){
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
},{"./entity.js":5}],11:[function(require,module,exports){
var Behavior = require("./behavior.js");
var FixType = require("./typing.js").FixType;
var Type = require("./typing.js").Type;

var TypeException = function(expected, received, token) {
  this.expected = expected;
  this.received = received;
  this.token = token;
};

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

Token.stopChars = ["(", ")", ","];

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

Token.parse = function(input) {
  Token.parserInput = input;
  Token.parserInputWhole = input;
  Token.parserStack = [];

  do {
    Token.parseStep()
  } while (Token.parserInput.length);

  var ret = Token.parserStack.pop();

  if (Token.parserStack.length)
    throw "Unexpected " + ret.name;

  return ret;
};

Token.readWhitespace = function() {
  while (/\s/.test(Token.parserInput[0]) && Token.parserInput.length) {
    Token.parserInput = Token.parserInput.slice(1);
  }
};

Token.parseName = function() {
  Token.readWhitespace();

  var ret = "";

  while (!/\s/.test(Token.parserInput[0]) && Token.parserInput.length && Token.stopChars.indexOf(Token.parserInput[0]) === -1) // read until a whitespace occurs
  {
    ret += Token.parserInput[0]
    Token.parserInput = Token.parserInput.slice(1);
  }

  Token.readWhitespace();

  return ret;
};

Token.readChar = function(char) {
  Token.readWhitespace();

  if (Token.parserInput[0] !== char) {
    var position = Token.parserInputWhole.length - Token.parserInput.length;
    throw "Expected '" + char + "' at position " + position + " at '" + Token.parserInputWhole.substr(position) + "'";
  }

  Token.parserInput = Token.parserInput.slice(1);

  Token.readWhitespace();
};

Token.parseStep = function(expectedType) {
  var name = Token.parseName();
  var token = window.tokens[name];

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
    var a = Token.parserStack.pop();

    if (a.type !== token.argument_types[0])
      throw "Unexpected " + a.type + " (was expecting " + token.argument_types[0] + ")";

    args = [a, Token.parseStep(token.argument_types[1])];
    Token.parserStack.pop();
  }

  if (token.fixType === FixType.PREFIX) {
    Token.readChar("(");

    for (i = 0; i < numArgs; i++) {
      args.push(Token.parseStep(token.argument_types[i]));

      Token.readWhitespace();

      if (Token.parserInput[0] === ",")
        Token.parserInput = Token.parserInput.slice(1);
    }

    Token.readChar(")");
  }

  var newToken = new token.constructor();
  for (var i = 0; i < args.length; i++) {
    newToken.args[i] = args[i];

    Token.parserStack.pop();
  }
  Token.parserStack.push(newToken);

  return newToken;
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
},{"./behavior.js":2,"./typing.js":13}],12:[function(require,module,exports){
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
            new b2Vec2(_engine.viewport.x - _engine.viewport.width / 2 + window.Input.mouse.x, _engine.viewport.y - _engine.viewport.height / 2 + window.Input.mouse.y))
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
    this.origin = [window.Input.mouse.x, window.Input.mouse.y];
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
    this.w = window.Input.mouse.x - this.origin[0];
    this.h = window.Input.mouse.y - this.origin[1];

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
    this.origin = [window.Input.mouse.x, window.Input.mouse.y];
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
    this.radius = Math.min(window.Input.mouse.x - this.origin[0], window.Input.mouse.y - this.origin[1]) / 2;

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
},{"./bodytype.js":3,"./shapes.js":10}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
            window.Input.tool = Tools.Selection;
          }
          },
          {
            text: Translations.getTranslatedWrapped(18), onclick: function () {
            window.Input.tool = Tools.Rectangle;
          }
          },
          {
            text: Translations.getTranslatedWrapped(19), onclick: function () {
            window.Input.tool = Tools.Circle;
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
},{"./bodytype.js":3,"./tools.js":12,"./uibuilder.js":15}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
// Object containing useful methods
var Utils = {
  getBrowserWidth: function() {
    return $(".ui.content").outerWidth();//window.innerWidth;
  },

  getBrowserHeight: function() {
    return $(".ui.content").outerHeight() - $(".ui.toolbar").outerHeight();//window.innerHeight;
  },

  randomRange: function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },
}

module.exports = Utils;
},{}],17:[function(require,module,exports){
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
},{"./utils.js":16}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1VzZXJzL0pha3ViIE1hdHXFoWthL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2FjdGlvbnMuanMiLCJqcy9iZWhhdmlvci5qcyIsImpzL2JvZHl0eXBlLmpzIiwianMvZW5naW5lLmpzIiwianMvZW50aXR5LmpzIiwianMvZW50aXR5ZmlsdGVycy5qcyIsImpzL2VudHJ5LmpzIiwianMvaW5wdXQuanMiLCJqcy9sb2dpYy5qcyIsImpzL3NoYXBlcy5qcyIsImpzL3Rva2VuLmpzIiwianMvdG9vbHMuanMiLCJqcy90eXBpbmcuanMiLCJqcy91aS5qcyIsImpzL3VpYnVpbGRlci5qcyIsImpzL3V0aWxzLmpzIiwianMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDallBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQmVoYXZpb3IgPSByZXF1aXJlKFwiLi9iZWhhdmlvci5qc1wiKTtcclxudmFyIEFjdGlvbiA9IHJlcXVpcmUoXCIuL3Rva2VuLmpzXCIpLkFjdGlvbjtcclxudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbnZhciBhU2V0Q29sb3IgPSBmdW5jdGlvbihlZiwgY29sb3IpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcInNldENvbG9yXCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLlNUUklOR10pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goY29sb3IpO1xyXG59XHJcbmFTZXRDb2xvci5wcm90b3R5cGUgPSBuZXcgQWN0aW9uKCk7XHJcbmFTZXRDb2xvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhU2V0Q29sb3I7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGFTZXRDb2xvcik7XHJcblxyXG5hU2V0Q29sb3IucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuc2V0Q29sb3IodGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xyXG59XHJcblxyXG52YXIgYVRvcnF1ZSA9IGZ1bmN0aW9uKGVmLCBzdHJlbmd0aCkge1xyXG4gIEFjdGlvbi5jYWxsKHRoaXMsIFwiYXBwbHlUb3JxdWVcIiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaChzdHJlbmd0aCk7XHJcbn1cclxuYVRvcnF1ZS5wcm90b3R5cGUgPSBuZXcgQWN0aW9uKCk7XHJcbmFUb3JxdWUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYVRvcnF1ZTtcclxuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4oYVRvcnF1ZSk7XHJcblxyXG5hVG9ycXVlLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LmJvZHkuQXBwbHlUb3JxdWUoZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcclxufVxyXG5cclxudmFyIGFBbmd1bGFySW1wdWxzZSA9IGZ1bmN0aW9uKGVmLCBzdHJlbmd0aCkge1xyXG4gIEFjdGlvbi5jYWxsKHRoaXMsIFwiYXBwbHlBbmd1bGFySW1wdWxzZVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHN0cmVuZ3RoKTtcclxufVxyXG5hQW5ndWxhckltcHVsc2UucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5hQW5ndWxhckltcHVsc2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYUFuZ3VsYXJJbXB1bHNlO1xyXG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihhQW5ndWxhckltcHVsc2UpO1xyXG5cclxuYUFuZ3VsYXJJbXB1bHNlLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LmJvZHkuQXBwbHlBbmd1bGFySW1wdWxzZShlbnRpdHkuZ2V0TWFzcygpICogdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xyXG59XHJcblxyXG52YXIgYUxpbmVhclZlbG9jaXR5ID0gZnVuY3Rpb24oZWYsIHgsIHkpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcInNldExpbmVhclZlbG9jaXR5XCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHgpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHkpO1xyXG59XHJcbmFMaW5lYXJWZWxvY2l0eS5wcm90b3R5cGUgPSBuZXcgQWN0aW9uKCk7XHJcbmFMaW5lYXJWZWxvY2l0eS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhTGluZWFyVmVsb2NpdHk7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGFMaW5lYXJWZWxvY2l0eSk7XHJcblxyXG5hTGluZWFyVmVsb2NpdHkucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuc2V0TGluZWFyVmVsb2NpdHkobmV3IGIyVmVjMih0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSwgdGhpcy5hcmdzWzJdLmV2YWx1YXRlKCkpKTtcclxufVxyXG5cclxudmFyIGFMaW5lYXJJbXB1bHNlID0gZnVuY3Rpb24oZWYsIHgsIHkpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5TGluZWFySW1wdWxzZVwiLCBlZiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goeCk7XHJcbiAgdGhpcy5hcmdzLnB1c2goeSk7XHJcbn1cclxuYUxpbmVhckltcHVsc2UucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5hTGluZWFySW1wdWxzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhTGluZWFySW1wdWxzZTtcclxuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4oYUxpbmVhckltcHVsc2UpO1xyXG5cclxuYUxpbmVhckltcHVsc2UucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuYXBwbHlMaW5lYXJJbXB1bHNlKG5ldyBiMlZlYzIoZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpLCBlbnRpdHkuZ2V0TWFzcygpICogdGhpcy5hcmdzWzJdLmV2YWx1YXRlKCkpKTtcclxufVxyXG4iLCJ2YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xuXG52YXIgQmVoYXZpb3IgPSBmdW5jdGlvbihsb2dpYywgcmVzdWx0cykge1xuICB0aGlzLmxvZ2ljID0gbG9naWM7XG5cbiAgaWYgKHRoaXMubG9naWMudHlwZSAhPT0gVHlwZS5CT09MRUFOKVxuICAgIHRocm93IG5ldyBUeXBlRXhjZXB0aW9uKFR5cGUuQk9PTEVBTiwgdGhpcy5sb2dpYy50eXBlLCB0aGlzKTtcblxuICB0aGlzLnJlc3VsdHMgPSBBcnJheS5pc0FycmF5KHJlc3VsdHMpID8gcmVzdWx0cyA6IFtyZXN1bHRzXTtcbn07XG5cbndpbmRvdy50b2tlbnMgPSB7fTtcblxuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4gPSBmdW5jdGlvbih0b2tlbikge1xuICB2YXIgdCA9IG5ldyB0b2tlbigpO1xuICB3aW5kb3cudG9rZW5zW3QubmFtZV0gPSB0O1xufTtcblxuXG5CZWhhdmlvci5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbihlbnRpdHkpIHtcbiAgcmV0dXJuIHRoaXMubG9naWMuZXZhbHVhdGUoZW50aXR5KTtcbn07XG5cbkJlaGF2aW9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXCJCZWhhdmlvcihcIiArIHRoaXMubG9naWMudG9TdHJpbmcoKSArIFwiLCBcIiArIHRoaXMucmVzdWx0cy50b1N0cmluZygpICsgXCIpXCI7XG59O1xuXG5CZWhhdmlvci5wcm90b3R5cGUucmVzdWx0ID0gZnVuY3Rpb24oKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGhpcy5yZXN1bHRzW2ldLmV4ZWN1dGUoKVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJlaGF2aW9yO1xuXG5yZXF1aXJlKFwiLi9sb2dpYy5qc1wiKTtcbnJlcXVpcmUoXCIuL2FjdGlvbnMuanNcIik7XG5yZXF1aXJlKFwiLi9lbnRpdHlmaWx0ZXJzLmpzXCIpOyIsInZhciBCb2R5VHlwZSA9IHtcclxuICBEWU5BTUlDX0JPRFk6IE1vZHVsZS5iMl9keW5hbWljQm9keSxcclxuICBTVEFUSUNfQk9EWTogTW9kdWxlLmIyX3N0YXRpY0JvZHksXHJcbiAgS0lORU1BVElDX0JPRFk6IE1vZHVsZS5iMl9raW5lbWF0aWNCb2R5XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJvZHlUeXBlOyIsInZhciBVSSA9IHJlcXVpcmUoXCIuL3VpLmpzXCIpO1xyXG52YXIgVG9vbHMgPSByZXF1aXJlKFwiLi90b29scy5qc1wiKTtcclxuXHJcblxyXG5jb25zdCBBVVRPX0lEX1BSRUZJWCA9IFwiRU5USVRZX05VTUJFUl9cIjtcclxuXHJcbmNvbnN0IERJU1BMQVlfUkFUSU8gPSAyMDtcclxuXHJcbi8qLyBNeXNsaWVua3lcclxuXHJcbmxvY2tvdmFuaWUga2FtZXJ5IG5hIG9iamVrdFxyXG4gKiBwcmVjaG9keVxyXG5ha28gZnVuZ3VqZSBjZWxhIGthbWVyYT9cclxuXHJcbi8qL1xyXG5cclxuXHJcbi8vIEVOR0lORVxyXG5cclxuLy8gY29uc3RydWN0b3JcclxuXHJcbnZhciBFbmdpbmUgPSBmdW5jdGlvbih2aWV3cG9ydCwgZ3Jhdml0eSkge1xyXG4gIHRoaXMudmlld3BvcnQgPSB2aWV3cG9ydDtcclxuICB0aGlzLnNlbGVjdGVkRW50aXR5ID0gbnVsbDtcclxuICBcclxuICB0aGlzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSID0gMTY7XHJcbiAgdGhpcy5MQVlFUlNfTlVNQkVSID0gMTA7XHJcblxyXG4gIHRoaXMubGF5ZXJzID0gbmV3IEFycmF5KHRoaXMuTEFZRVJTX05VTUJFUik7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLkxBWUVSU19OVU1CRVI7IGkrKylcclxuICB7XHJcbiAgICB0aGlzLmxheWVyc1tpXSA9IFtdO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5jb2xsaXNpb25Hcm91cHMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuQ09MTElTSU9OX0dST1VQU19OVU1CRVI7IGkrKykge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHMucHVzaCh7XHJcbiAgICAgIFwibmFtZVwiOiBpICsgMSxcclxuICAgICAgXCJtYXNrXCI6IHBhcnNlSW50KEFycmF5KHRoaXMuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgKyAxKS5qb2luKFwiMVwiKSwgMilcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5saWZldGltZUVudGl0aWVzID0gMDtcclxuXHJcbiAgdGhpcy53b3JsZCA9IG5ldyBiMldvcmxkKGdyYXZpdHksIHRydWUpO1xyXG4gIHRoaXMud29ybGQucGF1c2VkID0gdHJ1ZTtcclxuXHJcbiAgd2luZG93LklucHV0LmluaXRpYWxpemUodmlld3BvcnQuY2FudmFzRWxlbWVudCk7XHJcbn07XHJcblxyXG4vLyBDaGFuZ2VzIHJ1bm5pbmcgc3RhdGUgb2YgdGhlIHNpbXVsYXRpb25cclxuRW5naW5lLnByb3RvdHlwZS50b2dnbGVQYXVzZSA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLndvcmxkLnBhdXNlZCA9ICF0aGlzLndvcmxkLnBhdXNlZDtcclxuICB0aGlzLnNlbGVjdGVkRW50aXR5ID0gbnVsbDtcclxuXHJcbiAgd2luZG93LklucHV0LnRvb2wgPSBUb29scy5CbGFuaztcclxuXHJcbiAgaWYodGhpcy53b3JsZC5wYXVzZWQpXHJcbiAgICB3aW5kb3cuSW5wdXQudG9vbCA9IFRvb2xzLlNlbGVjdGlvbjtcclxufTtcclxuXHJcbkVuZ2luZS5wcm90b3R5cGUucmVtb3ZlRW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gIHRoaXMud29ybGQuRGVzdHJveUJvZHkoZW50aXR5LmJvZHkpO1xyXG4gIHRoaXMubGF5ZXJzW2VudGl0eS5sYXllcl0uc3BsaWNlKHRoaXMubGF5ZXJzW2VudGl0eS5sYXllcl0uaW5kZXhPZihlbnRpdHkpLCAxKTtcclxufTtcclxuXHJcbkVuZ2luZS5wcm90b3R5cGUuc2V0RW50aXR5TGF5ZXIgPSBmdW5jdGlvbiAoZW50aXR5LCBuZXdMYXllcikge1xyXG4gIC8vIFJlbW92ZSBmcm9tIG9sZCBsYXllclxyXG4gIHRoaXMubGF5ZXJzW2VudGl0eS5sYXllcl0uc3BsaWNlKHRoaXMubGF5ZXJzW2VudGl0eS5sYXllcl0uaW5kZXhPZihlbnRpdHkpLCAxKTtcclxuXHJcbiAgLy8gU2V0IG5ldyBsYXllclxyXG4gIGVudGl0eS5sYXllciA9IG5ld0xheWVyO1xyXG4gIHRoaXMubGF5ZXJzW25ld0xheWVyXS5wdXNoKGVudGl0eSk7XHJcbn07XHJcblxyXG4vLyBSZXR1cm5zIGFsbCBlbnRpdGllcyBpbiBvbmUgYXJyYXlcclxuRW5naW5lLnByb3RvdHlwZS5lbnRpdGllcyA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFtdLCB0aGlzLmxheWVycyk7XHJcbn07XHJcblxyXG5cclxuLy8gUmV0dXJucyB0aGUgZW50aXR5IHdpdGggaWQgc3BlY2lmaWVkIGJ5IGFyZ3VtZW50XHJcbkVuZ2luZS5wcm90b3R5cGUuZ2V0RW50aXR5QnlJZCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgdmFyIGVudGl0aWVzID0gdGhpcy5lbnRpdGllcygpO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoZW50aXRpZXNbaV0uaWQgPT09IGlkKVxyXG4gICAgICByZXR1cm4gZW50aXRpZXNbaV07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbi8vIFJldHVybnMgYW4gYXJyYXkgb2YgZW50aXRpZXMgd2l0aCBzcGVjaWZpZWQgY29sbGlzaW9uR3JvdXBcclxuRW5naW5lLnByb3RvdHlwZS5nZXRFbnRpdGllc0J5Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gIHZhciByZXQgPSBbXTtcclxuICB2YXIgZW50aXRpZXMgPSB0aGlzLmVudGl0aWVzKCk7XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChlbnRpdGllc1tpXS5jb2xsaXNpb25Hcm91cCA9PT0gZ3JvdXApXHJcbiAgICAgIHJldC5wdXNoKGVudGl0aWVzW2ldKTtcclxuICB9XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG4vLyBBZGRpbmcgYW4gZW50aXR5IHRvIHRoZSB3b3JsZFxyXG5FbmdpbmUucHJvdG90eXBlLmFkZEVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eSwgdHlwZSkge1xyXG4gIC8vIGdlbmVyYXRlIGF1dG8gaWRcclxuICBpZiAoZW50aXR5LmlkID09PSB1bmRlZmluZWQpIHtcclxuICAgIGVudGl0eS5pZCA9IEFVVE9fSURfUFJFRklYICsgdGhpcy5saWZldGltZUVudGl0aWVzO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5saWZldGltZUVudGl0aWVzKys7XHJcblxyXG4gIGVudGl0eS5ib2R5LnNldF90eXBlKHR5cGUpO1xyXG5cclxuICBlbnRpdHkuYm9keSA9IHRoaXMud29ybGQuQ3JlYXRlQm9keShlbnRpdHkuYm9keSk7XHJcbiAgZW50aXR5LmZpeHR1cmUgPSBlbnRpdHkuYm9keS5DcmVhdGVGaXh0dXJlKGVudGl0eS5maXh0dXJlKTtcclxuXHJcbiAgdGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5wdXNoKGVudGl0eSk7XHJcblxyXG4gIHJldHVybiBlbnRpdHk7XHJcbn07XHJcblxyXG4vLyBDaGVja3Mgd2hldGhlciB0d28gZ3JvdXBzIHNob3VsZCBjb2xsaWRlXHJcbkVuZ2luZS5wcm90b3R5cGUuZ2V0Q29sbGlzaW9uID0gZnVuY3Rpb24oZ3JvdXBBLCBncm91cEIpIHtcclxuICByZXR1cm4gKHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayA+PiBncm91cEIpICYgMTtcclxufTtcclxuXHJcbi8vIFNldHMgdHdvIGdyb3VwcyB1cCB0byBjb2xsaWRlXHJcbkVuZ2luZS5wcm90b3R5cGUuc2V0Q29sbGlzaW9uID0gZnVuY3Rpb24oZ3JvdXBBLCBncm91cEIsIHZhbHVlKSB7XHJcbiAgdmFyIG1hc2tBID0gKDEgPDwgZ3JvdXBCKTtcclxuICB2YXIgbWFza0IgPSAoMSA8PCBncm91cEEpO1xyXG5cclxuICBpZiAodmFsdWUpIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayB8IG1hc2tBO1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrIHwgbWFza0I7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayAmIH5tYXNrQTtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQl0ubWFzayA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQl0ubWFzayAmIH5tYXNrQjtcclxuICB9XHJcbiAgdGhpcy51cGRhdGVDb2xsaXNpb25zKClcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbi8vIENoYW5nZXMgdGhlIElEIG9mIGFuIGVudGl0eVxyXG5FbmdpbmUucHJvdG90eXBlLmNoYW5nZUlkID0gZnVuY3Rpb24gKGVudGl0eSwgaWQpIHtcclxuICBlbnRpdHkuaWQgPSBpZDtcclxufTtcclxuXHJcbi8vIFNlbGVjdHMgYW4gZW50aXR5IGFuZCBzaG93cyBpdHMgcHJvcGVydGllcyBpbiB0aGUgc2lkZWJhclxyXG5FbmdpbmUucHJvdG90eXBlLnNlbGVjdEVudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICB0aGlzLnNlbGVjdGVkRW50aXR5ID0gZW50aXR5ID09PSBudWxsID8gbnVsbCA6IGVudGl0eTtcclxuICBVSS5idWlsZFNpZGViYXIodGhpcy5zZWxlY3RlZEVudGl0eSk7XHJcbn1cclxuXHJcbi8vIFVwZGF0ZXMgY29sbGlzaW9uIG1hc2tzIGZvciBhbGwgZW50aXRpZXMsIGJhc2VkIG9uIGVuZ2luZSdzIGNvbGxpc2lvbkdyb3VwcyB0YWJsZVxyXG5FbmdpbmUucHJvdG90eXBlLnVwZGF0ZUNvbGxpc2lvbnMgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgZW50aXRpZXMgPSB0aGlzLmVudGl0aWVzKCk7XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHRoaXMudXBkYXRlQ29sbGlzaW9uKGVudGl0aWVzW2ldKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy8gVXBkYXRlcyBjb2xsaXNpb24gbWFzayBmb3IgYW4gZW50aXR5LCBiYXNlZCBvbiBlbmdpbmUncyBjb2xsaXNpb25Hcm91cHMgdGFibGVcclxuRW5naW5lLnByb3RvdHlwZS51cGRhdGVDb2xsaXNpb24gPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICB2YXIgZmlsdGVyRGF0YSA9IGVudGl0eS5maXh0dXJlLkdldEZpbHRlckRhdGEoKTtcclxuICBmaWx0ZXJEYXRhLnNldF9tYXNrQml0cyh0aGlzLmNvbGxpc2lvbkdyb3Vwc1tlbnRpdHkuY29sbGlzaW9uR3JvdXBdLm1hc2spO1xyXG4gIGVudGl0eS5maXh0dXJlLlNldEZpbHRlckRhdGEoZmlsdGVyRGF0YSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG4vLyBPbmUgc2ltdWxhdGlvbiBzdGVwLiBTaW11bGF0aW9uIGxvZ2ljIGhhcHBlbnMgaGVyZS5cclxuRW5naW5lLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gRlBTIHRpbWVyXHJcbiAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgY3R4ID0gdGhpcy52aWV3cG9ydC5jb250ZXh0O1xyXG5cclxuICAvLyBjbGVhciBzY3JlZW5cclxuICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMudmlld3BvcnQud2lkdGgsIHRoaXMudmlld3BvcnQuaGVpZ2h0KTtcclxuXHJcbiAgY3R4LnNhdmUoKTtcclxuXHJcbiAgLy8gZHJhdyBhbGwgZW50aXRpZXNcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuTEFZRVJTX05VTUJFUjsgaSsrKVxyXG4gIHtcclxuICAgIHRoaXMuZHJhd0FycmF5KHRoaXMubGF5ZXJzW2ldLCBjdHgpO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFfZW5naW5lLndvcmxkLnBhdXNlZCkge1xyXG4gICAgLy8gYm94MmQgc2ltdWxhdGlvbiBzdGVwXHJcbiAgICB0aGlzLndvcmxkLlN0ZXAoMSAvIDYwLCAxMCwgNSk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgd2luZG93LklucHV0LnRvb2wub25tb3ZlKGN0eCk7XHJcbiAgfVxyXG4gIFxyXG5cclxuICAvLyBSZWxlYXNlZCBrZXlzIGFyZSBvbmx5IHRvIGJlIHByb2Nlc3NlZCBvbmNlXHJcbiAgd2luZG93LklucHV0Lm1vdXNlLmNsZWFuVXAoKTtcclxuICB3aW5kb3cuSW5wdXQua2V5Ym9hcmQuY2xlYW5VcCgpO1xyXG5cclxuICB2YXIgZW5kID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgLy8gQ2FsbCBuZXh0IHN0ZXBcclxuICBzZXRUaW1lb3V0KHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgICBfZW5naW5lLnN0ZXAoKVxyXG4gIH0pLCBNYXRoLm1pbig2MCAtIGVuZCAtIHN0YXJ0LCAwKSk7XHJcbn07XHJcblxyXG5FbmdpbmUucHJvdG90eXBlLmRyYXdBcnJheSA9IGZ1bmN0aW9uKGFycmF5LCBjdHgpIHtcclxuICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHgudHJhbnNsYXRlKHRoaXMudmlld3BvcnQueCAtIHRoaXMudmlld3BvcnQud2lkdGggLyAyLCB0aGlzLnZpZXdwb3J0LnkgLSB0aGlzLnZpZXdwb3J0LmhlaWdodCAvIDIpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGFycmF5W2ldLmNvbG9yO1xyXG5cclxuICAgIGlmKHRoaXMuc2VsZWN0ZWRFbnRpdHkgPT09IGFycmF5W2ldKSB7XHJcbiAgICAgIGN0eC5zaGFkb3dDb2xvciA9IFwiYmxhY2tcIjtcclxuICAgICAgY3R4LnNoYWRvd0JsdXIgPSAxMDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgeCA9IGFycmF5W2ldLmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpO1xyXG4gICAgdmFyIHkgPSBhcnJheVtpXS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3koKTtcclxuICAgIGN0eC50cmFuc2xhdGUoeCwgeSk7XHJcbiAgICBjdHgucm90YXRlKGFycmF5W2ldLmJvZHkuR2V0QW5nbGUoKSk7XHJcblxyXG4gICAgYXJyYXlbaV0uZHJhdyhjdHgpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBhcnJheVtpXS5iZWhhdmlvcnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgdmFyIGJlaGF2aW9yID0gYXJyYXlbaV0uYmVoYXZpb3JzW2pdO1xyXG5cclxuICAgICAgaWYgKGJlaGF2aW9yLmNoZWNrKGFycmF5W2ldKSlcclxuICAgICAgICBiZWhhdmlvci5yZXN1bHQoKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmU7IiwiLy8gRU5USVRZXHJcbnZhciBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzLmpzXCIpO1xyXG5cclxuY29uc3QgQVVUT19DT0xPUl9SQU5HRSA9IFswLCAyMzBdO1xyXG5cclxudmFyIEVudGl0eSA9IGZ1bmN0aW9uKHNoYXBlLCBmaXh0dXJlLCBib2R5LCBpZCwgY29sbGlzaW9uR3JvdXApIHtcclxuICB0aGlzLmlkID0gaWQ7XHJcbiAgdGhpcy5kZWFkID0gZmFsc2U7XHJcbiAgdGhpcy5sYXllciA9IDA7XHJcblxyXG4gIHRoaXMuZml4ZWRSb3RhdGlvbiA9IGZhbHNlO1xyXG5cclxuICB0aGlzLmNvbGxpc2lvbkdyb3VwID0gY29sbGlzaW9uR3JvdXA7XHJcbiAgaWYgKHRoaXMuY29sbGlzaW9uR3JvdXAgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3VwID0gMDtcclxuICB9XHJcblxyXG4gIHRoaXMuYmVoYXZpb3JzID0gW107XHJcblxyXG4gIHRoaXMuZml4dHVyZSA9IGZpeHR1cmU7XHJcbiAgaWYgKHRoaXMuZml4dHVyZSA9PSB1bmRlZmluZWQpIHtcclxuICAgIHZhciBmaXh0dXJlID0gbmV3IGIyRml4dHVyZURlZigpO1xyXG4gICAgZml4dHVyZS5zZXRfZGVuc2l0eSgxMClcclxuICAgIGZpeHR1cmUuc2V0X2ZyaWN0aW9uKDAuNSk7XHJcbiAgICBmaXh0dXJlLnNldF9yZXN0aXR1dGlvbigwLjIpO1xyXG5cclxuICAgIHRoaXMuZml4dHVyZSA9IGZpeHR1cmU7XHJcbiAgfVxyXG4gIHRoaXMuZml4dHVyZS5zZXRfc2hhcGUoc2hhcGUpO1xyXG5cclxuICB2YXIgZmlsdGVyRGF0YSA9IHRoaXMuZml4dHVyZS5nZXRfZmlsdGVyKCk7XHJcbiAgZmlsdGVyRGF0YS5zZXRfY2F0ZWdvcnlCaXRzKDEgPDwgY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAvLyBDb25zdHJ1Y3RvciBpcyBjYWxsZWQgd2hlbiBpbmhlcml0aW5nLCBzbyB3ZSBuZWVkIHRvIGNoZWNrIGZvciBfZW5naW5lIGF2YWlsYWJpbGl0eVxyXG4gIGlmICh0eXBlb2YgX2VuZ2luZSAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBmaWx0ZXJEYXRhLnNldF9tYXNrQml0cyhfZW5naW5lLmNvbGxpc2lvbkdyb3Vwc1t0aGlzLmNvbGxpc2lvbkdyb3VwXS5tYXNrKTtcclxuXHJcbiAgdGhpcy5maXh0dXJlLnNldF9maWx0ZXIoZmlsdGVyRGF0YSk7XHJcblxyXG4gIHRoaXMuYm9keSA9IGJvZHk7XHJcbiAgaWYgKHRoaXMuYm9keSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgdGhpcy5ib2R5LnNldF9maXhlZFJvdGF0aW9uKGZhbHNlKTtcclxuXHJcbiAgLy8gQXV0byBnZW5lcmF0ZSBjb2xvclxyXG4gIHZhciByID0gVXRpbHMucmFuZG9tUmFuZ2UoQVVUT19DT0xPUl9SQU5HRVswXSwgQVVUT19DT0xPUl9SQU5HRVsxXSkudG9TdHJpbmcoMTYpOyByID0gci5sZW5ndGggPT0gMSA/IFwiMFwiICsgciA6IHI7XHJcbiAgdmFyIGcgPSBVdGlscy5yYW5kb21SYW5nZShBVVRPX0NPTE9SX1JBTkdFWzBdLCBBVVRPX0NPTE9SX1JBTkdFWzFdKS50b1N0cmluZygxNik7IGcgPSBnLmxlbmd0aCA9PSAxID8gXCIwXCIgKyBnIDogZztcclxuICB2YXIgYiA9IFV0aWxzLnJhbmRvbVJhbmdlKEFVVE9fQ09MT1JfUkFOR0VbMF0sIEFVVE9fQ09MT1JfUkFOR0VbMV0pLnRvU3RyaW5nKDE2KTsgYiA9IGIubGVuZ3RoID09IDEgPyBcIjBcIiArIGIgOiBiO1xyXG4gIHRoaXMuY29sb3IgPSBcIiNcIiArIHIgICsgZyArIGIgO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmRpZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuZGVhZCA9IHRydWU7XHJcblxyXG4gIFxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCkge1xyXG4gIGFsZXJ0KFwiRVJST1IhIENhbm5vdCBkcmF3IEVudGl0eTogVXNlIGRlcml2ZWQgY2xhc3Nlcy5cIik7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0Q29sb3IgPSBmdW5jdGlvbihjb2xvcikge1xyXG4gIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0SWQgPSBmdW5jdGlvbihpZCkge1xyXG4gIHRoaXMuaWQgPSBpZDtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnNldENvbGxpc2lvbkdyb3VwID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuICB0aGlzLmNvbGxpc2lvbkdyb3VwID0gZ3JvdXA7XHJcblxyXG4gIHZhciBmaWx0ZXJEYXRhID0gdGhpcy5maXh0dXJlLkdldEZpbHRlckRhdGEoKTtcclxuICBmaWx0ZXJEYXRhLnNldF9jYXRlZ29yeUJpdHMoMSA8PCBncm91cCk7XHJcbiAgdGhpcy5maXh0dXJlLlNldEZpbHRlckRhdGEoZmlsdGVyRGF0YSk7XHJcblxyXG4gIF9lbmdpbmUudXBkYXRlQ29sbGlzaW9uKHRoaXMpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRMaW5lYXJWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLmJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKTtcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRNYXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIE1hdGgubWF4KDEsIHRoaXMuYm9keS5HZXRNYXNzKCkpO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnNldExpbmVhclZlbG9jaXR5ID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgdGhpcy5ib2R5LlNldExpbmVhclZlbG9jaXR5KHZlY3Rvcik7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFwcGx5VG9ycXVlID0gZnVuY3Rpb24oZm9yY2UpIHtcclxuICB0aGlzLmJvZHkuQXBwbHlUb3JxdWUoZm9yY2UpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5hcHBseUxpbmVhckltcHVsc2UgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICB0aGlzLmJvZHkuQXBwbHlMaW5lYXJJbXB1bHNlKHZlY3RvciwgdGhpcy5ib2R5LkdldFdvcmxkQ2VudGVyKCkpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5kaXNhYmxlUm90YXRpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gIHRoaXMuZml4ZWRSb3RhdGlvbiA9IHZhbHVlO1xyXG4gIHRoaXMuYm9keS5TZXRGaXhlZFJvdGF0aW9uKHZhbHVlKVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5hZGRCZWhhdmlvciA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XHJcbiAgdGhpcy5iZWhhdmlvcnMucHVzaChiZWhhdmlvcik7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbnRpdHk7IiwidmFyIEJlaGF2aW9yID0gcmVxdWlyZShcIi4vYmVoYXZpb3IuanNcIik7XHJcbnZhciBFbnRpdHlGaWx0ZXIgPSByZXF1aXJlKFwiLi90b2tlbi5qc1wiKS5FbnRpdHlGaWx0ZXI7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XHJcblxyXG52YXIgZWZCeUlkID0gZnVuY3Rpb24oaWQpIHtcclxuICBFbnRpdHlGaWx0ZXIuY2FsbCh0aGlzLCBcImZpbHRlckJ5SWRcIiwgYXJndW1lbnRzLCBbVHlwZS5TVFJJTkddKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goaWQpO1xyXG59XHJcbmVmQnlJZC5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcbmVmQnlJZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBlZkJ5SWQ7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGVmQnlJZCk7XHJcblxyXG5lZkJ5SWQucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkuaWQgPT09IHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xyXG59XHJcblxyXG52YXIgZWZCeUNvbGxpc2lvbkdyb3VwID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuICBFbnRpdHlGaWx0ZXIuY2FsbCh0aGlzLCBcImZpbHRlckJ5R3JvdXBcIiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZ3JvdXApO1xyXG59XHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBlZkJ5Q29sbGlzaW9uR3JvdXA7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGVmQnlDb2xsaXNpb25Hcm91cCk7XHJcblxyXG5lZkJ5Q29sbGlzaW9uR3JvdXAucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkuY29sbGlzaW9uR3JvdXAgPT09IHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xyXG59XHJcblxyXG52YXIgZWZCeUxvZ2ljID0gZnVuY3Rpb24obG9naWMpIHtcclxuICBFbnRpdHlGaWx0ZXIuY2FsbCh0aGlzLCBcImZpbHRlckJ5Q29uZGl0aW9uXCIsIGFyZ3VtZW50cywgW1R5cGUuQk9PTEVBTl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChsb2dpYyk7XHJcbn1cclxuZWZCeUxvZ2ljLnByb3RvdHlwZSA9IG5ldyBFbnRpdHlGaWx0ZXIoKTtcclxuZWZCeUxvZ2ljLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGVmQnlMb2dpYztcclxuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4oZWZCeUxvZ2ljKTtcclxuXHJcbmVmQnlMb2dpYy5wcm90b3R5cGUuZGVjaWRlID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgcmV0dXJuIG5ldyBCZWhhdmlvcih0aGlzLmFyZ3NbMF0pLmNoZWNrKGVudGl0eSk7XHJcbn07IiwicmVxdWlyZShcIi4vaW5wdXQuanNcIik7XHJcblxyXG52YXIgRW5naW5lID0gcmVxdWlyZShcIi4vZW5naW5lLmpzXCIpO1xyXG52YXIgVmlld3BvcnQgPSByZXF1aXJlKFwiLi92aWV3cG9ydC5qc1wiKTtcclxudmFyIFVJID0gcmVxdWlyZShcIi4vdWkuanNcIik7XHJcbnZhciBCb2R5VHlwZSA9IHJlcXVpcmUoXCIuL2JvZHl0eXBlLmpzXCIpO1xyXG52YXIgQmVoYXZpb3IgPSByZXF1aXJlKFwiLi9iZWhhdmlvci5qc1wiKTtcclxudmFyIFRva2VuID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuVG9rZW47XHJcblxyXG52YXIgQ2lyY2xlID0gcmVxdWlyZShcIi4vc2hhcGVzLmpzXCIpLkNpcmNsZTtcclxudmFyIFJlY3RhbmdsZSA9IHJlcXVpcmUoXCIuL3NoYXBlcy5qc1wiKS5SZWN0YW5nbGU7XHJcblxyXG5VSS5pbml0aWFsaXplKCk7XHJcblxyXG5fZW5naW5lID0gbmV3IEVuZ2luZShuZXcgVmlld3BvcnQoJChcIiNtYWluQ2FudmFzXCIpWzBdKSwgbmV3IGIyVmVjMigwLCA1MDApKTtcclxuXHJcbl9lbmdpbmUuYWRkRW50aXR5KG5ldyBDaXJjbGUobmV3IGIyVmVjMig1MDAsIDUwKSwgMjApLCBCb2R5VHlwZS5EWU5BTUlDX0JPRFkpXHJcbiAgLnNldENvbGxpc2lvbkdyb3VwKDIpXHJcbiAgLnNldElkKFwia3J1aFwiKVxyXG4gIC5kaXNhYmxlUm90YXRpb24oZmFsc2UpXHJcbiAgLmFkZEJlaGF2aW9yKFxyXG4gICAgbmV3IEJlaGF2aW9yKFxyXG4gICAgICBUb2tlbi5wYXJzZShcImlzQnV0dG9uVXAobnVtYmVyKDMyKSlcIiksXHJcbiAgICAgIFRva2VuLnBhcnNlKFwic2V0TGluZWFyVmVsb2NpdHkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSwgZ2V0VmVsb2NpdHlYKGZpbHRlckJ5SWQodGV4dChrcnVoKSkpLCBudW1iZXIoLTk5OTk5OTk5OTk5OTk5OTk5OSkpXCIpXHJcbiAgICApXHJcbiAgKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgVG9rZW4ucGFyc2UoXCJpc0J1dHRvbkRvd24obnVtYmVyKDM3KSlcIiksXHJcbiAgICAgIFRva2VuLnBhcnNlKFwic2V0TGluZWFyVmVsb2NpdHkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSwgbnVtYmVyKC0xMDApLCBnZXRWZWxvY2l0eVkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSkpXCIpXHJcbiAgICApXHJcbiAgKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgVG9rZW4ucGFyc2UoXCJpc0J1dHRvbkRvd24obnVtYmVyKDM5KSlcIiksXHJcbiAgICAgIFRva2VuLnBhcnNlKFwic2V0TGluZWFyVmVsb2NpdHkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSwgbnVtYmVyKDEwMCksIGdldFZlbG9jaXR5WShmaWx0ZXJCeUlkKHRleHQoa3J1aCkpKSlcIilcclxuICAgIClcclxuICApO1xyXG5cclxuX2VuZ2luZS5hZGRFbnRpdHkobmV3IFJlY3RhbmdsZShuZXcgYjJWZWMyKDQwMCwgNDAwKSwgbmV3IGIyVmVjMig0MDAsIDMpKSwgQm9keVR5cGUuS0lORU1BVElDX0JPRFkpXHJcbiAgLnNldElkKFwicGxhdGZvcm1cIilcclxuICAuc2V0Q29sbGlzaW9uR3JvdXAoMSk7XHJcblxyXG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gIF9lbmdpbmUuc3RlcCgpO1xyXG59KTtcclxuXHJcblxyXG5cclxuXHJcbiIsIi8vIElOUFVUIENBUFRVUklOR1xyXG5cclxudmFyIFRvb2xzID0gcmVxdWlyZShcIi4vdG9vbHMuanNcIik7XHJcblxyXG53aW5kb3cud2luZG93LklucHV0ID0ge1xyXG4gIHRvb2w6IFRvb2xzLlNlbGVjdGlvbixcclxuXHJcbiAgbW91c2U6IHtcclxuICAgIHg6IDAsXHJcbiAgICB5OiAwLFxyXG4gICAgbGVmdERvd246IGZhbHNlLFxyXG4gICAgcmlnaHREb3duOiBmYWxzZSxcclxuICAgIGxlZnRVcDogZmFsc2UsXHJcbiAgICByaWdodFVwOiBmYWxzZSxcclxuXHJcbiAgICB1cGRhdGVQb3NpdGlvbjogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHRoaXMueCA9IGV2ZW50LnBhZ2VYIC0gX2VuZ2luZS52aWV3cG9ydC5jYW52YXNFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICAgIHRoaXMueSA9IGV2ZW50LnBhZ2VZIC0gX2VuZ2luZS52aWV3cG9ydC5jYW52YXNFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc0Rvd246IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9IF9lbmdpbmUudmlld3BvcnQuY2FudmFzRWxlbWVudClcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMSkge1xyXG4gICAgICAgIHRoaXMubGVmdERvd24gPSB0cnVlO1xyXG5cclxuICAgICAgICB3aW5kb3cuSW5wdXQudG9vbC5vbmNsaWNrKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMylcclxuICAgICAgICB0aGlzLnJpZ2h0RG93biA9IHRydWU7XHJcblxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVCdXR0b25zVXA6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9IF9lbmdpbmUudmlld3BvcnQuY2FudmFzRWxlbWVudClcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMSkge1xyXG4gICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmxlZnRVcCA9IHRydWU7XHJcblxyXG4gICAgICAgIHdpbmRvdy5JbnB1dC50b29sLm9ucmVsZWFzZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDMpIHtcclxuICAgICAgICB0aGlzLnJpZ2h0RG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucmlnaHRVcCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYW5VcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLmxlZnRVcCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnJpZ2h0VXAgPSBmYWxzZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBrZXlib2FyZDoge1xyXG4gICAgZG93bjogbmV3IFNldCgpLFxyXG4gICAgdXA6IG5ldyBTZXQoKSxcclxuXHJcbiAgICBpc0Rvd246IGZ1bmN0aW9uIChrZXlDb2RlKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRvd24uaGFzKGtleUNvZGUpXHJcbiAgICB9LFxyXG5cclxuICAgIGlzVXA6IGZ1bmN0aW9uIChrZXlDb2RlKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnVwLmhhcyhrZXlDb2RlKTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc0Rvd246IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICB0aGlzLmRvd24uYWRkKGV2ZW50LndoaWNoKTtcclxuXHJcbiAgICAgIGlmKGV2ZW50LndoaWNoID09PSAzMilcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVCdXR0b25zVXA6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICB0aGlzLmRvd24uZGVsZXRlKGV2ZW50LndoaWNoKTtcclxuICAgICAgdGhpcy51cC5hZGQoZXZlbnQud2hpY2gpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhblVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMudXAuY2xlYXIoKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBpbml0aWFsaXplOiBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBlbGVtZW50Lm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICB3aW5kb3cud2luZG93LklucHV0Lm1vdXNlLnVwZGF0ZVBvc2l0aW9uKGUpO1xyXG4gICAgfTtcclxuICAgIGVsZW1lbnQub25tb3VzZWRvd24gPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHdpbmRvdy53aW5kb3cuSW5wdXQubW91c2UudXBkYXRlQnV0dG9uc0Rvd24oZSk7XHJcbiAgICB9O1xyXG4gICAgZWxlbWVudC5vbm1vdXNldXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHdpbmRvdy53aW5kb3cuSW5wdXQubW91c2UudXBkYXRlQnV0dG9uc1VwKGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBkb2N1bWVudC5vbmtleWRvd24gPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHdpbmRvdy53aW5kb3cuSW5wdXQua2V5Ym9hcmQudXBkYXRlQnV0dG9uc0Rvd24oZSk7XHJcbiAgICB9O1xyXG4gICAgZG9jdW1lbnQub25rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgd2luZG93LndpbmRvdy5JbnB1dC5rZXlib2FyZC51cGRhdGVCdXR0b25zVXAoZSk7XHJcbiAgICB9O1xyXG4gIH1cclxufTtcclxuXHJcbiIsInZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xudmFyIExvZ2ljID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuTG9naWM7XG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xudmFyIEZpeFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuRml4VHlwZTtcblxudmFyIGxBbmQgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiQU5EXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOLCBUeXBlLkJPT0xFQU5dKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcbn07XG5sQW5kLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubEFuZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQW5kO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obEFuZCk7XG5cbmxBbmQucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICYmIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcbn1cblxudmFyIGxPciA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJPUlwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuQk9PTEVBTiwgVHlwZS5CT09MRUFOXSk7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG59XG5sT3IucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sT3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE9yO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obE9yKTtcblxubE9yLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpIHx8IHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIHJldHVybiBmYWxzZTtcbn1cblxudmFyIGxOb3QgPSBmdW5jdGlvbiAoYSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiTk9UXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG59XG5sTm90LnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubE5vdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTm90O1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obE5vdCk7XG5cbmxOb3QucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gIXRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xufVxuXG52YXIgbFN0cmluZyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwidGV4dFwiLCBUeXBlLlNUUklORywgYXJndW1lbnRzLCBbVHlwZS5MSVRFUkFMXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2godmFsdWUpO1xufVxubFN0cmluZy5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxTdHJpbmcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFN0cmluZztcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxTdHJpbmcpO1xuXG5sU3RyaW5nLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXTtcbn1cblxudmFyIGxOdW1iZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIm51bWJlclwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5MSVRFUkFMXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2godmFsdWUpO1xufVxubE51bWJlci5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxOdW1iZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE51bWJlcjtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxOdW1iZXIpO1xuXG5sTnVtYmVyLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5hcmdzWzBdKTtcbn1cblxudmFyIGxCb29sID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJib29sZWFuXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5MSVRFUkFMXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2godmFsdWUpO1xufVxubEJvb2wucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sQm9vbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQm9vbDtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxCb29sKTtcblxubEJvb2wucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdID09PSBcInRydWVcIjtcbn1cblxudmFyIGxCdXR0b25Eb3duID0gZnVuY3Rpb24gKGJ1dHRvbikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiaXNCdXR0b25Eb3duXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChidXR0b24pO1xufVxubEJ1dHRvbkRvd24ucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sQnV0dG9uRG93bi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQnV0dG9uRG93bjtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxCdXR0b25Eb3duKTtcblxubEJ1dHRvbkRvd24ucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gd2luZG93LklucHV0LmtleWJvYXJkLmlzRG93bih0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSk7XG59XG5cbnZhciBsQnV0dG9uVXAgPSBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJpc0J1dHRvblVwXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChidXR0b24pO1xufVxubEJ1dHRvblVwLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubEJ1dHRvblVwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxCdXR0b25VcDtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxCdXR0b25VcCk7XG5cbmxCdXR0b25VcC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB3aW5kb3cuSW5wdXQua2V5Ym9hcmQuaXNVcCh0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSk7XG59XG5cbnZhciBsUmFuZG9tID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJyYW5kb21OdW1iZXJcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKG1pbik7XG4gIHRoaXMuYXJncy5wdXNoKG1heCk7XG59XG5sUmFuZG9tLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubFJhbmRvbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsUmFuZG9tO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obFJhbmRvbSk7XG5cbmxSYW5kb20ucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gVXRpbHMucmFuZG9tUmFuZ2UodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgJiYgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xufVxuXG52YXIgbFZlbG9jaXR5WCA9IGZ1bmN0aW9uIChlZikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiZ2V0VmVsb2NpdHlYXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcbn1cbmxWZWxvY2l0eVgucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sVmVsb2NpdHlYLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxWZWxvY2l0eVg7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsVmVsb2NpdHlYKTtcblxubFZlbG9jaXR5WC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbnRpdHkgPSB0aGlzLmFyZ3NbMF0uZmlsdGVyKClbMF07XG5cbiAgcmV0dXJuIGVudGl0eS5ib2R5LkdldExpbmVhclZlbG9jaXR5KCkuZ2V0X3goKTtcbn1cblxudmFyIGxWZWxvY2l0eVkgPSBmdW5jdGlvbiAoZWYpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImdldFZlbG9jaXR5WVwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChlZik7XG59XG5sVmVsb2NpdHlZLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubFZlbG9jaXR5WS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsVmVsb2NpdHlZO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obFZlbG9jaXR5WSk7XG5cbmxWZWxvY2l0eVkucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZW50aXR5ID0gdGhpcy5hcmdzWzBdLmZpbHRlcigpWzBdO1xuXG4gIHJldHVybiBlbnRpdHkuYm9keS5HZXRMaW5lYXJWZWxvY2l0eSgpLmdldF95KCk7XG59XG5cbnZhciBsUGx1cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCIrXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcbn1cbmxQbHVzLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubFBsdXMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFBsdXM7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsUGx1cyk7XG5cbmxQbHVzLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICsgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59XG5cbnZhciBsTXVsdGlwbHkgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiKlwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59XG5sTXVsdGlwbHkucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sTXVsdGlwbHkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE11bHRpcGx5O1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obE11bHRpcGx5KTtcblxubE11bHRpcGx5LnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICogdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59XG5cbnZhciBsRGl2aWRlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIi9cIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xufVxubERpdmlkZS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxEaXZpZGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbERpdmlkZTtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxEaXZpZGUpO1xuXG5sRGl2aWRlLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpIC8gdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59XG5cbnZhciBsTWludXMgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiLVwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59XG5sTWludXMucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sTWludXMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE1pbnVzO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obE1pbnVzKTtcblxubE1pbnVzLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICsgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59IiwidmFyIEVudGl0eSA9IHJlcXVpcmUoXCIuL2VudGl0eS5qc1wiKTtcclxuXHJcbi8vIENpcmNsZSBlbnRpdHlcclxudmFyIENpcmNsZSA9IGZ1bmN0aW9uKGNlbnRlciwgcmFkaXVzLCBmaXh0dXJlLCBpZCwgY29sbGlzaW9uR3JvdXApIHtcclxuICB2YXIgc2hhcGUgPSBuZXcgYjJDaXJjbGVTaGFwZSgpO1xyXG4gIHNoYXBlLnNldF9tX3JhZGl1cyhyYWRpdXMpO1xyXG5cclxuICB2YXIgYm9keSA9IG5ldyBiMkJvZHlEZWYoKTtcclxuICBib2R5LnNldF9wb3NpdGlvbihjZW50ZXIpO1xyXG5cclxuICBFbnRpdHkuY2FsbCh0aGlzLCBzaGFwZSwgZml4dHVyZSwgYm9keSwgaWQsIGNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcbkNpcmNsZS5wcm90b3R5cGUgPSBuZXcgRW50aXR5KCk7XHJcbkNpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaXJjbGU7XHJcblxyXG5DaXJjbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcblxyXG4gIGN0eC5hcmMoMCwgMCwgdGhpcy5yYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcblxyXG4gIGN0eC5maWxsKCk7XHJcblxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XHJcbiAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IFwiZGVzdGluYXRpb24tb3V0XCI7XHJcblxyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgubW92ZVRvKDAsIDApO1xyXG4gIGN0eC5saW5lVG8oMCwgdGhpcy5yYWRpdXMpO1xyXG4gIGN0eC5zdHJva2UoKTtcclxuICBjdHguY2xvc2VQYXRoKCk7XHJcbn1cclxuXHJcblxyXG4vLyBSZWN0YW5nbGUgZW50aXR5XHJcbnZhciBSZWN0YW5nbGUgPSBmdW5jdGlvbihjZW50ZXIsIGV4dGVudHMsIGZpeHR1cmUsIGlkLCBjb2xsaXNpb25Hcm91cCkge1xyXG4gIHZhciBzaGFwZSA9IG5ldyBiMlBvbHlnb25TaGFwZSgpO1xyXG4gIHNoYXBlLlNldEFzQm94KGV4dGVudHMuZ2V0X3goKSwgZXh0ZW50cy5nZXRfeSgpKVxyXG5cclxuICB2YXIgYm9keSA9IG5ldyBiMkJvZHlEZWYoKTtcclxuICBib2R5LnNldF9wb3NpdGlvbihjZW50ZXIpO1xyXG5cclxuICBFbnRpdHkuY2FsbCh0aGlzLCBzaGFwZSwgZml4dHVyZSwgYm9keSwgaWQsIGNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgdGhpcy5leHRlbnRzID0gZXh0ZW50cztcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuUmVjdGFuZ2xlLnByb3RvdHlwZSA9IG5ldyBFbnRpdHkoKTtcclxuUmVjdGFuZ2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlY3RhbmdsZTtcclxuXHJcblJlY3RhbmdsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGN0eCkge1xyXG4gIHZhciBoYWxmV2lkdGggPSB0aGlzLmV4dGVudHMuZ2V0X3goKTtcclxuICB2YXIgaGFsZkhlaWdodCA9IHRoaXMuZXh0ZW50cy5nZXRfeSgpO1xyXG5cclxuICBjdHguZmlsbFJlY3QoLWhhbGZXaWR0aCwgLWhhbGZIZWlnaHQsIGhhbGZXaWR0aCAqIDIsIGhhbGZIZWlnaHQgKiAyKTtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzLkNpcmNsZSA9IENpcmNsZTtcclxubW9kdWxlLmV4cG9ydHMuUmVjdGFuZ2xlID0gUmVjdGFuZ2xlOyIsInZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xyXG52YXIgRml4VHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5GaXhUeXBlO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxudmFyIFR5cGVFeGNlcHRpb24gPSBmdW5jdGlvbihleHBlY3RlZCwgcmVjZWl2ZWQsIHRva2VuKSB7XHJcbiAgdGhpcy5leHBlY3RlZCA9IGV4cGVjdGVkO1xyXG4gIHRoaXMucmVjZWl2ZWQgPSByZWNlaXZlZDtcclxuICB0aGlzLnRva2VuID0gdG9rZW47XHJcbn07XHJcblxyXG52YXIgVG9rZW4gPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBhcmdzLCBhcmd1bWVudF90eXBlcykge1xyXG4gIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5QUkVGSVg7XHJcbiAgdGhpcy5uYW1lID0gbmFtZTtcclxuICB0aGlzLmFyZ3MgPSBhcmdzID09IHVuZGVmaW5lZCA/IFtdIDogYXJncztcclxuICB0aGlzLmFyZ3VtZW50X3R5cGVzID0gYXJndW1lbnRfdHlwZXM7XHJcbiAgdGhpcy5hcmdzID0gW107XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hcmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoYXJnc1tpXS50eXBlICE9PSBhcmd1bWVudF90eXBlc1tpXSAmJiBhcmd1bWVudF90eXBlc1tpXSAhPT0gVHlwZS5MSVRFUkFMKVxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUV4Y2VwdGlvbihhcmd1bWVudF90eXBlc1tpXSwgYXJnc1tpXS50eXBlLCB0aGlzKTtcclxuICB9XHJcbn07XHJcblxyXG5Ub2tlbi5zdG9wQ2hhcnMgPSBbXCIoXCIsIFwiKVwiLCBcIixcIl07XHJcblxyXG5Ub2tlbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgcmV0ID0gXCJcIjtcclxuICB2YXIgYXJnU3RyaW5ncyA9IFtdO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgYXJnU3RyaW5ncy5wdXNoKHRoaXMuYXJnc1tpXS50b1N0cmluZygpKTtcclxuICB9XHJcblxyXG4gIGFyZ1N0cmluZ3MgPSBhcmdTdHJpbmdzLmpvaW4oXCIsIFwiKTtcclxuXHJcbiAgc3dpdGNoICh0aGlzLmZpeFR5cGUpIHtcclxuICAgIGNhc2UgRml4VHlwZS5QUkVGSVg6XHJcbiAgICAgIHJldCA9IHRoaXMubmFtZSArIFwiKFwiICsgYXJnU3RyaW5ncyArIFwiKVwiO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgRml4VHlwZS5JTkZJWDpcclxuICAgICAgcmV0ID0gdGhpcy5hcmdzWzBdLnRvU3RyaW5nKCkgKyBcIiBcIiArIHRoaXMubmFtZSArIFwiIFwiICsgdGhpcy5hcmdzWzFdLnRvU3RyaW5nKCk7XHJcbiAgICAgIGJyZWFrO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcblRva2VuLnBhcnNlID0gZnVuY3Rpb24oaW5wdXQpIHtcclxuICBUb2tlbi5wYXJzZXJJbnB1dCA9IGlucHV0O1xyXG4gIFRva2VuLnBhcnNlcklucHV0V2hvbGUgPSBpbnB1dDtcclxuICBUb2tlbi5wYXJzZXJTdGFjayA9IFtdO1xyXG5cclxuICBkbyB7XHJcbiAgICBUb2tlbi5wYXJzZVN0ZXAoKVxyXG4gIH0gd2hpbGUgKFRva2VuLnBhcnNlcklucHV0Lmxlbmd0aCk7XHJcblxyXG4gIHZhciByZXQgPSBUb2tlbi5wYXJzZXJTdGFjay5wb3AoKTtcclxuXHJcbiAgaWYgKFRva2VuLnBhcnNlclN0YWNrLmxlbmd0aClcclxuICAgIHRocm93IFwiVW5leHBlY3RlZCBcIiArIHJldC5uYW1lO1xyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuVG9rZW4ucmVhZFdoaXRlc3BhY2UgPSBmdW5jdGlvbigpIHtcclxuICB3aGlsZSAoL1xccy8udGVzdChUb2tlbi5wYXJzZXJJbnB1dFswXSkgJiYgVG9rZW4ucGFyc2VySW5wdXQubGVuZ3RoKSB7XHJcbiAgICBUb2tlbi5wYXJzZXJJbnB1dCA9IFRva2VuLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG4gIH1cclxufTtcclxuXHJcblRva2VuLnBhcnNlTmFtZSA9IGZ1bmN0aW9uKCkge1xyXG4gIFRva2VuLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gIHZhciByZXQgPSBcIlwiO1xyXG5cclxuICB3aGlsZSAoIS9cXHMvLnRlc3QoVG9rZW4ucGFyc2VySW5wdXRbMF0pICYmIFRva2VuLnBhcnNlcklucHV0Lmxlbmd0aCAmJiBUb2tlbi5zdG9wQ2hhcnMuaW5kZXhPZihUb2tlbi5wYXJzZXJJbnB1dFswXSkgPT09IC0xKSAvLyByZWFkIHVudGlsIGEgd2hpdGVzcGFjZSBvY2N1cnNcclxuICB7XHJcbiAgICByZXQgKz0gVG9rZW4ucGFyc2VySW5wdXRbMF1cclxuICAgIFRva2VuLnBhcnNlcklucHV0ID0gVG9rZW4ucGFyc2VySW5wdXQuc2xpY2UoMSk7XHJcbiAgfVxyXG5cclxuICBUb2tlbi5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuVG9rZW4ucmVhZENoYXIgPSBmdW5jdGlvbihjaGFyKSB7XHJcbiAgVG9rZW4ucmVhZFdoaXRlc3BhY2UoKTtcclxuXHJcbiAgaWYgKFRva2VuLnBhcnNlcklucHV0WzBdICE9PSBjaGFyKSB7XHJcbiAgICB2YXIgcG9zaXRpb24gPSBUb2tlbi5wYXJzZXJJbnB1dFdob2xlLmxlbmd0aCAtIFRva2VuLnBhcnNlcklucHV0Lmxlbmd0aDtcclxuICAgIHRocm93IFwiRXhwZWN0ZWQgJ1wiICsgY2hhciArIFwiJyBhdCBwb3NpdGlvbiBcIiArIHBvc2l0aW9uICsgXCIgYXQgJ1wiICsgVG9rZW4ucGFyc2VySW5wdXRXaG9sZS5zdWJzdHIocG9zaXRpb24pICsgXCInXCI7XHJcbiAgfVxyXG5cclxuICBUb2tlbi5wYXJzZXJJbnB1dCA9IFRva2VuLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG5cclxuICBUb2tlbi5yZWFkV2hpdGVzcGFjZSgpO1xyXG59O1xyXG5cclxuVG9rZW4ucGFyc2VTdGVwID0gZnVuY3Rpb24oZXhwZWN0ZWRUeXBlKSB7XHJcbiAgdmFyIG5hbWUgPSBUb2tlbi5wYXJzZU5hbWUoKTtcclxuICB2YXIgdG9rZW4gPSB3aW5kb3cudG9rZW5zW25hbWVdO1xyXG5cclxuICBpZiAodG9rZW4gPT09IHVuZGVmaW5lZCAmJiBleHBlY3RlZFR5cGUgPT09IFR5cGUuTElURVJBTCkge1xyXG4gICAgcmV0dXJuIG5hbWU7XHJcbiAgfVxyXG5cclxuICBpZiAodG9rZW4gPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aHJvdyBcIkV4cGVjdGVkIGFyZ3VtZW50IHdpdGggdHlwZSBcIiArIGV4cGVjdGVkVHlwZTtcclxuICB9XHJcblxyXG4gIGlmIChleHBlY3RlZFR5cGUgIT09IHVuZGVmaW5lZCAmJiB0b2tlbi50eXBlICE9PSBleHBlY3RlZFR5cGUpIHtcclxuICAgIHRocm93IFwiVW5leHBlY3RlZCBcIiArIHRva2VuLnR5cGUgKyBcIiAod2FzIGV4cGVjdGluZyBcIiArIGV4cGVjdGVkVHlwZSArIFwiKVwiO1xyXG4gIH1cclxuXHJcbiAgdmFyIG51bUFyZ3MgPSB0b2tlbi5hcmd1bWVudF90eXBlcy5sZW5ndGg7XHJcblxyXG4gIHZhciBhcmdzID0gW107XHJcblxyXG4gIGlmICh0b2tlbi5maXhUeXBlID09PSBGaXhUeXBlLklORklYKSB7XHJcbiAgICB2YXIgYSA9IFRva2VuLnBhcnNlclN0YWNrLnBvcCgpO1xyXG5cclxuICAgIGlmIChhLnR5cGUgIT09IHRva2VuLmFyZ3VtZW50X3R5cGVzWzBdKVxyXG4gICAgICB0aHJvdyBcIlVuZXhwZWN0ZWQgXCIgKyBhLnR5cGUgKyBcIiAod2FzIGV4cGVjdGluZyBcIiArIHRva2VuLmFyZ3VtZW50X3R5cGVzWzBdICsgXCIpXCI7XHJcblxyXG4gICAgYXJncyA9IFthLCBUb2tlbi5wYXJzZVN0ZXAodG9rZW4uYXJndW1lbnRfdHlwZXNbMV0pXTtcclxuICAgIFRva2VuLnBhcnNlclN0YWNrLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRva2VuLmZpeFR5cGUgPT09IEZpeFR5cGUuUFJFRklYKSB7XHJcbiAgICBUb2tlbi5yZWFkQ2hhcihcIihcIik7XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IG51bUFyZ3M7IGkrKykge1xyXG4gICAgICBhcmdzLnB1c2goVG9rZW4ucGFyc2VTdGVwKHRva2VuLmFyZ3VtZW50X3R5cGVzW2ldKSk7XHJcblxyXG4gICAgICBUb2tlbi5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICAgICAgaWYgKFRva2VuLnBhcnNlcklucHV0WzBdID09PSBcIixcIilcclxuICAgICAgICBUb2tlbi5wYXJzZXJJbnB1dCA9IFRva2VuLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG4gICAgfVxyXG5cclxuICAgIFRva2VuLnJlYWRDaGFyKFwiKVwiKTtcclxuICB9XHJcblxyXG4gIHZhciBuZXdUb2tlbiA9IG5ldyB0b2tlbi5jb25zdHJ1Y3RvcigpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgbmV3VG9rZW4uYXJnc1tpXSA9IGFyZ3NbaV07XHJcblxyXG4gICAgVG9rZW4ucGFyc2VyU3RhY2sucG9wKCk7XHJcbiAgfVxyXG4gIFRva2VuLnBhcnNlclN0YWNrLnB1c2gobmV3VG9rZW4pO1xyXG5cclxuICByZXR1cm4gbmV3VG9rZW47XHJcbn07XHJcblxyXG5cclxudmFyIExvZ2ljID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICBUb2tlbi5jYWxsKHRoaXMsIG5hbWUsIHR5cGUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKTtcclxufTtcclxuTG9naWMucHJvdG90eXBlID0gbmV3IFRva2VuKCk7XHJcbkxvZ2ljLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvZ2ljO1xyXG5cclxuTG9naWMucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24oKSB7IC8vIFVzZSBhIGRlcml2ZWQgY2xhc3NcclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5cclxudmFyIEFjdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgVG9rZW4uY2FsbCh0aGlzLCBuYW1lLCBUeXBlLkFDVElPTiwgYXJncywgYXJndW1lbnRfdHlwZXMpO1xyXG59O1xyXG5BY3Rpb24ucHJvdG90eXBlID0gbmV3IFRva2VuKCk7XHJcbkFjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBY3Rpb247XHJcblxyXG5BY3Rpb24ucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHsgLy8gVXNlIGEgZGVyaXZlZCBjbGFzc1xyXG4gIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbkFjdGlvbi5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBlbnRpdGllcyA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB0aGlzLmVhY2goZW50aXRpZXNbaV0pO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG52YXIgRW50aXR5RmlsdGVyID0gZnVuY3Rpb24obmFtZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICBUb2tlbi5jYWxsKHRoaXMsIG5hbWUsIFR5cGUuRU5USVRZRklMVEVSLCBhcmdzLCBhcmd1bWVudF90eXBlcyk7XHJcbn07XHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUgPSBuZXcgVG9rZW4oKTtcclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVudGl0eUZpbHRlcjtcclxuXHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUuZGVjaWRlID0gZnVuY3Rpb24oZW50aXR5KSB7IC8vIFVzZSBkZXJpdmVkIGNsYXNzXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgcmV0ID0gW107XHJcbiAgdmFyIGVudGl0aWVzID0gX2VuZ2luZS5lbnRpdGllcygpO1xyXG4gIFxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmICh0aGlzLmRlY2lkZShlbnRpdGllc1tpXSkpXHJcbiAgICAgIHJldC5wdXNoKGVudGl0aWVzW2ldKTtcclxuICB9XHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLlRva2VuID0gVG9rZW47XHJcbm1vZHVsZS5leHBvcnRzLkFjdGlvbiA9IEFjdGlvbjtcclxubW9kdWxlLmV4cG9ydHMuTG9naWMgPSBMb2dpYztcclxubW9kdWxlLmV4cG9ydHMuRW50aXR5RmlsdGVyID0gRW50aXR5RmlsdGVyO1xyXG5cclxuLy8gVE9ETzogbGluZWFyIGFjdGlvbiwgcG9yb3ZuYXZhbmllLCB1aGx5LCBwbHVzLCBtaW51cyAsIGRlbGVubywga3JhdCwgeCBuYSBuIiwidmFyIFNoYXBlID0gcmVxdWlyZShcIi4vc2hhcGVzLmpzXCIpO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL2JvZHl0eXBlLmpzXCIpO1xyXG5cclxudmFyIEJsYW5rID0ge1xyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHt9LFxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge30sXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7fVxyXG59O1xyXG5cclxuXHJcbnZhciBTZWxlY3Rpb24gPSB7XHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgX2VuZ2luZS5zZWxlY3RFbnRpdHkobnVsbCk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IF9lbmdpbmUuTEFZRVJTX05VTUJFUiAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX2VuZ2luZS5sYXllcnNbaV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBpZiAoX2VuZ2luZS5sYXllcnNbaV1bal0uZml4dHVyZS5UZXN0UG9pbnQoXHJcbiAgICAgICAgICAgIG5ldyBiMlZlYzIoX2VuZ2luZS52aWV3cG9ydC54IC0gX2VuZ2luZS52aWV3cG9ydC53aWR0aCAvIDIgKyB3aW5kb3cuSW5wdXQubW91c2UueCwgX2VuZ2luZS52aWV3cG9ydC55IC0gX2VuZ2luZS52aWV3cG9ydC5oZWlnaHQgLyAyICsgd2luZG93LklucHV0Lm1vdXNlLnkpKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgX2VuZ2luZS5zZWxlY3RFbnRpdHkoX2VuZ2luZS5sYXllcnNbaV1bal0pO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgb25yZWxlYXNlOiBmdW5jdGlvbiAoKSB7fSxcclxuICBvbm1vdmU6IGZ1bmN0aW9uICgpIHt9XHJcbn07XHJcblxyXG5cclxudmFyIFJlY3RhbmdsZSA9IHtcclxuICBvcmlnaW46IG51bGwsXHJcbiAgdzogMCxcclxuICBoOiAwLFxyXG4gIG1pblNpemU6IDUsXHJcblxyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMub25tb3ZlID0gdGhpcy5kcmFnZ2luZztcclxuICAgIHRoaXMub3JpZ2luID0gW3dpbmRvdy5JbnB1dC5tb3VzZS54LCB3aW5kb3cuSW5wdXQubW91c2UueV07XHJcbiAgfSxcclxuXHJcbiAgb25yZWxlYXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy53ID49IHRoaXMubWluU2l6ZSAmJiB0aGlzLmggPj0gdGhpcy5taW5TaXplKVxyXG4gICAgICBfZW5naW5lLmFkZEVudGl0eShuZXcgU2hhcGUuUmVjdGFuZ2xlKFxyXG4gICAgICAgIG5ldyBiMlZlYzIodGhpcy5vcmlnaW5bMF0gKyB0aGlzLncgLyAyLCB0aGlzLm9yaWdpblsxXSArIHRoaXMuaCAvIDIpLFxyXG4gICAgICAgIG5ldyBiMlZlYzIodGhpcy53IC8gMiwgdGhpcy5oIC8gMikpLCBUeXBlLkRZTkFNSUNfQk9EWSk7XHJcblxyXG4gICAgdGhpcy5vbm1vdmUgPSBmdW5jdGlvbigpe307XHJcbiAgICB0aGlzLm9yaWdpbiA9IG51bGw7XHJcbiAgICB0aGlzLncgPSB0aGlzLmggPSAwO1xyXG4gIH0sXHJcblxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICB9LFxyXG5cclxuICBkcmFnZ2luZzogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgdGhpcy53ID0gd2luZG93LklucHV0Lm1vdXNlLnggLSB0aGlzLm9yaWdpblswXTtcclxuICAgIHRoaXMuaCA9IHdpbmRvdy5JbnB1dC5tb3VzZS55IC0gdGhpcy5vcmlnaW5bMV07XHJcblxyXG4gICAgaWYgKHRoaXMudyA8IHRoaXMubWluU2l6ZSB8fCB0aGlzLmggPCB0aGlzLm1pblNpemUpXHJcbiAgICAgIHJldHVybjtcclxuXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLCAwLCAwLCAwLjQpXCI7XHJcbiAgICBjdHguZmlsbFJlY3QodGhpcy5vcmlnaW5bMF0sIHRoaXMub3JpZ2luWzFdLCB0aGlzLncsIHRoaXMuaCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG52YXIgQ2lyY2xlID0ge1xyXG4gIG9yaWdpbjogbnVsbCxcclxuICByYWRpdXM6IDAsXHJcbiAgbWluUmFkaXVzOiA1LFxyXG5cclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm9ubW92ZSA9IHRoaXMuZHJhZ2dpbmc7XHJcbiAgICB0aGlzLm9yaWdpbiA9IFt3aW5kb3cuSW5wdXQubW91c2UueCwgd2luZG93LklucHV0Lm1vdXNlLnldO1xyXG4gIH0sXHJcblxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMucmFkaXVzID49IHRoaXMubWluUmFkaXVzKVxyXG4gICAgICBfZW5naW5lLmFkZEVudGl0eShuZXcgU2hhcGUuQ2lyY2xlKFxyXG4gICAgICAgIG5ldyBiMlZlYzIodGhpcy5vcmlnaW5bMF0gKyB0aGlzLnJhZGl1cywgdGhpcy5vcmlnaW5bMV0gKyB0aGlzLnJhZGl1cyksXHJcbiAgICAgICAgdGhpcy5yYWRpdXMpLCBUeXBlLkRZTkFNSUNfQk9EWSk7XHJcblxyXG4gICAgdGhpcy5vbm1vdmUgPSBmdW5jdGlvbigpe307XHJcbiAgICB0aGlzLm9yaWdpbiA9IG51bGw7XHJcbiAgICB0aGlzLnJhZGl1cyA9IDA7XHJcbiAgfSxcclxuXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIH0sXHJcblxyXG4gIGRyYWdnaW5nOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICB0aGlzLnJhZGl1cyA9IE1hdGgubWluKHdpbmRvdy5JbnB1dC5tb3VzZS54IC0gdGhpcy5vcmlnaW5bMF0sIHdpbmRvdy5JbnB1dC5tb3VzZS55IC0gdGhpcy5vcmlnaW5bMV0pIC8gMjtcclxuXHJcbiAgICBpZiAodGhpcy5yYWRpdXMgPCB0aGlzLm1pblJhZGl1cylcclxuICAgICAgcmV0dXJuO1xyXG5cclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcblxyXG4gICAgY3R4LmFyYyh0aGlzLm9yaWdpblswXSArIHRoaXMucmFkaXVzLCB0aGlzLm9yaWdpblsxXSArIHRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cywgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuXHJcbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsIDAsIDAsIDAuNClcIjtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5CbGFuayA9IEJsYW5rO1xyXG5tb2R1bGUuZXhwb3J0cy5TZWxlY3Rpb24gPSBTZWxlY3Rpb247XHJcbm1vZHVsZS5leHBvcnRzLlJlY3RhbmdsZSA9IFJlY3RhbmdsZTtcclxubW9kdWxlLmV4cG9ydHMuQ2lyY2xlID0gQ2lyY2xlOyIsInZhciBUeXBlID0ge1xyXG4gIEJPT0xFQU46IFwiYm9vbGVhblwiLFxyXG4gIE5VTUJFUjogXCJudW1iZXJcIixcclxuICBTVFJJTkc6IFwic3RyaW5nXCIsXHJcbiAgQVJSQVk6IFwiYXJyYXlcIixcclxuICBBQ1RJT046IFwiYWN0aW9uXCIsXHJcbiAgRU5USVRZRklMVEVSOiBcImVudGl0eUZpbHRlclwiLFxyXG4gIExJVEVSQUw6IFwibGl0ZXJhbFwiXHJcbn07XHJcblxyXG52YXIgRml4VHlwZSA9IHtcclxuICBJTkZJWDogXCJpbmZpeFwiLFxyXG4gIFBSRUZJWDogXCJwcmVmaXhcIlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMuVHlwZSA9IFR5cGU7XHJcbm1vZHVsZS5leHBvcnRzLkZpeFR5cGUgPSBGaXhUeXBlOyIsInZhciBUb29scyA9IHJlcXVpcmUoXCIuL3Rvb2xzLmpzXCIpO1xyXG52YXIgQm9keVR5cGUgPSByZXF1aXJlKFwiLi9ib2R5dHlwZS5qc1wiKTtcclxudmFyIFVJQnVpbGRlciA9IHJlcXVpcmUoXCIuL3VpYnVpbGRlci5qc1wiKTtcclxuXHJcbi8vIE9iamVjdCBmb3IgYnVpbGRpbmcgdGhlIFVJXHJcbnZhciBVSSA9IHtcclxuICAvLyBVSSBpbml0aWFsaXNhdGlvblxyXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGxhbmd1YWdlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBUcmFuc2xhdGlvbnMuc3RyaW5ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBsYW5ndWFnZXMucHVzaCh7dGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWQoMCwgaSksIHZhbHVlOiBpfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHByb3BlcnRpZXMgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxyXG5cclxuICAgICAgICBpZDogXCJwbGF5XCIsXHJcbiAgICAgICAgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIpLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIF9lbmdpbmUudG9nZ2xlUGF1c2UoKTtcclxuXHJcbiAgICAgICAgICBpZiAoX2VuZ2luZS53b3JsZC5wYXVzZWQpIHtcclxuICAgICAgICAgICAgJChcIiNwbGF5XCIpLmh0bWwoVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIpKTtcclxuXHJcbiAgICAgICAgICAgICQoXCIjY29sbGlzaW9ucywgI3Rvb2xcIikuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5lbmFibGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJChcIiNwbGF5XCIpLmh0bWwoVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDMpKTtcclxuXHJcbiAgICAgICAgICAgICQoXCIjY29sbGlzaW9ucywgI3Rvb2xcIikuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5kaXNhYmxlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge3R5cGU6IFwiYnJlYWtcIn0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxyXG5cclxuICAgICAgICBpZDogXCJjb2xsaXNpb25zXCIsXHJcbiAgICAgICAgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDEpLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIFVJQnVpbGRlci5wb3B1cChVSS5jcmVhdGVDb2xsaXNpb25zKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge3R5cGU6IFwiYnJlYWtcIn0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcInJhZGlvXCIsXHJcblxyXG4gICAgICAgIGlkOiBcInRvb2xcIixcclxuICAgICAgICBlbGVtZW50czogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTcpLCBjaGVja2VkOiB0cnVlLCBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5JbnB1dC50b29sID0gVG9vbHMuU2VsZWN0aW9uO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE4KSwgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB3aW5kb3cuSW5wdXQudG9vbCA9IFRvb2xzLlJlY3RhbmdsZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxOSksIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgd2luZG93LklucHV0LnRvb2wgPSBUb29scy5DaXJjbGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAge3R5cGU6IFwiYnJlYWtcIn0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcInNlbGVjdFwiLFxyXG4gICAgICAgIG9wdGlvbnM6IGxhbmd1YWdlcyxcclxuXHJcbiAgICAgICAgb25jaGFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgVHJhbnNsYXRpb25zLnNldExhbmd1YWdlKHZhbHVlICogMSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgfVxyXG4gICAgXTtcclxuXHJcbiAgICBVSUJ1aWxkZXIuYnVpbGRMYXlvdXQoKTtcclxuICAgICQoXCIudWkudG9vbGJhclwiKVswXS5hcHBlbmRDaGlsZChVSUJ1aWxkZXIuYnVpbGQocHJvcGVydGllcykpO1xyXG4gICAgJChcIi51aS5jb250ZW50XCIpWzBdLmFwcGVuZENoaWxkKGVsKFwiY2FudmFzI21haW5DYW52YXNcIikpO1xyXG5cclxuICB9LFxyXG5cclxuICAvLyBCdWlsZGluZyB0aGUgY29sbGlzaW9uIGdyb3VwIHRhYmxlXHJcbiAgY3JlYXRlQ29sbGlzaW9uczogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGFibGUgPSBlbChcInRhYmxlLmNvbGxpc2lvblRhYmxlXCIpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2VuZ2luZS5DT0xMSVNJT05fR1JPVVBTX05VTUJFUiArIDE7IGkrKykge1xyXG4gICAgICB2YXIgdHIgPSBlbChcInRyXCIpO1xyXG5cclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBfZW5naW5lLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSICsgMTsgaisrKSB7XHJcbiAgICAgICAgdmFyIHRkID0gZWwoXCJ0ZFwiKTtcclxuXHJcbiAgICAgICAgLy8gZmlyc3Qgcm93XHJcbiAgICAgICAgaWYgKGkgPT09IDAgJiYgaiA+IDApIHtcclxuICAgICAgICAgIHRkLmlubmVySFRNTCA9IFwiPGRpdj48c3Bhbj5cIiArIF9lbmdpbmUuY29sbGlzaW9uR3JvdXBzW2ogLSAxXS5uYW1lICsgXCI8L3NwYW4+PC9kaXY+XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmaXJzdCBjb2x1bW5cclxuICAgICAgICBlbHNlIGlmIChqID09PSAwICYmIGkgIT09IDApXHJcbiAgICAgICAgICB0ZC5pbm5lckhUTUwgPSBfZW5naW5lLmNvbGxpc2lvbkdyb3Vwc1tpIC0gMV0ubmFtZTtcclxuXHJcbiAgICAgICAgLy8gcmVsZXZhbnQgdHJpYW5nbGVcclxuICAgICAgICBlbHNlIGlmIChpIDw9IGogJiYgaiAhPT0gMCAmJiBpICE9PSAwKSB7XHJcbiAgICAgICAgICB0ZC5yb3cgPSBpO1xyXG4gICAgICAgICAgdGQuY29sID0gajtcclxuXHJcbiAgICAgICAgICAvLyBoaWdobGlnaHRpbmdcclxuICAgICAgICAgIHRkLm9ubW91c2VvdmVyID0gZnVuY3Rpb24oaSwgaiwgdGFibGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHZhciB0ZHMgPSB0YWJsZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRkXCIpO1xyXG4gICAgICAgICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgdGRzLmxlbmd0aDsgbisrKSB7XHJcbiAgICAgICAgICAgICAgICB0ZHNbbl0uY2xhc3NOYW1lID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBvbmx5IGhpZ2hsaWdodCB1cCB0byB0aGUgcmVsZXZhbnQgY2VsbFxyXG4gICAgICAgICAgICAgICAgaWYgKCh0ZHNbbl0ucm93ID09PSBpICYmIHRkc1tuXS5jb2wgPD0gaikgfHwgKHRkc1tuXS5jb2wgPT09IGogJiYgdGRzW25dLnJvdyA8PSBpKSlcclxuICAgICAgICAgICAgICAgICAgdGRzW25dLmNsYXNzTmFtZSA9IFwiaGlnaGxpZ2h0XCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KGksIGosIHRhYmxlKTtcclxuXHJcbiAgICAgICAgICAvLyBtb3JlIGhpZ2hsaWdodGluZ1xyXG4gICAgICAgICAgdGQub25tb3VzZW91dCA9IGZ1bmN0aW9uKHRhYmxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICB2YXIgdGRzID0gdGFibGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0ZFwiKTtcclxuICAgICAgICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IHRkcy5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgICAgICAgICAgdGRzW25dLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KHRhYmxlKTtcclxuXHJcbiAgICAgICAgICAvLyBjaGVja2JveCBmb3IgY29sbGlzaW9uIHRvZ2dsaW5nXHJcbiAgICAgICAgICB2YXIgY2hlY2tib3ggPSBlbChcImlucHV0XCIsIHt0eXBlOiBcImNoZWNrYm94XCJ9KTtcclxuXHJcbiAgICAgICAgICBpZiAoX2VuZ2luZS5nZXRDb2xsaXNpb24oaSAtIDEsIGogLSAxKSlcclxuICAgICAgICAgICAgY2hlY2tib3guc2V0QXR0cmlidXRlKFwiY2hlY2tlZFwiLCBcImNoZWNrZWRcIik7XHJcblxyXG4gICAgICAgICAgY2hlY2tib3gub25jaGFuZ2UgPSBmdW5jdGlvbihpLCBqLCBjaGVja2JveCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgX2VuZ2luZS5zZXRDb2xsaXNpb24oaSAtIDEsIGogLSAxLCBjaGVja2JveC5jaGVja2VkID8gMSA6IDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KGksIGosIGNoZWNrYm94KTtcclxuXHJcbiAgICAgICAgICAvLyBjbGlja2luZyB0aGUgY2hlY2tib3gncyBjZWxsIHNob3VsZCB3b3JrIGFzIHdlbGxcclxuICAgICAgICAgIHRkLm9uY2xpY2sgPSBmdW5jdGlvbihjaGVja2JveCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgIGlmIChlLnRhcmdldCA9PT0gY2hlY2tib3gpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9ICFjaGVja2JveC5jaGVja2VkO1xyXG4gICAgICAgICAgICAgIGNoZWNrYm94Lm9uY2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9KGNoZWNrYm94KTtcclxuXHJcbiAgICAgICAgICB0ZC5hcHBlbmRDaGlsZChjaGVja2JveCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmaXggZm9yIGFsc28gaGlnaGxpZ2h0aW5nIGNlbGxzIHdpdGhvdXQgY2hlY2tib3hlc1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGQucm93ID0gaTtcclxuICAgICAgICAgIHRkLmNvbCA9IGo7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0ci5hcHBlbmRDaGlsZCh0ZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRhYmxlLmFwcGVuZENoaWxkKHRyKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGFibGU7XHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlQmVoYXZpb3I6IGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICAgIHJldHVybiBcIlRPRE9cIjtcclxuXHJcbiAgICB2YXIgbG9naWMgPSBlbChcInRleHRhcmVhXCIpO1xyXG4gICAgbG9naWMuaW5uZXJIVE1MID0gZW50aXR5LmJlaGF2aW9yc1swXS50b1N0cmluZygpO1xyXG5cclxuICAgIHJldHVybiBlbChcImRpdlwiLCBbXHJcbiAgICAgIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg1KSwgZWwoXCJiclwiKSxcclxuICAgICAgbG9naWMsXHJcbiAgICAgIGVsLnAoKSxcclxuICAgICAgVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDYpLCBlbChcImJyXCIpLFxyXG5cclxuICAgIF0pO1xyXG4gIH0sXHJcblxyXG4gIGJ1aWxkU2lkZWJhcjogZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gICAgdmFyIHNpZGViYXIgPSAkKFwiLnNpZGViYXIudWkgLmNvbnRlbnRcIik7XHJcblxyXG4gICAgc2lkZWJhci5odG1sKFwiXCIpO1xyXG5cclxuICAgIGlmIChlbnRpdHkgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwcm9wZXJ0aWVzID0gW1xyXG4gICAgICAvLyBJRFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoNyl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXRUZXh0XCIsIHZhbHVlOiBlbnRpdHkuaWQsIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtfZW5naW5lLmNoYW5nZUlkKGVudGl0eSwgdmFsKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIENvbGxpc2lvbiBncm91cFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoOCl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXROdW1iZXJcIiwgdmFsdWU6IGVudGl0eS5jb2xsaXNpb25Hcm91cCArIDEsIG1pbjogMSwgbWF4OiBfZW5naW5lLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtlbnRpdHkuc2V0Q29sbGlzaW9uR3JvdXAodmFsICogMSAtIDEpO319LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gTGF5ZXJcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIxKX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmxheWVyICsgMSwgbWluOiAxLCBtYXg6IF9lbmdpbmUuTEFZRVJTX05VTUJFUixcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7IF9lbmdpbmUuc2V0RW50aXR5TGF5ZXIoZW50aXR5LCB2YWwqMSAtIDEpOyB9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIFhcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDkpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF94KCksXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgICAgZW50aXR5LmJvZHkuU2V0VHJhbnNmb3JtKG5ldyBiMlZlYzIodmFsICogMSwgZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpKSwgZW50aXR5LmJvZHkuR2V0QW5nbGUoKSk7XHJcbiAgICAgICAgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBZXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxMCl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXROdW1iZXJcIiwgdmFsdWU6IGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3koKSxcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgICBlbnRpdHkuYm9keS5TZXRUcmFuc2Zvcm0obmV3IGIyVmVjMihlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF94KCksIHZhbCAqIDEpLCBlbnRpdHkuYm9keS5HZXRBbmdsZSgpKTtcclxuICAgICAgICB9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIFJvdGF0aW9uXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxMSl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXROdW1iZXJcIiwgdmFsdWU6IGVudGl0eS5ib2R5LkdldEFuZ2xlKCkgKiAxODAgLyBNYXRoLlBJLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtlbnRpdHkuYm9keS5TZXRUcmFuc2Zvcm0oZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKSwgKHZhbCAqIDEpICogTWF0aC5QSSAvIDE4MCk7fX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBGaXhlZCByb3RhdGlvblxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTIpfSxcclxuICAgICAgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IGVudGl0eS5maXhlZFJvdGF0aW9uLCBvbmNoYW5nZTogZnVuY3Rpb24odmFsKSB7IGVudGl0eS5kaXNhYmxlUm90YXRpb24odmFsKTsgfSB9LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gQ29sb3JcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDEzKX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dENvbG9yXCIsIHZhbHVlOiBlbnRpdHkuY29sb3IsIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtlbnRpdHkuY29sb3IgPSB2YWx9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIEJvZHkgdHlwZVxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTQpfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwic2VsZWN0XCIsIHNlbGVjdGVkOiBlbnRpdHkuYm9keS5HZXRUeXBlKCksIG9uY2hhbmdlOiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LmJvZHkuU2V0VHlwZSh2YWwgKiAxKX0sXHJcbiAgICAgICAgb3B0aW9uczogW1xyXG4gICAgICAgICAgeyB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTUpLCB2YWx1ZTogQm9keVR5cGUuRFlOQU1JQ19CT0RZIH0sXHJcbiAgICAgICAgICB7IHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgyMCksIHZhbHVlOiBCb2R5VHlwZS5LSU5FTUFUSUNfQk9EWSB9LFxyXG4gICAgICAgICAgeyB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTYpLCB2YWx1ZTogQm9keVR5cGUuU1RBVElDX0JPRFkgfSxcclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICB7IHR5cGU6IFwiYnV0dG9uXCIsIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgyMiksIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZihjb25maXJtKFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkKDIzKSkpXHJcbiAgICAgICAgICBfZW5naW5lLnJlbW92ZUVudGl0eShlbnRpdHkpO1xyXG4gICAgICB9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICBdO1xyXG5cclxuICAgIHNpZGViYXJbMF0uYXBwZW5kQ2hpbGQoVUlCdWlsZGVyLmJ1aWxkKHByb3BlcnRpZXMpKTtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJOyIsInZhciBVSUJ1aWxkZXIgPSB7XHJcbiAgcmFkaW86IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwicmFkaW9Hcm91cC1cIiArICQoXCIucmFkaW9Hcm91cFwiKS5sZW5ndGgsXHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJkaXYudWkucmFkaW9Hcm91cFwiLCB7aWQ6IHByb3BlcnRpZXMuaWR9KTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcImlucHV0W3R5cGU9cmFkaW9dXCIsIHRoaXMpLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmRpc2FibGUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoXCJpbnB1dFt0eXBlPXJhZGlvXVwiLCB0aGlzKS5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5lbmFibGUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICB2YXIgaWRDb3VudCA9ICQoXCJpbnB1dFt0eXBlPXJhZGlvXVwiKS5sZW5ndGg7XHJcblxyXG4gICAgcHJvcGVydGllcy5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgZWxlbWVudCA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgICAgaWQ6IFwicmFkaW8tXCIgKyBpZENvdW50KyssXHJcbiAgICAgICAgY2hlY2tlZDogZmFsc2UsXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24oKXt9XHJcbiAgICAgIH0sIGVsZW1lbnQpO1xyXG5cclxuICAgICAgdmFyIGlucHV0ID0gZWwoXCJpbnB1dC51aVwiLCB7dHlwZTogXCJyYWRpb1wiLCBpZDogZWxlbWVudC5pZCwgbmFtZTogcHJvcGVydGllcy5pZH0pO1xyXG4gICAgICB2YXIgbGFiZWwgPSBlbChcImxhYmVsLnVpLmJ1dHRvblwiLCB7Zm9yOiBlbGVtZW50LmlkfSwgW2VsZW1lbnQudGV4dF0pO1xyXG5cclxuICAgICAgaW5wdXQuZW5hYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICQoXCIrbGFiZWxcIiwgdGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlucHV0LmRpc2FibGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAkKFwiK2xhYmVsXCIsIHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBsYWJlbC5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmKCQodGhpcykuaGFzQ2xhc3MoXCJkaXNhYmxlZFwiKSlcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgZWxlbWVudC5vbmNsaWNrKCk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpbnB1dC5jaGVja2VkID0gZWxlbWVudC5jaGVja2VkO1xyXG5cclxuICAgICAgcmV0LmFwcGVuZENoaWxkKGlucHV0KTtcclxuICAgICAgcmV0LmFwcGVuZENoaWxkKGxhYmVsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuICBcclxuICBidXR0b246IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwiYnV0dG9uLVwiICsgJChcIi5idXR0b25cIikubGVuZ3RoLFxyXG4gICAgICBvbmNsaWNrOiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcInNwYW4udWkuYnV0dG9uXCIsIHsgaWQ6IHByb3BlcnRpZXMuaWQgfSwgW3Byb3BlcnRpZXMudGV4dF0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKClcclxuICAgIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKFwiZGlzYWJsZWRcIikpXHJcbiAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgcHJvcGVydGllcy5vbmNsaWNrKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgc2VsZWN0OiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcInNlbGVjdC1cIiArICQoXCJzZWxlY3RcIikubGVuZ3RoLFxyXG4gICAgICBzZWxlY3RlZDogXCJcIixcclxuICAgICAgb25jaGFuZ2U6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwic2VsZWN0LnVpXCIsIHsgaWQ6IHByb3BlcnRpZXMuaWQgfSk7XHJcblxyXG4gICAgcmV0Lm9uY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uY2hhbmdlKHRoaXMudmFsdWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZW5hYmxlO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcm9wZXJ0aWVzLm9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob3B0aW9uLCBpbmRleCkge1xyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQoZWwoXCJvcHRpb25cIiwge3ZhbHVlOiBvcHRpb24udmFsdWV9LCBbb3B0aW9uLnRleHRdKSk7XHJcblxyXG4gICAgICBpZiAob3B0aW9uLnZhbHVlID09IHByb3BlcnRpZXMuc2VsZWN0ZWQpXHJcbiAgICAgICAgcmV0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgYnJlYWs6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBlbChcInNwYW4udWkuYnJlYWtcIik7XHJcbiAgfSxcclxuXHJcbiAgaW5wdXRUZXh0OiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImlucHV0VGV4dC1cIiArICQoXCJpbnB1dFt0eXBlPXRleHRdXCIpLmxlbmd0aCxcclxuICAgICAgdmFsdWU6IFwiXCIsXHJcbiAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwiaW5wdXQudWlcIiwgeyB0eXBlOiBcInRleHRcIiwgaWQ6IHByb3BlcnRpZXMuaWQsIHZhbHVlOiBwcm9wZXJ0aWVzLnZhbHVlIH0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0Lm9uaW5wdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBpbnB1dE51bWJlcjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJpbnB1dE51bWJlci1cIiArICQoXCJpbnB1dFt0eXBlPW51bWJlcl1cIikubGVuZ3RoLFxyXG4gICAgICB2YWx1ZTogMCxcclxuICAgICAgbWluOiAtSW5maW5pdHksXHJcbiAgICAgIG1heDogSW5maW5pdHksXHJcbiAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwiaW5wdXQudWlcIiwgeyB0eXBlOiBcIm51bWJlclwiLCBpZDogcHJvcGVydGllcy5pZCwgdmFsdWU6IHByb3BlcnRpZXMudmFsdWUsIG1pbjogcHJvcGVydGllcy5taW4sIG1heDogcHJvcGVydGllcy5tYXggfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQub25pbnB1dCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBodG1sOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGNvbnRlbnQ6IFwiXCJcclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHJldHVybiBwcm9wZXJ0aWVzLmNvbnRlbnQ7XHJcbiAgfSxcclxuXHJcbiAgaW5wdXRDb2xvcjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJpbnB1dENvbG9yLVwiICsgJChcImlucHV0W3R5cGU9Y29sb3JdXCIpLmxlbmd0aCxcclxuICAgICAgdmFsdWU6IFwiIzAwMDAwMFwiLFxyXG4gICAgICBvbmlucHV0OiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJjb2xvclwiLCBpZDogcHJvcGVydGllcy5pZCwgdmFsdWU6IHByb3BlcnRpZXMudmFsdWUgfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQub25pbnB1dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcHJvcGVydGllcy5vbmlucHV0KHRoaXMudmFsdWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGNoZWNrYm94OiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImNoZWNrYm94LVwiICsgJChcImlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLmxlbmd0aCxcclxuICAgICAgY2hlY2tlZDogZmFsc2UsXHJcbiAgICAgIG9uY2hhbmdlOiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcInNwYW5cIik7XHJcbiAgICB2YXIgY2hlY2tib3ggPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBpZDogcHJvcGVydGllcy5pZCB9KTtcclxuICAgIHZhciBsYWJlbCA9IGVsKFwibGFiZWwudWkuYnV0dG9uXCIsIHsgZm9yOiBwcm9wZXJ0aWVzLmlkIH0pO1xyXG5cclxuICAgIHJldC5hcHBlbmRDaGlsZChjaGVja2JveCk7XHJcbiAgICByZXQuYXBwZW5kQ2hpbGQobGFiZWwpO1xyXG5cclxuICAgIGNoZWNrYm94LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoXCIrbGFiZWxcIiwgdGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIGNoZWNrYm94LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIGNoZWNrYm94LmNoZWNrZWQgPSBwcm9wZXJ0aWVzLmNoZWNrZWQ7XHJcblxyXG4gICAgY2hlY2tib3gub25jaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25jaGFuZ2UodGhpcy5jaGVja2VkKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBidWlsZDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHZhciByZXQgPSBlbC5kaXYoKTtcclxuXHJcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgdmFyIGdlbmVyYXRlZDtcclxuICAgICAgXHJcbiAgICAgIHN3aXRjaCAoZWxlbWVudC50eXBlKSB7XHJcbiAgICAgICAgY2FzZSBcInJhZGlvXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLnJhZGlvKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJidXR0b25cIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuYnV0dG9uKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJzZWxlY3RcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuc2VsZWN0KGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJpbnB1dFRleHRcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuaW5wdXRUZXh0KGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJpbnB1dE51bWJlclwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5pbnB1dE51bWJlcihlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiaW5wdXRDb2xvclwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5pbnB1dENvbG9yKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJjaGVja2JveFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5jaGVja2JveChlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiaHRtbFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5odG1sKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJicmVha1wiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5icmVhaygpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChnZW5lcmF0ZWQpO1xyXG4gICAgfSwgdGhpcyk7XHJcbiAgICBcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuICBcclxuICBidWlsZExheW91dDogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY29udGVudCA9IGVsKFwiZGl2LnVpLmNvbnRlbnQucGFuZWxcIik7XHJcbiAgICB2YXIgc2lkZWJhciA9IGVsKFwiZGl2LnVpLnNpZGViYXIucGFuZWxcIiwge30sIFsgZWwoXCJkaXYuY29udGVudFwiKSBdKTtcclxuICAgIHZhciByZXNpemVyID0gZWwoXCJkaXYudWkucmVzaXplclwiKTtcclxuICAgIHZhciB0b29sYmFyID0gZWwoXCJkaXYudWkudG9vbGJhclwiKTtcclxuXHJcbiAgICB2YXIgdyA9ICQoXCJib2R5XCIpLm91dGVyV2lkdGgoKTtcclxuICAgIHZhciBzaWRlYmFyV2lkdGggPSAyNTA7XHJcblxyXG4gICAgY29udGVudC5zdHlsZS53aWR0aCA9IHcgLSAyNTAgKyBcInB4XCI7XHJcbiAgICBzaWRlYmFyLnN0eWxlLndpZHRoID0gc2lkZWJhcldpZHRoICsgXCJweFwiO1xyXG5cclxuICAgIHZhciBzaWRlYmFyUmVzaXplRXZlbnQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB2YXIgd2luZG93V2lkdGggPSAkKFwiYm9keVwiKS5vdXRlcldpZHRoKCk7XHJcbiAgICAgIHZhciBzaWRlYmFyV2lkdGggPSBNYXRoLm1heCgzMCwgTWF0aC5taW4od2luZG93V2lkdGggKiAwLjYsIHdpbmRvd1dpZHRoIC0gZS5jbGllbnRYKSk7XHJcbiAgICAgIHZhciBjb250ZW50V2lkdGggPSB3aW5kb3dXaWR0aCAtIHNpZGViYXJXaWR0aDtcclxuXHJcbiAgICAgIHNpZGViYXIuc3R5bGUud2lkdGggPSBzaWRlYmFyV2lkdGggKyBcInB4XCI7XHJcbiAgICAgIGNvbnRlbnQuc3R5bGUud2lkdGggPSBjb250ZW50V2lkdGggKyBcInB4XCI7XHJcblxyXG4gICAgICB3aW5kb3cub25yZXNpemUoKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIG1vdXNlVXBFdmVudCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHNpZGViYXIucmVzaXppbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICQoXCIucmVzaXplci51aVwiKS5yZW1vdmVDbGFzcyhcInJlc2l6aW5nXCIpO1xyXG5cclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2lkZWJhclJlc2l6ZUV2ZW50KTtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG1vdXNlVXBFdmVudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciB3aW5kb3dSZXNpemVFdmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHdpbmRvd1dpZHRoID0gJChcImJvZHlcIikub3V0ZXJXaWR0aCgpO1xyXG4gICAgICB2YXIgY29udGVudFdpZHRoID0gTWF0aC5tYXgod2luZG93V2lkdGggKiAwLjQsIE1hdGgubWluKFxyXG4gICAgICAgIHdpbmRvd1dpZHRoIC0gMzAsXHJcbiAgICAgICAgd2luZG93V2lkdGggLSAkKFwiLnNpZGViYXIudWlcIikub3V0ZXJXaWR0aCgpXHJcbiAgICAgICkpO1xyXG4gICAgICB2YXIgc2lkZWJhcldpZHRoID0gd2luZG93V2lkdGggLSBjb250ZW50V2lkdGg7XHJcblxyXG4gICAgICBzaWRlYmFyLnN0eWxlLndpZHRoID0gc2lkZWJhcldpZHRoICsgXCJweFwiO1xyXG4gICAgICBjb250ZW50LnN0eWxlLndpZHRoID0gY29udGVudFdpZHRoICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2l6ZXIub25tb3VzZWRvd24gPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBzaWRlYmFyLnJlc2l6aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJyZXNpemluZ1wiKTtcclxuXHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHNpZGViYXJSZXNpemVFdmVudCk7XHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBtb3VzZVVwRXZlbnQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB3aW5kb3dSZXNpemVFdmVudCk7XHJcblxyXG4gICAgY29udGVudC5hcHBlbmRDaGlsZCh0b29sYmFyKTtcclxuICAgIHNpZGViYXIuYXBwZW5kQ2hpbGQocmVzaXplcik7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRlbnQpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzaWRlYmFyKTtcclxuICB9LFxyXG5cclxuICAvLyBDcmVhdGluZyBhIHBvcHVwIG1lc3NhZ2VcclxuICBwb3B1cDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgdmFyIG92ZXJsYXkgPSBlbChcImRpdiNwb3B1cE92ZXJsYXlcIiwgW2VsKFwiZGl2I3BvcHVwQ29udGVudFwiLCBbZGF0YV0pXSk7XHJcbiAgICBvdmVybGF5Lm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIFVJQnVpbGRlci5jbG9zZVBvcHVwKGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZShvdmVybGF5LCBkb2N1bWVudC5ib2R5LmZpcnN0Q2hpbGQpO1xyXG5cclxuICAgIFRyYW5zbGF0aW9ucy5yZWZyZXNoKCk7XHJcbiAgfSxcclxuXHJcbiAgLy8gQ2xvc2luZyBhIHBvcHVwIG1lc3NhZ2VcclxuICBjbG9zZVBvcHVwOiBmdW5jdGlvbihlKSB7XHJcbiAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9wdXBPdmVybGF5XCIpO1xyXG4gICAgdmFyIGNvbnRlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBvcHVwQ29udGVudFwiKTtcclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgaXQgd2FzIHRoZSBvdmVybGF5IHRoYXQgd2FzIGNsaWNrZWQsIG5vdCBhbiBlbGVtZW50IGFib3ZlIGl0XHJcbiAgICBpZiAodHlwZW9mIGUgIT09IFwidW5kZWZpbmVkXCIgJiYgZS50YXJnZXQgIT09IG92ZXJsYXkpXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIGNvbnRlbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjb250ZW50KTtcclxuICAgIG92ZXJsYXkucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvdmVybGF5KTtcclxuICB9LFxyXG5cclxuXHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSUJ1aWxkZXI7IiwiLy8gT2JqZWN0IGNvbnRhaW5pbmcgdXNlZnVsIG1ldGhvZHNcclxudmFyIFV0aWxzID0ge1xyXG4gIGdldEJyb3dzZXJXaWR0aDogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJChcIi51aS5jb250ZW50XCIpLm91dGVyV2lkdGgoKTsvL3dpbmRvdy5pbm5lcldpZHRoO1xyXG4gIH0sXHJcblxyXG4gIGdldEJyb3dzZXJIZWlnaHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICQoXCIudWkuY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gJChcIi51aS50b29sYmFyXCIpLm91dGVySGVpZ2h0KCk7Ly93aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgfSxcclxuXHJcbiAgcmFuZG9tUmFuZ2U6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pO1xyXG4gIH0sXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7IiwidmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHMuanNcIik7XHJcblxyXG4vLyBWSUVXUE9SVFxyXG4vLyBUaGlzIGlzIGJhc2ljYWxseSBjYW1lcmEgKyBwcm9qZWN0b3JcclxuXHJcbnZhciBWaWV3cG9ydCA9IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIHgsIHkpIHtcclxuICAvLyBDYW52YXMgZGltZW5zaW9uc1xyXG4gIGlmICh3aWR0aCAhPSB1bmRlZmluZWQgJiYgaGVpZ2h0ICE9IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5zZXRBdXRvUmVzaXplKGZhbHNlKTtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnNldEF1dG9SZXNpemUodHJ1ZSk7XHJcbiAgICB0aGlzLmF1dG9SZXNpemUoKTtcclxuICB9XHJcblxyXG4gIC8vIENlbnRlciBwb2ludCBvZiB0aGUgY2FtZXJhXHJcbiAgaWYgKHggIT09IHVuZGVmaW5lZCAmJiB5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnggPSBNYXRoLmZsb29yKHRoaXMud2lkdGggLyAyKTtcclxuICAgIHRoaXMueSA9IE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyAyKTtcclxuICB9XHJcblxyXG4gIC8vIENhbnZhcyBlbGVtZW50XHJcbiAgdGhpcy5jYW52YXNFbGVtZW50ID0gY2FudmFzRWxlbWVudDtcclxuXHJcbiAgaWYgKGNhbnZhc0VsZW1lbnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5jYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXNFbGVtZW50KTtcclxuICB9XHJcblxyXG4gIHRoaXMucmVzZXRFbGVtZW50KCk7IC8vIFJlc2l6ZSB0byBuZXcgZGltZW5zaW9uc1xyXG5cclxuICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG59O1xyXG5cclxuLy8gUmVsb2FkcyB2YWx1ZXMgZm9yIHRoZSBjYW52YXMgZWxlbWVudFxyXG5WaWV3cG9ydC5wcm90b3R5cGUucmVzZXRFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5jYW52YXNFbGVtZW50LndpZHRoID0gdGhpcy53aWR0aDtcclxuICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbn1cclxuXHJcbi8vIEF1dG9tYXRpY2FsbHkgcmVzaXplcyB0aGUgdmlld3BvcnQgdG8gZmlsbCB0aGUgc2NyZWVuXHJcblZpZXdwb3J0LnByb3RvdHlwZS5hdXRvUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy53aWR0aCA9IFV0aWxzLmdldEJyb3dzZXJXaWR0aCgpO1xyXG4gIHRoaXMuaGVpZ2h0ID0gVXRpbHMuZ2V0QnJvd3NlckhlaWdodCgpO1xyXG4gIHRoaXMueCA9IE1hdGguZmxvb3IodGhpcy53aWR0aCAvIDIpO1xyXG4gIHRoaXMueSA9IE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyAyKTtcclxufTtcclxuXHJcbi8vIFRvZ2dsZXMgdmlld3BvcnQgYXV0byByZXNpemluZ1xyXG5WaWV3cG9ydC5wcm90b3R5cGUuc2V0QXV0b1Jlc2l6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblxyXG4gIHRoaXMuYXV0b1Jlc2l6ZUFjdGl2ZSA9IHZhbHVlO1xyXG5cclxuICBpZiAodGhpcy5hdXRvUmVzaXplQWN0aXZlKSB7XHJcbiAgICB2YXIgdCA9IHRoaXM7XHJcbiAgICB3aW5kb3cub25yZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdC5hdXRvUmVzaXplKCk7XHJcbiAgICAgIHQucmVzZXRFbGVtZW50KCk7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHdpbmRvdy5vbnJlc2l6ZSA9IG51bGw7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWV3cG9ydDsiXX0=
