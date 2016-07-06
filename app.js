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
  this.entities = [];
  this.selectedEntity = null;
  
  this.COLLISION_GROUPS_NUMBER = 16;

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


// Returns the entity with id specified by argument
Engine.prototype.getEntityById = function(id) {
  for (var i = 0; i < this.entities.length; i++) {
    if (this.entities[i].id === id)
      return this.entities[i];
  }

  return null;
};

// Returns an array of entities with specified collisionGroup
Engine.prototype.getEntitiesByCollisionGroup = function(group) {
  var ret = [];

  for (var i = 0; i < this.entities.length; i++) {
    if (this.entities[i].collisionGroup === group)
      ret.push(this.entities[i]);
  }

  return ret;
}

// Adding an entity to the world
Engine.prototype.addEntity = function(entity, type) {
  // generate auto id
  if (entity.id === undefined) {
    entity.id = AUTO_ID_PREFIX + this.lifetimeEntities;
  }

  entity.engine = this;

  this.lifetimeEntities++;

  entity.body.set_type(type);

  entity.body = this.world.CreateBody(entity.body);
  entity.fixture = entity.body.CreateFixture(entity.fixture);
  this.entities.push(entity);

  return entity;
}

// Checks whether two groups should collide
Engine.prototype.getCollision = function(groupA, groupB) {
  return (this.collisionGroups[groupA].mask >> groupB) & 1;
}

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
Engine.prototype.selectEntity = function (index) {
  this.selectedEntity = index === null ? null : this.entities[index];
  UI.buildSidebar(this.selectedEntity);
}

// Updates collision masks for all entities, based on engine's collisionGroups table
Engine.prototype.updateCollisions = function() {

  for (var i = 0; i < this.entities.length; i++) {
    this.updateCollision(this.entities[i]);
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
  for (var i = this.entities.length - 1; i >= 0; i--) {
    ctx.save();
    ctx.translate(this.viewport.x - this.viewport.width / 2, this.viewport.y - this.viewport.height / 2);
    ctx.fillStyle = this.entities[i].color;

    if(this.selectedEntity == this.entities[i]) {
      ctx.shadowColor = "black";
      ctx.shadowBlur = 10;
    }

    var x = this.entities[i].body.GetPosition().get_x();
    var y = this.entities[i].body.GetPosition().get_y();
    ctx.translate(x, y);
    ctx.rotate(this.entities[i].body.GetAngle());

    this.entities[i].draw(ctx);

    ctx.restore();

    for (var j = 0; j < this.entities[i].behaviors.length; j++) {
      var behavior = this.entities[i].behaviors[j];

      if (behavior.check(this.entities[i]))
        behavior.result();
    }
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
}


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
}

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
  for (var i = 0; i < _engine.entities.length; i++) {
    if (this.decide(_engine.entities[i]))
      ret.push(_engine.entities[i]);
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

    for (var i = _engine.entities.length - 1; i >= 0; i--) {
      if (_engine.entities[i].fixture.TestPoint(
          new b2Vec2(_engine.viewport.x - _engine.viewport.width / 2 + window.Input.mouse.x, _engine.viewport.y - _engine.viewport.height / 2  + window.Input.mouse.y))
      ) {
        _engine.selectEntity(i);
      }
    }
  },
  onrelease: function () {},
  onmove: function () {}
};


var Rectangle = {
  origin: null,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [window.Input.mouse.x, window.Input.mouse.y];
  },

  onrelease: function () {
    var w = window.Input.mouse.x - this.origin[0];
    var h = window.Input.mouse.y - this.origin[1];

    _engine.addEntity(new Shape.Rectangle(
      new b2Vec2(this.origin[0] + w / 2, this.origin[1] + h / 2),
      new b2Vec2(w / 2, h / 2)), Type.DYNAMIC_BODY);

    this.onmove = function(){};
    this.origin = null;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(this.origin[0], this.origin[1], window.Input.mouse.x - this.origin[0], window.Input.mouse.y - this.origin[1]);
    ctx.restore();
  }
};


