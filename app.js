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

      element.id = element.id == undefined ? "radio-" + idCount++ : element.id;

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

      if (element.onclick !== undefined) {
        label.onclick = function () {
          if($(this).hasClass("disabled"))
            return;

          element.onclick();
        };
      }

      if (element.checked === true) {
        input.checked = true;
      }

      ret.appendChild(input);
      ret.appendChild(label);
    });

    return ret;
  },
  
  button: function (properties) {
    var ret = el("span.ui.button", {}, [properties.text]);

    ret.disable = function ()
    {
      $(this).addClass("disabled");
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
    };

    if (properties.onclick != undefined)
      ret.onclick = function () {
        if($(this).hasClass("disabled"))
          return;

        properties.onclick();
      };

    if (properties.id != undefined)
      ret.id = properties.id;

    return ret;
  },

  select: function (properties) {
    var ret = el("select.ui");

    if (properties.id != undefined)
      ret.id = properties.id;

    if (properties.onchange != undefined) {
      ret.onchange = function () {
        properties.onchange(this.value);
      };
    }

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
    var ret = el("input.ui", { type: "text" });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    if (properties.id != undefined)
      ret.id = properties.id;

    if (properties.oninput != undefined)
      ret.oninput = function () {
        properties.oninput(this.value);
      };

    if (properties.value != undefined)
      ret.value = properties.value;

    return ret;
  },

  inputNumber: function (properties) {
    var ret = el("input.ui", { type: "number" });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    if (properties.id != undefined)
      ret.id = properties.id;

    if (properties.oninput != undefined)
      ret.oninput = function (e) {
        properties.oninput(this.value);
      };

    if (properties.value != undefined)
      ret.value = properties.value;

    if (properties.min != undefined)
      ret.min = properties.min;

    if (properties.max != undefined)
      ret.max = properties.max;

    return ret;
  },

  html: function (properties) {
    return properties.content;
  },

  inputColor: function (properties) {
    var ret = el("input.ui", { type: "color" });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    if (properties.id != undefined)
      ret.id = properties.id;

    if (properties.value != undefined)
      ret.value = properties.value;

    if (properties.oninput != undefined)
      ret.oninput = function () {
        properties.oninput(this.value);
      };

    return ret;
  },

  checkbox: function (properties) {
    var ret = el("span");

    var id = properties.id != undefined ? properties.id : "checkbox-" + $("input[type=checkbox]").length;
    
    var checkbox = el("input.ui", { type: "checkbox", id: id });
    var label = el("label.ui.button", { for: id });

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

    if (properties.checked != undefined && properties.checked === true)
      checkbox.checked = true;

    if (properties.onchange != undefined)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1VzZXJzL0pha3ViIE1hdHXFoWthL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2FjdGlvbnMuanMiLCJqcy9iZWhhdmlvci5qcyIsImpzL2JvZHl0eXBlLmpzIiwianMvZW5naW5lLmpzIiwianMvZW50aXR5LmpzIiwianMvZW50aXR5ZmlsdGVycy5qcyIsImpzL2VudHJ5LmpzIiwianMvaW5wdXQuanMiLCJqcy9sb2dpYy5qcyIsImpzL3NoYXBlcy5qcyIsImpzL3Rva2VuLmpzIiwianMvdG9vbHMuanMiLCJqcy90eXBpbmcuanMiLCJqcy91aS5qcyIsImpzL3VpYnVpbGRlci5qcyIsImpzL3V0aWxzLmpzIiwianMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xyXG52YXIgQWN0aW9uID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuQWN0aW9uO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxudmFyIGFTZXRDb2xvciA9IGZ1bmN0aW9uKGVmLCBjb2xvcikge1xyXG4gIEFjdGlvbi5jYWxsKHRoaXMsIFwic2V0Q29sb3JcIiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuU1RSSU5HXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaChjb2xvcik7XHJcbn1cclxuYVNldENvbG9yLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuYVNldENvbG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFTZXRDb2xvcjtcclxuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4oYVNldENvbG9yKTtcclxuXHJcbmFTZXRDb2xvci5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5zZXRDb2xvcih0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XHJcbn1cclxuXHJcbnZhciBhVG9ycXVlID0gZnVuY3Rpb24oZWYsIHN0cmVuZ3RoKSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJhcHBseVRvcnF1ZVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHN0cmVuZ3RoKTtcclxufVxyXG5hVG9ycXVlLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuYVRvcnF1ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhVG9ycXVlO1xyXG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihhVG9ycXVlKTtcclxuXHJcbmFUb3JxdWUucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuYm9keS5BcHBseVRvcnF1ZShlbnRpdHkuZ2V0TWFzcygpICogdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xyXG59XHJcblxyXG52YXIgYUFuZ3VsYXJJbXB1bHNlID0gZnVuY3Rpb24oZWYsIHN0cmVuZ3RoKSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJhcHBseUFuZ3VsYXJJbXB1bHNlXCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goc3RyZW5ndGgpO1xyXG59XHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUgPSBuZXcgQWN0aW9uKCk7XHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhQW5ndWxhckltcHVsc2U7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGFBbmd1bGFySW1wdWxzZSk7XHJcblxyXG5hQW5ndWxhckltcHVsc2UucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuYm9keS5BcHBseUFuZ3VsYXJJbXB1bHNlKGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XHJcbn1cclxuXHJcbnZhciBhTGluZWFyVmVsb2NpdHkgPSBmdW5jdGlvbihlZiwgeCwgeSkge1xyXG4gIEFjdGlvbi5jYWxsKHRoaXMsIFwic2V0TGluZWFyVmVsb2NpdHlcIiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goeCk7XHJcbiAgdGhpcy5hcmdzLnB1c2goeSk7XHJcbn1cclxuYUxpbmVhclZlbG9jaXR5LnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuYUxpbmVhclZlbG9jaXR5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFMaW5lYXJWZWxvY2l0eTtcclxuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4oYUxpbmVhclZlbG9jaXR5KTtcclxuXHJcbmFMaW5lYXJWZWxvY2l0eS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5zZXRMaW5lYXJWZWxvY2l0eShuZXcgYjJWZWMyKHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpLCB0aGlzLmFyZ3NbMl0uZXZhbHVhdGUoKSkpO1xyXG59XHJcblxyXG52YXIgYUxpbmVhckltcHVsc2UgPSBmdW5jdGlvbihlZiwgeCwgeSkge1xyXG4gIEFjdGlvbi5jYWxsKHRoaXMsIFwiYXBwbHlMaW5lYXJJbXB1bHNlXCIsIGVmLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaCh4KTtcclxuICB0aGlzLmFyZ3MucHVzaCh5KTtcclxufVxyXG5hTGluZWFySW1wdWxzZS5wcm90b3R5cGUgPSBuZXcgQWN0aW9uKCk7XHJcbmFMaW5lYXJJbXB1bHNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFMaW5lYXJJbXB1bHNlO1xyXG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihhTGluZWFySW1wdWxzZSk7XHJcblxyXG5hTGluZWFySW1wdWxzZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5hcHBseUxpbmVhckltcHVsc2UobmV3IGIyVmVjMihlbnRpdHkuZ2V0TWFzcygpICogdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCksIGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMl0uZXZhbHVhdGUoKSkpO1xyXG59XHJcbiIsInZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XG5cbnZhciBCZWhhdmlvciA9IGZ1bmN0aW9uKGxvZ2ljLCByZXN1bHRzKSB7XG4gIHRoaXMubG9naWMgPSBsb2dpYztcblxuICBpZiAodGhpcy5sb2dpYy50eXBlICE9PSBUeXBlLkJPT0xFQU4pXG4gICAgdGhyb3cgbmV3IFR5cGVFeGNlcHRpb24oVHlwZS5CT09MRUFOLCB0aGlzLmxvZ2ljLnR5cGUsIHRoaXMpO1xuXG4gIHRoaXMucmVzdWx0cyA9IEFycmF5LmlzQXJyYXkocmVzdWx0cykgPyByZXN1bHRzIDogW3Jlc3VsdHNdO1xufTtcblxud2luZG93LnRva2VucyA9IHt9O1xuXG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbiA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIHZhciB0ID0gbmV3IHRva2VuKCk7XG4gIHdpbmRvdy50b2tlbnNbdC5uYW1lXSA9IHQ7XG59O1xuXG5cbkJlaGF2aW9yLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICByZXR1cm4gdGhpcy5sb2dpYy5ldmFsdWF0ZShlbnRpdHkpO1xufTtcblxuQmVoYXZpb3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBcIkJlaGF2aW9yKFwiICsgdGhpcy5sb2dpYy50b1N0cmluZygpICsgXCIsIFwiICsgdGhpcy5yZXN1bHRzLnRvU3RyaW5nKCkgKyBcIilcIjtcbn07XG5cbkJlaGF2aW9yLnByb3RvdHlwZS5yZXN1bHQgPSBmdW5jdGlvbigpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLnJlc3VsdHNbaV0uZXhlY3V0ZSgpXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQmVoYXZpb3I7XG5cbnJlcXVpcmUoXCIuL2xvZ2ljLmpzXCIpO1xucmVxdWlyZShcIi4vYWN0aW9ucy5qc1wiKTtcbnJlcXVpcmUoXCIuL2VudGl0eWZpbHRlcnMuanNcIik7IiwidmFyIEJvZHlUeXBlID0ge1xyXG4gIERZTkFNSUNfQk9EWTogTW9kdWxlLmIyX2R5bmFtaWNCb2R5LFxyXG4gIFNUQVRJQ19CT0RZOiBNb2R1bGUuYjJfc3RhdGljQm9keSxcclxuICBLSU5FTUFUSUNfQk9EWTogTW9kdWxlLmIyX2tpbmVtYXRpY0JvZHlcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQm9keVR5cGU7IiwidmFyIFVJID0gcmVxdWlyZShcIi4vdWkuanNcIik7XHJcbnZhciBUb29scyA9IHJlcXVpcmUoXCIuL3Rvb2xzLmpzXCIpO1xyXG5cclxuXHJcbmNvbnN0IEFVVE9fSURfUFJFRklYID0gXCJFTlRJVFlfTlVNQkVSX1wiO1xyXG5cclxuY29uc3QgRElTUExBWV9SQVRJTyA9IDIwO1xyXG5cclxuLyovIE15c2xpZW5reVxyXG5cclxubG9ja292YW5pZSBrYW1lcnkgbmEgb2JqZWt0XHJcbiAqIHByZWNob2R5XHJcbmFrbyBmdW5ndWplIGNlbGEga2FtZXJhP1xyXG5cclxuLyovXHJcblxyXG5cclxuLy8gRU5HSU5FXHJcblxyXG4vLyBjb25zdHJ1Y3RvclxyXG5cclxudmFyIEVuZ2luZSA9IGZ1bmN0aW9uKHZpZXdwb3J0LCBncmF2aXR5KSB7XHJcbiAgdGhpcy52aWV3cG9ydCA9IHZpZXdwb3J0O1xyXG4gIHRoaXMuZW50aXRpZXMgPSBbXTtcclxuICB0aGlzLnNlbGVjdGVkRW50aXR5ID0gbnVsbDtcclxuICBcclxuICB0aGlzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSID0gMTY7XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXBzID0gW107XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSOyBpKyspIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzLnB1c2goe1xyXG4gICAgICBcIm5hbWVcIjogaSArIDEsXHJcbiAgICAgIFwibWFza1wiOiBwYXJzZUludChBcnJheSh0aGlzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSICsgMSkuam9pbihcIjFcIiksIDIpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHRoaXMubGlmZXRpbWVFbnRpdGllcyA9IDA7XHJcblxyXG4gIHRoaXMud29ybGQgPSBuZXcgYjJXb3JsZChncmF2aXR5LCB0cnVlKTtcclxuICB0aGlzLndvcmxkLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gIHdpbmRvdy5JbnB1dC5pbml0aWFsaXplKHZpZXdwb3J0LmNhbnZhc0VsZW1lbnQpO1xyXG59O1xyXG5cclxuLy8gQ2hhbmdlcyBydW5uaW5nIHN0YXRlIG9mIHRoZSBzaW11bGF0aW9uXHJcbkVuZ2luZS5wcm90b3R5cGUudG9nZ2xlUGF1c2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdGhpcy53b3JsZC5wYXVzZWQgPSAhdGhpcy53b3JsZC5wYXVzZWQ7XHJcbiAgdGhpcy5zZWxlY3RlZEVudGl0eSA9IG51bGw7XHJcblxyXG4gIHdpbmRvdy5JbnB1dC50b29sID0gVG9vbHMuQmxhbms7XHJcblxyXG4gIGlmKHRoaXMud29ybGQucGF1c2VkKVxyXG4gICAgd2luZG93LklucHV0LnRvb2wgPSBUb29scy5TZWxlY3Rpb247XHJcbn07XHJcblxyXG5cclxuLy8gUmV0dXJucyB0aGUgZW50aXR5IHdpdGggaWQgc3BlY2lmaWVkIGJ5IGFyZ3VtZW50XHJcbkVuZ2luZS5wcm90b3R5cGUuZ2V0RW50aXR5QnlJZCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAodGhpcy5lbnRpdGllc1tpXS5pZCA9PT0gaWQpXHJcbiAgICAgIHJldHVybiB0aGlzLmVudGl0aWVzW2ldO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG4vLyBSZXR1cm5zIGFuIGFycmF5IG9mIGVudGl0aWVzIHdpdGggc3BlY2lmaWVkIGNvbGxpc2lvbkdyb3VwXHJcbkVuZ2luZS5wcm90b3R5cGUuZ2V0RW50aXRpZXNCeUNvbGxpc2lvbkdyb3VwID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuICB2YXIgcmV0ID0gW107XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKHRoaXMuZW50aXRpZXNbaV0uY29sbGlzaW9uR3JvdXAgPT09IGdyb3VwKVxyXG4gICAgICByZXQucHVzaCh0aGlzLmVudGl0aWVzW2ldKTtcclxuICB9XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn1cclxuXHJcbi8vIEFkZGluZyBhbiBlbnRpdHkgdG8gdGhlIHdvcmxkXHJcbkVuZ2luZS5wcm90b3R5cGUuYWRkRW50aXR5ID0gZnVuY3Rpb24oZW50aXR5LCB0eXBlKSB7XHJcbiAgLy8gZ2VuZXJhdGUgYXV0byBpZFxyXG4gIGlmIChlbnRpdHkuaWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgZW50aXR5LmlkID0gQVVUT19JRF9QUkVGSVggKyB0aGlzLmxpZmV0aW1lRW50aXRpZXM7XHJcbiAgfVxyXG5cclxuICBlbnRpdHkuZW5naW5lID0gdGhpcztcclxuXHJcbiAgdGhpcy5saWZldGltZUVudGl0aWVzKys7XHJcblxyXG4gIGVudGl0eS5ib2R5LnNldF90eXBlKHR5cGUpO1xyXG5cclxuICBlbnRpdHkuYm9keSA9IHRoaXMud29ybGQuQ3JlYXRlQm9keShlbnRpdHkuYm9keSk7XHJcbiAgZW50aXR5LmZpeHR1cmUgPSBlbnRpdHkuYm9keS5DcmVhdGVGaXh0dXJlKGVudGl0eS5maXh0dXJlKTtcclxuICB0aGlzLmVudGl0aWVzLnB1c2goZW50aXR5KTtcclxuXHJcbiAgcmV0dXJuIGVudGl0eTtcclxufVxyXG5cclxuLy8gQ2hlY2tzIHdoZXRoZXIgdHdvIGdyb3VwcyBzaG91bGQgY29sbGlkZVxyXG5FbmdpbmUucHJvdG90eXBlLmdldENvbGxpc2lvbiA9IGZ1bmN0aW9uKGdyb3VwQSwgZ3JvdXBCKSB7XHJcbiAgcmV0dXJuICh0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEFdLm1hc2sgPj4gZ3JvdXBCKSAmIDE7XHJcbn1cclxuXHJcbi8vIFNldHMgdHdvIGdyb3VwcyB1cCB0byBjb2xsaWRlXHJcbkVuZ2luZS5wcm90b3R5cGUuc2V0Q29sbGlzaW9uID0gZnVuY3Rpb24oZ3JvdXBBLCBncm91cEIsIHZhbHVlKSB7XHJcbiAgdmFyIG1hc2tBID0gKDEgPDwgZ3JvdXBCKTtcclxuICB2YXIgbWFza0IgPSAoMSA8PCBncm91cEEpO1xyXG5cclxuICBpZiAodmFsdWUpIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayB8IG1hc2tBO1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrIHwgbWFza0I7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayAmIH5tYXNrQTtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQl0ubWFzayA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQl0ubWFzayAmIH5tYXNrQjtcclxuICB9XHJcbiAgdGhpcy51cGRhdGVDb2xsaXNpb25zKClcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbi8vIENoYW5nZXMgdGhlIElEIG9mIGFuIGVudGl0eVxyXG5FbmdpbmUucHJvdG90eXBlLmNoYW5nZUlkID0gZnVuY3Rpb24gKGVudGl0eSwgaWQpIHtcclxuICBlbnRpdHkuaWQgPSBpZDtcclxufTtcclxuXHJcbi8vIFNlbGVjdHMgYW4gZW50aXR5IGFuZCBzaG93cyBpdHMgcHJvcGVydGllcyBpbiB0aGUgc2lkZWJhclxyXG5FbmdpbmUucHJvdG90eXBlLnNlbGVjdEVudGl0eSA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gIHRoaXMuc2VsZWN0ZWRFbnRpdHkgPSBpbmRleCA9PT0gbnVsbCA/IG51bGwgOiB0aGlzLmVudGl0aWVzW2luZGV4XTtcclxuICBVSS5idWlsZFNpZGViYXIodGhpcy5zZWxlY3RlZEVudGl0eSk7XHJcbn1cclxuXHJcbi8vIFVwZGF0ZXMgY29sbGlzaW9uIG1hc2tzIGZvciBhbGwgZW50aXRpZXMsIGJhc2VkIG9uIGVuZ2luZSdzIGNvbGxpc2lvbkdyb3VwcyB0YWJsZVxyXG5FbmdpbmUucHJvdG90eXBlLnVwZGF0ZUNvbGxpc2lvbnMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB0aGlzLnVwZGF0ZUNvbGxpc2lvbih0aGlzLmVudGl0aWVzW2ldKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy8gVXBkYXRlcyBjb2xsaXNpb24gbWFzayBmb3IgYW4gZW50aXR5LCBiYXNlZCBvbiBlbmdpbmUncyBjb2xsaXNpb25Hcm91cHMgdGFibGVcclxuRW5naW5lLnByb3RvdHlwZS51cGRhdGVDb2xsaXNpb24gPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICB2YXIgZmlsdGVyRGF0YSA9IGVudGl0eS5maXh0dXJlLkdldEZpbHRlckRhdGEoKTtcclxuICBmaWx0ZXJEYXRhLnNldF9tYXNrQml0cyh0aGlzLmNvbGxpc2lvbkdyb3Vwc1tlbnRpdHkuY29sbGlzaW9uR3JvdXBdLm1hc2spO1xyXG4gIGVudGl0eS5maXh0dXJlLlNldEZpbHRlckRhdGEoZmlsdGVyRGF0YSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG4vLyBPbmUgc2ltdWxhdGlvbiBzdGVwLiBTaW11bGF0aW9uIGxvZ2ljIGhhcHBlbnMgaGVyZS5cclxuRW5naW5lLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gRlBTIHRpbWVyXHJcbiAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgY3R4ID0gdGhpcy52aWV3cG9ydC5jb250ZXh0O1xyXG5cclxuICAvLyBjbGVhciBzY3JlZW5cclxuICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMudmlld3BvcnQud2lkdGgsIHRoaXMudmlld3BvcnQuaGVpZ2h0KTtcclxuXHJcbiAgY3R4LnNhdmUoKTtcclxuXHJcbiAgLy8gZHJhdyBhbGwgZW50aXRpZXNcclxuICBmb3IgKHZhciBpID0gdGhpcy5lbnRpdGllcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC50cmFuc2xhdGUodGhpcy52aWV3cG9ydC54IC0gdGhpcy52aWV3cG9ydC53aWR0aCAvIDIsIHRoaXMudmlld3BvcnQueSAtIHRoaXMudmlld3BvcnQuaGVpZ2h0IC8gMik7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5lbnRpdGllc1tpXS5jb2xvcjtcclxuXHJcbiAgICBpZih0aGlzLnNlbGVjdGVkRW50aXR5ID09IHRoaXMuZW50aXRpZXNbaV0pIHtcclxuICAgICAgY3R4LnNoYWRvd0NvbG9yID0gXCJibGFja1wiO1xyXG4gICAgICBjdHguc2hhZG93Qmx1ciA9IDEwO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB4ID0gdGhpcy5lbnRpdGllc1tpXS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3goKTtcclxuICAgIHZhciB5ID0gdGhpcy5lbnRpdGllc1tpXS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3koKTtcclxuICAgIGN0eC50cmFuc2xhdGUoeCwgeSk7XHJcbiAgICBjdHgucm90YXRlKHRoaXMuZW50aXRpZXNbaV0uYm9keS5HZXRBbmdsZSgpKTtcclxuXHJcbiAgICB0aGlzLmVudGl0aWVzW2ldLmRyYXcoY3R4KTtcclxuXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG5cclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5lbnRpdGllc1tpXS5iZWhhdmlvcnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgdmFyIGJlaGF2aW9yID0gdGhpcy5lbnRpdGllc1tpXS5iZWhhdmlvcnNbal07XHJcblxyXG4gICAgICBpZiAoYmVoYXZpb3IuY2hlY2sodGhpcy5lbnRpdGllc1tpXSkpXHJcbiAgICAgICAgYmVoYXZpb3IucmVzdWx0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoIV9lbmdpbmUud29ybGQucGF1c2VkKSB7XHJcbiAgICAvLyBib3gyZCBzaW11bGF0aW9uIHN0ZXBcclxuICAgIHRoaXMud29ybGQuU3RlcCgxIC8gNjAsIDEwLCA1KTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICB3aW5kb3cuSW5wdXQudG9vbC5vbm1vdmUoY3R4KTtcclxuICB9XHJcbiAgXHJcblxyXG4gIC8vIFJlbGVhc2VkIGtleXMgYXJlIG9ubHkgdG8gYmUgcHJvY2Vzc2VkIG9uY2VcclxuICB3aW5kb3cuSW5wdXQubW91c2UuY2xlYW5VcCgpO1xyXG4gIHdpbmRvdy5JbnB1dC5rZXlib2FyZC5jbGVhblVwKCk7XHJcblxyXG4gIHZhciBlbmQgPSBEYXRlLm5vdygpO1xyXG5cclxuICAvLyBDYWxsIG5leHQgc3RlcFxyXG4gIHNldFRpbWVvdXQod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICAgIF9lbmdpbmUuc3RlcCgpXHJcbiAgfSksIE1hdGgubWluKDYwIC0gZW5kIC0gc3RhcnQsIDApKTtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW5naW5lOyIsIi8vIEVOVElUWVxyXG52YXIgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlscy5qc1wiKTtcclxuXHJcbmNvbnN0IEFVVE9fQ09MT1JfUkFOR0UgPSBbMCwgMjMwXTtcclxuXHJcbnZhciBFbnRpdHkgPSBmdW5jdGlvbihzaGFwZSwgZml4dHVyZSwgYm9keSwgaWQsIGNvbGxpc2lvbkdyb3VwKSB7XHJcbiAgdGhpcy5pZCA9IGlkO1xyXG4gIHRoaXMuZGVhZCA9IGZhbHNlO1xyXG4gIHRoaXMubGF5ZXIgPSAwO1xyXG5cclxuICB0aGlzLmZpeGVkUm90YXRpb24gPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25Hcm91cCA9IGNvbGxpc2lvbkdyb3VwO1xyXG4gIGlmICh0aGlzLmNvbGxpc2lvbkdyb3VwID09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cCA9IDA7XHJcbiAgfVxyXG5cclxuICB0aGlzLmJlaGF2aW9ycyA9IFtdO1xyXG5cclxuICB0aGlzLmZpeHR1cmUgPSBmaXh0dXJlO1xyXG4gIGlmICh0aGlzLmZpeHR1cmUgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB2YXIgZml4dHVyZSA9IG5ldyBiMkZpeHR1cmVEZWYoKTtcclxuICAgIGZpeHR1cmUuc2V0X2RlbnNpdHkoMTApXHJcbiAgICBmaXh0dXJlLnNldF9mcmljdGlvbigwLjUpO1xyXG4gICAgZml4dHVyZS5zZXRfcmVzdGl0dXRpb24oMC4yKTtcclxuXHJcbiAgICB0aGlzLmZpeHR1cmUgPSBmaXh0dXJlO1xyXG4gIH1cclxuICB0aGlzLmZpeHR1cmUuc2V0X3NoYXBlKHNoYXBlKTtcclxuXHJcbiAgdmFyIGZpbHRlckRhdGEgPSB0aGlzLmZpeHR1cmUuZ2V0X2ZpbHRlcigpO1xyXG4gIGZpbHRlckRhdGEuc2V0X2NhdGVnb3J5Qml0cygxIDw8IGNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgLy8gQ29uc3RydWN0b3IgaXMgY2FsbGVkIHdoZW4gaW5oZXJpdGluZywgc28gd2UgbmVlZCB0byBjaGVjayBmb3IgX2VuZ2luZSBhdmFpbGFiaWxpdHlcclxuICBpZiAodHlwZW9mIF9lbmdpbmUgIT09ICd1bmRlZmluZWQnKVxyXG4gICAgZmlsdGVyRGF0YS5zZXRfbWFza0JpdHMoX2VuZ2luZS5jb2xsaXNpb25Hcm91cHNbdGhpcy5jb2xsaXNpb25Hcm91cF0ubWFzayk7XHJcblxyXG4gIHRoaXMuZml4dHVyZS5zZXRfZmlsdGVyKGZpbHRlckRhdGEpO1xyXG5cclxuICB0aGlzLmJvZHkgPSBib2R5O1xyXG4gIGlmICh0aGlzLmJvZHkgIT09IHVuZGVmaW5lZClcclxuICAgIHRoaXMuYm9keS5zZXRfZml4ZWRSb3RhdGlvbihmYWxzZSk7XHJcblxyXG4gIC8vIEF1dG8gZ2VuZXJhdGUgY29sb3JcclxuICB2YXIgciA9IFV0aWxzLnJhbmRvbVJhbmdlKEFVVE9fQ09MT1JfUkFOR0VbMF0sIEFVVE9fQ09MT1JfUkFOR0VbMV0pLnRvU3RyaW5nKDE2KTsgciA9IHIubGVuZ3RoID09IDEgPyBcIjBcIiArIHIgOiByO1xyXG4gIHZhciBnID0gVXRpbHMucmFuZG9tUmFuZ2UoQVVUT19DT0xPUl9SQU5HRVswXSwgQVVUT19DT0xPUl9SQU5HRVsxXSkudG9TdHJpbmcoMTYpOyBnID0gZy5sZW5ndGggPT0gMSA/IFwiMFwiICsgZyA6IGc7XHJcbiAgdmFyIGIgPSBVdGlscy5yYW5kb21SYW5nZShBVVRPX0NPTE9SX1JBTkdFWzBdLCBBVVRPX0NPTE9SX1JBTkdFWzFdKS50b1N0cmluZygxNik7IGIgPSBiLmxlbmd0aCA9PSAxID8gXCIwXCIgKyBiIDogYjtcclxuICB0aGlzLmNvbG9yID0gXCIjXCIgKyByICArIGcgKyBiIDtcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLmRlYWQgPSB0cnVlO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XHJcbiAgYWxlcnQoXCJFUlJPUiEgQ2Fubm90IGRyYXcgRW50aXR5OiBVc2UgZGVyaXZlZCBjbGFzc2VzLlwiKTtcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRDb2xvciA9IGZ1bmN0aW9uKGNvbG9yKSB7XHJcbiAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRJZCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgdGhpcy5pZCA9IGlkO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXAgPSBncm91cDtcclxuXHJcbiAgdmFyIGZpbHRlckRhdGEgPSB0aGlzLmZpeHR1cmUuR2V0RmlsdGVyRGF0YSgpO1xyXG4gIGZpbHRlckRhdGEuc2V0X2NhdGVnb3J5Qml0cygxIDw8IGdyb3VwKTtcclxuICB0aGlzLmZpeHR1cmUuU2V0RmlsdGVyRGF0YShmaWx0ZXJEYXRhKTtcclxuXHJcbiAgX2VuZ2luZS51cGRhdGVDb2xsaXNpb24odGhpcyk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmdldExpbmVhclZlbG9jaXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMuYm9keS5HZXRMaW5lYXJWZWxvY2l0eSgpO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmdldE1hc3MgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gTWF0aC5tYXgoMSwgdGhpcy5ib2R5LkdldE1hc3MoKSk7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0TGluZWFyVmVsb2NpdHkgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICB0aGlzLmJvZHkuU2V0TGluZWFyVmVsb2NpdHkodmVjdG9yKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuYXBwbHlUb3JxdWUgPSBmdW5jdGlvbihmb3JjZSkge1xyXG4gIHRoaXMuYm9keS5BcHBseVRvcnF1ZShmb3JjZSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFwcGx5TGluZWFySW1wdWxzZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gIHRoaXMuYm9keS5BcHBseUxpbmVhckltcHVsc2UodmVjdG9yLCB0aGlzLmJvZHkuR2V0V29ybGRDZW50ZXIoKSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmRpc2FibGVSb3RhdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgdGhpcy5maXhlZFJvdGF0aW9uID0gdmFsdWU7XHJcbiAgdGhpcy5ib2R5LlNldEZpeGVkUm90YXRpb24odmFsdWUpXHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFkZEJlaGF2aW9yID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcclxuICB0aGlzLmJlaGF2aW9ycy5wdXNoKGJlaGF2aW9yKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVudGl0eTsiLCJ2YXIgQmVoYXZpb3IgPSByZXF1aXJlKFwiLi9iZWhhdmlvci5qc1wiKTtcclxudmFyIEVudGl0eUZpbHRlciA9IHJlcXVpcmUoXCIuL3Rva2VuLmpzXCIpLkVudGl0eUZpbHRlcjtcclxudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbnZhciBlZkJ5SWQgPSBmdW5jdGlvbihpZCkge1xyXG4gIEVudGl0eUZpbHRlci5jYWxsKHRoaXMsIFwiZmlsdGVyQnlJZFwiLCBhcmd1bWVudHMsIFtUeXBlLlNUUklOR10pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChpZCk7XHJcbn1cclxuZWZCeUlkLnByb3RvdHlwZSA9IG5ldyBFbnRpdHlGaWx0ZXIoKTtcclxuZWZCeUlkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGVmQnlJZDtcclxuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4oZWZCeUlkKTtcclxuXHJcbmVmQnlJZC5wcm90b3R5cGUuZGVjaWRlID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgcmV0dXJuIGVudGl0eS5pZCA9PT0gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCk7XHJcbn1cclxuXHJcbnZhciBlZkJ5Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gIEVudGl0eUZpbHRlci5jYWxsKHRoaXMsIFwiZmlsdGVyQnlHcm91cFwiLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChncm91cCk7XHJcbn1cclxuZWZCeUNvbGxpc2lvbkdyb3VwLnByb3RvdHlwZSA9IG5ldyBFbnRpdHlGaWx0ZXIoKTtcclxuZWZCeUNvbGxpc2lvbkdyb3VwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGVmQnlDb2xsaXNpb25Hcm91cDtcclxuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4oZWZCeUNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUuZGVjaWRlID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgcmV0dXJuIGVudGl0eS5jb2xsaXNpb25Hcm91cCA9PT0gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCk7XHJcbn1cclxuXHJcbnZhciBlZkJ5TG9naWMgPSBmdW5jdGlvbihsb2dpYykge1xyXG4gIEVudGl0eUZpbHRlci5jYWxsKHRoaXMsIFwiZmlsdGVyQnlDb25kaXRpb25cIiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGxvZ2ljKTtcclxufVxyXG5lZkJ5TG9naWMucHJvdG90eXBlID0gbmV3IEVudGl0eUZpbHRlcigpO1xyXG5lZkJ5TG9naWMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gZWZCeUxvZ2ljO1xyXG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihlZkJ5TG9naWMpO1xyXG5cclxuZWZCeUxvZ2ljLnByb3RvdHlwZS5kZWNpZGUgPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICByZXR1cm4gbmV3IEJlaGF2aW9yKHRoaXMuYXJnc1swXSkuY2hlY2soZW50aXR5KTtcclxufTsiLCJyZXF1aXJlKFwiLi9pbnB1dC5qc1wiKTtcclxuXHJcbnZhciBFbmdpbmUgPSByZXF1aXJlKFwiLi9lbmdpbmUuanNcIik7XHJcbnZhciBWaWV3cG9ydCA9IHJlcXVpcmUoXCIuL3ZpZXdwb3J0LmpzXCIpO1xyXG52YXIgVUkgPSByZXF1aXJlKFwiLi91aS5qc1wiKTtcclxudmFyIEJvZHlUeXBlID0gcmVxdWlyZShcIi4vYm9keXR5cGUuanNcIik7XHJcbnZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xyXG52YXIgVG9rZW4gPSByZXF1aXJlKFwiLi90b2tlbi5qc1wiKS5Ub2tlbjtcclxuXHJcbnZhciBDaXJjbGUgPSByZXF1aXJlKFwiLi9zaGFwZXMuanNcIikuQ2lyY2xlO1xyXG52YXIgUmVjdGFuZ2xlID0gcmVxdWlyZShcIi4vc2hhcGVzLmpzXCIpLlJlY3RhbmdsZTtcclxuXHJcblVJLmluaXRpYWxpemUoKTtcclxuXHJcbl9lbmdpbmUgPSBuZXcgRW5naW5lKG5ldyBWaWV3cG9ydCgkKFwiI21haW5DYW52YXNcIilbMF0pLCBuZXcgYjJWZWMyKDAsIDUwMCkpO1xyXG5cclxuX2VuZ2luZS5hZGRFbnRpdHkobmV3IENpcmNsZShuZXcgYjJWZWMyKDUwMCwgNTApLCAyMCksIEJvZHlUeXBlLkRZTkFNSUNfQk9EWSlcclxuICAuc2V0Q29sbGlzaW9uR3JvdXAoMilcclxuICAuc2V0SWQoXCJrcnVoXCIpXHJcbiAgLmRpc2FibGVSb3RhdGlvbihmYWxzZSlcclxuICAuYWRkQmVoYXZpb3IoXHJcbiAgICBuZXcgQmVoYXZpb3IoXHJcbiAgICAgIFRva2VuLnBhcnNlKFwiaXNCdXR0b25VcChudW1iZXIoMzIpKVwiKSxcclxuICAgICAgVG9rZW4ucGFyc2UoXCJzZXRMaW5lYXJWZWxvY2l0eShmaWx0ZXJCeUlkKHRleHQoa3J1aCkpLCBnZXRWZWxvY2l0eVgoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSksIG51bWJlcigtOTk5OTk5OTk5OTk5OTk5OTk5KSlcIilcclxuICAgIClcclxuICApXHJcbiAgLmFkZEJlaGF2aW9yKFxyXG4gICAgbmV3IEJlaGF2aW9yKFxyXG4gICAgICBUb2tlbi5wYXJzZShcImlzQnV0dG9uRG93bihudW1iZXIoMzcpKVwiKSxcclxuICAgICAgVG9rZW4ucGFyc2UoXCJzZXRMaW5lYXJWZWxvY2l0eShmaWx0ZXJCeUlkKHRleHQoa3J1aCkpLCBudW1iZXIoLTEwMCksIGdldFZlbG9jaXR5WShmaWx0ZXJCeUlkKHRleHQoa3J1aCkpKSlcIilcclxuICAgIClcclxuICApXHJcbiAgLmFkZEJlaGF2aW9yKFxyXG4gICAgbmV3IEJlaGF2aW9yKFxyXG4gICAgICBUb2tlbi5wYXJzZShcImlzQnV0dG9uRG93bihudW1iZXIoMzkpKVwiKSxcclxuICAgICAgVG9rZW4ucGFyc2UoXCJzZXRMaW5lYXJWZWxvY2l0eShmaWx0ZXJCeUlkKHRleHQoa3J1aCkpLCBudW1iZXIoMTAwKSwgZ2V0VmVsb2NpdHlZKGZpbHRlckJ5SWQodGV4dChrcnVoKSkpKVwiKVxyXG4gICAgKVxyXG4gICk7XHJcblxyXG5fZW5naW5lLmFkZEVudGl0eShuZXcgUmVjdGFuZ2xlKG5ldyBiMlZlYzIoNDAwLCA0MDApLCBuZXcgYjJWZWMyKDQwMCwgMykpLCBCb2R5VHlwZS5LSU5FTUFUSUNfQk9EWSlcclxuICAuc2V0SWQoXCJwbGF0Zm9ybVwiKVxyXG4gIC5zZXRDb2xsaXNpb25Hcm91cCgxKTtcclxuXHJcbndpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgX2VuZ2luZS5zdGVwKCk7XHJcbn0pO1xyXG5cclxuXHJcblxyXG5cclxuIiwiLy8gSU5QVVQgQ0FQVFVSSU5HXHJcblxyXG52YXIgVG9vbHMgPSByZXF1aXJlKFwiLi90b29scy5qc1wiKTtcclxuXHJcbndpbmRvdy53aW5kb3cuSW5wdXQgPSB7XHJcbiAgdG9vbDogVG9vbHMuU2VsZWN0aW9uLFxyXG5cclxuICBtb3VzZToge1xyXG4gICAgeDogMCxcclxuICAgIHk6IDAsXHJcbiAgICBsZWZ0RG93bjogZmFsc2UsXHJcbiAgICByaWdodERvd246IGZhbHNlLFxyXG4gICAgbGVmdFVwOiBmYWxzZSxcclxuICAgIHJpZ2h0VXA6IGZhbHNlLFxyXG5cclxuICAgIHVwZGF0ZVBvc2l0aW9uOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgdGhpcy54ID0gZXZlbnQucGFnZVggLSBfZW5naW5lLnZpZXdwb3J0LmNhbnZhc0VsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgdGhpcy55ID0gZXZlbnQucGFnZVkgLSBfZW5naW5lLnZpZXdwb3J0LmNhbnZhc0VsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVCdXR0b25zRG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC50YXJnZXQgIT0gX2VuZ2luZS52aWV3cG9ydC5jYW52YXNFbGVtZW50KVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxKSB7XHJcbiAgICAgICAgdGhpcy5sZWZ0RG93biA9IHRydWU7XHJcblxyXG4gICAgICAgIHdpbmRvdy5JbnB1dC50b29sLm9uY2xpY2soKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAzKVxyXG4gICAgICAgIHRoaXMucmlnaHREb3duID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc1VwOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPSBfZW5naW5lLnZpZXdwb3J0LmNhbnZhc0VsZW1lbnQpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEpIHtcclxuICAgICAgICB0aGlzLmxlZnREb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5sZWZ0VXAgPSB0cnVlO1xyXG5cclxuICAgICAgICB3aW5kb3cuSW5wdXQudG9vbC5vbnJlbGVhc2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAzKSB7XHJcbiAgICAgICAgdGhpcy5yaWdodERvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJpZ2h0VXAgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFuVXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy5sZWZ0VXAgPSBmYWxzZTtcclxuICAgICAgdGhpcy5yaWdodFVwID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAga2V5Ym9hcmQ6IHtcclxuICAgIGRvd246IG5ldyBTZXQoKSxcclxuICAgIHVwOiBuZXcgU2V0KCksXHJcblxyXG4gICAgaXNEb3duOiBmdW5jdGlvbiAoa2V5Q29kZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5kb3duLmhhcyhrZXlDb2RlKVxyXG4gICAgfSxcclxuXHJcbiAgICBpc1VwOiBmdW5jdGlvbiAoa2V5Q29kZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy51cC5oYXMoa2V5Q29kZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUJ1dHRvbnNEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgdGhpcy5kb3duLmFkZChldmVudC53aGljaCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUJ1dHRvbnNVcDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHRoaXMuZG93bi5kZWxldGUoZXZlbnQud2hpY2gpO1xyXG4gICAgICB0aGlzLnVwLmFkZChldmVudC53aGljaCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFuVXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy51cC5jbGVhcigpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIGVsZW1lbnQub25tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHdpbmRvdy53aW5kb3cuSW5wdXQubW91c2UudXBkYXRlUG9zaXRpb24oZSk7XHJcbiAgICB9O1xyXG4gICAgZWxlbWVudC5vbm1vdXNlZG93biA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgd2luZG93LndpbmRvdy5JbnB1dC5tb3VzZS51cGRhdGVCdXR0b25zRG93bihlKTtcclxuICAgIH07XHJcbiAgICBlbGVtZW50Lm9ubW91c2V1cCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgd2luZG93LndpbmRvdy5JbnB1dC5tb3VzZS51cGRhdGVCdXR0b25zVXAoZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50Lm9ua2V5ZG93biA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgd2luZG93LndpbmRvdy5JbnB1dC5rZXlib2FyZC51cGRhdGVCdXR0b25zRG93bihlKTtcclxuICAgIH07XHJcbiAgICBkb2N1bWVudC5vbmtleXVwID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICB3aW5kb3cud2luZG93LklucHV0LmtleWJvYXJkLnVwZGF0ZUJ1dHRvbnNVcChlKTtcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG5cclxuIiwidmFyIEJlaGF2aW9yID0gcmVxdWlyZShcIi4vYmVoYXZpb3IuanNcIik7XG52YXIgTG9naWMgPSByZXF1aXJlKFwiLi90b2tlbi5qc1wiKS5Mb2dpYztcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XG52YXIgRml4VHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5GaXhUeXBlO1xuXG52YXIgbEFuZCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJBTkRcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLkJPT0xFQU4sIFR5cGUuQk9PTEVBTl0pO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xufTtcbmxBbmQucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sQW5kLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxBbmQ7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsQW5kKTtcblxubEFuZC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgJiYgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xufVxuXG52YXIgbE9yID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIk9SXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOLCBUeXBlLkJPT0xFQU5dKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcbn1cbmxPci5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxPci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsT3I7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsT3IpO1xuXG5sT3IucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgfHwgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG52YXIgbE5vdCA9IGZ1bmN0aW9uIChhKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJOT1RcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLkJPT0xFQU5dKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbn1cbmxOb3QucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sTm90LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxOb3Q7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsTm90KTtcblxubE5vdC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAhdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCk7XG59XG5cbnZhciBsU3RyaW5nID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJ0ZXh0XCIsIFR5cGUuU1RSSU5HLCBhcmd1bWVudHMsIFtUeXBlLkxJVEVSQUxdKTtcblxuICB0aGlzLmFyZ3MucHVzaCh2YWx1ZSk7XG59XG5sU3RyaW5nLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubFN0cmluZy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsU3RyaW5nO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obFN0cmluZyk7XG5cbmxTdHJpbmcucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdO1xufVxuXG52YXIgbE51bWJlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwibnVtYmVyXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkxJVEVSQUxdKTtcblxuICB0aGlzLmFyZ3MucHVzaCh2YWx1ZSk7XG59XG5sTnVtYmVyLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubE51bWJlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTnVtYmVyO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obE51bWJlcik7XG5cbmxOdW1iZXIucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLmFyZ3NbMF0pO1xufVxuXG52YXIgbEJvb2wgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImJvb2xlYW5cIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLkxJVEVSQUxdKTtcblxuICB0aGlzLmFyZ3MucHVzaCh2YWx1ZSk7XG59XG5sQm9vbC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxCb29sLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxCb29sO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obEJvb2wpO1xuXG5sQm9vbC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0gPT09IFwidHJ1ZVwiO1xufVxuXG52YXIgbEJ1dHRvbkRvd24gPSBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJpc0J1dHRvbkRvd25cIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGJ1dHRvbik7XG59XG5sQnV0dG9uRG93bi5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxCdXR0b25Eb3duLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxCdXR0b25Eb3duO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obEJ1dHRvbkRvd24pO1xuXG5sQnV0dG9uRG93bi5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB3aW5kb3cuSW5wdXQua2V5Ym9hcmQuaXNEb3duKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpKTtcbn1cblxudmFyIGxCdXR0b25VcCA9IGZ1bmN0aW9uIChidXR0b24pIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImlzQnV0dG9uVXBcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGJ1dHRvbik7XG59XG5sQnV0dG9uVXAucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sQnV0dG9uVXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbEJ1dHRvblVwO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obEJ1dHRvblVwKTtcblxubEJ1dHRvblVwLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHdpbmRvdy5JbnB1dC5rZXlib2FyZC5pc1VwKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpKTtcbn1cblxudmFyIGxSYW5kb20gPSBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcInJhbmRvbU51bWJlclwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2gobWluKTtcbiAgdGhpcy5hcmdzLnB1c2gobWF4KTtcbn1cbmxSYW5kb20ucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sUmFuZG9tLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxSYW5kb207XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsUmFuZG9tKTtcblxubFJhbmRvbS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBVdGlscy5yYW5kb21SYW5nZSh0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSAmJiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XG59XG5cbnZhciBsVmVsb2NpdHlYID0gZnVuY3Rpb24gKGVmKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJnZXRWZWxvY2l0eVhcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xufVxubFZlbG9jaXR5WC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxWZWxvY2l0eVgucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFZlbG9jaXR5WDtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxWZWxvY2l0eVgpO1xuXG5sVmVsb2NpdHlYLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVudGl0eSA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKVswXTtcblxuICByZXR1cm4gZW50aXR5LmJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKS5nZXRfeCgpO1xufVxuXG52YXIgbFZlbG9jaXR5WSA9IGZ1bmN0aW9uIChlZikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiZ2V0VmVsb2NpdHlZXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcbn1cbmxWZWxvY2l0eVkucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sVmVsb2NpdHlZLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxWZWxvY2l0eVk7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsVmVsb2NpdHlZKTtcblxubFZlbG9jaXR5WS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbnRpdHkgPSB0aGlzLmFyZ3NbMF0uZmlsdGVyKClbMF07XG5cbiAgcmV0dXJuIGVudGl0eS5ib2R5LkdldExpbmVhclZlbG9jaXR5KCkuZ2V0X3koKTtcbn1cblxudmFyIGxQbHVzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIitcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xufVxubFBsdXMucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sUGx1cy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsUGx1cztcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxQbHVzKTtcblxubFBsdXMucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgKyB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKTtcbn1cblxudmFyIGxNdWx0aXBseSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCIqXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcbn1cbmxNdWx0aXBseS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxNdWx0aXBseS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTXVsdGlwbHk7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsTXVsdGlwbHkpO1xuXG5sTXVsdGlwbHkucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKTtcbn1cblxudmFyIGxEaXZpZGUgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiL1wiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59XG5sRGl2aWRlLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubERpdmlkZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsRGl2aWRlO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obERpdmlkZSk7XG5cbmxEaXZpZGUucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgLyB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKTtcbn1cblxudmFyIGxNaW51cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCItXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcbn1cbmxNaW51cy5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxNaW51cy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTWludXM7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsTWludXMpO1xuXG5sTWludXMucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgKyB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKTtcbn0iLCJ2YXIgRW50aXR5ID0gcmVxdWlyZShcIi4vZW50aXR5LmpzXCIpO1xyXG5cclxuLy8gQ2lyY2xlIGVudGl0eVxyXG52YXIgQ2lyY2xlID0gZnVuY3Rpb24oY2VudGVyLCByYWRpdXMsIGZpeHR1cmUsIGlkLCBjb2xsaXNpb25Hcm91cCkge1xyXG4gIHZhciBzaGFwZSA9IG5ldyBiMkNpcmNsZVNoYXBlKCk7XHJcbiAgc2hhcGUuc2V0X21fcmFkaXVzKHJhZGl1cyk7XHJcblxyXG4gIHZhciBib2R5ID0gbmV3IGIyQm9keURlZigpO1xyXG4gIGJvZHkuc2V0X3Bvc2l0aW9uKGNlbnRlcik7XHJcblxyXG4gIEVudGl0eS5jYWxsKHRoaXMsIHNoYXBlLCBmaXh0dXJlLCBib2R5LCBpZCwgY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuQ2lyY2xlLnByb3RvdHlwZSA9IG5ldyBFbnRpdHkoKTtcclxuQ2lyY2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENpcmNsZTtcclxuXHJcbkNpcmNsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGN0eCkge1xyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuXHJcbiAgY3R4LmFyYygwLCAwLCB0aGlzLnJhZGl1cywgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuXHJcbiAgY3R4LmZpbGwoKTtcclxuXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcclxuICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gXCJkZXN0aW5hdGlvbi1vdXRcIjtcclxuXHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5tb3ZlVG8oMCwgMCk7XHJcbiAgY3R4LmxpbmVUbygwLCB0aGlzLnJhZGl1cyk7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG4gIGN0eC5jbG9zZVBhdGgoKTtcclxufVxyXG5cclxuXHJcbi8vIFJlY3RhbmdsZSBlbnRpdHlcclxudmFyIFJlY3RhbmdsZSA9IGZ1bmN0aW9uKGNlbnRlciwgZXh0ZW50cywgZml4dHVyZSwgaWQsIGNvbGxpc2lvbkdyb3VwKSB7XHJcbiAgdmFyIHNoYXBlID0gbmV3IGIyUG9seWdvblNoYXBlKCk7XHJcbiAgc2hhcGUuU2V0QXNCb3goZXh0ZW50cy5nZXRfeCgpLCBleHRlbnRzLmdldF95KCkpXHJcblxyXG4gIHZhciBib2R5ID0gbmV3IGIyQm9keURlZigpO1xyXG4gIGJvZHkuc2V0X3Bvc2l0aW9uKGNlbnRlcik7XHJcblxyXG4gIEVudGl0eS5jYWxsKHRoaXMsIHNoYXBlLCBmaXh0dXJlLCBib2R5LCBpZCwgY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICB0aGlzLmV4dGVudHMgPSBleHRlbnRzO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5SZWN0YW5nbGUucHJvdG90eXBlID0gbmV3IEVudGl0eSgpO1xyXG5SZWN0YW5nbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVjdGFuZ2xlO1xyXG5cclxuUmVjdGFuZ2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY3R4KSB7XHJcbiAgdmFyIGhhbGZXaWR0aCA9IHRoaXMuZXh0ZW50cy5nZXRfeCgpO1xyXG4gIHZhciBoYWxmSGVpZ2h0ID0gdGhpcy5leHRlbnRzLmdldF95KCk7XHJcblxyXG4gIGN0eC5maWxsUmVjdCgtaGFsZldpZHRoLCAtaGFsZkhlaWdodCwgaGFsZldpZHRoICogMiwgaGFsZkhlaWdodCAqIDIpO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMuQ2lyY2xlID0gQ2lyY2xlO1xyXG5tb2R1bGUuZXhwb3J0cy5SZWN0YW5nbGUgPSBSZWN0YW5nbGU7IiwidmFyIEJlaGF2aW9yID0gcmVxdWlyZShcIi4vYmVoYXZpb3IuanNcIik7XHJcbnZhciBGaXhUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLkZpeFR5cGU7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XHJcblxyXG52YXIgVHlwZUV4Y2VwdGlvbiA9IGZ1bmN0aW9uKGV4cGVjdGVkLCByZWNlaXZlZCwgdG9rZW4pIHtcclxuICB0aGlzLmV4cGVjdGVkID0gZXhwZWN0ZWQ7XHJcbiAgdGhpcy5yZWNlaXZlZCA9IHJlY2VpdmVkO1xyXG4gIHRoaXMudG9rZW4gPSB0b2tlbjtcclxufTtcclxuXHJcbnZhciBUb2tlbiA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgdGhpcy50eXBlID0gdHlwZTtcclxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLlBSRUZJWDtcclxuICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gIHRoaXMuYXJncyA9IGFyZ3MgPT0gdW5kZWZpbmVkID8gW10gOiBhcmdzO1xyXG4gIHRoaXMuYXJndW1lbnRfdHlwZXMgPSBhcmd1bWVudF90eXBlcztcclxuICB0aGlzLmFyZ3MgPSBbXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFyZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChhcmdzW2ldLnR5cGUgIT09IGFyZ3VtZW50X3R5cGVzW2ldICYmIGFyZ3VtZW50X3R5cGVzW2ldICE9PSBUeXBlLkxJVEVSQUwpXHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXhjZXB0aW9uKGFyZ3VtZW50X3R5cGVzW2ldLCBhcmdzW2ldLnR5cGUsIHRoaXMpO1xyXG4gIH1cclxufTtcclxuXHJcblRva2VuLnN0b3BDaGFycyA9IFtcIihcIiwgXCIpXCIsIFwiLFwiXTtcclxuXHJcblRva2VuLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciByZXQgPSBcIlwiO1xyXG4gIHZhciBhcmdTdHJpbmdzID0gW107XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hcmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBhcmdTdHJpbmdzLnB1c2godGhpcy5hcmdzW2ldLnRvU3RyaW5nKCkpO1xyXG4gIH1cclxuXHJcbiAgYXJnU3RyaW5ncyA9IGFyZ1N0cmluZ3Muam9pbihcIiwgXCIpO1xyXG5cclxuICBzd2l0Y2ggKHRoaXMuZml4VHlwZSkge1xyXG4gICAgY2FzZSBGaXhUeXBlLlBSRUZJWDpcclxuICAgICAgcmV0ID0gdGhpcy5uYW1lICsgXCIoXCIgKyBhcmdTdHJpbmdzICsgXCIpXCI7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBGaXhUeXBlLklORklYOlxyXG4gICAgICByZXQgPSB0aGlzLmFyZ3NbMF0udG9TdHJpbmcoKSArIFwiIFwiICsgdGhpcy5uYW1lICsgXCIgXCIgKyB0aGlzLmFyZ3NbMV0udG9TdHJpbmcoKTtcclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuVG9rZW4ucGFyc2UgPSBmdW5jdGlvbihpbnB1dCkge1xyXG4gIFRva2VuLnBhcnNlcklucHV0ID0gaW5wdXQ7XHJcbiAgVG9rZW4ucGFyc2VySW5wdXRXaG9sZSA9IGlucHV0O1xyXG4gIFRva2VuLnBhcnNlclN0YWNrID0gW107XHJcblxyXG4gIGRvIHtcclxuICAgIFRva2VuLnBhcnNlU3RlcCgpXHJcbiAgfSB3aGlsZSAoVG9rZW4ucGFyc2VySW5wdXQubGVuZ3RoKTtcclxuXHJcbiAgdmFyIHJldCA9IFRva2VuLnBhcnNlclN0YWNrLnBvcCgpO1xyXG5cclxuICBpZiAoVG9rZW4ucGFyc2VyU3RhY2subGVuZ3RoKVxyXG4gICAgdGhyb3cgXCJVbmV4cGVjdGVkIFwiICsgcmV0Lm5hbWU7XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5Ub2tlbi5yZWFkV2hpdGVzcGFjZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHdoaWxlICgvXFxzLy50ZXN0KFRva2VuLnBhcnNlcklucHV0WzBdKSAmJiBUb2tlbi5wYXJzZXJJbnB1dC5sZW5ndGgpIHtcclxuICAgIFRva2VuLnBhcnNlcklucHV0ID0gVG9rZW4ucGFyc2VySW5wdXQuc2xpY2UoMSk7XHJcbiAgfVxyXG59O1xyXG5cclxuVG9rZW4ucGFyc2VOYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgVG9rZW4ucmVhZFdoaXRlc3BhY2UoKTtcclxuXHJcbiAgdmFyIHJldCA9IFwiXCI7XHJcblxyXG4gIHdoaWxlICghL1xccy8udGVzdChUb2tlbi5wYXJzZXJJbnB1dFswXSkgJiYgVG9rZW4ucGFyc2VySW5wdXQubGVuZ3RoICYmIFRva2VuLnN0b3BDaGFycy5pbmRleE9mKFRva2VuLnBhcnNlcklucHV0WzBdKSA9PT0gLTEpIC8vIHJlYWQgdW50aWwgYSB3aGl0ZXNwYWNlIG9jY3Vyc1xyXG4gIHtcclxuICAgIHJldCArPSBUb2tlbi5wYXJzZXJJbnB1dFswXVxyXG4gICAgVG9rZW4ucGFyc2VySW5wdXQgPSBUb2tlbi5wYXJzZXJJbnB1dC5zbGljZSgxKTtcclxuICB9XHJcblxyXG4gIFRva2VuLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5Ub2tlbi5yZWFkQ2hhciA9IGZ1bmN0aW9uKGNoYXIpIHtcclxuICBUb2tlbi5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICBpZiAoVG9rZW4ucGFyc2VySW5wdXRbMF0gIT09IGNoYXIpIHtcclxuICAgIHZhciBwb3NpdGlvbiA9IFRva2VuLnBhcnNlcklucHV0V2hvbGUubGVuZ3RoIC0gVG9rZW4ucGFyc2VySW5wdXQubGVuZ3RoO1xyXG4gICAgdGhyb3cgXCJFeHBlY3RlZCAnXCIgKyBjaGFyICsgXCInIGF0IHBvc2l0aW9uIFwiICsgcG9zaXRpb24gKyBcIiBhdCAnXCIgKyBUb2tlbi5wYXJzZXJJbnB1dFdob2xlLnN1YnN0cihwb3NpdGlvbikgKyBcIidcIjtcclxuICB9XHJcblxyXG4gIFRva2VuLnBhcnNlcklucHV0ID0gVG9rZW4ucGFyc2VySW5wdXQuc2xpY2UoMSk7XHJcblxyXG4gIFRva2VuLnJlYWRXaGl0ZXNwYWNlKCk7XHJcbn07XHJcblxyXG5Ub2tlbi5wYXJzZVN0ZXAgPSBmdW5jdGlvbihleHBlY3RlZFR5cGUpIHtcclxuICB2YXIgbmFtZSA9IFRva2VuLnBhcnNlTmFtZSgpO1xyXG4gIHZhciB0b2tlbiA9IHdpbmRvdy50b2tlbnNbbmFtZV07XHJcblxyXG4gIGlmICh0b2tlbiA9PT0gdW5kZWZpbmVkICYmIGV4cGVjdGVkVHlwZSA9PT0gVHlwZS5MSVRFUkFMKSB7XHJcbiAgICByZXR1cm4gbmFtZTtcclxuICB9XHJcblxyXG4gIGlmICh0b2tlbiA9PSB1bmRlZmluZWQpIHtcclxuICAgIHRocm93IFwiRXhwZWN0ZWQgYXJndW1lbnQgd2l0aCB0eXBlIFwiICsgZXhwZWN0ZWRUeXBlO1xyXG4gIH1cclxuXHJcbiAgaWYgKGV4cGVjdGVkVHlwZSAhPT0gdW5kZWZpbmVkICYmIHRva2VuLnR5cGUgIT09IGV4cGVjdGVkVHlwZSkge1xyXG4gICAgdGhyb3cgXCJVbmV4cGVjdGVkIFwiICsgdG9rZW4udHlwZSArIFwiICh3YXMgZXhwZWN0aW5nIFwiICsgZXhwZWN0ZWRUeXBlICsgXCIpXCI7XHJcbiAgfVxyXG5cclxuICB2YXIgbnVtQXJncyA9IHRva2VuLmFyZ3VtZW50X3R5cGVzLmxlbmd0aDtcclxuXHJcbiAgdmFyIGFyZ3MgPSBbXTtcclxuXHJcbiAgaWYgKHRva2VuLmZpeFR5cGUgPT09IEZpeFR5cGUuSU5GSVgpIHtcclxuICAgIHZhciBhID0gVG9rZW4ucGFyc2VyU3RhY2sucG9wKCk7XHJcblxyXG4gICAgaWYgKGEudHlwZSAhPT0gdG9rZW4uYXJndW1lbnRfdHlwZXNbMF0pXHJcbiAgICAgIHRocm93IFwiVW5leHBlY3RlZCBcIiArIGEudHlwZSArIFwiICh3YXMgZXhwZWN0aW5nIFwiICsgdG9rZW4uYXJndW1lbnRfdHlwZXNbMF0gKyBcIilcIjtcclxuXHJcbiAgICBhcmdzID0gW2EsIFRva2VuLnBhcnNlU3RlcCh0b2tlbi5hcmd1bWVudF90eXBlc1sxXSldO1xyXG4gICAgVG9rZW4ucGFyc2VyU3RhY2sucG9wKCk7XHJcbiAgfVxyXG5cclxuICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5QUkVGSVgpIHtcclxuICAgIFRva2VuLnJlYWRDaGFyKFwiKFwiKTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQXJnczsgaSsrKSB7XHJcbiAgICAgIGFyZ3MucHVzaChUb2tlbi5wYXJzZVN0ZXAodG9rZW4uYXJndW1lbnRfdHlwZXNbaV0pKTtcclxuXHJcbiAgICAgIFRva2VuLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gICAgICBpZiAoVG9rZW4ucGFyc2VySW5wdXRbMF0gPT09IFwiLFwiKVxyXG4gICAgICAgIFRva2VuLnBhcnNlcklucHV0ID0gVG9rZW4ucGFyc2VySW5wdXQuc2xpY2UoMSk7XHJcbiAgICB9XHJcblxyXG4gICAgVG9rZW4ucmVhZENoYXIoXCIpXCIpO1xyXG4gIH1cclxuXHJcbiAgdmFyIG5ld1Rva2VuID0gbmV3IHRva2VuLmNvbnN0cnVjdG9yKCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBuZXdUb2tlbi5hcmdzW2ldID0gYXJnc1tpXTtcclxuXHJcbiAgICBUb2tlbi5wYXJzZXJTdGFjay5wb3AoKTtcclxuICB9XHJcbiAgVG9rZW4ucGFyc2VyU3RhY2sucHVzaChuZXdUb2tlbik7XHJcblxyXG4gIHJldHVybiBuZXdUb2tlbjtcclxufTtcclxuXHJcblxyXG52YXIgTG9naWMgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBhcmdzLCBhcmd1bWVudF90eXBlcykge1xyXG4gIFRva2VuLmNhbGwodGhpcywgbmFtZSwgdHlwZSwgYXJncywgYXJndW1lbnRfdHlwZXMpO1xyXG59O1xyXG5Mb2dpYy5wcm90b3R5cGUgPSBuZXcgVG9rZW4oKTtcclxuTG9naWMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9naWM7XHJcblxyXG5Mb2dpYy5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbigpIHsgLy8gVXNlIGEgZGVyaXZlZCBjbGFzc1xyXG4gIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcblxyXG52YXIgQWN0aW9uID0gZnVuY3Rpb24obmFtZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICBUb2tlbi5jYWxsKHRoaXMsIG5hbWUsIFR5cGUuQUNUSU9OLCBhcmdzLCBhcmd1bWVudF90eXBlcyk7XHJcbn07XHJcbkFjdGlvbi5wcm90b3R5cGUgPSBuZXcgVG9rZW4oKTtcclxuQWN0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFjdGlvbjtcclxuXHJcbkFjdGlvbi5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkgeyAvLyBVc2UgYSBkZXJpdmVkIGNsYXNzXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuQWN0aW9uLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGVudGl0aWVzID0gdGhpcy5hcmdzWzBdLmZpbHRlcigpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHRoaXMuZWFjaChlbnRpdGllc1tpXSk7XHJcbiAgfVxyXG59O1xyXG5cclxuXHJcbnZhciBFbnRpdHlGaWx0ZXIgPSBmdW5jdGlvbihuYW1lLCBhcmdzLCBhcmd1bWVudF90eXBlcykge1xyXG4gIFRva2VuLmNhbGwodGhpcywgbmFtZSwgVHlwZS5FTlRJVFlGSUxURVIsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKTtcclxufTtcclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZSA9IG5ldyBUb2tlbigpO1xyXG5FbnRpdHlGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW50aXR5RmlsdGVyO1xyXG5cclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZS5kZWNpZGUgPSBmdW5jdGlvbihlbnRpdHkpIHsgLy8gVXNlIGRlcml2ZWQgY2xhc3NcclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5FbnRpdHlGaWx0ZXIucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciByZXQgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IF9lbmdpbmUuZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmICh0aGlzLmRlY2lkZShfZW5naW5lLmVudGl0aWVzW2ldKSlcclxuICAgICAgcmV0LnB1c2goX2VuZ2luZS5lbnRpdGllc1tpXSk7XHJcbiAgfVxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5Ub2tlbiA9IFRva2VuO1xyXG5tb2R1bGUuZXhwb3J0cy5BY3Rpb24gPSBBY3Rpb247XHJcbm1vZHVsZS5leHBvcnRzLkxvZ2ljID0gTG9naWM7XHJcbm1vZHVsZS5leHBvcnRzLkVudGl0eUZpbHRlciA9IEVudGl0eUZpbHRlcjtcclxuXHJcbi8vIFRPRE86IGxpbmVhciBhY3Rpb24sIHBvcm92bmF2YW5pZSwgdWhseSwgcGx1cywgbWludXMgLCBkZWxlbm8sIGtyYXQsIHggbmEgbiIsInZhciBTaGFwZSA9IHJlcXVpcmUoXCIuL3NoYXBlcy5qc1wiKTtcclxudmFyIFR5cGUgPSByZXF1aXJlKFwiLi9ib2R5dHlwZS5qc1wiKTtcclxuXHJcbnZhciBCbGFuayA9IHtcclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7fSxcclxuICBvbnJlbGVhc2U6IGZ1bmN0aW9uICgpIHt9LFxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge31cclxufTtcclxuXHJcblxyXG52YXIgU2VsZWN0aW9uID0ge1xyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgIF9lbmdpbmUuc2VsZWN0RW50aXR5KG51bGwpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSBfZW5naW5lLmVudGl0aWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGlmIChfZW5naW5lLmVudGl0aWVzW2ldLmZpeHR1cmUuVGVzdFBvaW50KFxyXG4gICAgICAgICAgbmV3IGIyVmVjMihfZW5naW5lLnZpZXdwb3J0LnggLSBfZW5naW5lLnZpZXdwb3J0LndpZHRoIC8gMiArIHdpbmRvdy5JbnB1dC5tb3VzZS54LCBfZW5naW5lLnZpZXdwb3J0LnkgLSBfZW5naW5lLnZpZXdwb3J0LmhlaWdodCAvIDIgICsgd2luZG93LklucHV0Lm1vdXNlLnkpKVxyXG4gICAgICApIHtcclxuICAgICAgICBfZW5naW5lLnNlbGVjdEVudGl0eShpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgb25yZWxlYXNlOiBmdW5jdGlvbiAoKSB7fSxcclxuICBvbm1vdmU6IGZ1bmN0aW9uICgpIHt9XHJcbn07XHJcblxyXG5cclxudmFyIFJlY3RhbmdsZSA9IHtcclxuICBvcmlnaW46IG51bGwsXHJcblxyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMub25tb3ZlID0gdGhpcy5kcmFnZ2luZztcclxuICAgIHRoaXMub3JpZ2luID0gW3dpbmRvdy5JbnB1dC5tb3VzZS54LCB3aW5kb3cuSW5wdXQubW91c2UueV07XHJcbiAgfSxcclxuXHJcbiAgb25yZWxlYXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgdyA9IHdpbmRvdy5JbnB1dC5tb3VzZS54IC0gdGhpcy5vcmlnaW5bMF07XHJcbiAgICB2YXIgaCA9IHdpbmRvdy5JbnB1dC5tb3VzZS55IC0gdGhpcy5vcmlnaW5bMV07XHJcblxyXG4gICAgX2VuZ2luZS5hZGRFbnRpdHkobmV3IFNoYXBlLlJlY3RhbmdsZShcclxuICAgICAgbmV3IGIyVmVjMih0aGlzLm9yaWdpblswXSArIHcgLyAyLCB0aGlzLm9yaWdpblsxXSArIGggLyAyKSxcclxuICAgICAgbmV3IGIyVmVjMih3IC8gMiwgaCAvIDIpKSwgVHlwZS5EWU5BTUlDX0JPRFkpO1xyXG5cclxuICAgIHRoaXMub25tb3ZlID0gZnVuY3Rpb24oKXt9O1xyXG4gICAgdGhpcy5vcmlnaW4gPSBudWxsO1xyXG4gIH0sXHJcblxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICB9LFxyXG5cclxuICBkcmFnZ2luZzogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgMC40KVwiO1xyXG4gICAgY3R4LmZpbGxSZWN0KHRoaXMub3JpZ2luWzBdLCB0aGlzLm9yaWdpblsxXSwgd2luZG93LklucHV0Lm1vdXNlLnggLSB0aGlzLm9yaWdpblswXSwgd2luZG93LklucHV0Lm1vdXNlLnkgLSB0aGlzLm9yaWdpblsxXSk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG52YXIgQ2lyY2xlID0ge1xyXG4gIG9yaWdpbjogbnVsbCxcclxuICByYWRpdXM6IDAsXHJcblxyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMub25tb3ZlID0gdGhpcy5kcmFnZ2luZztcclxuICAgIHRoaXMub3JpZ2luID0gW3dpbmRvdy5JbnB1dC5tb3VzZS54LCB3aW5kb3cuSW5wdXQubW91c2UueV07XHJcbiAgfSxcclxuXHJcbiAgb25yZWxlYXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBfZW5naW5lLmFkZEVudGl0eShuZXcgU2hhcGUuQ2lyY2xlKFxyXG4gICAgICBuZXcgYjJWZWMyKHRoaXMub3JpZ2luWzBdICsgdGhpcy5yYWRpdXMsIHRoaXMub3JpZ2luWzFdICsgdGhpcy5yYWRpdXMpLFxyXG4gICAgICB0aGlzLnJhZGl1cyksIFR5cGUuRFlOQU1JQ19CT0RZKTtcclxuXHJcbiAgICB0aGlzLm9ubW92ZSA9IGZ1bmN0aW9uKCl7fTtcclxuICAgIHRoaXMub3JpZ2luID0gbnVsbDtcclxuICAgIHRoaXMucmFkaXVzID0gMDtcclxuICB9LFxyXG5cclxuICBvbm1vdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgfSxcclxuXHJcbiAgZHJhZ2dpbmc6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgIHRoaXMucmFkaXVzID0gTWF0aC5taW4od2luZG93LklucHV0Lm1vdXNlLnggLSB0aGlzLm9yaWdpblswXSwgd2luZG93LklucHV0Lm1vdXNlLnkgLSB0aGlzLm9yaWdpblsxXSkgLyAyO1xyXG5cclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcblxyXG4gICAgY3R4LmFyYyh0aGlzLm9yaWdpblswXSArIHRoaXMucmFkaXVzLCB0aGlzLm9yaWdpblsxXSArIHRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cywgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuXHJcbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsIDAsIDAsIDAuNClcIjtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5CbGFuayA9IEJsYW5rO1xyXG5tb2R1bGUuZXhwb3J0cy5TZWxlY3Rpb24gPSBTZWxlY3Rpb247XHJcbm1vZHVsZS5leHBvcnRzLlJlY3RhbmdsZSA9IFJlY3RhbmdsZTtcclxubW9kdWxlLmV4cG9ydHMuQ2lyY2xlID0gQ2lyY2xlOyIsInZhciBUeXBlID0ge1xyXG4gIEJPT0xFQU46IFwiYm9vbGVhblwiLFxyXG4gIE5VTUJFUjogXCJudW1iZXJcIixcclxuICBTVFJJTkc6IFwic3RyaW5nXCIsXHJcbiAgQVJSQVk6IFwiYXJyYXlcIixcclxuICBBQ1RJT046IFwiYWN0aW9uXCIsXHJcbiAgRU5USVRZRklMVEVSOiBcImVudGl0eUZpbHRlclwiLFxyXG4gIExJVEVSQUw6IFwibGl0ZXJhbFwiXHJcbn07XHJcblxyXG52YXIgRml4VHlwZSA9IHtcclxuICBJTkZJWDogXCJpbmZpeFwiLFxyXG4gIFBSRUZJWDogXCJwcmVmaXhcIlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMuVHlwZSA9IFR5cGU7XHJcbm1vZHVsZS5leHBvcnRzLkZpeFR5cGUgPSBGaXhUeXBlOyIsInZhciBUb29scyA9IHJlcXVpcmUoXCIuL3Rvb2xzLmpzXCIpO1xyXG52YXIgQm9keVR5cGUgPSByZXF1aXJlKFwiLi9ib2R5dHlwZS5qc1wiKTtcclxudmFyIFVJQnVpbGRlciA9IHJlcXVpcmUoXCIuL3VpYnVpbGRlci5qc1wiKTtcclxuXHJcbi8vIE9iamVjdCBmb3IgYnVpbGRpbmcgdGhlIFVJXHJcbnZhciBVSSA9IHtcclxuICAvLyBVSSBpbml0aWFsaXNhdGlvblxyXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGxhbmd1YWdlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBUcmFuc2xhdGlvbnMuc3RyaW5ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBsYW5ndWFnZXMucHVzaCh7dGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWQoMCwgaSksIHZhbHVlOiBpfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHByb3BlcnRpZXMgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxyXG5cclxuICAgICAgICBpZDogXCJwbGF5XCIsXHJcbiAgICAgICAgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIpLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIF9lbmdpbmUudG9nZ2xlUGF1c2UoKTtcclxuXHJcbiAgICAgICAgICBpZiAoX2VuZ2luZS53b3JsZC5wYXVzZWQpIHtcclxuICAgICAgICAgICAgJChcIiNwbGF5XCIpLmh0bWwoVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIpKTtcclxuXHJcbiAgICAgICAgICAgICQoXCIjY29sbGlzaW9ucywgI3Rvb2xcIikuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5lbmFibGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJChcIiNwbGF5XCIpLmh0bWwoVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDMpKTtcclxuXHJcbiAgICAgICAgICAgICQoXCIjY29sbGlzaW9ucywgI3Rvb2xcIikuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5kaXNhYmxlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge3R5cGU6IFwiYnJlYWtcIn0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxyXG5cclxuICAgICAgICBpZDogXCJjb2xsaXNpb25zXCIsXHJcbiAgICAgICAgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDEpLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIFVJQnVpbGRlci5wb3B1cChVSS5jcmVhdGVDb2xsaXNpb25zKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge3R5cGU6IFwiYnJlYWtcIn0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcInJhZGlvXCIsXHJcblxyXG4gICAgICAgIGlkOiBcInRvb2xcIixcclxuICAgICAgICBlbGVtZW50czogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTcpLCBjaGVja2VkOiB0cnVlLCBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5JbnB1dC50b29sID0gVG9vbHMuU2VsZWN0aW9uO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE4KSwgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB3aW5kb3cuSW5wdXQudG9vbCA9IFRvb2xzLlJlY3RhbmdsZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxOSksIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgd2luZG93LklucHV0LnRvb2wgPSBUb29scy5DaXJjbGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAge3R5cGU6IFwiYnJlYWtcIn0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcInNlbGVjdFwiLFxyXG4gICAgICAgIG9wdGlvbnM6IGxhbmd1YWdlcyxcclxuXHJcbiAgICAgICAgb25jaGFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgVHJhbnNsYXRpb25zLnNldExhbmd1YWdlKHZhbHVlICogMSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgfVxyXG4gICAgXTtcclxuXHJcbiAgICBVSUJ1aWxkZXIuYnVpbGRMYXlvdXQoKTtcclxuICAgICQoXCIudWkudG9vbGJhclwiKVswXS5hcHBlbmRDaGlsZChVSUJ1aWxkZXIuYnVpbGQocHJvcGVydGllcykpO1xyXG4gICAgJChcIi51aS5jb250ZW50XCIpWzBdLmFwcGVuZENoaWxkKGVsKFwiY2FudmFzI21haW5DYW52YXNcIikpO1xyXG5cclxuICB9LFxyXG5cclxuICAvLyBCdWlsZGluZyB0aGUgY29sbGlzaW9uIGdyb3VwIHRhYmxlXHJcbiAgY3JlYXRlQ29sbGlzaW9uczogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGFibGUgPSBlbChcInRhYmxlLmNvbGxpc2lvblRhYmxlXCIpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2VuZ2luZS5DT0xMSVNJT05fR1JPVVBTX05VTUJFUiArIDE7IGkrKykge1xyXG4gICAgICB2YXIgdHIgPSBlbChcInRyXCIpO1xyXG5cclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBfZW5naW5lLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSICsgMTsgaisrKSB7XHJcbiAgICAgICAgdmFyIHRkID0gZWwoXCJ0ZFwiKTtcclxuXHJcbiAgICAgICAgLy8gZmlyc3Qgcm93XHJcbiAgICAgICAgaWYgKGkgPT09IDAgJiYgaiA+IDApIHtcclxuICAgICAgICAgIHRkLmlubmVySFRNTCA9IFwiPGRpdj48c3Bhbj5cIiArIF9lbmdpbmUuY29sbGlzaW9uR3JvdXBzW2ogLSAxXS5uYW1lICsgXCI8L3NwYW4+PC9kaXY+XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmaXJzdCBjb2x1bW5cclxuICAgICAgICBlbHNlIGlmIChqID09PSAwICYmIGkgIT09IDApXHJcbiAgICAgICAgICB0ZC5pbm5lckhUTUwgPSBfZW5naW5lLmNvbGxpc2lvbkdyb3Vwc1tpIC0gMV0ubmFtZTtcclxuXHJcbiAgICAgICAgLy8gcmVsZXZhbnQgdHJpYW5nbGVcclxuICAgICAgICBlbHNlIGlmIChpIDw9IGogJiYgaiAhPT0gMCAmJiBpICE9PSAwKSB7XHJcbiAgICAgICAgICB0ZC5yb3cgPSBpO1xyXG4gICAgICAgICAgdGQuY29sID0gajtcclxuXHJcbiAgICAgICAgICAvLyBoaWdobGlnaHRpbmdcclxuICAgICAgICAgIHRkLm9ubW91c2VvdmVyID0gZnVuY3Rpb24oaSwgaiwgdGFibGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHZhciB0ZHMgPSB0YWJsZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRkXCIpO1xyXG4gICAgICAgICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgdGRzLmxlbmd0aDsgbisrKSB7XHJcbiAgICAgICAgICAgICAgICB0ZHNbbl0uY2xhc3NOYW1lID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBvbmx5IGhpZ2hsaWdodCB1cCB0byB0aGUgcmVsZXZhbnQgY2VsbFxyXG4gICAgICAgICAgICAgICAgaWYgKCh0ZHNbbl0ucm93ID09PSBpICYmIHRkc1tuXS5jb2wgPD0gaikgfHwgKHRkc1tuXS5jb2wgPT09IGogJiYgdGRzW25dLnJvdyA8PSBpKSlcclxuICAgICAgICAgICAgICAgICAgdGRzW25dLmNsYXNzTmFtZSA9IFwiaGlnaGxpZ2h0XCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KGksIGosIHRhYmxlKTtcclxuXHJcbiAgICAgICAgICAvLyBtb3JlIGhpZ2hsaWdodGluZ1xyXG4gICAgICAgICAgdGQub25tb3VzZW91dCA9IGZ1bmN0aW9uKHRhYmxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICB2YXIgdGRzID0gdGFibGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0ZFwiKTtcclxuICAgICAgICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IHRkcy5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgICAgICAgICAgdGRzW25dLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KHRhYmxlKTtcclxuXHJcbiAgICAgICAgICAvLyBjaGVja2JveCBmb3IgY29sbGlzaW9uIHRvZ2dsaW5nXHJcbiAgICAgICAgICB2YXIgY2hlY2tib3ggPSBlbChcImlucHV0XCIsIHt0eXBlOiBcImNoZWNrYm94XCJ9KTtcclxuXHJcbiAgICAgICAgICBpZiAoX2VuZ2luZS5nZXRDb2xsaXNpb24oaSAtIDEsIGogLSAxKSlcclxuICAgICAgICAgICAgY2hlY2tib3guc2V0QXR0cmlidXRlKFwiY2hlY2tlZFwiLCBcImNoZWNrZWRcIik7XHJcblxyXG4gICAgICAgICAgY2hlY2tib3gub25jaGFuZ2UgPSBmdW5jdGlvbihpLCBqLCBjaGVja2JveCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgX2VuZ2luZS5zZXRDb2xsaXNpb24oaSAtIDEsIGogLSAxLCBjaGVja2JveC5jaGVja2VkID8gMSA6IDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KGksIGosIGNoZWNrYm94KTtcclxuXHJcbiAgICAgICAgICAvLyBjbGlja2luZyB0aGUgY2hlY2tib3gncyBjZWxsIHNob3VsZCB3b3JrIGFzIHdlbGxcclxuICAgICAgICAgIHRkLm9uY2xpY2sgPSBmdW5jdGlvbihjaGVja2JveCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgIGlmIChlLnRhcmdldCA9PT0gY2hlY2tib3gpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9ICFjaGVja2JveC5jaGVja2VkO1xyXG4gICAgICAgICAgICAgIGNoZWNrYm94Lm9uY2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9KGNoZWNrYm94KTtcclxuXHJcbiAgICAgICAgICB0ZC5hcHBlbmRDaGlsZChjaGVja2JveCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmaXggZm9yIGFsc28gaGlnaGxpZ2h0aW5nIGNlbGxzIHdpdGhvdXQgY2hlY2tib3hlc1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGQucm93ID0gaTtcclxuICAgICAgICAgIHRkLmNvbCA9IGo7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0ci5hcHBlbmRDaGlsZCh0ZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRhYmxlLmFwcGVuZENoaWxkKHRyKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGFibGU7XHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlQmVoYXZpb3I6IGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICAgIHJldHVybiBcIlRPRE9cIjtcclxuXHJcbiAgICB2YXIgbG9naWMgPSBlbChcInRleHRhcmVhXCIpO1xyXG4gICAgbG9naWMuaW5uZXJIVE1MID0gZW50aXR5LmJlaGF2aW9yc1swXS50b1N0cmluZygpO1xyXG5cclxuICAgIHJldHVybiBlbChcImRpdlwiLCBbXHJcbiAgICAgIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg1KSwgZWwoXCJiclwiKSxcclxuICAgICAgbG9naWMsXHJcbiAgICAgIGVsLnAoKSxcclxuICAgICAgVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDYpLCBlbChcImJyXCIpLFxyXG5cclxuICAgIF0pO1xyXG4gIH0sXHJcblxyXG4gIGJ1aWxkU2lkZWJhcjogZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gICAgdmFyIHNpZGViYXIgPSAkKFwiLnNpZGViYXIudWkgLmNvbnRlbnRcIik7XHJcblxyXG4gICAgc2lkZWJhci5odG1sKFwiXCIpO1xyXG5cclxuICAgIGlmIChlbnRpdHkgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwcm9wZXJ0aWVzID0gW1xyXG4gICAgICAvLyBJRFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoNyl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXRUZXh0XCIsIHZhbHVlOiBlbnRpdHkuaWQsIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtfZW5naW5lLmNoYW5nZUlkKGVudGl0eSwgdmFsKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIENvbGxpc2lvbiBncm91cFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoOCl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXROdW1iZXJcIiwgdmFsdWU6IGVudGl0eS5jb2xsaXNpb25Hcm91cCArIDEsIG1pbjogMSwgbWF4OiBfZW5naW5lLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtlbnRpdHkuc2V0Q29sbGlzaW9uR3JvdXAodmFsICogMSAtIDEpO319LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gWFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoOSl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXROdW1iZXJcIiwgdmFsdWU6IGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3goKSxcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgICBlbnRpdHkuYm9keS5TZXRUcmFuc2Zvcm0obmV3IGIyVmVjMih2YWwgKiAxLCBlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF95KCkpLCBlbnRpdHkuYm9keS5HZXRBbmdsZSgpKTtcclxuICAgICAgICB9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIFlcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDEwKX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtcclxuICAgICAgICAgIGVudGl0eS5ib2R5LlNldFRyYW5zZm9ybShuZXcgYjJWZWMyKGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3goKSwgdmFsICogMSksIGVudGl0eS5ib2R5LkdldEFuZ2xlKCkpO1xyXG4gICAgICAgIH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gUm90YXRpb25cclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDExKX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmJvZHkuR2V0QW5nbGUoKSAqIDE4MCAvIE1hdGguUEksXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5ib2R5LlNldFRyYW5zZm9ybShlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLCAodmFsICogMSkgKiBNYXRoLlBJIC8gMTgwKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIEZpeGVkIHJvdGF0aW9uXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxMil9LFxyXG4gICAgICB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogZW50aXR5LmZpeGVkUm90YXRpb24sIG9uY2hhbmdlOiBmdW5jdGlvbih2YWwpIHsgZW50aXR5LmRpc2FibGVSb3RhdGlvbih2YWwpOyB9IH0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBDb2xvclxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTMpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0Q29sb3JcIiwgdmFsdWU6IGVudGl0eS5jb2xvciwgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5jb2xvciA9IHZhbH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgIF07XHJcblxyXG4gICAgc2lkZWJhclswXS5hcHBlbmRDaGlsZChVSUJ1aWxkZXIuYnVpbGQocHJvcGVydGllcykpO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUk7IiwidmFyIFVJQnVpbGRlciA9IHtcclxuICByYWRpbzogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHZhciByZXQgPSBlbChcImRpdi51aS5yYWRpb0dyb3VwXCIsIHtpZDogcHJvcGVydGllcy5pZH0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKFwiaW5wdXRbdHlwZT1yYWRpb11cIiwgdGhpcykuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcImlucHV0W3R5cGU9cmFkaW9dXCIsIHRoaXMpLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmVuYWJsZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIHZhciBpZENvdW50ID0gJChcImlucHV0W3R5cGU9cmFkaW9dXCIpLmxlbmd0aDtcclxuXHJcbiAgICBwcm9wZXJ0aWVzLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG5cclxuICAgICAgZWxlbWVudC5pZCA9IGVsZW1lbnQuaWQgPT0gdW5kZWZpbmVkID8gXCJyYWRpby1cIiArIGlkQ291bnQrKyA6IGVsZW1lbnQuaWQ7XHJcblxyXG4gICAgICB2YXIgaW5wdXQgPSBlbChcImlucHV0LnVpXCIsIHt0eXBlOiBcInJhZGlvXCIsIGlkOiBlbGVtZW50LmlkLCBuYW1lOiBwcm9wZXJ0aWVzLmlkfSk7XHJcbiAgICAgIHZhciBsYWJlbCA9IGVsKFwibGFiZWwudWkuYnV0dG9uXCIsIHtmb3I6IGVsZW1lbnQuaWR9LCBbZWxlbWVudC50ZXh0XSk7XHJcblxyXG4gICAgICBpbnB1dC5lbmFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgaW5wdXQuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICQoXCIrbGFiZWxcIiwgdGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlmIChlbGVtZW50Lm9uY2xpY2sgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGxhYmVsLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKFwiZGlzYWJsZWRcIikpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICBlbGVtZW50Lm9uY2xpY2soKTtcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZWxlbWVudC5jaGVja2VkID09PSB0cnVlKSB7XHJcbiAgICAgICAgaW5wdXQuY2hlY2tlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChpbnB1dCk7XHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChsYWJlbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcbiAgXHJcbiAgYnV0dG9uOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgdmFyIHJldCA9IGVsKFwic3Bhbi51aS5idXR0b25cIiwge30sIFtwcm9wZXJ0aWVzLnRleHRdKTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpXHJcbiAgICB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAocHJvcGVydGllcy5vbmNsaWNrICE9IHVuZGVmaW5lZClcclxuICAgICAgcmV0Lm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcyhcImRpc2FibGVkXCIpKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBwcm9wZXJ0aWVzLm9uY2xpY2soKTtcclxuICAgICAgfTtcclxuXHJcbiAgICBpZiAocHJvcGVydGllcy5pZCAhPSB1bmRlZmluZWQpXHJcbiAgICAgIHJldC5pZCA9IHByb3BlcnRpZXMuaWQ7XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBzZWxlY3Q6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICB2YXIgcmV0ID0gZWwoXCJzZWxlY3QudWlcIik7XHJcblxyXG4gICAgaWYgKHByb3BlcnRpZXMuaWQgIT0gdW5kZWZpbmVkKVxyXG4gICAgICByZXQuaWQgPSBwcm9wZXJ0aWVzLmlkO1xyXG5cclxuICAgIGlmIChwcm9wZXJ0aWVzLm9uY2hhbmdlICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICByZXQub25jaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcHJvcGVydGllcy5vbmNoYW5nZSh0aGlzLnZhbHVlKTtcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZW5hYmxlO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgcHJvcGVydGllcy5vcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9wdGlvbikge1xyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQoZWwoXCJvcHRpb25cIiwge3ZhbHVlOiBvcHRpb24udmFsdWV9LCBbb3B0aW9uLnRleHRdKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGJyZWFrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gZWwoXCJzcGFuLnVpLmJyZWFrXCIpO1xyXG4gIH0sXHJcblxyXG4gIGlucHV0VGV4dDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHZhciByZXQgPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJ0ZXh0XCIgfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAocHJvcGVydGllcy5pZCAhPSB1bmRlZmluZWQpXHJcbiAgICAgIHJldC5pZCA9IHByb3BlcnRpZXMuaWQ7XHJcblxyXG4gICAgaWYgKHByb3BlcnRpZXMub25pbnB1dCAhPSB1bmRlZmluZWQpXHJcbiAgICAgIHJldC5vbmlucHV0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgICAgfTtcclxuXHJcbiAgICBpZiAocHJvcGVydGllcy52YWx1ZSAhPSB1bmRlZmluZWQpXHJcbiAgICAgIHJldC52YWx1ZSA9IHByb3BlcnRpZXMudmFsdWU7XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBpbnB1dE51bWJlcjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHZhciByZXQgPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJudW1iZXJcIiB9KTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChwcm9wZXJ0aWVzLmlkICE9IHVuZGVmaW5lZClcclxuICAgICAgcmV0LmlkID0gcHJvcGVydGllcy5pZDtcclxuXHJcbiAgICBpZiAocHJvcGVydGllcy5vbmlucHV0ICE9IHVuZGVmaW5lZClcclxuICAgICAgcmV0Lm9uaW5wdXQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgICAgfTtcclxuXHJcbiAgICBpZiAocHJvcGVydGllcy52YWx1ZSAhPSB1bmRlZmluZWQpXHJcbiAgICAgIHJldC52YWx1ZSA9IHByb3BlcnRpZXMudmFsdWU7XHJcblxyXG4gICAgaWYgKHByb3BlcnRpZXMubWluICE9IHVuZGVmaW5lZClcclxuICAgICAgcmV0Lm1pbiA9IHByb3BlcnRpZXMubWluO1xyXG5cclxuICAgIGlmIChwcm9wZXJ0aWVzLm1heCAhPSB1bmRlZmluZWQpXHJcbiAgICAgIHJldC5tYXggPSBwcm9wZXJ0aWVzLm1heDtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGh0bWw6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICByZXR1cm4gcHJvcGVydGllcy5jb250ZW50O1xyXG4gIH0sXHJcblxyXG4gIGlucHV0Q29sb3I6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICB2YXIgcmV0ID0gZWwoXCJpbnB1dC51aVwiLCB7IHR5cGU6IFwiY29sb3JcIiB9KTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChwcm9wZXJ0aWVzLmlkICE9IHVuZGVmaW5lZClcclxuICAgICAgcmV0LmlkID0gcHJvcGVydGllcy5pZDtcclxuXHJcbiAgICBpZiAocHJvcGVydGllcy52YWx1ZSAhPSB1bmRlZmluZWQpXHJcbiAgICAgIHJldC52YWx1ZSA9IHByb3BlcnRpZXMudmFsdWU7XHJcblxyXG4gICAgaWYgKHByb3BlcnRpZXMub25pbnB1dCAhPSB1bmRlZmluZWQpXHJcbiAgICAgIHJldC5vbmlucHV0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGNoZWNrYm94OiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgdmFyIHJldCA9IGVsKFwic3BhblwiKTtcclxuXHJcbiAgICB2YXIgaWQgPSBwcm9wZXJ0aWVzLmlkICE9IHVuZGVmaW5lZCA/IHByb3BlcnRpZXMuaWQgOiBcImNoZWNrYm94LVwiICsgJChcImlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLmxlbmd0aDtcclxuICAgIFxyXG4gICAgdmFyIGNoZWNrYm94ID0gZWwoXCJpbnB1dC51aVwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgaWQ6IGlkIH0pO1xyXG4gICAgdmFyIGxhYmVsID0gZWwoXCJsYWJlbC51aS5idXR0b25cIiwgeyBmb3I6IGlkIH0pO1xyXG5cclxuICAgIHJldC5hcHBlbmRDaGlsZChjaGVja2JveCk7XHJcbiAgICByZXQuYXBwZW5kQ2hpbGQobGFiZWwpO1xyXG5cclxuICAgIGNoZWNrYm94LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoXCIrbGFiZWxcIiwgdGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIGNoZWNrYm94LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChwcm9wZXJ0aWVzLmNoZWNrZWQgIT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuY2hlY2tlZCA9PT0gdHJ1ZSlcclxuICAgICAgY2hlY2tib3guY2hlY2tlZCA9IHRydWU7XHJcblxyXG4gICAgaWYgKHByb3BlcnRpZXMub25jaGFuZ2UgIT0gdW5kZWZpbmVkKVxyXG4gICAgICBjaGVja2JveC5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBwcm9wZXJ0aWVzLm9uY2hhbmdlKHRoaXMuY2hlY2tlZCk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBidWlsZDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHZhciByZXQgPSBlbC5kaXYoKTtcclxuXHJcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgdmFyIGdlbmVyYXRlZDtcclxuICAgICAgXHJcbiAgICAgIHN3aXRjaCAoZWxlbWVudC50eXBlKSB7XHJcbiAgICAgICAgY2FzZSBcInJhZGlvXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLnJhZGlvKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJidXR0b25cIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuYnV0dG9uKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJzZWxlY3RcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuc2VsZWN0KGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJpbnB1dFRleHRcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuaW5wdXRUZXh0KGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJpbnB1dE51bWJlclwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5pbnB1dE51bWJlcihlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiaW5wdXRDb2xvclwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5pbnB1dENvbG9yKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJjaGVja2JveFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5jaGVja2JveChlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiaHRtbFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5odG1sKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJicmVha1wiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5icmVhaygpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChnZW5lcmF0ZWQpO1xyXG4gICAgfSwgdGhpcyk7XHJcbiAgICBcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuICBcclxuICBidWlsZExheW91dDogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY29udGVudCA9IGVsKFwiZGl2LnVpLmNvbnRlbnQucGFuZWxcIik7XHJcbiAgICB2YXIgc2lkZWJhciA9IGVsKFwiZGl2LnVpLnNpZGViYXIucGFuZWxcIiwge30sIFsgZWwoXCJkaXYuY29udGVudFwiKSBdKTtcclxuICAgIHZhciByZXNpemVyID0gZWwoXCJkaXYudWkucmVzaXplclwiKTtcclxuICAgIHZhciB0b29sYmFyID0gZWwoXCJkaXYudWkudG9vbGJhclwiKTtcclxuXHJcbiAgICB2YXIgdyA9ICQoXCJib2R5XCIpLm91dGVyV2lkdGgoKTtcclxuICAgIHZhciBzaWRlYmFyV2lkdGggPSAyNTA7XHJcblxyXG4gICAgY29udGVudC5zdHlsZS53aWR0aCA9IHcgLSAyNTAgKyBcInB4XCI7XHJcbiAgICBzaWRlYmFyLnN0eWxlLndpZHRoID0gc2lkZWJhcldpZHRoICsgXCJweFwiO1xyXG5cclxuICAgIHZhciBzaWRlYmFyUmVzaXplRXZlbnQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB2YXIgd2luZG93V2lkdGggPSAkKFwiYm9keVwiKS5vdXRlcldpZHRoKCk7XHJcbiAgICAgIHZhciBzaWRlYmFyV2lkdGggPSBNYXRoLm1heCgzMCwgTWF0aC5taW4od2luZG93V2lkdGggKiAwLjYsIHdpbmRvd1dpZHRoIC0gZS5jbGllbnRYKSk7XHJcbiAgICAgIHZhciBjb250ZW50V2lkdGggPSB3aW5kb3dXaWR0aCAtIHNpZGViYXJXaWR0aDtcclxuXHJcbiAgICAgIHNpZGViYXIuc3R5bGUud2lkdGggPSBzaWRlYmFyV2lkdGggKyBcInB4XCI7XHJcbiAgICAgIGNvbnRlbnQuc3R5bGUud2lkdGggPSBjb250ZW50V2lkdGggKyBcInB4XCI7XHJcblxyXG4gICAgICB3aW5kb3cub25yZXNpemUoKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIG1vdXNlVXBFdmVudCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHNpZGViYXIucmVzaXppbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICQoXCIucmVzaXplci51aVwiKS5yZW1vdmVDbGFzcyhcInJlc2l6aW5nXCIpO1xyXG5cclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2lkZWJhclJlc2l6ZUV2ZW50KTtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG1vdXNlVXBFdmVudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciB3aW5kb3dSZXNpemVFdmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHdpbmRvd1dpZHRoID0gJChcImJvZHlcIikub3V0ZXJXaWR0aCgpO1xyXG4gICAgICB2YXIgY29udGVudFdpZHRoID0gTWF0aC5tYXgod2luZG93V2lkdGggKiAwLjQsIE1hdGgubWluKFxyXG4gICAgICAgIHdpbmRvd1dpZHRoIC0gMzAsXHJcbiAgICAgICAgd2luZG93V2lkdGggLSAkKFwiLnNpZGViYXIudWlcIikub3V0ZXJXaWR0aCgpXHJcbiAgICAgICkpO1xyXG4gICAgICB2YXIgc2lkZWJhcldpZHRoID0gd2luZG93V2lkdGggLSBjb250ZW50V2lkdGg7XHJcblxyXG4gICAgICBzaWRlYmFyLnN0eWxlLndpZHRoID0gc2lkZWJhcldpZHRoICsgXCJweFwiO1xyXG4gICAgICBjb250ZW50LnN0eWxlLndpZHRoID0gY29udGVudFdpZHRoICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2l6ZXIub25tb3VzZWRvd24gPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBzaWRlYmFyLnJlc2l6aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJyZXNpemluZ1wiKTtcclxuXHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHNpZGViYXJSZXNpemVFdmVudCk7XHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBtb3VzZVVwRXZlbnQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB3aW5kb3dSZXNpemVFdmVudCk7XHJcblxyXG4gICAgY29udGVudC5hcHBlbmRDaGlsZCh0b29sYmFyKTtcclxuICAgIHNpZGViYXIuYXBwZW5kQ2hpbGQocmVzaXplcik7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRlbnQpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzaWRlYmFyKTtcclxuICB9LFxyXG5cclxuICAvLyBDcmVhdGluZyBhIHBvcHVwIG1lc3NhZ2VcclxuICBwb3B1cDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgdmFyIG92ZXJsYXkgPSBlbChcImRpdiNwb3B1cE92ZXJsYXlcIiwgW2VsKFwiZGl2I3BvcHVwQ29udGVudFwiLCBbZWwoXCJkaXYudzJ1aS1jZW50ZXJlZFwiLCBbZGF0YV0pXSldKTtcclxuICAgIG92ZXJsYXkub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgVUlCdWlsZGVyLmNsb3NlUG9wdXAoZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKG92ZXJsYXksIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgVHJhbnNsYXRpb25zLnJlZnJlc2goKTtcclxuICB9LFxyXG5cclxuICAvLyBDbG9zaW5nIGEgcG9wdXAgbWVzc2FnZVxyXG4gIGNsb3NlUG9wdXA6IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3B1cE92ZXJsYXlcIik7XHJcbiAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9wdXBDb250ZW50XCIpO1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSBpdCB3YXMgdGhlIG92ZXJsYXkgdGhhdCB3YXMgY2xpY2tlZCwgbm90IGFuIGVsZW1lbnQgYWJvdmUgaXRcclxuICAgIGlmICh0eXBlb2YgZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBlLnRhcmdldCAhPT0gb3ZlcmxheSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgY29udGVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNvbnRlbnQpO1xyXG4gICAgb3ZlcmxheS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG92ZXJsYXkpO1xyXG4gIH0sXHJcblxyXG5cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJQnVpbGRlcjsiLCIvLyBPYmplY3QgY29udGFpbmluZyB1c2VmdWwgbWV0aG9kc1xyXG52YXIgVXRpbHMgPSB7XHJcbiAgZ2V0QnJvd3NlcldpZHRoOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkKFwiLnVpLmNvbnRlbnRcIikub3V0ZXJXaWR0aCgpOy8vd2luZG93LmlubmVyV2lkdGg7XHJcbiAgfSxcclxuXHJcbiAgZ2V0QnJvd3NlckhlaWdodDogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJChcIi51aS5jb250ZW50XCIpLm91dGVySGVpZ2h0KCkgLSAkKFwiLnVpLnRvb2xiYXJcIikub3V0ZXJIZWlnaHQoKTsvL3dpbmRvdy5pbm5lckhlaWdodDtcclxuICB9LFxyXG5cclxuICByYW5kb21SYW5nZTogZnVuY3Rpb24obWluLCBtYXgpIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbik7XHJcbiAgfSxcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVdGlsczsiLCJ2YXIgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlscy5qc1wiKTtcclxuXHJcbi8vIFZJRVdQT1JUXHJcbi8vIFRoaXMgaXMgYmFzaWNhbGx5IGNhbWVyYSArIHByb2plY3RvclxyXG5cclxudmFyIFZpZXdwb3J0ID0gZnVuY3Rpb24oY2FudmFzRWxlbWVudCwgd2lkdGgsIGhlaWdodCwgeCwgeSkge1xyXG4gIC8vIENhbnZhcyBkaW1lbnNpb25zXHJcbiAgaWYgKHdpZHRoICE9IHVuZGVmaW5lZCAmJiBoZWlnaHQgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aGlzLnNldEF1dG9SZXNpemUoZmFsc2UpO1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuc2V0QXV0b1Jlc2l6ZSh0cnVlKTtcclxuICAgIHRoaXMuYXV0b1Jlc2l6ZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2VudGVyIHBvaW50IG9mIHRoZSBjYW1lcmFcclxuICBpZiAoeCAhPT0gdW5kZWZpbmVkICYmIHkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMueCA9IE1hdGguZmxvb3IodGhpcy53aWR0aCAvIDIpO1xyXG4gICAgdGhpcy55ID0gTWF0aC5mbG9vcih0aGlzLmhlaWdodCAvIDIpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2FudmFzIGVsZW1lbnRcclxuICB0aGlzLmNhbnZhc0VsZW1lbnQgPSBjYW52YXNFbGVtZW50O1xyXG5cclxuICBpZiAoY2FudmFzRWxlbWVudCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aGlzLmNhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhc0VsZW1lbnQpO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5yZXNldEVsZW1lbnQoKTsgLy8gUmVzaXplIHRvIG5ldyBkaW1lbnNpb25zXHJcblxyXG4gIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzRWxlbWVudC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbn07XHJcblxyXG4vLyBSZWxvYWRzIHZhbHVlcyBmb3IgdGhlIGNhbnZhcyBlbGVtZW50XHJcblZpZXdwb3J0LnByb3RvdHlwZS5yZXNldEVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLmNhbnZhc0VsZW1lbnQud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gIHRoaXMuY2FudmFzRWxlbWVudC5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxufVxyXG5cclxuLy8gQXV0b21hdGljYWxseSByZXNpemVzIHRoZSB2aWV3cG9ydCB0byBmaWxsIHRoZSBzY3JlZW5cclxuVmlld3BvcnQucHJvdG90eXBlLmF1dG9SZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLndpZHRoID0gVXRpbHMuZ2V0QnJvd3NlcldpZHRoKCk7XHJcbiAgdGhpcy5oZWlnaHQgPSBVdGlscy5nZXRCcm93c2VySGVpZ2h0KCk7XHJcbiAgdGhpcy54ID0gTWF0aC5mbG9vcih0aGlzLndpZHRoIC8gMik7XHJcbiAgdGhpcy55ID0gTWF0aC5mbG9vcih0aGlzLmhlaWdodCAvIDIpO1xyXG59O1xyXG5cclxuLy8gVG9nZ2xlcyB2aWV3cG9ydCBhdXRvIHJlc2l6aW5nXHJcblZpZXdwb3J0LnByb3RvdHlwZS5zZXRBdXRvUmVzaXplID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHJcbiAgdGhpcy5hdXRvUmVzaXplQWN0aXZlID0gdmFsdWU7XHJcblxyXG4gIGlmICh0aGlzLmF1dG9SZXNpemVBY3RpdmUpIHtcclxuICAgIHZhciB0ID0gdGhpcztcclxuICAgIHdpbmRvdy5vbnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB0LmF1dG9SZXNpemUoKTtcclxuICAgICAgdC5yZXNldEVsZW1lbnQoKTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgd2luZG93Lm9ucmVzaXplID0gbnVsbDtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdwb3J0OyJdfQ==