var Circle = {
  origin: null,
  radius: 0,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [window.Input.mouse.x, window.Input.mouse.y];
  },

  onrelease: function () {
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

    properties.options.forEach(function (option) {
      ret.appendChild(el("option", {value: option.value}, [option.text]));
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
    var overlay = el("div#popupOverlay", [el("div#popupContent", [el("div.w2ui-centered", [data])])]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1VzZXJzL0pha3ViIE1hdHXFoWthL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2FjdGlvbnMuanMiLCJqcy9iZWhhdmlvci5qcyIsImpzL2JvZHl0eXBlLmpzIiwianMvZW5naW5lLmpzIiwianMvZW50aXR5LmpzIiwianMvZW50aXR5ZmlsdGVycy5qcyIsImpzL2VudHJ5LmpzIiwianMvaW5wdXQuanMiLCJqcy9sb2dpYy5qcyIsImpzL3NoYXBlcy5qcyIsImpzL3Rva2VuLmpzIiwianMvdG9vbHMuanMiLCJqcy90eXBpbmcuanMiLCJqcy91aS5qcyIsImpzL3VpYnVpbGRlci5qcyIsImpzL3V0aWxzLmpzIiwianMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEJlaGF2aW9yID0gcmVxdWlyZShcIi4vYmVoYXZpb3IuanNcIik7XHJcbnZhciBBY3Rpb24gPSByZXF1aXJlKFwiLi90b2tlbi5qc1wiKS5BY3Rpb247XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XHJcblxyXG52YXIgYVNldENvbG9yID0gZnVuY3Rpb24oZWYsIGNvbG9yKSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJzZXRDb2xvclwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5TVFJJTkddKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKGNvbG9yKTtcclxufVxyXG5hU2V0Q29sb3IucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5hU2V0Q29sb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYVNldENvbG9yO1xyXG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihhU2V0Q29sb3IpO1xyXG5cclxuYVNldENvbG9yLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LnNldENvbG9yKHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcclxufVxyXG5cclxudmFyIGFUb3JxdWUgPSBmdW5jdGlvbihlZiwgc3RyZW5ndGgpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5VG9ycXVlXCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goc3RyZW5ndGgpO1xyXG59XHJcbmFUb3JxdWUucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5hVG9ycXVlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFUb3JxdWU7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGFUb3JxdWUpO1xyXG5cclxuYVRvcnF1ZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5ib2R5LkFwcGx5VG9ycXVlKGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XHJcbn1cclxuXHJcbnZhciBhQW5ndWxhckltcHVsc2UgPSBmdW5jdGlvbihlZiwgc3RyZW5ndGgpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5QW5ndWxhckltcHVsc2VcIiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaChzdHJlbmd0aCk7XHJcbn1cclxuYUFuZ3VsYXJJbXB1bHNlLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuYUFuZ3VsYXJJbXB1bHNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFBbmd1bGFySW1wdWxzZTtcclxuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4oYUFuZ3VsYXJJbXB1bHNlKTtcclxuXHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5ib2R5LkFwcGx5QW5ndWxhckltcHVsc2UoZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcclxufVxyXG5cclxudmFyIGFMaW5lYXJWZWxvY2l0eSA9IGZ1bmN0aW9uKGVmLCB4LCB5KSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJzZXRMaW5lYXJWZWxvY2l0eVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaCh4KTtcclxuICB0aGlzLmFyZ3MucHVzaCh5KTtcclxufVxyXG5hTGluZWFyVmVsb2NpdHkucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5hTGluZWFyVmVsb2NpdHkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYUxpbmVhclZlbG9jaXR5O1xyXG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihhTGluZWFyVmVsb2NpdHkpO1xyXG5cclxuYUxpbmVhclZlbG9jaXR5LnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LnNldExpbmVhclZlbG9jaXR5KG5ldyBiMlZlYzIodGhpcy5hcmdzWzFdLmV2YWx1YXRlKCksIHRoaXMuYXJnc1syXS5ldmFsdWF0ZSgpKSk7XHJcbn1cclxuXHJcbnZhciBhTGluZWFySW1wdWxzZSA9IGZ1bmN0aW9uKGVmLCB4LCB5KSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJhcHBseUxpbmVhckltcHVsc2VcIiwgZWYsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHgpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHkpO1xyXG59XHJcbmFMaW5lYXJJbXB1bHNlLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuYUxpbmVhckltcHVsc2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYUxpbmVhckltcHVsc2U7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGFMaW5lYXJJbXB1bHNlKTtcclxuXHJcbmFMaW5lYXJJbXB1bHNlLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LmFwcGx5TGluZWFySW1wdWxzZShuZXcgYjJWZWMyKGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSwgZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1syXS5ldmFsdWF0ZSgpKSk7XHJcbn1cclxuIiwidmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcblxudmFyIEJlaGF2aW9yID0gZnVuY3Rpb24obG9naWMsIHJlc3VsdHMpIHtcbiAgdGhpcy5sb2dpYyA9IGxvZ2ljO1xuXG4gIGlmICh0aGlzLmxvZ2ljLnR5cGUgIT09IFR5cGUuQk9PTEVBTilcbiAgICB0aHJvdyBuZXcgVHlwZUV4Y2VwdGlvbihUeXBlLkJPT0xFQU4sIHRoaXMubG9naWMudHlwZSwgdGhpcyk7XG5cbiAgdGhpcy5yZXN1bHRzID0gQXJyYXkuaXNBcnJheShyZXN1bHRzKSA/IHJlc3VsdHMgOiBbcmVzdWx0c107XG59O1xuXG53aW5kb3cudG9rZW5zID0ge307XG5cbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgdmFyIHQgPSBuZXcgdG9rZW4oKTtcbiAgd2luZG93LnRva2Vuc1t0Lm5hbWVdID0gdDtcbn07XG5cblxuQmVoYXZpb3IucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gIHJldHVybiB0aGlzLmxvZ2ljLmV2YWx1YXRlKGVudGl0eSk7XG59O1xuXG5CZWhhdmlvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIFwiQmVoYXZpb3IoXCIgKyB0aGlzLmxvZ2ljLnRvU3RyaW5nKCkgKyBcIiwgXCIgKyB0aGlzLnJlc3VsdHMudG9TdHJpbmcoKSArIFwiKVwiO1xufTtcblxuQmVoYXZpb3IucHJvdG90eXBlLnJlc3VsdCA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMucmVzdWx0c1tpXS5leGVjdXRlKClcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCZWhhdmlvcjtcblxucmVxdWlyZShcIi4vbG9naWMuanNcIik7XG5yZXF1aXJlKFwiLi9hY3Rpb25zLmpzXCIpO1xucmVxdWlyZShcIi4vZW50aXR5ZmlsdGVycy5qc1wiKTsiLCJ2YXIgQm9keVR5cGUgPSB7XHJcbiAgRFlOQU1JQ19CT0RZOiBNb2R1bGUuYjJfZHluYW1pY0JvZHksXHJcbiAgU1RBVElDX0JPRFk6IE1vZHVsZS5iMl9zdGF0aWNCb2R5LFxyXG4gIEtJTkVNQVRJQ19CT0RZOiBNb2R1bGUuYjJfa2luZW1hdGljQm9keVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCb2R5VHlwZTsiLCJ2YXIgVUkgPSByZXF1aXJlKFwiLi91aS5qc1wiKTtcclxudmFyIFRvb2xzID0gcmVxdWlyZShcIi4vdG9vbHMuanNcIik7XHJcblxyXG5cclxuY29uc3QgQVVUT19JRF9QUkVGSVggPSBcIkVOVElUWV9OVU1CRVJfXCI7XHJcblxyXG5jb25zdCBESVNQTEFZX1JBVElPID0gMjA7XHJcblxyXG4vKi8gTXlzbGllbmt5XHJcblxyXG5sb2Nrb3ZhbmllIGthbWVyeSBuYSBvYmpla3RcclxuICogcHJlY2hvZHlcclxuYWtvIGZ1bmd1amUgY2VsYSBrYW1lcmE/XHJcblxyXG4vKi9cclxuXHJcblxyXG4vLyBFTkdJTkVcclxuXHJcbi8vIGNvbnN0cnVjdG9yXHJcblxyXG52YXIgRW5naW5lID0gZnVuY3Rpb24odmlld3BvcnQsIGdyYXZpdHkpIHtcclxuICB0aGlzLnZpZXdwb3J0ID0gdmlld3BvcnQ7XHJcbiAgdGhpcy5lbnRpdGllcyA9IFtdO1xyXG4gIHRoaXMuc2VsZWN0ZWRFbnRpdHkgPSBudWxsO1xyXG4gIFxyXG4gIHRoaXMuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgPSAxNjtcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25Hcm91cHMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuQ09MTElTSU9OX0dST1VQU19OVU1CRVI7IGkrKykge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHMucHVzaCh7XHJcbiAgICAgIFwibmFtZVwiOiBpICsgMSxcclxuICAgICAgXCJtYXNrXCI6IHBhcnNlSW50KEFycmF5KHRoaXMuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgKyAxKS5qb2luKFwiMVwiKSwgMilcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5saWZldGltZUVudGl0aWVzID0gMDtcclxuXHJcbiAgdGhpcy53b3JsZCA9IG5ldyBiMldvcmxkKGdyYXZpdHksIHRydWUpO1xyXG4gIHRoaXMud29ybGQucGF1c2VkID0gdHJ1ZTtcclxuXHJcbiAgd2luZG93LklucHV0LmluaXRpYWxpemUodmlld3BvcnQuY2FudmFzRWxlbWVudCk7XHJcbn07XHJcblxyXG4vLyBDaGFuZ2VzIHJ1bm5pbmcgc3RhdGUgb2YgdGhlIHNpbXVsYXRpb25cclxuRW5naW5lLnByb3RvdHlwZS50b2dnbGVQYXVzZSA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLndvcmxkLnBhdXNlZCA9ICF0aGlzLndvcmxkLnBhdXNlZDtcclxuICB0aGlzLnNlbGVjdGVkRW50aXR5ID0gbnVsbDtcclxuXHJcbiAgd2luZG93LklucHV0LnRvb2wgPSBUb29scy5CbGFuaztcclxuXHJcbiAgaWYodGhpcy53b3JsZC5wYXVzZWQpXHJcbiAgICB3aW5kb3cuSW5wdXQudG9vbCA9IFRvb2xzLlNlbGVjdGlvbjtcclxufTtcclxuXHJcblxyXG4vLyBSZXR1cm5zIHRoZSBlbnRpdHkgd2l0aCBpZCBzcGVjaWZpZWQgYnkgYXJndW1lbnRcclxuRW5naW5lLnByb3RvdHlwZS5nZXRFbnRpdHlCeUlkID0gZnVuY3Rpb24oaWQpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmICh0aGlzLmVudGl0aWVzW2ldLmlkID09PSBpZClcclxuICAgICAgcmV0dXJuIHRoaXMuZW50aXRpZXNbaV07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbi8vIFJldHVybnMgYW4gYXJyYXkgb2YgZW50aXRpZXMgd2l0aCBzcGVjaWZpZWQgY29sbGlzaW9uR3JvdXBcclxuRW5naW5lLnByb3RvdHlwZS5nZXRFbnRpdGllc0J5Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gIHZhciByZXQgPSBbXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAodGhpcy5lbnRpdGllc1tpXS5jb2xsaXNpb25Hcm91cCA9PT0gZ3JvdXApXHJcbiAgICAgIHJldC5wdXNoKHRoaXMuZW50aXRpZXNbaV0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJldDtcclxufVxyXG5cclxuLy8gQWRkaW5nIGFuIGVudGl0eSB0byB0aGUgd29ybGRcclxuRW5naW5lLnByb3RvdHlwZS5hZGRFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHksIHR5cGUpIHtcclxuICAvLyBnZW5lcmF0ZSBhdXRvIGlkXHJcbiAgaWYgKGVudGl0eS5pZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICBlbnRpdHkuaWQgPSBBVVRPX0lEX1BSRUZJWCArIHRoaXMubGlmZXRpbWVFbnRpdGllcztcclxuICB9XHJcblxyXG4gIGVudGl0eS5lbmdpbmUgPSB0aGlzO1xyXG5cclxuICB0aGlzLmxpZmV0aW1lRW50aXRpZXMrKztcclxuXHJcbiAgZW50aXR5LmJvZHkuc2V0X3R5cGUodHlwZSk7XHJcblxyXG4gIGVudGl0eS5ib2R5ID0gdGhpcy53b3JsZC5DcmVhdGVCb2R5KGVudGl0eS5ib2R5KTtcclxuICBlbnRpdHkuZml4dHVyZSA9IGVudGl0eS5ib2R5LkNyZWF0ZUZpeHR1cmUoZW50aXR5LmZpeHR1cmUpO1xyXG4gIHRoaXMuZW50aXRpZXMucHVzaChlbnRpdHkpO1xyXG5cclxuICByZXR1cm4gZW50aXR5O1xyXG59XHJcblxyXG4vLyBDaGVja3Mgd2hldGhlciB0d28gZ3JvdXBzIHNob3VsZCBjb2xsaWRlXHJcbkVuZ2luZS5wcm90b3R5cGUuZ2V0Q29sbGlzaW9uID0gZnVuY3Rpb24oZ3JvdXBBLCBncm91cEIpIHtcclxuICByZXR1cm4gKHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayA+PiBncm91cEIpICYgMTtcclxufVxyXG5cclxuLy8gU2V0cyB0d28gZ3JvdXBzIHVwIHRvIGNvbGxpZGVcclxuRW5naW5lLnByb3RvdHlwZS5zZXRDb2xsaXNpb24gPSBmdW5jdGlvbihncm91cEEsIGdyb3VwQiwgdmFsdWUpIHtcclxuICB2YXIgbWFza0EgPSAoMSA8PCBncm91cEIpO1xyXG4gIHZhciBtYXNrQiA9ICgxIDw8IGdyb3VwQSk7XHJcblxyXG4gIGlmICh2YWx1ZSkge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrIHwgbWFza0E7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgPSB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgfCBtYXNrQjtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrICYgfm1hc2tBO1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrICYgfm1hc2tCO1xyXG4gIH1cclxuICB0aGlzLnVwZGF0ZUNvbGxpc2lvbnMoKVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuLy8gQ2hhbmdlcyB0aGUgSUQgb2YgYW4gZW50aXR5XHJcbkVuZ2luZS5wcm90b3R5cGUuY2hhbmdlSWQgPSBmdW5jdGlvbiAoZW50aXR5LCBpZCkge1xyXG4gIGVudGl0eS5pZCA9IGlkO1xyXG59O1xyXG5cclxuLy8gU2VsZWN0cyBhbiBlbnRpdHkgYW5kIHNob3dzIGl0cyBwcm9wZXJ0aWVzIGluIHRoZSBzaWRlYmFyXHJcbkVuZ2luZS5wcm90b3R5cGUuc2VsZWN0RW50aXR5ID0gZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgdGhpcy5zZWxlY3RlZEVudGl0eSA9IGluZGV4ID09PSBudWxsID8gbnVsbCA6IHRoaXMuZW50aXRpZXNbaW5kZXhdO1xyXG4gIFVJLmJ1aWxkU2lkZWJhcih0aGlzLnNlbGVjdGVkRW50aXR5KTtcclxufVxyXG5cclxuLy8gVXBkYXRlcyBjb2xsaXNpb24gbWFza3MgZm9yIGFsbCBlbnRpdGllcywgYmFzZWQgb24gZW5naW5lJ3MgY29sbGlzaW9uR3JvdXBzIHRhYmxlXHJcbkVuZ2luZS5wcm90b3R5cGUudXBkYXRlQ29sbGlzaW9ucyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHRoaXMudXBkYXRlQ29sbGlzaW9uKHRoaXMuZW50aXRpZXNbaV0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vLyBVcGRhdGVzIGNvbGxpc2lvbiBtYXNrIGZvciBhbiBlbnRpdHksIGJhc2VkIG9uIGVuZ2luZSdzIGNvbGxpc2lvbkdyb3VwcyB0YWJsZVxyXG5FbmdpbmUucHJvdG90eXBlLnVwZGF0ZUNvbGxpc2lvbiA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHZhciBmaWx0ZXJEYXRhID0gZW50aXR5LmZpeHR1cmUuR2V0RmlsdGVyRGF0YSgpO1xyXG4gIGZpbHRlckRhdGEuc2V0X21hc2tCaXRzKHRoaXMuY29sbGlzaW9uR3JvdXBzW2VudGl0eS5jb2xsaXNpb25Hcm91cF0ubWFzayk7XHJcbiAgZW50aXR5LmZpeHR1cmUuU2V0RmlsdGVyRGF0YShmaWx0ZXJEYXRhKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbi8vIE9uZSBzaW11bGF0aW9uIHN0ZXAuIFNpbXVsYXRpb24gbG9naWMgaGFwcGVucyBoZXJlLlxyXG5FbmdpbmUucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpIHtcclxuICAvLyBGUFMgdGltZXJcclxuICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpO1xyXG5cclxuICBjdHggPSB0aGlzLnZpZXdwb3J0LmNvbnRleHQ7XHJcblxyXG4gIC8vIGNsZWFyIHNjcmVlblxyXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy52aWV3cG9ydC53aWR0aCwgdGhpcy52aWV3cG9ydC5oZWlnaHQpO1xyXG5cclxuICBjdHguc2F2ZSgpO1xyXG5cclxuICAvLyBkcmF3IGFsbCBlbnRpdGllc1xyXG4gIGZvciAodmFyIGkgPSB0aGlzLmVudGl0aWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LnRyYW5zbGF0ZSh0aGlzLnZpZXdwb3J0LnggLSB0aGlzLnZpZXdwb3J0LndpZHRoIC8gMiwgdGhpcy52aWV3cG9ydC55IC0gdGhpcy52aWV3cG9ydC5oZWlnaHQgLyAyKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmVudGl0aWVzW2ldLmNvbG9yO1xyXG5cclxuICAgIGlmKHRoaXMuc2VsZWN0ZWRFbnRpdHkgPT0gdGhpcy5lbnRpdGllc1tpXSkge1xyXG4gICAgICBjdHguc2hhZG93Q29sb3IgPSBcImJsYWNrXCI7XHJcbiAgICAgIGN0eC5zaGFkb3dCbHVyID0gMTA7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHggPSB0aGlzLmVudGl0aWVzW2ldLmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpO1xyXG4gICAgdmFyIHkgPSB0aGlzLmVudGl0aWVzW2ldLmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpO1xyXG4gICAgY3R4LnRyYW5zbGF0ZSh4LCB5KTtcclxuICAgIGN0eC5yb3RhdGUodGhpcy5lbnRpdGllc1tpXS5ib2R5LkdldEFuZ2xlKCkpO1xyXG5cclxuICAgIHRoaXMuZW50aXRpZXNbaV0uZHJhdyhjdHgpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmVudGl0aWVzW2ldLmJlaGF2aW9ycy5sZW5ndGg7IGorKykge1xyXG4gICAgICB2YXIgYmVoYXZpb3IgPSB0aGlzLmVudGl0aWVzW2ldLmJlaGF2aW9yc1tqXTtcclxuXHJcbiAgICAgIGlmIChiZWhhdmlvci5jaGVjayh0aGlzLmVudGl0aWVzW2ldKSlcclxuICAgICAgICBiZWhhdmlvci5yZXN1bHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICghX2VuZ2luZS53b3JsZC5wYXVzZWQpIHtcclxuICAgIC8vIGJveDJkIHNpbXVsYXRpb24gc3RlcFxyXG4gICAgdGhpcy53b3JsZC5TdGVwKDEgLyA2MCwgMTAsIDUpO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHdpbmRvdy5JbnB1dC50b29sLm9ubW92ZShjdHgpO1xyXG4gIH1cclxuICBcclxuXHJcbiAgLy8gUmVsZWFzZWQga2V5cyBhcmUgb25seSB0byBiZSBwcm9jZXNzZWQgb25jZVxyXG4gIHdpbmRvdy5JbnB1dC5tb3VzZS5jbGVhblVwKCk7XHJcbiAgd2luZG93LklucHV0LmtleWJvYXJkLmNsZWFuVXAoKTtcclxuXHJcbiAgdmFyIGVuZCA9IERhdGUubm93KCk7XHJcblxyXG4gIC8vIENhbGwgbmV4dCBzdGVwXHJcbiAgc2V0VGltZW91dCh3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gICAgX2VuZ2luZS5zdGVwKClcclxuICB9KSwgTWF0aC5taW4oNjAgLSBlbmQgLSBzdGFydCwgMCkpO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmU7IiwiLy8gRU5USVRZXHJcbnZhciBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzLmpzXCIpO1xyXG5cclxuY29uc3QgQVVUT19DT0xPUl9SQU5HRSA9IFswLCAyMzBdO1xyXG5cclxudmFyIEVudGl0eSA9IGZ1bmN0aW9uKHNoYXBlLCBmaXh0dXJlLCBib2R5LCBpZCwgY29sbGlzaW9uR3JvdXApIHtcclxuICB0aGlzLmlkID0gaWQ7XHJcbiAgdGhpcy5kZWFkID0gZmFsc2U7XHJcbiAgdGhpcy5sYXllciA9IDA7XHJcblxyXG4gIHRoaXMuZml4ZWRSb3RhdGlvbiA9IGZhbHNlO1xyXG5cclxuICB0aGlzLmNvbGxpc2lvbkdyb3VwID0gY29sbGlzaW9uR3JvdXA7XHJcbiAgaWYgKHRoaXMuY29sbGlzaW9uR3JvdXAgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3VwID0gMDtcclxuICB9XHJcblxyXG4gIHRoaXMuYmVoYXZpb3JzID0gW107XHJcblxyXG4gIHRoaXMuZml4dHVyZSA9IGZpeHR1cmU7XHJcbiAgaWYgKHRoaXMuZml4dHVyZSA9PSB1bmRlZmluZWQpIHtcclxuICAgIHZhciBmaXh0dXJlID0gbmV3IGIyRml4dHVyZURlZigpO1xyXG4gICAgZml4dHVyZS5zZXRfZGVuc2l0eSgxMClcclxuICAgIGZpeHR1cmUuc2V0X2ZyaWN0aW9uKDAuNSk7XHJcbiAgICBmaXh0dXJlLnNldF9yZXN0aXR1dGlvbigwLjIpO1xyXG5cclxuICAgIHRoaXMuZml4dHVyZSA9IGZpeHR1cmU7XHJcbiAgfVxyXG4gIHRoaXMuZml4dHVyZS5zZXRfc2hhcGUoc2hhcGUpO1xyXG5cclxuICB2YXIgZmlsdGVyRGF0YSA9IHRoaXMuZml4dHVyZS5nZXRfZmlsdGVyKCk7XHJcbiAgZmlsdGVyRGF0YS5zZXRfY2F0ZWdvcnlCaXRzKDEgPDwgY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAvLyBDb25zdHJ1Y3RvciBpcyBjYWxsZWQgd2hlbiBpbmhlcml0aW5nLCBzbyB3ZSBuZWVkIHRvIGNoZWNrIGZvciBfZW5naW5lIGF2YWlsYWJpbGl0eVxyXG4gIGlmICh0eXBlb2YgX2VuZ2luZSAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBmaWx0ZXJEYXRhLnNldF9tYXNrQml0cyhfZW5naW5lLmNvbGxpc2lvbkdyb3Vwc1t0aGlzLmNvbGxpc2lvbkdyb3VwXS5tYXNrKTtcclxuXHJcbiAgdGhpcy5maXh0dXJlLnNldF9maWx0ZXIoZmlsdGVyRGF0YSk7XHJcblxyXG4gIHRoaXMuYm9keSA9IGJvZHk7XHJcbiAgaWYgKHRoaXMuYm9keSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgdGhpcy5ib2R5LnNldF9maXhlZFJvdGF0aW9uKGZhbHNlKTtcclxuXHJcbiAgLy8gQXV0byBnZW5lcmF0ZSBjb2xvclxyXG4gIHZhciByID0gVXRpbHMucmFuZG9tUmFuZ2UoQVVUT19DT0xPUl9SQU5HRVswXSwgQVVUT19DT0xPUl9SQU5HRVsxXSkudG9TdHJpbmcoMTYpOyByID0gci5sZW5ndGggPT0gMSA/IFwiMFwiICsgciA6IHI7XHJcbiAgdmFyIGcgPSBVdGlscy5yYW5kb21SYW5nZShBVVRPX0NPTE9SX1JBTkdFWzBdLCBBVVRPX0NPTE9SX1JBTkdFWzFdKS50b1N0cmluZygxNik7IGcgPSBnLmxlbmd0aCA9PSAxID8gXCIwXCIgKyBnIDogZztcclxuICB2YXIgYiA9IFV0aWxzLnJhbmRvbVJhbmdlKEFVVE9fQ09MT1JfUkFOR0VbMF0sIEFVVE9fQ09MT1JfUkFOR0VbMV0pLnRvU3RyaW5nKDE2KTsgYiA9IGIubGVuZ3RoID09IDEgPyBcIjBcIiArIGIgOiBiO1xyXG4gIHRoaXMuY29sb3IgPSBcIiNcIiArIHIgICsgZyArIGIgO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmRpZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuZGVhZCA9IHRydWU7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcclxuICBhbGVydChcIkVSUk9SISBDYW5ub3QgZHJhdyBFbnRpdHk6IFVzZSBkZXJpdmVkIGNsYXNzZXMuXCIpO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnNldENvbG9yID0gZnVuY3Rpb24oY29sb3IpIHtcclxuICB0aGlzLmNvbG9yID0gY29sb3I7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnNldElkID0gZnVuY3Rpb24oaWQpIHtcclxuICB0aGlzLmlkID0gaWQ7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRDb2xsaXNpb25Hcm91cCA9IGZ1bmN0aW9uKGdyb3VwKSB7XHJcbiAgdGhpcy5jb2xsaXNpb25Hcm91cCA9IGdyb3VwO1xyXG5cclxuICB2YXIgZmlsdGVyRGF0YSA9IHRoaXMuZml4dHVyZS5HZXRGaWx0ZXJEYXRhKCk7XHJcbiAgZmlsdGVyRGF0YS5zZXRfY2F0ZWdvcnlCaXRzKDEgPDwgZ3JvdXApO1xyXG4gIHRoaXMuZml4dHVyZS5TZXRGaWx0ZXJEYXRhKGZpbHRlckRhdGEpO1xyXG5cclxuICBfZW5naW5lLnVwZGF0ZUNvbGxpc2lvbih0aGlzKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZ2V0TGluZWFyVmVsb2NpdHkgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5ib2R5LkdldExpbmVhclZlbG9jaXR5KCk7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZ2V0TWFzcyA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBNYXRoLm1heCgxLCB0aGlzLmJvZHkuR2V0TWFzcygpKTtcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRMaW5lYXJWZWxvY2l0eSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gIHRoaXMuYm9keS5TZXRMaW5lYXJWZWxvY2l0eSh2ZWN0b3IpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5hcHBseVRvcnF1ZSA9IGZ1bmN0aW9uKGZvcmNlKSB7XHJcbiAgdGhpcy5ib2R5LkFwcGx5VG9ycXVlKGZvcmNlKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuYXBwbHlMaW5lYXJJbXB1bHNlID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgdGhpcy5ib2R5LkFwcGx5TGluZWFySW1wdWxzZSh2ZWN0b3IsIHRoaXMuYm9keS5HZXRXb3JsZENlbnRlcigpKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZGlzYWJsZVJvdGF0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICB0aGlzLmZpeGVkUm90YXRpb24gPSB2YWx1ZTtcclxuICB0aGlzLmJvZHkuU2V0Rml4ZWRSb3RhdGlvbih2YWx1ZSlcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuYWRkQmVoYXZpb3IgPSBmdW5jdGlvbihiZWhhdmlvcikge1xyXG4gIHRoaXMuYmVoYXZpb3JzLnB1c2goYmVoYXZpb3IpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW50aXR5OyIsInZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xyXG52YXIgRW50aXR5RmlsdGVyID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuRW50aXR5RmlsdGVyO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxudmFyIGVmQnlJZCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgRW50aXR5RmlsdGVyLmNhbGwodGhpcywgXCJmaWx0ZXJCeUlkXCIsIGFyZ3VtZW50cywgW1R5cGUuU1RSSU5HXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGlkKTtcclxufVxyXG5lZkJ5SWQucHJvdG90eXBlID0gbmV3IEVudGl0eUZpbHRlcigpO1xyXG5lZkJ5SWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gZWZCeUlkO1xyXG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihlZkJ5SWQpO1xyXG5cclxuZWZCeUlkLnByb3RvdHlwZS5kZWNpZGUgPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICByZXR1cm4gZW50aXR5LmlkID09PSB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKTtcclxufVxyXG5cclxudmFyIGVmQnlDb2xsaXNpb25Hcm91cCA9IGZ1bmN0aW9uKGdyb3VwKSB7XHJcbiAgRW50aXR5RmlsdGVyLmNhbGwodGhpcywgXCJmaWx0ZXJCeUdyb3VwXCIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGdyb3VwKTtcclxufVxyXG5lZkJ5Q29sbGlzaW9uR3JvdXAucHJvdG90eXBlID0gbmV3IEVudGl0eUZpbHRlcigpO1xyXG5lZkJ5Q29sbGlzaW9uR3JvdXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gZWZCeUNvbGxpc2lvbkdyb3VwO1xyXG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihlZkJ5Q29sbGlzaW9uR3JvdXApO1xyXG5cclxuZWZCeUNvbGxpc2lvbkdyb3VwLnByb3RvdHlwZS5kZWNpZGUgPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICByZXR1cm4gZW50aXR5LmNvbGxpc2lvbkdyb3VwID09PSB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKTtcclxufVxyXG5cclxudmFyIGVmQnlMb2dpYyA9IGZ1bmN0aW9uKGxvZ2ljKSB7XHJcbiAgRW50aXR5RmlsdGVyLmNhbGwodGhpcywgXCJmaWx0ZXJCeUNvbmRpdGlvblwiLCBhcmd1bWVudHMsIFtUeXBlLkJPT0xFQU5dKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2gobG9naWMpO1xyXG59XHJcbmVmQnlMb2dpYy5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcbmVmQnlMb2dpYy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBlZkJ5TG9naWM7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGVmQnlMb2dpYyk7XHJcblxyXG5lZkJ5TG9naWMucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBuZXcgQmVoYXZpb3IodGhpcy5hcmdzWzBdKS5jaGVjayhlbnRpdHkpO1xyXG59OyIsInJlcXVpcmUoXCIuL2lucHV0LmpzXCIpO1xyXG5cclxudmFyIEVuZ2luZSA9IHJlcXVpcmUoXCIuL2VuZ2luZS5qc1wiKTtcclxudmFyIFZpZXdwb3J0ID0gcmVxdWlyZShcIi4vdmlld3BvcnQuanNcIik7XHJcbnZhciBVSSA9IHJlcXVpcmUoXCIuL3VpLmpzXCIpO1xyXG52YXIgQm9keVR5cGUgPSByZXF1aXJlKFwiLi9ib2R5dHlwZS5qc1wiKTtcclxudmFyIEJlaGF2aW9yID0gcmVxdWlyZShcIi4vYmVoYXZpb3IuanNcIik7XHJcbnZhciBUb2tlbiA9IHJlcXVpcmUoXCIuL3Rva2VuLmpzXCIpLlRva2VuO1xyXG5cclxudmFyIENpcmNsZSA9IHJlcXVpcmUoXCIuL3NoYXBlcy5qc1wiKS5DaXJjbGU7XHJcbnZhciBSZWN0YW5nbGUgPSByZXF1aXJlKFwiLi9zaGFwZXMuanNcIikuUmVjdGFuZ2xlO1xyXG5cclxuVUkuaW5pdGlhbGl6ZSgpO1xyXG5cclxuX2VuZ2luZSA9IG5ldyBFbmdpbmUobmV3IFZpZXdwb3J0KCQoXCIjbWFpbkNhbnZhc1wiKVswXSksIG5ldyBiMlZlYzIoMCwgNTAwKSk7XHJcblxyXG5fZW5naW5lLmFkZEVudGl0eShuZXcgQ2lyY2xlKG5ldyBiMlZlYzIoNTAwLCA1MCksIDIwKSwgQm9keVR5cGUuRFlOQU1JQ19CT0RZKVxyXG4gIC5zZXRDb2xsaXNpb25Hcm91cCgyKVxyXG4gIC5zZXRJZChcImtydWhcIilcclxuICAuZGlzYWJsZVJvdGF0aW9uKGZhbHNlKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgVG9rZW4ucGFyc2UoXCJpc0J1dHRvblVwKG51bWJlcigzMikpXCIpLFxyXG4gICAgICBUb2tlbi5wYXJzZShcInNldExpbmVhclZlbG9jaXR5KGZpbHRlckJ5SWQodGV4dChrcnVoKSksIGdldFZlbG9jaXR5WChmaWx0ZXJCeUlkKHRleHQoa3J1aCkpKSwgbnVtYmVyKC05OTk5OTk5OTk5OTk5OTk5OTkpKVwiKVxyXG4gICAgKVxyXG4gIClcclxuICAuYWRkQmVoYXZpb3IoXHJcbiAgICBuZXcgQmVoYXZpb3IoXHJcbiAgICAgIFRva2VuLnBhcnNlKFwiaXNCdXR0b25Eb3duKG51bWJlcigzNykpXCIpLFxyXG4gICAgICBUb2tlbi5wYXJzZShcInNldExpbmVhclZlbG9jaXR5KGZpbHRlckJ5SWQodGV4dChrcnVoKSksIG51bWJlcigtMTAwKSwgZ2V0VmVsb2NpdHlZKGZpbHRlckJ5SWQodGV4dChrcnVoKSkpKVwiKVxyXG4gICAgKVxyXG4gIClcclxuICAuYWRkQmVoYXZpb3IoXHJcbiAgICBuZXcgQmVoYXZpb3IoXHJcbiAgICAgIFRva2VuLnBhcnNlKFwiaXNCdXR0b25Eb3duKG51bWJlcigzOSkpXCIpLFxyXG4gICAgICBUb2tlbi5wYXJzZShcInNldExpbmVhclZlbG9jaXR5KGZpbHRlckJ5SWQodGV4dChrcnVoKSksIG51bWJlcigxMDApLCBnZXRWZWxvY2l0eVkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSkpXCIpXHJcbiAgICApXHJcbiAgKTtcclxuXHJcbl9lbmdpbmUuYWRkRW50aXR5KG5ldyBSZWN0YW5nbGUobmV3IGIyVmVjMig0MDAsIDQwMCksIG5ldyBiMlZlYzIoNDAwLCAzKSksIEJvZHlUeXBlLktJTkVNQVRJQ19CT0RZKVxyXG4gIC5zZXRJZChcInBsYXRmb3JtXCIpXHJcbiAgLnNldENvbGxpc2lvbkdyb3VwKDEpO1xyXG5cclxud2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICBfZW5naW5lLnN0ZXAoKTtcclxufSk7XHJcblxyXG5cclxuXHJcblxyXG4iLCIvLyBJTlBVVCBDQVBUVVJJTkdcclxuXHJcbnZhciBUb29scyA9IHJlcXVpcmUoXCIuL3Rvb2xzLmpzXCIpO1xyXG5cclxud2luZG93LndpbmRvdy5JbnB1dCA9IHtcclxuICB0b29sOiBUb29scy5TZWxlY3Rpb24sXHJcblxyXG4gIG1vdXNlOiB7XHJcbiAgICB4OiAwLFxyXG4gICAgeTogMCxcclxuICAgIGxlZnREb3duOiBmYWxzZSxcclxuICAgIHJpZ2h0RG93bjogZmFsc2UsXHJcbiAgICBsZWZ0VXA6IGZhbHNlLFxyXG4gICAgcmlnaHRVcDogZmFsc2UsXHJcblxyXG4gICAgdXBkYXRlUG9zaXRpb246IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICB0aGlzLnggPSBldmVudC5wYWdlWCAtIF9lbmdpbmUudmlld3BvcnQuY2FudmFzRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gICAgICB0aGlzLnkgPSBldmVudC5wYWdlWSAtIF9lbmdpbmUudmlld3BvcnQuY2FudmFzRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUJ1dHRvbnNEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPSBfZW5naW5lLnZpZXdwb3J0LmNhbnZhc0VsZW1lbnQpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEpIHtcclxuICAgICAgICB0aGlzLmxlZnREb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgd2luZG93LklucHV0LnRvb2wub25jbGljaygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDMpXHJcbiAgICAgICAgdGhpcy5yaWdodERvd24gPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVCdXR0b25zVXA6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9IF9lbmdpbmUudmlld3BvcnQuY2FudmFzRWxlbWVudClcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMSkge1xyXG4gICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmxlZnRVcCA9IHRydWU7XHJcblxyXG4gICAgICAgIHdpbmRvdy5JbnB1dC50b29sLm9ucmVsZWFzZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDMpIHtcclxuICAgICAgICB0aGlzLnJpZ2h0RG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucmlnaHRVcCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYW5VcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLmxlZnRVcCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnJpZ2h0VXAgPSBmYWxzZTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBrZXlib2FyZDoge1xyXG4gICAgZG93bjogbmV3IFNldCgpLFxyXG4gICAgdXA6IG5ldyBTZXQoKSxcclxuXHJcbiAgICBpc0Rvd246IGZ1bmN0aW9uIChrZXlDb2RlKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRvd24uaGFzKGtleUNvZGUpXHJcbiAgICB9LFxyXG5cclxuICAgIGlzVXA6IGZ1bmN0aW9uIChrZXlDb2RlKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnVwLmhhcyhrZXlDb2RlKTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc0Rvd246IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICB0aGlzLmRvd24uYWRkKGV2ZW50LndoaWNoKTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc1VwOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgdGhpcy5kb3duLmRlbGV0ZShldmVudC53aGljaCk7XHJcbiAgICAgIHRoaXMudXAuYWRkKGV2ZW50LndoaWNoKTtcclxuICAgIH0sXHJcblxyXG4gICAgY2xlYW5VcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLnVwLmNsZWFyKCk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgZWxlbWVudC5vbm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgd2luZG93LndpbmRvdy5JbnB1dC5tb3VzZS51cGRhdGVQb3NpdGlvbihlKTtcclxuICAgIH07XHJcbiAgICBlbGVtZW50Lm9ubW91c2Vkb3duID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICB3aW5kb3cud2luZG93LklucHV0Lm1vdXNlLnVwZGF0ZUJ1dHRvbnNEb3duKGUpO1xyXG4gICAgfTtcclxuICAgIGVsZW1lbnQub25tb3VzZXVwID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICB3aW5kb3cud2luZG93LklucHV0Lm1vdXNlLnVwZGF0ZUJ1dHRvbnNVcChlKTtcclxuICAgIH07XHJcblxyXG4gICAgZG9jdW1lbnQub25rZXlkb3duID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICB3aW5kb3cud2luZG93LklucHV0LmtleWJvYXJkLnVwZGF0ZUJ1dHRvbnNEb3duKGUpO1xyXG4gICAgfTtcclxuICAgIGRvY3VtZW50Lm9ua2V5dXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHdpbmRvdy53aW5kb3cuSW5wdXQua2V5Ym9hcmQudXBkYXRlQnV0dG9uc1VwKGUpO1xyXG4gICAgfTtcclxuICB9XHJcbn07XHJcblxyXG4iLCJ2YXIgQmVoYXZpb3IgPSByZXF1aXJlKFwiLi9iZWhhdmlvci5qc1wiKTtcbnZhciBMb2dpYyA9IHJlcXVpcmUoXCIuL3Rva2VuLmpzXCIpLkxvZ2ljO1xudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcbnZhciBGaXhUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLkZpeFR5cGU7XG5cbnZhciBsQW5kID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIkFORFwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuQk9PTEVBTiwgVHlwZS5CT09MRUFOXSk7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG59O1xubEFuZC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxBbmQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbEFuZDtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxBbmQpO1xuXG5sQW5kLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICh0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSAmJiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XG59XG5cbnZhciBsT3IgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiT1JcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLkJPT0xFQU4sIFR5cGUuQk9PTEVBTl0pO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xufVxubE9yLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubE9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxPcjtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxPcik7XG5cbmxPci5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSB8fCB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSlcbiAgICByZXR1cm4gdHJ1ZTtcblxuICByZXR1cm4gZmFsc2U7XG59XG5cbnZhciBsTm90ID0gZnVuY3Rpb24gKGEpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIk5PVFwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuQk9PTEVBTl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xufVxubE5vdC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxOb3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE5vdDtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxOb3QpO1xuXG5sTm90LnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICF0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKTtcbn1cblxudmFyIGxTdHJpbmcgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcInRleHRcIiwgVHlwZS5TVFJJTkcsIGFyZ3VtZW50cywgW1R5cGUuTElURVJBTF0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKHZhbHVlKTtcbn1cbmxTdHJpbmcucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sU3RyaW5nLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxTdHJpbmc7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsU3RyaW5nKTtcblxubFN0cmluZy5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF07XG59XG5cbnZhciBsTnVtYmVyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJudW1iZXJcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTElURVJBTF0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKHZhbHVlKTtcbn1cbmxOdW1iZXIucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sTnVtYmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxOdW1iZXI7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsTnVtYmVyKTtcblxubE51bWJlci5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBwYXJzZUZsb2F0KHRoaXMuYXJnc1swXSk7XG59XG5cbnZhciBsQm9vbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiYm9vbGVhblwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuTElURVJBTF0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKHZhbHVlKTtcbn1cbmxCb29sLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubEJvb2wucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbEJvb2w7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsQm9vbCk7XG5cbmxCb29sLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXSA9PT0gXCJ0cnVlXCI7XG59XG5cbnZhciBsQnV0dG9uRG93biA9IGZ1bmN0aW9uIChidXR0b24pIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImlzQnV0dG9uRG93blwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYnV0dG9uKTtcbn1cbmxCdXR0b25Eb3duLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubEJ1dHRvbkRvd24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbEJ1dHRvbkRvd247XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsQnV0dG9uRG93bik7XG5cbmxCdXR0b25Eb3duLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHdpbmRvdy5JbnB1dC5rZXlib2FyZC5pc0Rvd24odGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkpO1xufVxuXG52YXIgbEJ1dHRvblVwID0gZnVuY3Rpb24gKGJ1dHRvbikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiaXNCdXR0b25VcFwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYnV0dG9uKTtcbn1cbmxCdXR0b25VcC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxCdXR0b25VcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQnV0dG9uVXA7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsQnV0dG9uVXApO1xuXG5sQnV0dG9uVXAucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gd2luZG93LklucHV0LmtleWJvYXJkLmlzVXAodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkpO1xufVxuXG52YXIgbFJhbmRvbSA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwicmFuZG9tTnVtYmVyXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChtaW4pO1xuICB0aGlzLmFyZ3MucHVzaChtYXgpO1xufVxubFJhbmRvbS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxSYW5kb20ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFJhbmRvbTtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxSYW5kb20pO1xuXG5sUmFuZG9tLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIFV0aWxzLnJhbmRvbVJhbmdlKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICYmIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcbn1cblxudmFyIGxWZWxvY2l0eVggPSBmdW5jdGlvbiAoZWYpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImdldFZlbG9jaXR5WFwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChlZik7XG59XG5sVmVsb2NpdHlYLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubFZlbG9jaXR5WC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsVmVsb2NpdHlYO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obFZlbG9jaXR5WCk7XG5cbmxWZWxvY2l0eVgucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZW50aXR5ID0gdGhpcy5hcmdzWzBdLmZpbHRlcigpWzBdO1xuXG4gIHJldHVybiBlbnRpdHkuYm9keS5HZXRMaW5lYXJWZWxvY2l0eSgpLmdldF94KCk7XG59XG5cbnZhciBsVmVsb2NpdHlZID0gZnVuY3Rpb24gKGVmKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJnZXRWZWxvY2l0eVlcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xufVxubFZlbG9jaXR5WS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxWZWxvY2l0eVkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFZlbG9jaXR5WTtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxWZWxvY2l0eVkpO1xuXG5sVmVsb2NpdHlZLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVudGl0eSA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKVswXTtcblxuICByZXR1cm4gZW50aXR5LmJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKS5nZXRfeSgpO1xufVxuXG52YXIgbFBsdXMgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiK1wiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59XG5sUGx1cy5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxQbHVzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxQbHVzO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obFBsdXMpO1xuXG5sUGx1cy5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSArIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpO1xufVxuXG52YXIgbE11bHRpcGx5ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIipcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xufVxubE11bHRpcGx5LnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubE11bHRpcGx5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxNdWx0aXBseTtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxNdWx0aXBseSk7XG5cbmxNdWx0aXBseS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpO1xufVxuXG52YXIgbERpdmlkZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCIvXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcbn1cbmxEaXZpZGUucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sRGl2aWRlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxEaXZpZGU7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsRGl2aWRlKTtcblxubERpdmlkZS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSAvIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpO1xufVxuXG52YXIgbE1pbnVzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIi1cIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xufVxubE1pbnVzLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubE1pbnVzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxNaW51cztcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxNaW51cyk7XG5cbmxNaW51cy5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSArIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpO1xufSIsInZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi9lbnRpdHkuanNcIik7XHJcblxyXG4vLyBDaXJjbGUgZW50aXR5XHJcbnZhciBDaXJjbGUgPSBmdW5jdGlvbihjZW50ZXIsIHJhZGl1cywgZml4dHVyZSwgaWQsIGNvbGxpc2lvbkdyb3VwKSB7XHJcbiAgdmFyIHNoYXBlID0gbmV3IGIyQ2lyY2xlU2hhcGUoKTtcclxuICBzaGFwZS5zZXRfbV9yYWRpdXMocmFkaXVzKTtcclxuXHJcbiAgdmFyIGJvZHkgPSBuZXcgYjJCb2R5RGVmKCk7XHJcbiAgYm9keS5zZXRfcG9zaXRpb24oY2VudGVyKTtcclxuXHJcbiAgRW50aXR5LmNhbGwodGhpcywgc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5DaXJjbGUucHJvdG90eXBlID0gbmV3IEVudGl0eSgpO1xyXG5DaXJjbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2lyY2xlO1xyXG5cclxuQ2lyY2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY3R4KSB7XHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG5cclxuICBjdHguYXJjKDAsIDAsIHRoaXMucmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG5cclxuICBjdHguZmlsbCgpO1xyXG5cclxuICBjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xyXG4gIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSBcImRlc3RpbmF0aW9uLW91dFwiO1xyXG5cclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4Lm1vdmVUbygwLCAwKTtcclxuICBjdHgubGluZVRvKDAsIHRoaXMucmFkaXVzKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbiAgY3R4LmNsb3NlUGF0aCgpO1xyXG59XHJcblxyXG5cclxuLy8gUmVjdGFuZ2xlIGVudGl0eVxyXG52YXIgUmVjdGFuZ2xlID0gZnVuY3Rpb24oY2VudGVyLCBleHRlbnRzLCBmaXh0dXJlLCBpZCwgY29sbGlzaW9uR3JvdXApIHtcclxuICB2YXIgc2hhcGUgPSBuZXcgYjJQb2x5Z29uU2hhcGUoKTtcclxuICBzaGFwZS5TZXRBc0JveChleHRlbnRzLmdldF94KCksIGV4dGVudHMuZ2V0X3koKSlcclxuXHJcbiAgdmFyIGJvZHkgPSBuZXcgYjJCb2R5RGVmKCk7XHJcbiAgYm9keS5zZXRfcG9zaXRpb24oY2VudGVyKTtcclxuXHJcbiAgRW50aXR5LmNhbGwodGhpcywgc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIHRoaXMuZXh0ZW50cyA9IGV4dGVudHM7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblJlY3RhbmdsZS5wcm90b3R5cGUgPSBuZXcgRW50aXR5KCk7XHJcblJlY3RhbmdsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZWN0YW5nbGU7XHJcblxyXG5SZWN0YW5nbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcclxuICB2YXIgaGFsZldpZHRoID0gdGhpcy5leHRlbnRzLmdldF94KCk7XHJcbiAgdmFyIGhhbGZIZWlnaHQgPSB0aGlzLmV4dGVudHMuZ2V0X3koKTtcclxuXHJcbiAgY3R4LmZpbGxSZWN0KC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0LCBoYWxmV2lkdGggKiAyLCBoYWxmSGVpZ2h0ICogMik7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cy5DaXJjbGUgPSBDaXJjbGU7XHJcbm1vZHVsZS5leHBvcnRzLlJlY3RhbmdsZSA9IFJlY3RhbmdsZTsiLCJ2YXIgQmVoYXZpb3IgPSByZXF1aXJlKFwiLi9iZWhhdmlvci5qc1wiKTtcclxudmFyIEZpeFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuRml4VHlwZTtcclxudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbnZhciBUeXBlRXhjZXB0aW9uID0gZnVuY3Rpb24oZXhwZWN0ZWQsIHJlY2VpdmVkLCB0b2tlbikge1xyXG4gIHRoaXMuZXhwZWN0ZWQgPSBleHBlY3RlZDtcclxuICB0aGlzLnJlY2VpdmVkID0gcmVjZWl2ZWQ7XHJcbiAgdGhpcy50b2tlbiA9IHRva2VuO1xyXG59O1xyXG5cclxudmFyIFRva2VuID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuUFJFRklYO1xyXG4gIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgdGhpcy5hcmdzID0gYXJncyA9PSB1bmRlZmluZWQgPyBbXSA6IGFyZ3M7XHJcbiAgdGhpcy5hcmd1bWVudF90eXBlcyA9IGFyZ3VtZW50X3R5cGVzO1xyXG4gIHRoaXMuYXJncyA9IFtdO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKGFyZ3NbaV0udHlwZSAhPT0gYXJndW1lbnRfdHlwZXNbaV0gJiYgYXJndW1lbnRfdHlwZXNbaV0gIT09IFR5cGUuTElURVJBTClcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFeGNlcHRpb24oYXJndW1lbnRfdHlwZXNbaV0sIGFyZ3NbaV0udHlwZSwgdGhpcyk7XHJcbiAgfVxyXG59O1xyXG5cclxuVG9rZW4uc3RvcENoYXJzID0gW1wiKFwiLCBcIilcIiwgXCIsXCJdO1xyXG5cclxuVG9rZW4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIHJldCA9IFwiXCI7XHJcbiAgdmFyIGFyZ1N0cmluZ3MgPSBbXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFyZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGFyZ1N0cmluZ3MucHVzaCh0aGlzLmFyZ3NbaV0udG9TdHJpbmcoKSk7XHJcbiAgfVxyXG5cclxuICBhcmdTdHJpbmdzID0gYXJnU3RyaW5ncy5qb2luKFwiLCBcIik7XHJcblxyXG4gIHN3aXRjaCAodGhpcy5maXhUeXBlKSB7XHJcbiAgICBjYXNlIEZpeFR5cGUuUFJFRklYOlxyXG4gICAgICByZXQgPSB0aGlzLm5hbWUgKyBcIihcIiArIGFyZ1N0cmluZ3MgKyBcIilcIjtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIEZpeFR5cGUuSU5GSVg6XHJcbiAgICAgIHJldCA9IHRoaXMuYXJnc1swXS50b1N0cmluZygpICsgXCIgXCIgKyB0aGlzLm5hbWUgKyBcIiBcIiArIHRoaXMuYXJnc1sxXS50b1N0cmluZygpO1xyXG4gICAgICBicmVhaztcclxuICB9XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5Ub2tlbi5wYXJzZSA9IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgVG9rZW4ucGFyc2VySW5wdXQgPSBpbnB1dDtcclxuICBUb2tlbi5wYXJzZXJJbnB1dFdob2xlID0gaW5wdXQ7XHJcbiAgVG9rZW4ucGFyc2VyU3RhY2sgPSBbXTtcclxuXHJcbiAgZG8ge1xyXG4gICAgVG9rZW4ucGFyc2VTdGVwKClcclxuICB9IHdoaWxlIChUb2tlbi5wYXJzZXJJbnB1dC5sZW5ndGgpO1xyXG5cclxuICB2YXIgcmV0ID0gVG9rZW4ucGFyc2VyU3RhY2sucG9wKCk7XHJcblxyXG4gIGlmIChUb2tlbi5wYXJzZXJTdGFjay5sZW5ndGgpXHJcbiAgICB0aHJvdyBcIlVuZXhwZWN0ZWQgXCIgKyByZXQubmFtZTtcclxuXHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcblRva2VuLnJlYWRXaGl0ZXNwYWNlID0gZnVuY3Rpb24oKSB7XHJcbiAgd2hpbGUgKC9cXHMvLnRlc3QoVG9rZW4ucGFyc2VySW5wdXRbMF0pICYmIFRva2VuLnBhcnNlcklucHV0Lmxlbmd0aCkge1xyXG4gICAgVG9rZW4ucGFyc2VySW5wdXQgPSBUb2tlbi5wYXJzZXJJbnB1dC5zbGljZSgxKTtcclxuICB9XHJcbn07XHJcblxyXG5Ub2tlbi5wYXJzZU5hbWUgPSBmdW5jdGlvbigpIHtcclxuICBUb2tlbi5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICB2YXIgcmV0ID0gXCJcIjtcclxuXHJcbiAgd2hpbGUgKCEvXFxzLy50ZXN0KFRva2VuLnBhcnNlcklucHV0WzBdKSAmJiBUb2tlbi5wYXJzZXJJbnB1dC5sZW5ndGggJiYgVG9rZW4uc3RvcENoYXJzLmluZGV4T2YoVG9rZW4ucGFyc2VySW5wdXRbMF0pID09PSAtMSkgLy8gcmVhZCB1bnRpbCBhIHdoaXRlc3BhY2Ugb2NjdXJzXHJcbiAge1xyXG4gICAgcmV0ICs9IFRva2VuLnBhcnNlcklucHV0WzBdXHJcbiAgICBUb2tlbi5wYXJzZXJJbnB1dCA9IFRva2VuLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG4gIH1cclxuXHJcbiAgVG9rZW4ucmVhZFdoaXRlc3BhY2UoKTtcclxuXHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcblRva2VuLnJlYWRDaGFyID0gZnVuY3Rpb24oY2hhcikge1xyXG4gIFRva2VuLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gIGlmIChUb2tlbi5wYXJzZXJJbnB1dFswXSAhPT0gY2hhcikge1xyXG4gICAgdmFyIHBvc2l0aW9uID0gVG9rZW4ucGFyc2VySW5wdXRXaG9sZS5sZW5ndGggLSBUb2tlbi5wYXJzZXJJbnB1dC5sZW5ndGg7XHJcbiAgICB0aHJvdyBcIkV4cGVjdGVkICdcIiArIGNoYXIgKyBcIicgYXQgcG9zaXRpb24gXCIgKyBwb3NpdGlvbiArIFwiIGF0ICdcIiArIFRva2VuLnBhcnNlcklucHV0V2hvbGUuc3Vic3RyKHBvc2l0aW9uKSArIFwiJ1wiO1xyXG4gIH1cclxuXHJcbiAgVG9rZW4ucGFyc2VySW5wdXQgPSBUb2tlbi5wYXJzZXJJbnB1dC5zbGljZSgxKTtcclxuXHJcbiAgVG9rZW4ucmVhZFdoaXRlc3BhY2UoKTtcclxufTtcclxuXHJcblRva2VuLnBhcnNlU3RlcCA9IGZ1bmN0aW9uKGV4cGVjdGVkVHlwZSkge1xyXG4gIHZhciBuYW1lID0gVG9rZW4ucGFyc2VOYW1lKCk7XHJcbiAgdmFyIHRva2VuID0gd2luZG93LnRva2Vuc1tuYW1lXTtcclxuXHJcbiAgaWYgKHRva2VuID09PSB1bmRlZmluZWQgJiYgZXhwZWN0ZWRUeXBlID09PSBUeXBlLkxJVEVSQUwpIHtcclxuICAgIHJldHVybiBuYW1lO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRva2VuID09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhyb3cgXCJFeHBlY3RlZCBhcmd1bWVudCB3aXRoIHR5cGUgXCIgKyBleHBlY3RlZFR5cGU7XHJcbiAgfVxyXG5cclxuICBpZiAoZXhwZWN0ZWRUeXBlICE9PSB1bmRlZmluZWQgJiYgdG9rZW4udHlwZSAhPT0gZXhwZWN0ZWRUeXBlKSB7XHJcbiAgICB0aHJvdyBcIlVuZXhwZWN0ZWQgXCIgKyB0b2tlbi50eXBlICsgXCIgKHdhcyBleHBlY3RpbmcgXCIgKyBleHBlY3RlZFR5cGUgKyBcIilcIjtcclxuICB9XHJcblxyXG4gIHZhciBudW1BcmdzID0gdG9rZW4uYXJndW1lbnRfdHlwZXMubGVuZ3RoO1xyXG5cclxuICB2YXIgYXJncyA9IFtdO1xyXG5cclxuICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5JTkZJWCkge1xyXG4gICAgdmFyIGEgPSBUb2tlbi5wYXJzZXJTdGFjay5wb3AoKTtcclxuXHJcbiAgICBpZiAoYS50eXBlICE9PSB0b2tlbi5hcmd1bWVudF90eXBlc1swXSlcclxuICAgICAgdGhyb3cgXCJVbmV4cGVjdGVkIFwiICsgYS50eXBlICsgXCIgKHdhcyBleHBlY3RpbmcgXCIgKyB0b2tlbi5hcmd1bWVudF90eXBlc1swXSArIFwiKVwiO1xyXG5cclxuICAgIGFyZ3MgPSBbYSwgVG9rZW4ucGFyc2VTdGVwKHRva2VuLmFyZ3VtZW50X3R5cGVzWzFdKV07XHJcbiAgICBUb2tlbi5wYXJzZXJTdGFjay5wb3AoKTtcclxuICB9XHJcblxyXG4gIGlmICh0b2tlbi5maXhUeXBlID09PSBGaXhUeXBlLlBSRUZJWCkge1xyXG4gICAgVG9rZW4ucmVhZENoYXIoXCIoXCIpO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBudW1BcmdzOyBpKyspIHtcclxuICAgICAgYXJncy5wdXNoKFRva2VuLnBhcnNlU3RlcCh0b2tlbi5hcmd1bWVudF90eXBlc1tpXSkpO1xyXG5cclxuICAgICAgVG9rZW4ucmVhZFdoaXRlc3BhY2UoKTtcclxuXHJcbiAgICAgIGlmIChUb2tlbi5wYXJzZXJJbnB1dFswXSA9PT0gXCIsXCIpXHJcbiAgICAgICAgVG9rZW4ucGFyc2VySW5wdXQgPSBUb2tlbi5wYXJzZXJJbnB1dC5zbGljZSgxKTtcclxuICAgIH1cclxuXHJcbiAgICBUb2tlbi5yZWFkQ2hhcihcIilcIik7XHJcbiAgfVxyXG5cclxuICB2YXIgbmV3VG9rZW4gPSBuZXcgdG9rZW4uY29uc3RydWN0b3IoKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIG5ld1Rva2VuLmFyZ3NbaV0gPSBhcmdzW2ldO1xyXG5cclxuICAgIFRva2VuLnBhcnNlclN0YWNrLnBvcCgpO1xyXG4gIH1cclxuICBUb2tlbi5wYXJzZXJTdGFjay5wdXNoKG5ld1Rva2VuKTtcclxuXHJcbiAgcmV0dXJuIG5ld1Rva2VuO1xyXG59O1xyXG5cclxuXHJcbnZhciBMb2dpYyA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgVG9rZW4uY2FsbCh0aGlzLCBuYW1lLCB0eXBlLCBhcmdzLCBhcmd1bWVudF90eXBlcyk7XHJcbn07XHJcbkxvZ2ljLnByb3RvdHlwZSA9IG5ldyBUb2tlbigpO1xyXG5Mb2dpYy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMb2dpYztcclxuXHJcbkxvZ2ljLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uKCkgeyAvLyBVc2UgYSBkZXJpdmVkIGNsYXNzXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuXHJcbnZhciBBY3Rpb24gPSBmdW5jdGlvbihuYW1lLCBhcmdzLCBhcmd1bWVudF90eXBlcykge1xyXG4gIFRva2VuLmNhbGwodGhpcywgbmFtZSwgVHlwZS5BQ1RJT04sIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKTtcclxufTtcclxuQWN0aW9uLnByb3RvdHlwZSA9IG5ldyBUb2tlbigpO1xyXG5BY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQWN0aW9uO1xyXG5cclxuQWN0aW9uLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7IC8vIFVzZSBhIGRlcml2ZWQgY2xhc3NcclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5BY3Rpb24ucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgZW50aXRpZXMgPSB0aGlzLmFyZ3NbMF0uZmlsdGVyKCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdGhpcy5lYWNoKGVudGl0aWVzW2ldKTtcclxuICB9XHJcbn07XHJcblxyXG5cclxudmFyIEVudGl0eUZpbHRlciA9IGZ1bmN0aW9uKG5hbWUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgVG9rZW4uY2FsbCh0aGlzLCBuYW1lLCBUeXBlLkVOVElUWUZJTFRFUiwgYXJncywgYXJndW1lbnRfdHlwZXMpO1xyXG59O1xyXG5FbnRpdHlGaWx0ZXIucHJvdG90eXBlID0gbmV3IFRva2VuKCk7XHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbnRpdHlGaWx0ZXI7XHJcblxyXG5FbnRpdHlGaWx0ZXIucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkgeyAvLyBVc2UgZGVyaXZlZCBjbGFzc1xyXG4gIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIHJldCA9IFtdO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgX2VuZ2luZS5lbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKHRoaXMuZGVjaWRlKF9lbmdpbmUuZW50aXRpZXNbaV0pKVxyXG4gICAgICByZXQucHVzaChfZW5naW5lLmVudGl0aWVzW2ldKTtcclxuICB9XHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLlRva2VuID0gVG9rZW47XHJcbm1vZHVsZS5leHBvcnRzLkFjdGlvbiA9IEFjdGlvbjtcclxubW9kdWxlLmV4cG9ydHMuTG9naWMgPSBMb2dpYztcclxubW9kdWxlLmV4cG9ydHMuRW50aXR5RmlsdGVyID0gRW50aXR5RmlsdGVyO1xyXG5cclxuLy8gVE9ETzogbGluZWFyIGFjdGlvbiwgcG9yb3ZuYXZhbmllLCB1aGx5LCBwbHVzLCBtaW51cyAsIGRlbGVubywga3JhdCwgeCBuYSBuIiwidmFyIFNoYXBlID0gcmVxdWlyZShcIi4vc2hhcGVzLmpzXCIpO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL2JvZHl0eXBlLmpzXCIpO1xyXG5cclxudmFyIEJsYW5rID0ge1xyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHt9LFxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge30sXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7fVxyXG59O1xyXG5cclxuXHJcbnZhciBTZWxlY3Rpb24gPSB7XHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgX2VuZ2luZS5zZWxlY3RFbnRpdHkobnVsbCk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IF9lbmdpbmUuZW50aXRpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgaWYgKF9lbmdpbmUuZW50aXRpZXNbaV0uZml4dHVyZS5UZXN0UG9pbnQoXHJcbiAgICAgICAgICBuZXcgYjJWZWMyKF9lbmdpbmUudmlld3BvcnQueCAtIF9lbmdpbmUudmlld3BvcnQud2lkdGggLyAyICsgd2luZG93LklucHV0Lm1vdXNlLngsIF9lbmdpbmUudmlld3BvcnQueSAtIF9lbmdpbmUudmlld3BvcnQuaGVpZ2h0IC8gMiAgKyB3aW5kb3cuSW5wdXQubW91c2UueSkpXHJcbiAgICAgICkge1xyXG4gICAgICAgIF9lbmdpbmUuc2VsZWN0RW50aXR5KGkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBvbnJlbGVhc2U6IGZ1bmN0aW9uICgpIHt9LFxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge31cclxufTtcclxuXHJcblxyXG52YXIgUmVjdGFuZ2xlID0ge1xyXG4gIG9yaWdpbjogbnVsbCxcclxuXHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5vbm1vdmUgPSB0aGlzLmRyYWdnaW5nO1xyXG4gICAgdGhpcy5vcmlnaW4gPSBbd2luZG93LklucHV0Lm1vdXNlLngsIHdpbmRvdy5JbnB1dC5tb3VzZS55XTtcclxuICB9LFxyXG5cclxuICBvbnJlbGVhc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB3ID0gd2luZG93LklucHV0Lm1vdXNlLnggLSB0aGlzLm9yaWdpblswXTtcclxuICAgIHZhciBoID0gd2luZG93LklucHV0Lm1vdXNlLnkgLSB0aGlzLm9yaWdpblsxXTtcclxuXHJcbiAgICBfZW5naW5lLmFkZEVudGl0eShuZXcgU2hhcGUuUmVjdGFuZ2xlKFxyXG4gICAgICBuZXcgYjJWZWMyKHRoaXMub3JpZ2luWzBdICsgdyAvIDIsIHRoaXMub3JpZ2luWzFdICsgaCAvIDIpLFxyXG4gICAgICBuZXcgYjJWZWMyKHcgLyAyLCBoIC8gMikpLCBUeXBlLkRZTkFNSUNfQk9EWSk7XHJcblxyXG4gICAgdGhpcy5vbm1vdmUgPSBmdW5jdGlvbigpe307XHJcbiAgICB0aGlzLm9yaWdpbiA9IG51bGw7XHJcbiAgfSxcclxuXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIH0sXHJcblxyXG4gIGRyYWdnaW5nOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLCAwLCAwLCAwLjQpXCI7XHJcbiAgICBjdHguZmlsbFJlY3QodGhpcy5vcmlnaW5bMF0sIHRoaXMub3JpZ2luWzFdLCB3aW5kb3cuSW5wdXQubW91c2UueCAtIHRoaXMub3JpZ2luWzBdLCB3aW5kb3cuSW5wdXQubW91c2UueSAtIHRoaXMub3JpZ2luWzFdKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgfVxyXG59O1xyXG5cclxuXHJcbnZhciBDaXJjbGUgPSB7XHJcbiAgb3JpZ2luOiBudWxsLFxyXG4gIHJhZGl1czogMCxcclxuXHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5vbm1vdmUgPSB0aGlzLmRyYWdnaW5nO1xyXG4gICAgdGhpcy5vcmlnaW4gPSBbd2luZG93LklucHV0Lm1vdXNlLngsIHdpbmRvdy5JbnB1dC5tb3VzZS55XTtcclxuICB9LFxyXG5cclxuICBvbnJlbGVhc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIF9lbmdpbmUuYWRkRW50aXR5KG5ldyBTaGFwZS5DaXJjbGUoXHJcbiAgICAgIG5ldyBiMlZlYzIodGhpcy5vcmlnaW5bMF0gKyB0aGlzLnJhZGl1cywgdGhpcy5vcmlnaW5bMV0gKyB0aGlzLnJhZGl1cyksXHJcbiAgICAgIHRoaXMucmFkaXVzKSwgVHlwZS5EWU5BTUlDX0JPRFkpO1xyXG5cclxuICAgIHRoaXMub25tb3ZlID0gZnVuY3Rpb24oKXt9O1xyXG4gICAgdGhpcy5vcmlnaW4gPSBudWxsO1xyXG4gICAgdGhpcy5yYWRpdXMgPSAwO1xyXG4gIH0sXHJcblxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICB9LFxyXG5cclxuICBkcmFnZ2luZzogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgdGhpcy5yYWRpdXMgPSBNYXRoLm1pbih3aW5kb3cuSW5wdXQubW91c2UueCAtIHRoaXMub3JpZ2luWzBdLCB3aW5kb3cuSW5wdXQubW91c2UueSAtIHRoaXMub3JpZ2luWzFdKSAvIDI7XHJcblxyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuXHJcbiAgICBjdHguYXJjKHRoaXMub3JpZ2luWzBdICsgdGhpcy5yYWRpdXMsIHRoaXMub3JpZ2luWzFdICsgdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG5cclxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgMC40KVwiO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLkJsYW5rID0gQmxhbms7XHJcbm1vZHVsZS5leHBvcnRzLlNlbGVjdGlvbiA9IFNlbGVjdGlvbjtcclxubW9kdWxlLmV4cG9ydHMuUmVjdGFuZ2xlID0gUmVjdGFuZ2xlO1xyXG5tb2R1bGUuZXhwb3J0cy5DaXJjbGUgPSBDaXJjbGU7IiwidmFyIFR5cGUgPSB7XHJcbiAgQk9PTEVBTjogXCJib29sZWFuXCIsXHJcbiAgTlVNQkVSOiBcIm51bWJlclwiLFxyXG4gIFNUUklORzogXCJzdHJpbmdcIixcclxuICBBUlJBWTogXCJhcnJheVwiLFxyXG4gIEFDVElPTjogXCJhY3Rpb25cIixcclxuICBFTlRJVFlGSUxURVI6IFwiZW50aXR5RmlsdGVyXCIsXHJcbiAgTElURVJBTDogXCJsaXRlcmFsXCJcclxufTtcclxuXHJcbnZhciBGaXhUeXBlID0ge1xyXG4gIElORklYOiBcImluZml4XCIsXHJcbiAgUFJFRklYOiBcInByZWZpeFwiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5UeXBlID0gVHlwZTtcclxubW9kdWxlLmV4cG9ydHMuRml4VHlwZSA9IEZpeFR5cGU7IiwidmFyIFRvb2xzID0gcmVxdWlyZShcIi4vdG9vbHMuanNcIik7XHJcbnZhciBCb2R5VHlwZSA9IHJlcXVpcmUoXCIuL2JvZHl0eXBlLmpzXCIpO1xyXG52YXIgVUlCdWlsZGVyID0gcmVxdWlyZShcIi4vdWlidWlsZGVyLmpzXCIpO1xyXG5cclxuLy8gT2JqZWN0IGZvciBidWlsZGluZyB0aGUgVUlcclxudmFyIFVJID0ge1xyXG4gIC8vIFVJIGluaXRpYWxpc2F0aW9uXHJcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbGFuZ3VhZ2VzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IFRyYW5zbGF0aW9ucy5zdHJpbmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGxhbmd1YWdlcy5wdXNoKHt0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZCgwLCBpKSwgdmFsdWU6IGl9KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcHJvcGVydGllcyA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXHJcblxyXG4gICAgICAgIGlkOiBcInBsYXlcIixcclxuICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMiksXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgX2VuZ2luZS50b2dnbGVQYXVzZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChfZW5naW5lLndvcmxkLnBhdXNlZCkge1xyXG4gICAgICAgICAgICAkKFwiI3BsYXlcIikuaHRtbChUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMikpO1xyXG5cclxuICAgICAgICAgICAgJChcIiNjb2xsaXNpb25zLCAjdG9vbFwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0aGlzLmVuYWJsZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiI3BsYXlcIikuaHRtbChUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMykpO1xyXG5cclxuICAgICAgICAgICAgJChcIiNjb2xsaXNpb25zLCAjdG9vbFwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0aGlzLmRpc2FibGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7dHlwZTogXCJicmVha1wifSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXHJcblxyXG4gICAgICAgIGlkOiBcImNvbGxpc2lvbnNcIixcclxuICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMSksXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgVUlCdWlsZGVyLnBvcHVwKFVJLmNyZWF0ZUNvbGxpc2lvbnMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7dHlwZTogXCJicmVha1wifSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwicmFkaW9cIixcclxuXHJcbiAgICAgICAgaWQ6IFwidG9vbFwiLFxyXG4gICAgICAgIGVsZW1lbnRzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxNyksIGNoZWNrZWQ6IHRydWUsIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgd2luZG93LklucHV0LnRvb2wgPSBUb29scy5TZWxlY3Rpb247XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTgpLCBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5JbnB1dC50b29sID0gVG9vbHMuUmVjdGFuZ2xlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE5KSwgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB3aW5kb3cuSW5wdXQudG9vbCA9IFRvb2xzLkNpcmNsZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB7dHlwZTogXCJicmVha1wifSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwic2VsZWN0XCIsXHJcbiAgICAgICAgb3B0aW9uczogbGFuZ3VhZ2VzLFxyXG5cclxuICAgICAgICBvbmNoYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICBUcmFuc2xhdGlvbnMuc2V0TGFuZ3VhZ2UodmFsdWUgKiAxKTtcclxuICAgICAgICB9LFxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIFVJQnVpbGRlci5idWlsZExheW91dCgpO1xyXG4gICAgJChcIi51aS50b29sYmFyXCIpWzBdLmFwcGVuZENoaWxkKFVJQnVpbGRlci5idWlsZChwcm9wZXJ0aWVzKSk7XHJcbiAgICAkKFwiLnVpLmNvbnRlbnRcIilbMF0uYXBwZW5kQ2hpbGQoZWwoXCJjYW52YXMjbWFpbkNhbnZhc1wiKSk7XHJcblxyXG4gIH0sXHJcblxyXG4gIC8vIEJ1aWxkaW5nIHRoZSBjb2xsaXNpb24gZ3JvdXAgdGFibGVcclxuICBjcmVhdGVDb2xsaXNpb25zOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0YWJsZSA9IGVsKFwidGFibGUuY29sbGlzaW9uVGFibGVcIik7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZW5naW5lLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSICsgMTsgaSsrKSB7XHJcbiAgICAgIHZhciB0ciA9IGVsKFwidHJcIik7XHJcblxyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF9lbmdpbmUuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgKyAxOyBqKyspIHtcclxuICAgICAgICB2YXIgdGQgPSBlbChcInRkXCIpO1xyXG5cclxuICAgICAgICAvLyBmaXJzdCByb3dcclxuICAgICAgICBpZiAoaSA9PT0gMCAmJiBqID4gMCkge1xyXG4gICAgICAgICAgdGQuaW5uZXJIVE1MID0gXCI8ZGl2PjxzcGFuPlwiICsgX2VuZ2luZS5jb2xsaXNpb25Hcm91cHNbaiAtIDFdLm5hbWUgKyBcIjwvc3Bhbj48L2Rpdj5cIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpcnN0IGNvbHVtblxyXG4gICAgICAgIGVsc2UgaWYgKGogPT09IDAgJiYgaSAhPT0gMClcclxuICAgICAgICAgIHRkLmlubmVySFRNTCA9IF9lbmdpbmUuY29sbGlzaW9uR3JvdXBzW2kgLSAxXS5uYW1lO1xyXG5cclxuICAgICAgICAvLyByZWxldmFudCB0cmlhbmdsZVxyXG4gICAgICAgIGVsc2UgaWYgKGkgPD0gaiAmJiBqICE9PSAwICYmIGkgIT09IDApIHtcclxuICAgICAgICAgIHRkLnJvdyA9IGk7XHJcbiAgICAgICAgICB0ZC5jb2wgPSBqO1xyXG5cclxuICAgICAgICAgIC8vIGhpZ2hsaWdodGluZ1xyXG4gICAgICAgICAgdGQub25tb3VzZW92ZXIgPSBmdW5jdGlvbihpLCBqLCB0YWJsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHRkcyA9IHRhYmxlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGRcIik7XHJcbiAgICAgICAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCB0ZHMubGVuZ3RoOyBuKyspIHtcclxuICAgICAgICAgICAgICAgIHRkc1tuXS5jbGFzc05hbWUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG9ubHkgaGlnaGxpZ2h0IHVwIHRvIHRoZSByZWxldmFudCBjZWxsXHJcbiAgICAgICAgICAgICAgICBpZiAoKHRkc1tuXS5yb3cgPT09IGkgJiYgdGRzW25dLmNvbCA8PSBqKSB8fCAodGRzW25dLmNvbCA9PT0gaiAmJiB0ZHNbbl0ucm93IDw9IGkpKVxyXG4gICAgICAgICAgICAgICAgICB0ZHNbbl0uY2xhc3NOYW1lID0gXCJoaWdobGlnaHRcIjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0oaSwgaiwgdGFibGUpO1xyXG5cclxuICAgICAgICAgIC8vIG1vcmUgaGlnaGxpZ2h0aW5nXHJcbiAgICAgICAgICB0ZC5vbm1vdXNlb3V0ID0gZnVuY3Rpb24odGFibGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHZhciB0ZHMgPSB0YWJsZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRkXCIpO1xyXG4gICAgICAgICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgdGRzLmxlbmd0aDsgbisrKSB7XHJcbiAgICAgICAgICAgICAgICB0ZHNbbl0uY2xhc3NOYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0odGFibGUpO1xyXG5cclxuICAgICAgICAgIC8vIGNoZWNrYm94IGZvciBjb2xsaXNpb24gdG9nZ2xpbmdcclxuICAgICAgICAgIHZhciBjaGVja2JveCA9IGVsKFwiaW5wdXRcIiwge3R5cGU6IFwiY2hlY2tib3hcIn0pO1xyXG5cclxuICAgICAgICAgIGlmIChfZW5naW5lLmdldENvbGxpc2lvbihpIC0gMSwgaiAtIDEpKVxyXG4gICAgICAgICAgICBjaGVja2JveC5zZXRBdHRyaWJ1dGUoXCJjaGVja2VkXCIsIFwiY2hlY2tlZFwiKTtcclxuXHJcbiAgICAgICAgICBjaGVja2JveC5vbmNoYW5nZSA9IGZ1bmN0aW9uKGksIGosIGNoZWNrYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBfZW5naW5lLnNldENvbGxpc2lvbihpIC0gMSwgaiAtIDEsIGNoZWNrYm94LmNoZWNrZWQgPyAxIDogMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0oaSwgaiwgY2hlY2tib3gpO1xyXG5cclxuICAgICAgICAgIC8vIGNsaWNraW5nIHRoZSBjaGVja2JveCdzIGNlbGwgc2hvdWxkIHdvcmsgYXMgd2VsbFxyXG4gICAgICAgICAgdGQub25jbGljayA9IGZ1bmN0aW9uKGNoZWNrYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0ID09PSBjaGVja2JveClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gIWNoZWNrYm94LmNoZWNrZWQ7XHJcbiAgICAgICAgICAgICAgY2hlY2tib3gub25jaGFuZ2UoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0oY2hlY2tib3gpO1xyXG5cclxuICAgICAgICAgIHRkLmFwcGVuZENoaWxkKGNoZWNrYm94KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpeCBmb3IgYWxzbyBoaWdobGlnaHRpbmcgY2VsbHMgd2l0aG91dCBjaGVja2JveGVzXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0ZC5yb3cgPSBpO1xyXG4gICAgICAgICAgdGQuY29sID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGFibGUuYXBwZW5kQ2hpbGQodHIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YWJsZTtcclxuICB9LFxyXG5cclxuICBjcmVhdGVCZWhhdmlvcjogZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gICAgcmV0dXJuIFwiVE9ET1wiO1xyXG5cclxuICAgIHZhciBsb2dpYyA9IGVsKFwidGV4dGFyZWFcIik7XHJcbiAgICBsb2dpYy5pbm5lckhUTUwgPSBlbnRpdHkuYmVoYXZpb3JzWzBdLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgcmV0dXJuIGVsKFwiZGl2XCIsIFtcclxuICAgICAgVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDUpLCBlbChcImJyXCIpLFxyXG4gICAgICBsb2dpYyxcclxuICAgICAgZWwucCgpLFxyXG4gICAgICBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoNiksIGVsKFwiYnJcIiksXHJcblxyXG4gICAgXSk7XHJcbiAgfSxcclxuXHJcbiAgYnVpbGRTaWRlYmFyOiBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgICB2YXIgc2lkZWJhciA9ICQoXCIuc2lkZWJhci51aSAuY29udGVudFwiKTtcclxuXHJcbiAgICBzaWRlYmFyLmh0bWwoXCJcIik7XHJcblxyXG4gICAgaWYgKGVudGl0eSA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHByb3BlcnRpZXMgPSBbXHJcbiAgICAgIC8vIElEXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg3KX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dFRleHRcIiwgdmFsdWU6IGVudGl0eS5pZCwgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge19lbmdpbmUuY2hhbmdlSWQoZW50aXR5LCB2YWwpO319LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gQ29sbGlzaW9uIGdyb3VwXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg4KX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmNvbGxpc2lvbkdyb3VwICsgMSwgbWluOiAxLCBtYXg6IF9lbmdpbmUuQ09MTElTSU9OX0dST1VQU19OVU1CRVIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5zZXRDb2xsaXNpb25Hcm91cCh2YWwgKiAxIC0gMSk7fX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBYXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg5KX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtcclxuICAgICAgICAgIGVudGl0eS5ib2R5LlNldFRyYW5zZm9ybShuZXcgYjJWZWMyKHZhbCAqIDEsIGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3koKSksIGVudGl0eS5ib2R5LkdldEFuZ2xlKCkpO1xyXG4gICAgICAgIH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gWVxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTApfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF95KCksXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgICAgZW50aXR5LmJvZHkuU2V0VHJhbnNmb3JtKG5ldyBiMlZlYzIoZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpLCB2YWwgKiAxKSwgZW50aXR5LmJvZHkuR2V0QW5nbGUoKSk7XHJcbiAgICAgICAgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBSb3RhdGlvblxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTEpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuYm9keS5HZXRBbmdsZSgpICogMTgwIC8gTWF0aC5QSSxcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LmJvZHkuU2V0VHJhbnNmb3JtKGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCksICh2YWwgKiAxKSAqIE1hdGguUEkgLyAxODApO319LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gRml4ZWQgcm90YXRpb25cclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDEyKX0sXHJcbiAgICAgIHsgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBlbnRpdHkuZml4ZWRSb3RhdGlvbiwgb25jaGFuZ2U6IGZ1bmN0aW9uKHZhbCkgeyBlbnRpdHkuZGlzYWJsZVJvdGF0aW9uKHZhbCk7IH0gfSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIENvbG9yXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxMyl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXRDb2xvclwiLCB2YWx1ZTogZW50aXR5LmNvbG9yLCBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LmNvbG9yID0gdmFsfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgXTtcclxuXHJcbiAgICBzaWRlYmFyWzBdLmFwcGVuZENoaWxkKFVJQnVpbGRlci5idWlsZChwcm9wZXJ0aWVzKSk7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSTsiLCJ2YXIgVUlCdWlsZGVyID0ge1xyXG4gIHJhZGlvOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcInJhZGlvR3JvdXAtXCIgKyAkKFwiLnJhZGlvR3JvdXBcIikubGVuZ3RoLFxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwiZGl2LnVpLnJhZGlvR3JvdXBcIiwge2lkOiBwcm9wZXJ0aWVzLmlkfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoXCJpbnB1dFt0eXBlPXJhZGlvXVwiLCB0aGlzKS5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKFwiaW5wdXRbdHlwZT1yYWRpb11cIiwgdGhpcykuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMuZW5hYmxlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgdmFyIGlkQ291bnQgPSAkKFwiaW5wdXRbdHlwZT1yYWRpb11cIikubGVuZ3RoO1xyXG5cclxuICAgIHByb3BlcnRpZXMuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgIGVsZW1lbnQgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICAgIGlkOiBcInJhZGlvLVwiICsgaWRDb3VudCsrLFxyXG4gICAgICAgIGNoZWNrZWQ6IGZhbHNlLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uKCl7fVxyXG4gICAgICB9LCBlbGVtZW50KTtcclxuXHJcbiAgICAgIHZhciBpbnB1dCA9IGVsKFwiaW5wdXQudWlcIiwge3R5cGU6IFwicmFkaW9cIiwgaWQ6IGVsZW1lbnQuaWQsIG5hbWU6IHByb3BlcnRpZXMuaWR9KTtcclxuICAgICAgdmFyIGxhYmVsID0gZWwoXCJsYWJlbC51aS5idXR0b25cIiwge2ZvcjogZWxlbWVudC5pZH0sIFtlbGVtZW50LnRleHRdKTtcclxuXHJcbiAgICAgIGlucHV0LmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAkKFwiK2xhYmVsXCIsIHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpbnB1dC5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgbGFiZWwub25jbGljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKFwiZGlzYWJsZWRcIikpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGVsZW1lbnQub25jbGljaygpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgaW5wdXQuY2hlY2tlZCA9IGVsZW1lbnQuY2hlY2tlZDtcclxuXHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChpbnB1dCk7XHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChsYWJlbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcbiAgXHJcbiAgYnV0dG9uOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImJ1dHRvbi1cIiArICQoXCIuYnV0dG9uXCIpLmxlbmd0aCxcclxuICAgICAgb25jbGljazogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJzcGFuLnVpLmJ1dHRvblwiLCB7IGlkOiBwcm9wZXJ0aWVzLmlkIH0sIFtwcm9wZXJ0aWVzLnRleHRdKTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpXHJcbiAgICB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQub25jbGljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcyhcImRpc2FibGVkXCIpKVxyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIHByb3BlcnRpZXMub25jbGljaygpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIHNlbGVjdDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJzZWxlY3QtXCIgKyAkKFwic2VsZWN0XCIpLmxlbmd0aCxcclxuICAgICAgb25jaGFuZ2U6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwic2VsZWN0LnVpXCIsIHsgaWQ6IHByb3BlcnRpZXMuaWQgfSk7XHJcblxyXG4gICAgcmV0Lm9uY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uY2hhbmdlKHRoaXMudmFsdWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZW5hYmxlO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcm9wZXJ0aWVzLm9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob3B0aW9uKSB7XHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChlbChcIm9wdGlvblwiLCB7dmFsdWU6IG9wdGlvbi52YWx1ZX0sIFtvcHRpb24udGV4dF0pKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgYnJlYWs6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBlbChcInNwYW4udWkuYnJlYWtcIik7XHJcbiAgfSxcclxuXHJcbiAgaW5wdXRUZXh0OiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImlucHV0VGV4dC1cIiArICQoXCJpbnB1dFt0eXBlPXRleHRdXCIpLmxlbmd0aCxcclxuICAgICAgdmFsdWU6IFwiXCIsXHJcbiAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwiaW5wdXQudWlcIiwgeyB0eXBlOiBcInRleHRcIiwgaWQ6IHByb3BlcnRpZXMuaWQsIHZhbHVlOiBwcm9wZXJ0aWVzLnZhbHVlIH0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0Lm9uaW5wdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBpbnB1dE51bWJlcjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJpbnB1dE51bWJlci1cIiArICQoXCJpbnB1dFt0eXBlPW51bWJlcl1cIikubGVuZ3RoLFxyXG4gICAgICB2YWx1ZTogMCxcclxuICAgICAgbWluOiAtSW5maW5pdHksXHJcbiAgICAgIG1heDogSW5maW5pdHksXHJcbiAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwiaW5wdXQudWlcIiwgeyB0eXBlOiBcIm51bWJlclwiLCBpZDogcHJvcGVydGllcy5pZCwgdmFsdWU6IHByb3BlcnRpZXMudmFsdWUsIG1pbjogcHJvcGVydGllcy5taW4sIG1heDogcHJvcGVydGllcy5tYXggfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQub25pbnB1dCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBodG1sOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGNvbnRlbnQ6IFwiXCJcclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHJldHVybiBwcm9wZXJ0aWVzLmNvbnRlbnQ7XHJcbiAgfSxcclxuXHJcbiAgaW5wdXRDb2xvcjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJpbnB1dENvbG9yLVwiICsgJChcImlucHV0W3R5cGU9Y29sb3JdXCIpLmxlbmd0aCxcclxuICAgICAgdmFsdWU6IFwiIzAwMDAwMFwiLFxyXG4gICAgICBvbmlucHV0OiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJjb2xvclwiLCBpZDogcHJvcGVydGllcy5pZCwgdmFsdWU6IHByb3BlcnRpZXMudmFsdWUgfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQub25pbnB1dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcHJvcGVydGllcy5vbmlucHV0KHRoaXMudmFsdWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGNoZWNrYm94OiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImNoZWNrYm94LVwiICsgJChcImlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLmxlbmd0aCxcclxuICAgICAgY2hlY2tlZDogZmFsc2UsXHJcbiAgICAgIG9uY2hhbmdlOiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcInNwYW5cIik7XHJcbiAgICB2YXIgY2hlY2tib3ggPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBpZDogcHJvcGVydGllcy5pZCB9KTtcclxuICAgIHZhciBsYWJlbCA9IGVsKFwibGFiZWwudWkuYnV0dG9uXCIsIHsgZm9yOiBwcm9wZXJ0aWVzLmlkIH0pO1xyXG5cclxuICAgIHJldC5hcHBlbmRDaGlsZChjaGVja2JveCk7XHJcbiAgICByZXQuYXBwZW5kQ2hpbGQobGFiZWwpO1xyXG5cclxuICAgIGNoZWNrYm94LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoXCIrbGFiZWxcIiwgdGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIGNoZWNrYm94LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIGNoZWNrYm94LmNoZWNrZWQgPSBwcm9wZXJ0aWVzLmNoZWNrZWQ7XHJcblxyXG4gICAgY2hlY2tib3gub25jaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25jaGFuZ2UodGhpcy5jaGVja2VkKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBidWlsZDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHZhciByZXQgPSBlbC5kaXYoKTtcclxuXHJcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgdmFyIGdlbmVyYXRlZDtcclxuICAgICAgXHJcbiAgICAgIHN3aXRjaCAoZWxlbWVudC50eXBlKSB7XHJcbiAgICAgICAgY2FzZSBcInJhZGlvXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLnJhZGlvKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJidXR0b25cIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuYnV0dG9uKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJzZWxlY3RcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuc2VsZWN0KGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJpbnB1dFRleHRcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuaW5wdXRUZXh0KGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJpbnB1dE51bWJlclwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5pbnB1dE51bWJlcihlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiaW5wdXRDb2xvclwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5pbnB1dENvbG9yKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJjaGVja2JveFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5jaGVja2JveChlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiaHRtbFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5odG1sKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJicmVha1wiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5icmVhaygpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChnZW5lcmF0ZWQpO1xyXG4gICAgfSwgdGhpcyk7XHJcbiAgICBcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuICBcclxuICBidWlsZExheW91dDogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY29udGVudCA9IGVsKFwiZGl2LnVpLmNvbnRlbnQucGFuZWxcIik7XHJcbiAgICB2YXIgc2lkZWJhciA9IGVsKFwiZGl2LnVpLnNpZGViYXIucGFuZWxcIiwge30sIFsgZWwoXCJkaXYuY29udGVudFwiKSBdKTtcclxuICAgIHZhciByZXNpemVyID0gZWwoXCJkaXYudWkucmVzaXplclwiKTtcclxuICAgIHZhciB0b29sYmFyID0gZWwoXCJkaXYudWkudG9vbGJhclwiKTtcclxuXHJcbiAgICB2YXIgdyA9ICQoXCJib2R5XCIpLm91dGVyV2lkdGgoKTtcclxuICAgIHZhciBzaWRlYmFyV2lkdGggPSAyNTA7XHJcblxyXG4gICAgY29udGVudC5zdHlsZS53aWR0aCA9IHcgLSAyNTAgKyBcInB4XCI7XHJcbiAgICBzaWRlYmFyLnN0eWxlLndpZHRoID0gc2lkZWJhcldpZHRoICsgXCJweFwiO1xyXG5cclxuICAgIHZhciBzaWRlYmFyUmVzaXplRXZlbnQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB2YXIgd2luZG93V2lkdGggPSAkKFwiYm9keVwiKS5vdXRlcldpZHRoKCk7XHJcbiAgICAgIHZhciBzaWRlYmFyV2lkdGggPSBNYXRoLm1heCgzMCwgTWF0aC5taW4od2luZG93V2lkdGggKiAwLjYsIHdpbmRvd1dpZHRoIC0gZS5jbGllbnRYKSk7XHJcbiAgICAgIHZhciBjb250ZW50V2lkdGggPSB3aW5kb3dXaWR0aCAtIHNpZGViYXJXaWR0aDtcclxuXHJcbiAgICAgIHNpZGViYXIuc3R5bGUud2lkdGggPSBzaWRlYmFyV2lkdGggKyBcInB4XCI7XHJcbiAgICAgIGNvbnRlbnQuc3R5bGUud2lkdGggPSBjb250ZW50V2lkdGggKyBcInB4XCI7XHJcblxyXG4gICAgICB3aW5kb3cub25yZXNpemUoKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIG1vdXNlVXBFdmVudCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHNpZGViYXIucmVzaXppbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICQoXCIucmVzaXplci51aVwiKS5yZW1vdmVDbGFzcyhcInJlc2l6aW5nXCIpO1xyXG5cclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2lkZWJhclJlc2l6ZUV2ZW50KTtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG1vdXNlVXBFdmVudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciB3aW5kb3dSZXNpemVFdmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHdpbmRvd1dpZHRoID0gJChcImJvZHlcIikub3V0ZXJXaWR0aCgpO1xyXG4gICAgICB2YXIgY29udGVudFdpZHRoID0gTWF0aC5tYXgod2luZG93V2lkdGggKiAwLjQsIE1hdGgubWluKFxyXG4gICAgICAgIHdpbmRvd1dpZHRoIC0gMzAsXHJcbiAgICAgICAgd2luZG93V2lkdGggLSAkKFwiLnNpZGViYXIudWlcIikub3V0ZXJXaWR0aCgpXHJcbiAgICAgICkpO1xyXG4gICAgICB2YXIgc2lkZWJhcldpZHRoID0gd2luZG93V2lkdGggLSBjb250ZW50V2lkdGg7XHJcblxyXG4gICAgICBzaWRlYmFyLnN0eWxlLndpZHRoID0gc2lkZWJhcldpZHRoICsgXCJweFwiO1xyXG4gICAgICBjb250ZW50LnN0eWxlLndpZHRoID0gY29udGVudFdpZHRoICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2l6ZXIub25tb3VzZWRvd24gPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBzaWRlYmFyLnJlc2l6aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJyZXNpemluZ1wiKTtcclxuXHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHNpZGViYXJSZXNpemVFdmVudCk7XHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBtb3VzZVVwRXZlbnQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB3aW5kb3dSZXNpemVFdmVudCk7XHJcblxyXG4gICAgY29udGVudC5hcHBlbmRDaGlsZCh0b29sYmFyKTtcclxuICAgIHNpZGViYXIuYXBwZW5kQ2hpbGQocmVzaXplcik7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRlbnQpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzaWRlYmFyKTtcclxuICB9LFxyXG5cclxuICAvLyBDcmVhdGluZyBhIHBvcHVwIG1lc3NhZ2VcclxuICBwb3B1cDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgdmFyIG92ZXJsYXkgPSBlbChcImRpdiNwb3B1cE92ZXJsYXlcIiwgW2VsKFwiZGl2I3BvcHVwQ29udGVudFwiLCBbZWwoXCJkaXYudzJ1aS1jZW50ZXJlZFwiLCBbZGF0YV0pXSldKTtcclxuICAgIG92ZXJsYXkub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgVUlCdWlsZGVyLmNsb3NlUG9wdXAoZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKG92ZXJsYXksIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgVHJhbnNsYXRpb25zLnJlZnJlc2goKTtcclxuICB9LFxyXG5cclxuICAvLyBDbG9zaW5nIGEgcG9wdXAgbWVzc2FnZVxyXG4gIGNsb3NlUG9wdXA6IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3B1cE92ZXJsYXlcIik7XHJcbiAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9wdXBDb250ZW50XCIpO1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSBpdCB3YXMgdGhlIG92ZXJsYXkgdGhhdCB3YXMgY2xpY2tlZCwgbm90IGFuIGVsZW1lbnQgYWJvdmUgaXRcclxuICAgIGlmICh0eXBlb2YgZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBlLnRhcmdldCAhPT0gb3ZlcmxheSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgY29udGVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNvbnRlbnQpO1xyXG4gICAgb3ZlcmxheS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG92ZXJsYXkpO1xyXG4gIH0sXHJcblxyXG5cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJQnVpbGRlcjsiLCIvLyBPYmplY3QgY29udGFpbmluZyB1c2VmdWwgbWV0aG9kc1xyXG52YXIgVXRpbHMgPSB7XHJcbiAgZ2V0QnJvd3NlcldpZHRoOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkKFwiLnVpLmNvbnRlbnRcIikub3V0ZXJXaWR0aCgpOy8vd2luZG93LmlubmVyV2lkdGg7XHJcbiAgfSxcclxuXHJcbiAgZ2V0QnJvd3NlckhlaWdodDogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJChcIi51aS5jb250ZW50XCIpLm91dGVySGVpZ2h0KCkgLSAkKFwiLnVpLnRvb2xiYXJcIikub3V0ZXJIZWlnaHQoKTsvL3dpbmRvdy5pbm5lckhlaWdodDtcclxuICB9LFxyXG5cclxuICByYW5kb21SYW5nZTogZnVuY3Rpb24obWluLCBtYXgpIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbik7XHJcbiAgfSxcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVdGlsczsiLCJ2YXIgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlscy5qc1wiKTtcclxuXHJcbi8vIFZJRVdQT1JUXHJcbi8vIFRoaXMgaXMgYmFzaWNhbGx5IGNhbWVyYSArIHByb2plY3RvclxyXG5cclxudmFyIFZpZXdwb3J0ID0gZnVuY3Rpb24oY2FudmFzRWxlbWVudCwgd2lkdGgsIGhlaWdodCwgeCwgeSkge1xyXG4gIC8vIENhbnZhcyBkaW1lbnNpb25zXHJcbiAgaWYgKHdpZHRoICE9IHVuZGVmaW5lZCAmJiBoZWlnaHQgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aGlzLnNldEF1dG9SZXNpemUoZmFsc2UpO1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuc2V0QXV0b1Jlc2l6ZSh0cnVlKTtcclxuICAgIHRoaXMuYXV0b1Jlc2l6ZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2VudGVyIHBvaW50IG9mIHRoZSBjYW1lcmFcclxuICBpZiAoeCAhPT0gdW5kZWZpbmVkICYmIHkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMueCA9IE1hdGguZmxvb3IodGhpcy53aWR0aCAvIDIpO1xyXG4gICAgdGhpcy55ID0gTWF0aC5mbG9vcih0aGlzLmhlaWdodCAvIDIpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2FudmFzIGVsZW1lbnRcclxuICB0aGlzLmNhbnZhc0VsZW1lbnQgPSBjYW52YXNFbGVtZW50O1xyXG5cclxuICBpZiAoY2FudmFzRWxlbWVudCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aGlzLmNhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhc0VsZW1lbnQpO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5yZXNldEVsZW1lbnQoKTsgLy8gUmVzaXplIHRvIG5ldyBkaW1lbnNpb25zXHJcblxyXG4gIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzRWxlbWVudC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbn07XHJcblxyXG4vLyBSZWxvYWRzIHZhbHVlcyBmb3IgdGhlIGNhbnZhcyBlbGVtZW50XHJcblZpZXdwb3J0LnByb3RvdHlwZS5yZXNldEVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLmNhbnZhc0VsZW1lbnQud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gIHRoaXMuY2FudmFzRWxlbWVudC5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxufVxyXG5cclxuLy8gQXV0b21hdGljYWxseSByZXNpemVzIHRoZSB2aWV3cG9ydCB0byBmaWxsIHRoZSBzY3JlZW5cclxuVmlld3BvcnQucHJvdG90eXBlLmF1dG9SZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLndpZHRoID0gVXRpbHMuZ2V0QnJvd3NlcldpZHRoKCk7XHJcbiAgdGhpcy5oZWlnaHQgPSBVdGlscy5nZXRCcm93c2VySGVpZ2h0KCk7XHJcbiAgdGhpcy54ID0gTWF0aC5mbG9vcih0aGlzLndpZHRoIC8gMik7XHJcbiAgdGhpcy55ID0gTWF0aC5mbG9vcih0aGlzLmhlaWdodCAvIDIpO1xyXG59O1xyXG5cclxuLy8gVG9nZ2xlcyB2aWV3cG9ydCBhdXRvIHJlc2l6aW5nXHJcblZpZXdwb3J0LnByb3RvdHlwZS5zZXRBdXRvUmVzaXplID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHJcbiAgdGhpcy5hdXRvUmVzaXplQWN0aXZlID0gdmFsdWU7XHJcblxyXG4gIGlmICh0aGlzLmF1dG9SZXNpemVBY3RpdmUpIHtcclxuICAgIHZhciB0ID0gdGhpcztcclxuICAgIHdpbmRvdy5vbnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB0LmF1dG9SZXNpemUoKTtcclxuICAgICAgdC5yZXNldEVsZW1lbnQoKTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgd2luZG93Lm9ucmVzaXplID0gbnVsbDtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdwb3J0OyJdfQ==
