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

    // selecting objects
    // if (window.Input.mouse.leftUp) {
    //   this.selectEntity(null);
    //
    //   for (i = this.entities.length - 1; i >= 0; i--) {
    //     if (this.entities[i].fixture.TestPoint(
    //         new b2Vec2(this.viewport.x - this.viewport.width / 2 + window.Input.mouse.x, this.viewport.y - this.viewport.height / 2  + window.Input.mouse.y))
    //     ) {
    //       this.selectEntity(i);
    //     }
    //   }
    // }
  }



  // CUSTOM TESTING CODE STARTS HERE
  // -------------------------------


  // drawing rectangles
  // var w = (window.Input.mouse.x - window.Input.mouse.dragOrigin[0]) / 2;
  // var h = (window.Input.mouse.y - window.Input.mouse.dragOrigin[1]) / 2;
  //
  // if (window.Input.mouse.leftDown && w > 5 && h > 5) {
  //   ctx.save();
  //   ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  //   ctx.fillRect(window.Input.mouse.dragOrigin[0], window.Input.mouse.dragOrigin[1], w * 2, h * 2);
  //   ctx.restore();
  // }
  // if (window.Input.mouse.leftUp && w > 5 && h > 5) {
  //   _engine.addEntity(new Rectangle(new b2Vec2(window.Input.mouse.x - w, window.Input.mouse.y - h), new b2Vec2(w, h)), Module.b2_dynamicBody);
  // }

  // -------------------------------
  //  CUSTOM TESTING CODE ENDS HERE



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
},{"./utils.js":15}],6:[function(require,module,exports){
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





},{"./behavior.js":2,"./bodytype.js":3,"./engine.js":4,"./input.js":8,"./shapes.js":10,"./token.js":11,"./ui.js":14,"./viewport.js":16}],8:[function(require,module,exports){
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

// Object for building the UI
var UI = {
  // UI initialisation
  initialize: function() {

    var toolbar = el("div.toolbar");

    var collisionsButton = el("div.uiContainer.button", {stringId: 1});
    collisionsButton.onclick = function() {
      UI.popup(UI.createCollisions());
    };

    var pauseButton = el("div.uiContainer.button", {stringId: 2});
    pauseButton.onclick = function() {
      _engine.togglePause();
      this.stringId = _engine.world.paused ? 2 : 3;
      this.innerHTML = Translations.getTranslated(this.stringId);
    };

    var languageSelector = el("select");
    languageSelector.onchange = function () {
      Translations.setLanguage(this.value);
    };
    for (var i = 0; i < Translations.strings.length; i++)
    {
      var option = el("option", {value: i});
      option.innerHTML = Translations.getTranslated(0, i);

      languageSelector.appendChild(option);
    }

    toolbar.appendChild(pauseButton);
    toolbar.appendChild(collisionsButton);
    toolbar.appendChild(languageSelector);

    var languages = [];
    for (var i = 0; i < Translations.strings.length; i++)
    {
      languages.push({ text: Translations.getTranslated(0, i), id: i });
    }

    $("body").w2layout(
      {
        name: "editorLayout",
        panels: [
          {
            type: "main",

            content: "<canvas id='mainCanvas'></canvas>",

            toolbar: {
              items: [
                { type: "button", id: "pause", caption: Translations.getTranslatedWrapped(2).outerHTML, stringId: 2 },
                { type: 'break', id: 'break1' },
                { type: "button", id: "collisions", caption: Translations.getTranslatedWrapped(1).outerHTML},
                { type: 'break', id: 'break2' },
                { type: "radio", group: 1, id: "selection", checked: true, caption: Translations.getTranslatedWrapped(17).outerHTML},
                { type: "radio", group: 1, id: "rectangle", caption: Translations.getTranslatedWrapped(18).outerHTML},
                { type: "radio", group: 1, id: "circle", caption: Translations.getTranslatedWrapped(19).outerHTML},
                { type: "spacer" },
                { type: "menu", id: "language", caption: Translations.getTranslatedWrapped(0).outerHTML, items: languages}
              ],
              onClick: function(e) {
                _engine.selectEntity(null);

                switch (e.target)
                {
                  case "pause":
                    _engine.togglePause();
                    UI.buildSidebar(null);
                    w2ui.editorLayout.toggle("right");
                    this.get("pause").stringId = _engine.world.paused ? 2 : 3;
                    this.get("pause").caption = "<span stringId='"+ this.get("pause").stringId +"'>"+
                      Translations.getTranslated(this.get("pause").stringId)
                    +"</span>";

                    if(_engine.world.paused)
                      this.enable("collisions", "selection", "rectangle", "circle");
                    else
                      this.disable("collisions", "selection", "rectangle", "circle");

                    this.refresh();
                    Translations.refresh();

                    break;

                  case "collisions":
                    UI.popup(UI.createCollisions());
                    break;

                  case "selection":
                    window.Input.tool = Tools.Selection;
                    break;

                  case "rectangle":
                    window.Input.tool = Tools.Rectangle;
                    break;

                  case "circle":
                    window.Input.tool = Tools.Circle;
                    break;
                }

                if (e.target.startsWith("language:"))
                {
                  Translations.setLanguage(e.subItem.id);
                }
              }
            }
          },
          {
            type: "right",
            size: 250,
            resizable: true,
            style: "padding: 1em;"
          },
        ],
        onResize: function (e) {
          if(typeof (_engine) === 'undefined')
            return;

          e.onComplete = function () {
            _engine.viewport.autoResize();
            _engine.viewport.resetElement();
          }
        },
        onClick: function (e) {
          alert();
        }
      }
    );

    Translations.refresh();
  },

  // Creating a popup message
  popup: function(data) {
    /*w2popup.open(
      {
        body: "<div class='w2ui-centered'>"+ data.outerHTML +"</div>",
        width: "700",
        height: "700",
        speed: 0.15
      }
    );*/
    var overlay = el("div#popupOverlay", [el("div#popupContent", [el("div.w2ui-centered", [data])])]);
    overlay.onclick = function(e) {
      UI.closePopup(e)
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
    var sidebar = w2ui.editorLayout.get("right");

    sidebar.content = "";

    if (entity === null) {
      w2ui.editorLayout.refresh("right");
      return;
    }


    var id = el.input({type: "text", value: entity.id});
    id.oninput = function ()
    {
      _engine.changeId(entity, this.value);
    };

    var collisionGroup = el.input({type: "number", min: 1, max: 16, value: entity.collisionGroup + 1});
    collisionGroup.onchange = function (e)
    {
      entity.setCollisionGroup(this.value * 1 - 1);
    };

    var x = el.input({type: "number", value: entity.body.GetPosition().get_x()});
    x.onchange = function ()
    {
      entity.body.SetTransform(new b2Vec2(this.value * 1, entity.body.GetPosition().get_y()), entity.body.GetAngle());
    };

    var y = el.input({type: "number", value: entity.body.GetPosition().get_y()});
    y.onchange = function ()
    {
      entity.body.SetTransform(new b2Vec2(entity.body.GetPosition().get_x(), this.value * 1), entity.body.GetAngle());
    };

    var rotation = el.input({type: "number", value: entity.body.GetAngle() * 180 / Math.PI});
    rotation.onchange = function ()
    {
      entity.body.SetTransform(entity.body.GetPosition(), (this.value * 1) * Math.PI / 180);
    };

    var fixedRotation = el.input({type: "checkbox"});
    fixedRotation.checked = entity.fixedRotation;
    fixedRotation.onchange = function ()
    {
      entity.disableRotation(this.checked);
    };

    var color = el.input({type: "color", value: entity.color});
    color.onchange = function () {
      entity.color = this.value;
    };

    var changeBehavior = el("button", [Translations.getTranslatedWrapped(4)]);
    changeBehavior.onclick = function () {
      UI.popup(UI.createBehavior(entity));
    };
    
    var bodyType = el("select", {}, [
      el("option", {value: BodyType.DYNAMIC_BODY}, [Translations.getTranslatedWrapped(15)]),
      el("option", {value: BodyType.KINEMATIC_BODY}, [Translations.getTranslatedWrapped(16)]),
    ]);
    for(var i = 0; i < bodyType.options.length; i ++)
    {
      if((bodyType.options[i].value * 1) === entity.body.GetType()) {
        bodyType.options[i].selected = true;

        break;
      }
    }
    bodyType.onchange = function () {
      entity.body.SetType(this.value * 1);
    };


    var content = el.div({}, [
      Translations.getTranslatedWrapped(7),
      el("br"), id, el("p"),
      Translations.getTranslatedWrapped(8),
      el("br"), collisionGroup, el("p"),
      Translations.getTranslatedWrapped(9),
      el("br"), x, el("p"),
      Translations.getTranslatedWrapped(10),
      el("br"), y, el("p"),
      Translations.getTranslatedWrapped(11),
      el("br"), rotation, el("p"),
      Translations.getTranslatedWrapped(12),
      el("br"), fixedRotation, el("p"),
      Translations.getTranslatedWrapped(13),
      el("br"), color, el("p"),
      Translations.getTranslatedWrapped(14),
      el("br"), bodyType, el("p"),
      /*el("br"), changeBehavior, el("p")*/
    ]);

    w2ui.editorLayout.content("right", content);

  }
};

module.exports = UI;
},{"./bodytype.js":3,"./tools.js":12}],15:[function(require,module,exports){
// Object containing useful methods
var Utils = {
  getBrowserWidth: function() {
    return $("#layout_editorLayout_panel_main .w2ui-panel-content").outerWidth() - 20;//window.innerWidth;
  },

  getBrowserHeight: function() {
    return $("#layout_editorLayout_panel_main .w2ui-panel-content").outerHeight() - 20;//window.innerHeight;
  },

  randomRange: function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },
}

module.exports = Utils;
},{}],16:[function(require,module,exports){
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
},{"./utils.js":15}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1VzZXJzL0pha3ViIE1hdHXFoWthL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2FjdGlvbnMuanMiLCJqcy9iZWhhdmlvci5qcyIsImpzL2JvZHl0eXBlLmpzIiwianMvZW5naW5lLmpzIiwianMvZW50aXR5LmpzIiwianMvZW50aXR5ZmlsdGVycy5qcyIsImpzL2VudHJ5LmpzIiwianMvaW5wdXQuanMiLCJqcy9sb2dpYy5qcyIsImpzL3NoYXBlcy5qcyIsImpzL3Rva2VuLmpzIiwianMvdG9vbHMuanMiLCJqcy90eXBpbmcuanMiLCJqcy91aS5qcyIsImpzL3V0aWxzLmpzIiwianMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEJlaGF2aW9yID0gcmVxdWlyZShcIi4vYmVoYXZpb3IuanNcIik7XHJcbnZhciBBY3Rpb24gPSByZXF1aXJlKFwiLi90b2tlbi5qc1wiKS5BY3Rpb247XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XHJcblxyXG52YXIgYVNldENvbG9yID0gZnVuY3Rpb24oZWYsIGNvbG9yKSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJzZXRDb2xvclwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5TVFJJTkddKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKGNvbG9yKTtcclxufVxyXG5hU2V0Q29sb3IucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5hU2V0Q29sb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYVNldENvbG9yO1xyXG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihhU2V0Q29sb3IpO1xyXG5cclxuYVNldENvbG9yLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LnNldENvbG9yKHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcclxufVxyXG5cclxudmFyIGFUb3JxdWUgPSBmdW5jdGlvbihlZiwgc3RyZW5ndGgpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5VG9ycXVlXCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goc3RyZW5ndGgpO1xyXG59XHJcbmFUb3JxdWUucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5hVG9ycXVlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFUb3JxdWU7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGFUb3JxdWUpO1xyXG5cclxuYVRvcnF1ZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5ib2R5LkFwcGx5VG9ycXVlKGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XHJcbn1cclxuXHJcbnZhciBhQW5ndWxhckltcHVsc2UgPSBmdW5jdGlvbihlZiwgc3RyZW5ndGgpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5QW5ndWxhckltcHVsc2VcIiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaChzdHJlbmd0aCk7XHJcbn1cclxuYUFuZ3VsYXJJbXB1bHNlLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuYUFuZ3VsYXJJbXB1bHNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFBbmd1bGFySW1wdWxzZTtcclxuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4oYUFuZ3VsYXJJbXB1bHNlKTtcclxuXHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5ib2R5LkFwcGx5QW5ndWxhckltcHVsc2UoZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcclxufVxyXG5cclxudmFyIGFMaW5lYXJWZWxvY2l0eSA9IGZ1bmN0aW9uKGVmLCB4LCB5KSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJzZXRMaW5lYXJWZWxvY2l0eVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaCh4KTtcclxuICB0aGlzLmFyZ3MucHVzaCh5KTtcclxufVxyXG5hTGluZWFyVmVsb2NpdHkucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5hTGluZWFyVmVsb2NpdHkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYUxpbmVhclZlbG9jaXR5O1xyXG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihhTGluZWFyVmVsb2NpdHkpO1xyXG5cclxuYUxpbmVhclZlbG9jaXR5LnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LnNldExpbmVhclZlbG9jaXR5KG5ldyBiMlZlYzIodGhpcy5hcmdzWzFdLmV2YWx1YXRlKCksIHRoaXMuYXJnc1syXS5ldmFsdWF0ZSgpKSk7XHJcbn1cclxuXHJcbnZhciBhTGluZWFySW1wdWxzZSA9IGZ1bmN0aW9uKGVmLCB4LCB5KSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJhcHBseUxpbmVhckltcHVsc2VcIiwgZWYsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHgpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHkpO1xyXG59XHJcbmFMaW5lYXJJbXB1bHNlLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuYUxpbmVhckltcHVsc2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYUxpbmVhckltcHVsc2U7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGFMaW5lYXJJbXB1bHNlKTtcclxuXHJcbmFMaW5lYXJJbXB1bHNlLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LmFwcGx5TGluZWFySW1wdWxzZShuZXcgYjJWZWMyKGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSwgZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1syXS5ldmFsdWF0ZSgpKSk7XHJcbn1cclxuIiwidmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcblxudmFyIEJlaGF2aW9yID0gZnVuY3Rpb24obG9naWMsIHJlc3VsdHMpIHtcbiAgdGhpcy5sb2dpYyA9IGxvZ2ljO1xuXG4gIGlmICh0aGlzLmxvZ2ljLnR5cGUgIT09IFR5cGUuQk9PTEVBTilcbiAgICB0aHJvdyBuZXcgVHlwZUV4Y2VwdGlvbihUeXBlLkJPT0xFQU4sIHRoaXMubG9naWMudHlwZSwgdGhpcyk7XG5cbiAgdGhpcy5yZXN1bHRzID0gQXJyYXkuaXNBcnJheShyZXN1bHRzKSA/IHJlc3VsdHMgOiBbcmVzdWx0c107XG59O1xuXG53aW5kb3cudG9rZW5zID0ge307XG5cbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgdmFyIHQgPSBuZXcgdG9rZW4oKTtcbiAgd2luZG93LnRva2Vuc1t0Lm5hbWVdID0gdDtcbn07XG5cblxuQmVoYXZpb3IucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gIHJldHVybiB0aGlzLmxvZ2ljLmV2YWx1YXRlKGVudGl0eSk7XG59O1xuXG5CZWhhdmlvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIFwiQmVoYXZpb3IoXCIgKyB0aGlzLmxvZ2ljLnRvU3RyaW5nKCkgKyBcIiwgXCIgKyB0aGlzLnJlc3VsdHMudG9TdHJpbmcoKSArIFwiKVwiO1xufTtcblxuQmVoYXZpb3IucHJvdG90eXBlLnJlc3VsdCA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMucmVzdWx0c1tpXS5leGVjdXRlKClcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCZWhhdmlvcjtcblxucmVxdWlyZShcIi4vbG9naWMuanNcIik7XG5yZXF1aXJlKFwiLi9hY3Rpb25zLmpzXCIpO1xucmVxdWlyZShcIi4vZW50aXR5ZmlsdGVycy5qc1wiKTsiLCJ2YXIgQm9keVR5cGUgPSB7XHJcbiAgRFlOQU1JQ19CT0RZOiBNb2R1bGUuYjJfZHluYW1pY0JvZHksXHJcbiAgU1RBVElDX0JPRFk6IE1vZHVsZS5iMl9zdGF0aWNCb2R5LFxyXG4gIEtJTkVNQVRJQ19CT0RZOiBNb2R1bGUuYjJfa2luZW1hdGljQm9keVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCb2R5VHlwZTsiLCJ2YXIgVUkgPSByZXF1aXJlKFwiLi91aS5qc1wiKTtcclxudmFyIFRvb2xzID0gcmVxdWlyZShcIi4vdG9vbHMuanNcIik7XHJcblxyXG5cclxuY29uc3QgQVVUT19JRF9QUkVGSVggPSBcIkVOVElUWV9OVU1CRVJfXCI7XHJcblxyXG5jb25zdCBESVNQTEFZX1JBVElPID0gMjA7XHJcblxyXG4vKi8gTXlzbGllbmt5XHJcblxyXG5sb2Nrb3ZhbmllIGthbWVyeSBuYSBvYmpla3RcclxuICogcHJlY2hvZHlcclxuYWtvIGZ1bmd1amUgY2VsYSBrYW1lcmE/XHJcblxyXG4vKi9cclxuXHJcblxyXG4vLyBFTkdJTkVcclxuXHJcbi8vIGNvbnN0cnVjdG9yXHJcblxyXG52YXIgRW5naW5lID0gZnVuY3Rpb24odmlld3BvcnQsIGdyYXZpdHkpIHtcclxuICB0aGlzLnZpZXdwb3J0ID0gdmlld3BvcnQ7XHJcbiAgdGhpcy5lbnRpdGllcyA9IFtdO1xyXG4gIHRoaXMuc2VsZWN0ZWRFbnRpdHkgPSBudWxsO1xyXG4gIFxyXG4gIHRoaXMuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgPSAxNjtcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25Hcm91cHMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuQ09MTElTSU9OX0dST1VQU19OVU1CRVI7IGkrKykge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHMucHVzaCh7XHJcbiAgICAgIFwibmFtZVwiOiBpICsgMSxcclxuICAgICAgXCJtYXNrXCI6IHBhcnNlSW50KEFycmF5KHRoaXMuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgKyAxKS5qb2luKFwiMVwiKSwgMilcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5saWZldGltZUVudGl0aWVzID0gMDtcclxuXHJcbiAgdGhpcy53b3JsZCA9IG5ldyBiMldvcmxkKGdyYXZpdHksIHRydWUpO1xyXG4gIHRoaXMud29ybGQucGF1c2VkID0gdHJ1ZTtcclxuXHJcbiAgd2luZG93LklucHV0LmluaXRpYWxpemUodmlld3BvcnQuY2FudmFzRWxlbWVudCk7XHJcbn07XHJcblxyXG4vLyBDaGFuZ2VzIHJ1bm5pbmcgc3RhdGUgb2YgdGhlIHNpbXVsYXRpb25cclxuRW5naW5lLnByb3RvdHlwZS50b2dnbGVQYXVzZSA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLndvcmxkLnBhdXNlZCA9ICF0aGlzLndvcmxkLnBhdXNlZDtcclxuICB0aGlzLnNlbGVjdGVkRW50aXR5ID0gbnVsbDtcclxuXHJcbiAgd2luZG93LklucHV0LnRvb2wgPSBUb29scy5CbGFuaztcclxuXHJcbiAgaWYodGhpcy53b3JsZC5wYXVzZWQpXHJcbiAgICB3aW5kb3cuSW5wdXQudG9vbCA9IFRvb2xzLlNlbGVjdGlvbjtcclxufTtcclxuXHJcblxyXG4vLyBSZXR1cm5zIHRoZSBlbnRpdHkgd2l0aCBpZCBzcGVjaWZpZWQgYnkgYXJndW1lbnRcclxuRW5naW5lLnByb3RvdHlwZS5nZXRFbnRpdHlCeUlkID0gZnVuY3Rpb24oaWQpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmICh0aGlzLmVudGl0aWVzW2ldLmlkID09PSBpZClcclxuICAgICAgcmV0dXJuIHRoaXMuZW50aXRpZXNbaV07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbi8vIFJldHVybnMgYW4gYXJyYXkgb2YgZW50aXRpZXMgd2l0aCBzcGVjaWZpZWQgY29sbGlzaW9uR3JvdXBcclxuRW5naW5lLnByb3RvdHlwZS5nZXRFbnRpdGllc0J5Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gIHZhciByZXQgPSBbXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAodGhpcy5lbnRpdGllc1tpXS5jb2xsaXNpb25Hcm91cCA9PT0gZ3JvdXApXHJcbiAgICAgIHJldC5wdXNoKHRoaXMuZW50aXRpZXNbaV0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJldDtcclxufVxyXG5cclxuLy8gQWRkaW5nIGFuIGVudGl0eSB0byB0aGUgd29ybGRcclxuRW5naW5lLnByb3RvdHlwZS5hZGRFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHksIHR5cGUpIHtcclxuICAvLyBnZW5lcmF0ZSBhdXRvIGlkXHJcbiAgaWYgKGVudGl0eS5pZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICBlbnRpdHkuaWQgPSBBVVRPX0lEX1BSRUZJWCArIHRoaXMubGlmZXRpbWVFbnRpdGllcztcclxuICB9XHJcblxyXG4gIGVudGl0eS5lbmdpbmUgPSB0aGlzO1xyXG5cclxuICB0aGlzLmxpZmV0aW1lRW50aXRpZXMrKztcclxuXHJcbiAgZW50aXR5LmJvZHkuc2V0X3R5cGUodHlwZSk7XHJcblxyXG4gIGVudGl0eS5ib2R5ID0gdGhpcy53b3JsZC5DcmVhdGVCb2R5KGVudGl0eS5ib2R5KTtcclxuICBlbnRpdHkuZml4dHVyZSA9IGVudGl0eS5ib2R5LkNyZWF0ZUZpeHR1cmUoZW50aXR5LmZpeHR1cmUpO1xyXG4gIHRoaXMuZW50aXRpZXMucHVzaChlbnRpdHkpO1xyXG5cclxuICByZXR1cm4gZW50aXR5O1xyXG59XHJcblxyXG4vLyBDaGVja3Mgd2hldGhlciB0d28gZ3JvdXBzIHNob3VsZCBjb2xsaWRlXHJcbkVuZ2luZS5wcm90b3R5cGUuZ2V0Q29sbGlzaW9uID0gZnVuY3Rpb24oZ3JvdXBBLCBncm91cEIpIHtcclxuICByZXR1cm4gKHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayA+PiBncm91cEIpICYgMTtcclxufVxyXG5cclxuLy8gU2V0cyB0d28gZ3JvdXBzIHVwIHRvIGNvbGxpZGVcclxuRW5naW5lLnByb3RvdHlwZS5zZXRDb2xsaXNpb24gPSBmdW5jdGlvbihncm91cEEsIGdyb3VwQiwgdmFsdWUpIHtcclxuICB2YXIgbWFza0EgPSAoMSA8PCBncm91cEIpO1xyXG4gIHZhciBtYXNrQiA9ICgxIDw8IGdyb3VwQSk7XHJcblxyXG4gIGlmICh2YWx1ZSkge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrIHwgbWFza0E7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgPSB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgfCBtYXNrQjtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrICYgfm1hc2tBO1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrICYgfm1hc2tCO1xyXG4gIH1cclxuICB0aGlzLnVwZGF0ZUNvbGxpc2lvbnMoKVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuLy8gQ2hhbmdlcyB0aGUgSUQgb2YgYW4gZW50aXR5XHJcbkVuZ2luZS5wcm90b3R5cGUuY2hhbmdlSWQgPSBmdW5jdGlvbiAoZW50aXR5LCBpZCkge1xyXG4gIGVudGl0eS5pZCA9IGlkO1xyXG59O1xyXG5cclxuLy8gU2VsZWN0cyBhbiBlbnRpdHkgYW5kIHNob3dzIGl0cyBwcm9wZXJ0aWVzIGluIHRoZSBzaWRlYmFyXHJcbkVuZ2luZS5wcm90b3R5cGUuc2VsZWN0RW50aXR5ID0gZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgdGhpcy5zZWxlY3RlZEVudGl0eSA9IGluZGV4ID09PSBudWxsID8gbnVsbCA6IHRoaXMuZW50aXRpZXNbaW5kZXhdO1xyXG4gIFVJLmJ1aWxkU2lkZWJhcih0aGlzLnNlbGVjdGVkRW50aXR5KTtcclxufVxyXG5cclxuLy8gVXBkYXRlcyBjb2xsaXNpb24gbWFza3MgZm9yIGFsbCBlbnRpdGllcywgYmFzZWQgb24gZW5naW5lJ3MgY29sbGlzaW9uR3JvdXBzIHRhYmxlXHJcbkVuZ2luZS5wcm90b3R5cGUudXBkYXRlQ29sbGlzaW9ucyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHRoaXMudXBkYXRlQ29sbGlzaW9uKHRoaXMuZW50aXRpZXNbaV0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vLyBVcGRhdGVzIGNvbGxpc2lvbiBtYXNrIGZvciBhbiBlbnRpdHksIGJhc2VkIG9uIGVuZ2luZSdzIGNvbGxpc2lvbkdyb3VwcyB0YWJsZVxyXG5FbmdpbmUucHJvdG90eXBlLnVwZGF0ZUNvbGxpc2lvbiA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHZhciBmaWx0ZXJEYXRhID0gZW50aXR5LmZpeHR1cmUuR2V0RmlsdGVyRGF0YSgpO1xyXG4gIGZpbHRlckRhdGEuc2V0X21hc2tCaXRzKHRoaXMuY29sbGlzaW9uR3JvdXBzW2VudGl0eS5jb2xsaXNpb25Hcm91cF0ubWFzayk7XHJcbiAgZW50aXR5LmZpeHR1cmUuU2V0RmlsdGVyRGF0YShmaWx0ZXJEYXRhKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbi8vIE9uZSBzaW11bGF0aW9uIHN0ZXAuIFNpbXVsYXRpb24gbG9naWMgaGFwcGVucyBoZXJlLlxyXG5FbmdpbmUucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpIHtcclxuICAvLyBGUFMgdGltZXJcclxuICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpO1xyXG5cclxuICBjdHggPSB0aGlzLnZpZXdwb3J0LmNvbnRleHQ7XHJcblxyXG4gIC8vIGNsZWFyIHNjcmVlblxyXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy52aWV3cG9ydC53aWR0aCwgdGhpcy52aWV3cG9ydC5oZWlnaHQpO1xyXG5cclxuICBjdHguc2F2ZSgpO1xyXG5cclxuICAvLyBkcmF3IGFsbCBlbnRpdGllc1xyXG4gIGZvciAodmFyIGkgPSB0aGlzLmVudGl0aWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LnRyYW5zbGF0ZSh0aGlzLnZpZXdwb3J0LnggLSB0aGlzLnZpZXdwb3J0LndpZHRoIC8gMiwgdGhpcy52aWV3cG9ydC55IC0gdGhpcy52aWV3cG9ydC5oZWlnaHQgLyAyKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmVudGl0aWVzW2ldLmNvbG9yO1xyXG5cclxuICAgIGlmKHRoaXMuc2VsZWN0ZWRFbnRpdHkgPT0gdGhpcy5lbnRpdGllc1tpXSkge1xyXG4gICAgICBjdHguc2hhZG93Q29sb3IgPSBcImJsYWNrXCI7XHJcbiAgICAgIGN0eC5zaGFkb3dCbHVyID0gMTA7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHggPSB0aGlzLmVudGl0aWVzW2ldLmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpO1xyXG4gICAgdmFyIHkgPSB0aGlzLmVudGl0aWVzW2ldLmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpO1xyXG4gICAgY3R4LnRyYW5zbGF0ZSh4LCB5KTtcclxuICAgIGN0eC5yb3RhdGUodGhpcy5lbnRpdGllc1tpXS5ib2R5LkdldEFuZ2xlKCkpO1xyXG5cclxuICAgIHRoaXMuZW50aXRpZXNbaV0uZHJhdyhjdHgpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmVudGl0aWVzW2ldLmJlaGF2aW9ycy5sZW5ndGg7IGorKykge1xyXG4gICAgICB2YXIgYmVoYXZpb3IgPSB0aGlzLmVudGl0aWVzW2ldLmJlaGF2aW9yc1tqXTtcclxuXHJcbiAgICAgIGlmIChiZWhhdmlvci5jaGVjayh0aGlzLmVudGl0aWVzW2ldKSlcclxuICAgICAgICBiZWhhdmlvci5yZXN1bHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICghX2VuZ2luZS53b3JsZC5wYXVzZWQpIHtcclxuICAgIC8vIGJveDJkIHNpbXVsYXRpb24gc3RlcFxyXG4gICAgdGhpcy53b3JsZC5TdGVwKDEgLyA2MCwgMTAsIDUpO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHdpbmRvdy5JbnB1dC50b29sLm9ubW92ZShjdHgpO1xyXG5cclxuICAgIC8vIHNlbGVjdGluZyBvYmplY3RzXHJcbiAgICAvLyBpZiAod2luZG93LklucHV0Lm1vdXNlLmxlZnRVcCkge1xyXG4gICAgLy8gICB0aGlzLnNlbGVjdEVudGl0eShudWxsKTtcclxuICAgIC8vXHJcbiAgICAvLyAgIGZvciAoaSA9IHRoaXMuZW50aXRpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgIC8vICAgICBpZiAodGhpcy5lbnRpdGllc1tpXS5maXh0dXJlLlRlc3RQb2ludChcclxuICAgIC8vICAgICAgICAgbmV3IGIyVmVjMih0aGlzLnZpZXdwb3J0LnggLSB0aGlzLnZpZXdwb3J0LndpZHRoIC8gMiArIHdpbmRvdy5JbnB1dC5tb3VzZS54LCB0aGlzLnZpZXdwb3J0LnkgLSB0aGlzLnZpZXdwb3J0LmhlaWdodCAvIDIgICsgd2luZG93LklucHV0Lm1vdXNlLnkpKVxyXG4gICAgLy8gICAgICkge1xyXG4gICAgLy8gICAgICAgdGhpcy5zZWxlY3RFbnRpdHkoaSk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9XHJcbiAgfVxyXG5cclxuXHJcblxyXG4gIC8vIENVU1RPTSBURVNUSU5HIENPREUgU1RBUlRTIEhFUkVcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuICAvLyBkcmF3aW5nIHJlY3RhbmdsZXNcclxuICAvLyB2YXIgdyA9ICh3aW5kb3cuSW5wdXQubW91c2UueCAtIHdpbmRvdy5JbnB1dC5tb3VzZS5kcmFnT3JpZ2luWzBdKSAvIDI7XHJcbiAgLy8gdmFyIGggPSAod2luZG93LklucHV0Lm1vdXNlLnkgLSB3aW5kb3cuSW5wdXQubW91c2UuZHJhZ09yaWdpblsxXSkgLyAyO1xyXG4gIC8vXHJcbiAgLy8gaWYgKHdpbmRvdy5JbnB1dC5tb3VzZS5sZWZ0RG93biAmJiB3ID4gNSAmJiBoID4gNSkge1xyXG4gIC8vICAgY3R4LnNhdmUoKTtcclxuICAvLyAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgMC40KVwiO1xyXG4gIC8vICAgY3R4LmZpbGxSZWN0KHdpbmRvdy5JbnB1dC5tb3VzZS5kcmFnT3JpZ2luWzBdLCB3aW5kb3cuSW5wdXQubW91c2UuZHJhZ09yaWdpblsxXSwgdyAqIDIsIGggKiAyKTtcclxuICAvLyAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgLy8gfVxyXG4gIC8vIGlmICh3aW5kb3cuSW5wdXQubW91c2UubGVmdFVwICYmIHcgPiA1ICYmIGggPiA1KSB7XHJcbiAgLy8gICBfZW5naW5lLmFkZEVudGl0eShuZXcgUmVjdGFuZ2xlKG5ldyBiMlZlYzIod2luZG93LklucHV0Lm1vdXNlLnggLSB3LCB3aW5kb3cuSW5wdXQubW91c2UueSAtIGgpLCBuZXcgYjJWZWMyKHcsIGgpKSwgTW9kdWxlLmIyX2R5bmFtaWNCb2R5KTtcclxuICAvLyB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgQ1VTVE9NIFRFU1RJTkcgQ09ERSBFTkRTIEhFUkVcclxuXHJcblxyXG5cclxuICAvLyBSZWxlYXNlZCBrZXlzIGFyZSBvbmx5IHRvIGJlIHByb2Nlc3NlZCBvbmNlXHJcbiAgd2luZG93LklucHV0Lm1vdXNlLmNsZWFuVXAoKTtcclxuICB3aW5kb3cuSW5wdXQua2V5Ym9hcmQuY2xlYW5VcCgpO1xyXG5cclxuICB2YXIgZW5kID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgLy8gQ2FsbCBuZXh0IHN0ZXBcclxuICBzZXRUaW1lb3V0KHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgICBfZW5naW5lLnN0ZXAoKVxyXG4gIH0pLCBNYXRoLm1pbig2MCAtIGVuZCAtIHN0YXJ0LCAwKSk7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTsiLCIvLyBFTlRJVFlcclxudmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHMuanNcIik7XHJcblxyXG5jb25zdCBBVVRPX0NPTE9SX1JBTkdFID0gWzAsIDIzMF07XHJcblxyXG52YXIgRW50aXR5ID0gZnVuY3Rpb24oc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCkge1xyXG4gIHRoaXMuaWQgPSBpZDtcclxuICB0aGlzLmRlYWQgPSBmYWxzZTtcclxuICB0aGlzLmxheWVyID0gMDtcclxuXHJcbiAgdGhpcy5maXhlZFJvdGF0aW9uID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXAgPSBjb2xsaXNpb25Hcm91cDtcclxuICBpZiAodGhpcy5jb2xsaXNpb25Hcm91cCA9PSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXAgPSAwO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5iZWhhdmlvcnMgPSBbXTtcclxuXHJcbiAgdGhpcy5maXh0dXJlID0gZml4dHVyZTtcclxuICBpZiAodGhpcy5maXh0dXJlID09IHVuZGVmaW5lZCkge1xyXG4gICAgdmFyIGZpeHR1cmUgPSBuZXcgYjJGaXh0dXJlRGVmKCk7XHJcbiAgICBmaXh0dXJlLnNldF9kZW5zaXR5KDEwKVxyXG4gICAgZml4dHVyZS5zZXRfZnJpY3Rpb24oMC41KTtcclxuICAgIGZpeHR1cmUuc2V0X3Jlc3RpdHV0aW9uKDAuMik7XHJcblxyXG4gICAgdGhpcy5maXh0dXJlID0gZml4dHVyZTtcclxuICB9XHJcbiAgdGhpcy5maXh0dXJlLnNldF9zaGFwZShzaGFwZSk7XHJcblxyXG4gIHZhciBmaWx0ZXJEYXRhID0gdGhpcy5maXh0dXJlLmdldF9maWx0ZXIoKTtcclxuICBmaWx0ZXJEYXRhLnNldF9jYXRlZ29yeUJpdHMoMSA8PCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIC8vIENvbnN0cnVjdG9yIGlzIGNhbGxlZCB3aGVuIGluaGVyaXRpbmcsIHNvIHdlIG5lZWQgdG8gY2hlY2sgZm9yIF9lbmdpbmUgYXZhaWxhYmlsaXR5XHJcbiAgaWYgKHR5cGVvZiBfZW5naW5lICE9PSAndW5kZWZpbmVkJylcclxuICAgIGZpbHRlckRhdGEuc2V0X21hc2tCaXRzKF9lbmdpbmUuY29sbGlzaW9uR3JvdXBzW3RoaXMuY29sbGlzaW9uR3JvdXBdLm1hc2spO1xyXG5cclxuICB0aGlzLmZpeHR1cmUuc2V0X2ZpbHRlcihmaWx0ZXJEYXRhKTtcclxuXHJcbiAgdGhpcy5ib2R5ID0gYm9keTtcclxuICBpZiAodGhpcy5ib2R5ICE9PSB1bmRlZmluZWQpXHJcbiAgICB0aGlzLmJvZHkuc2V0X2ZpeGVkUm90YXRpb24oZmFsc2UpO1xyXG5cclxuICAvLyBBdXRvIGdlbmVyYXRlIGNvbG9yXHJcbiAgdmFyIHIgPSBVdGlscy5yYW5kb21SYW5nZShBVVRPX0NPTE9SX1JBTkdFWzBdLCBBVVRPX0NPTE9SX1JBTkdFWzFdKS50b1N0cmluZygxNik7IHIgPSByLmxlbmd0aCA9PSAxID8gXCIwXCIgKyByIDogcjtcclxuICB2YXIgZyA9IFV0aWxzLnJhbmRvbVJhbmdlKEFVVE9fQ09MT1JfUkFOR0VbMF0sIEFVVE9fQ09MT1JfUkFOR0VbMV0pLnRvU3RyaW5nKDE2KTsgZyA9IGcubGVuZ3RoID09IDEgPyBcIjBcIiArIGcgOiBnO1xyXG4gIHZhciBiID0gVXRpbHMucmFuZG9tUmFuZ2UoQVVUT19DT0xPUl9SQU5HRVswXSwgQVVUT19DT0xPUl9SQU5HRVsxXSkudG9TdHJpbmcoMTYpOyBiID0gYi5sZW5ndGggPT0gMSA/IFwiMFwiICsgYiA6IGI7XHJcbiAgdGhpcy5jb2xvciA9IFwiI1wiICsgciAgKyBnICsgYiA7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5kZWFkID0gdHJ1ZTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCkge1xyXG4gIGFsZXJ0KFwiRVJST1IhIENhbm5vdCBkcmF3IEVudGl0eTogVXNlIGRlcml2ZWQgY2xhc3Nlcy5cIik7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0Q29sb3IgPSBmdW5jdGlvbihjb2xvcikge1xyXG4gIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0SWQgPSBmdW5jdGlvbihpZCkge1xyXG4gIHRoaXMuaWQgPSBpZDtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnNldENvbGxpc2lvbkdyb3VwID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuICB0aGlzLmNvbGxpc2lvbkdyb3VwID0gZ3JvdXA7XHJcblxyXG4gIHZhciBmaWx0ZXJEYXRhID0gdGhpcy5maXh0dXJlLkdldEZpbHRlckRhdGEoKTtcclxuICBmaWx0ZXJEYXRhLnNldF9jYXRlZ29yeUJpdHMoMSA8PCBncm91cCk7XHJcbiAgdGhpcy5maXh0dXJlLlNldEZpbHRlckRhdGEoZmlsdGVyRGF0YSk7XHJcblxyXG4gIF9lbmdpbmUudXBkYXRlQ29sbGlzaW9uKHRoaXMpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRMaW5lYXJWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLmJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKTtcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRNYXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIE1hdGgubWF4KDEsIHRoaXMuYm9keS5HZXRNYXNzKCkpO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnNldExpbmVhclZlbG9jaXR5ID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgdGhpcy5ib2R5LlNldExpbmVhclZlbG9jaXR5KHZlY3Rvcik7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFwcGx5VG9ycXVlID0gZnVuY3Rpb24oZm9yY2UpIHtcclxuICB0aGlzLmJvZHkuQXBwbHlUb3JxdWUoZm9yY2UpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5hcHBseUxpbmVhckltcHVsc2UgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICB0aGlzLmJvZHkuQXBwbHlMaW5lYXJJbXB1bHNlKHZlY3RvciwgdGhpcy5ib2R5LkdldFdvcmxkQ2VudGVyKCkpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5kaXNhYmxlUm90YXRpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gIHRoaXMuZml4ZWRSb3RhdGlvbiA9IHZhbHVlO1xyXG4gIHRoaXMuYm9keS5TZXRGaXhlZFJvdGF0aW9uKHZhbHVlKVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5hZGRCZWhhdmlvciA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XHJcbiAgdGhpcy5iZWhhdmlvcnMucHVzaChiZWhhdmlvcik7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbnRpdHk7IiwidmFyIEJlaGF2aW9yID0gcmVxdWlyZShcIi4vYmVoYXZpb3IuanNcIik7XHJcbnZhciBFbnRpdHlGaWx0ZXIgPSByZXF1aXJlKFwiLi90b2tlbi5qc1wiKS5FbnRpdHlGaWx0ZXI7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XHJcblxyXG52YXIgZWZCeUlkID0gZnVuY3Rpb24oaWQpIHtcclxuICBFbnRpdHlGaWx0ZXIuY2FsbCh0aGlzLCBcImZpbHRlckJ5SWRcIiwgYXJndW1lbnRzLCBbVHlwZS5TVFJJTkddKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goaWQpO1xyXG59XHJcbmVmQnlJZC5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcbmVmQnlJZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBlZkJ5SWQ7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGVmQnlJZCk7XHJcblxyXG5lZkJ5SWQucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkuaWQgPT09IHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xyXG59XHJcblxyXG52YXIgZWZCeUNvbGxpc2lvbkdyb3VwID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuICBFbnRpdHlGaWx0ZXIuY2FsbCh0aGlzLCBcImZpbHRlckJ5R3JvdXBcIiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZ3JvdXApO1xyXG59XHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBlZkJ5Q29sbGlzaW9uR3JvdXA7XHJcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGVmQnlDb2xsaXNpb25Hcm91cCk7XHJcblxyXG5lZkJ5Q29sbGlzaW9uR3JvdXAucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkuY29sbGlzaW9uR3JvdXAgPT09IHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xyXG59XHJcblxyXG52YXIgZWZCeUxvZ2ljID0gZnVuY3Rpb24obG9naWMpIHtcclxuICBFbnRpdHlGaWx0ZXIuY2FsbCh0aGlzLCBcImZpbHRlckJ5Q29uZGl0aW9uXCIsIGFyZ3VtZW50cywgW1R5cGUuQk9PTEVBTl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChsb2dpYyk7XHJcbn1cclxuZWZCeUxvZ2ljLnByb3RvdHlwZSA9IG5ldyBFbnRpdHlGaWx0ZXIoKTtcclxuZWZCeUxvZ2ljLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGVmQnlMb2dpYztcclxuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4oZWZCeUxvZ2ljKTtcclxuXHJcbmVmQnlMb2dpYy5wcm90b3R5cGUuZGVjaWRlID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgcmV0dXJuIG5ldyBCZWhhdmlvcih0aGlzLmFyZ3NbMF0pLmNoZWNrKGVudGl0eSk7XHJcbn07IiwicmVxdWlyZShcIi4vaW5wdXQuanNcIik7XHJcblxyXG52YXIgRW5naW5lID0gcmVxdWlyZShcIi4vZW5naW5lLmpzXCIpO1xyXG52YXIgVmlld3BvcnQgPSByZXF1aXJlKFwiLi92aWV3cG9ydC5qc1wiKTtcclxudmFyIFVJID0gcmVxdWlyZShcIi4vdWkuanNcIik7XHJcbnZhciBCb2R5VHlwZSA9IHJlcXVpcmUoXCIuL2JvZHl0eXBlLmpzXCIpO1xyXG52YXIgQmVoYXZpb3IgPSByZXF1aXJlKFwiLi9iZWhhdmlvci5qc1wiKTtcclxudmFyIFRva2VuID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuVG9rZW47XHJcblxyXG52YXIgQ2lyY2xlID0gcmVxdWlyZShcIi4vc2hhcGVzLmpzXCIpLkNpcmNsZTtcclxudmFyIFJlY3RhbmdsZSA9IHJlcXVpcmUoXCIuL3NoYXBlcy5qc1wiKS5SZWN0YW5nbGU7XHJcblxyXG5VSS5pbml0aWFsaXplKCk7XHJcblxyXG5fZW5naW5lID0gbmV3IEVuZ2luZShuZXcgVmlld3BvcnQoJChcIiNtYWluQ2FudmFzXCIpWzBdKSwgbmV3IGIyVmVjMigwLCA1MDApKTtcclxuXHJcbl9lbmdpbmUuYWRkRW50aXR5KG5ldyBDaXJjbGUobmV3IGIyVmVjMig1MDAsIDUwKSwgMjApLCBCb2R5VHlwZS5EWU5BTUlDX0JPRFkpXHJcbiAgLnNldENvbGxpc2lvbkdyb3VwKDIpXHJcbiAgLnNldElkKFwia3J1aFwiKVxyXG4gIC5kaXNhYmxlUm90YXRpb24oZmFsc2UpXHJcbiAgLmFkZEJlaGF2aW9yKFxyXG4gICAgbmV3IEJlaGF2aW9yKFxyXG4gICAgICBUb2tlbi5wYXJzZShcImlzQnV0dG9uVXAobnVtYmVyKDMyKSlcIiksXHJcbiAgICAgIFRva2VuLnBhcnNlKFwic2V0TGluZWFyVmVsb2NpdHkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSwgZ2V0VmVsb2NpdHlYKGZpbHRlckJ5SWQodGV4dChrcnVoKSkpLCBudW1iZXIoLTk5OTk5OTk5OTk5OTk5OTk5OSkpXCIpXHJcbiAgICApXHJcbiAgKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgVG9rZW4ucGFyc2UoXCJpc0J1dHRvbkRvd24obnVtYmVyKDM3KSlcIiksXHJcbiAgICAgIFRva2VuLnBhcnNlKFwic2V0TGluZWFyVmVsb2NpdHkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSwgbnVtYmVyKC0xMDApLCBnZXRWZWxvY2l0eVkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSkpXCIpXHJcbiAgICApXHJcbiAgKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgVG9rZW4ucGFyc2UoXCJpc0J1dHRvbkRvd24obnVtYmVyKDM5KSlcIiksXHJcbiAgICAgIFRva2VuLnBhcnNlKFwic2V0TGluZWFyVmVsb2NpdHkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSwgbnVtYmVyKDEwMCksIGdldFZlbG9jaXR5WShmaWx0ZXJCeUlkKHRleHQoa3J1aCkpKSlcIilcclxuICAgIClcclxuICApO1xyXG5cclxuX2VuZ2luZS5hZGRFbnRpdHkobmV3IFJlY3RhbmdsZShuZXcgYjJWZWMyKDQwMCwgNDAwKSwgbmV3IGIyVmVjMig0MDAsIDMpKSwgQm9keVR5cGUuS0lORU1BVElDX0JPRFkpXHJcbiAgLnNldElkKFwicGxhdGZvcm1cIilcclxuICAuc2V0Q29sbGlzaW9uR3JvdXAoMSk7XHJcblxyXG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gIF9lbmdpbmUuc3RlcCgpO1xyXG59KTtcclxuXHJcblxyXG5cclxuXHJcbiIsIi8vIElOUFVUIENBUFRVUklOR1xyXG5cclxudmFyIFRvb2xzID0gcmVxdWlyZShcIi4vdG9vbHMuanNcIik7XHJcblxyXG53aW5kb3cud2luZG93LklucHV0ID0ge1xyXG4gIHRvb2w6IFRvb2xzLlNlbGVjdGlvbixcclxuXHJcbiAgbW91c2U6IHtcclxuICAgIHg6IDAsXHJcbiAgICB5OiAwLFxyXG4gICAgbGVmdERvd246IGZhbHNlLFxyXG4gICAgcmlnaHREb3duOiBmYWxzZSxcclxuICAgIGxlZnRVcDogZmFsc2UsXHJcbiAgICByaWdodFVwOiBmYWxzZSxcclxuXHJcbiAgICB1cGRhdGVQb3NpdGlvbjogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHRoaXMueCA9IGV2ZW50LnBhZ2VYIC0gX2VuZ2luZS52aWV3cG9ydC5jYW52YXNFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICAgIHRoaXMueSA9IGV2ZW50LnBhZ2VZIC0gX2VuZ2luZS52aWV3cG9ydC5jYW52YXNFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc0Rvd246IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9IF9lbmdpbmUudmlld3BvcnQuY2FudmFzRWxlbWVudClcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMSkge1xyXG4gICAgICAgIHRoaXMubGVmdERvd24gPSB0cnVlO1xyXG5cclxuICAgICAgICB3aW5kb3cuSW5wdXQudG9vbC5vbmNsaWNrKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMylcclxuICAgICAgICB0aGlzLnJpZ2h0RG93biA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUJ1dHRvbnNVcDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC50YXJnZXQgIT0gX2VuZ2luZS52aWV3cG9ydC5jYW52YXNFbGVtZW50KVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxKSB7XHJcbiAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubGVmdFVwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgd2luZG93LklucHV0LnRvb2wub25yZWxlYXNlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMykge1xyXG4gICAgICAgIHRoaXMucmlnaHREb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yaWdodFVwID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhblVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMubGVmdFVwID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucmlnaHRVcCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGtleWJvYXJkOiB7XHJcbiAgICBkb3duOiBuZXcgU2V0KCksXHJcbiAgICB1cDogbmV3IFNldCgpLFxyXG5cclxuICAgIGlzRG93bjogZnVuY3Rpb24gKGtleUNvZGUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZG93bi5oYXMoa2V5Q29kZSlcclxuICAgIH0sXHJcblxyXG4gICAgaXNVcDogZnVuY3Rpb24gKGtleUNvZGUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudXAuaGFzKGtleUNvZGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVCdXR0b25zRG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHRoaXMuZG93bi5hZGQoZXZlbnQud2hpY2gpO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVCdXR0b25zVXA6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICB0aGlzLmRvd24uZGVsZXRlKGV2ZW50LndoaWNoKTtcclxuICAgICAgdGhpcy51cC5hZGQoZXZlbnQud2hpY2gpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhblVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMudXAuY2xlYXIoKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBpbml0aWFsaXplOiBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBlbGVtZW50Lm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICB3aW5kb3cud2luZG93LklucHV0Lm1vdXNlLnVwZGF0ZVBvc2l0aW9uKGUpO1xyXG4gICAgfTtcclxuICAgIGVsZW1lbnQub25tb3VzZWRvd24gPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHdpbmRvdy53aW5kb3cuSW5wdXQubW91c2UudXBkYXRlQnV0dG9uc0Rvd24oZSk7XHJcbiAgICB9O1xyXG4gICAgZWxlbWVudC5vbm1vdXNldXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHdpbmRvdy53aW5kb3cuSW5wdXQubW91c2UudXBkYXRlQnV0dG9uc1VwKGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBkb2N1bWVudC5vbmtleWRvd24gPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHdpbmRvdy53aW5kb3cuSW5wdXQua2V5Ym9hcmQudXBkYXRlQnV0dG9uc0Rvd24oZSk7XHJcbiAgICB9O1xyXG4gICAgZG9jdW1lbnQub25rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgd2luZG93LndpbmRvdy5JbnB1dC5rZXlib2FyZC51cGRhdGVCdXR0b25zVXAoZSk7XHJcbiAgICB9O1xyXG4gIH1cclxufTtcclxuXHJcbiIsInZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xudmFyIExvZ2ljID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuTG9naWM7XG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xudmFyIEZpeFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuRml4VHlwZTtcblxudmFyIGxBbmQgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiQU5EXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOLCBUeXBlLkJPT0xFQU5dKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcbn07XG5sQW5kLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubEFuZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQW5kO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obEFuZCk7XG5cbmxBbmQucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICYmIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcbn1cblxudmFyIGxPciA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJPUlwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuQk9PTEVBTiwgVHlwZS5CT09MRUFOXSk7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG59XG5sT3IucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sT3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE9yO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obE9yKTtcblxubE9yLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpIHx8IHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIHJldHVybiBmYWxzZTtcbn1cblxudmFyIGxOb3QgPSBmdW5jdGlvbiAoYSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiTk9UXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG59XG5sTm90LnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubE5vdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTm90O1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obE5vdCk7XG5cbmxOb3QucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gIXRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xufVxuXG52YXIgbFN0cmluZyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwidGV4dFwiLCBUeXBlLlNUUklORywgYXJndW1lbnRzLCBbVHlwZS5MSVRFUkFMXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2godmFsdWUpO1xufVxubFN0cmluZy5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxTdHJpbmcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFN0cmluZztcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxTdHJpbmcpO1xuXG5sU3RyaW5nLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXTtcbn1cblxudmFyIGxOdW1iZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIm51bWJlclwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5MSVRFUkFMXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2godmFsdWUpO1xufVxubE51bWJlci5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxOdW1iZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE51bWJlcjtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxOdW1iZXIpO1xuXG5sTnVtYmVyLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5hcmdzWzBdKTtcbn1cblxudmFyIGxCb29sID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJib29sZWFuXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5MSVRFUkFMXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2godmFsdWUpO1xufVxubEJvb2wucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sQm9vbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQm9vbDtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxCb29sKTtcblxubEJvb2wucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdID09PSBcInRydWVcIjtcbn1cblxudmFyIGxCdXR0b25Eb3duID0gZnVuY3Rpb24gKGJ1dHRvbikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiaXNCdXR0b25Eb3duXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChidXR0b24pO1xufVxubEJ1dHRvbkRvd24ucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sQnV0dG9uRG93bi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQnV0dG9uRG93bjtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxCdXR0b25Eb3duKTtcblxubEJ1dHRvbkRvd24ucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gd2luZG93LklucHV0LmtleWJvYXJkLmlzRG93bih0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSk7XG59XG5cbnZhciBsQnV0dG9uVXAgPSBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJpc0J1dHRvblVwXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChidXR0b24pO1xufVxubEJ1dHRvblVwLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubEJ1dHRvblVwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxCdXR0b25VcDtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxCdXR0b25VcCk7XG5cbmxCdXR0b25VcC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB3aW5kb3cuSW5wdXQua2V5Ym9hcmQuaXNVcCh0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSk7XG59XG5cbnZhciBsUmFuZG9tID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJyYW5kb21OdW1iZXJcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKG1pbik7XG4gIHRoaXMuYXJncy5wdXNoKG1heCk7XG59XG5sUmFuZG9tLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubFJhbmRvbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsUmFuZG9tO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obFJhbmRvbSk7XG5cbmxSYW5kb20ucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gVXRpbHMucmFuZG9tUmFuZ2UodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgJiYgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xufVxuXG52YXIgbFZlbG9jaXR5WCA9IGZ1bmN0aW9uIChlZikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiZ2V0VmVsb2NpdHlYXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcbn1cbmxWZWxvY2l0eVgucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sVmVsb2NpdHlYLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxWZWxvY2l0eVg7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsVmVsb2NpdHlYKTtcblxubFZlbG9jaXR5WC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbnRpdHkgPSB0aGlzLmFyZ3NbMF0uZmlsdGVyKClbMF07XG5cbiAgcmV0dXJuIGVudGl0eS5ib2R5LkdldExpbmVhclZlbG9jaXR5KCkuZ2V0X3goKTtcbn1cblxudmFyIGxWZWxvY2l0eVkgPSBmdW5jdGlvbiAoZWYpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImdldFZlbG9jaXR5WVwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChlZik7XG59XG5sVmVsb2NpdHlZLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubFZlbG9jaXR5WS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsVmVsb2NpdHlZO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obFZlbG9jaXR5WSk7XG5cbmxWZWxvY2l0eVkucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZW50aXR5ID0gdGhpcy5hcmdzWzBdLmZpbHRlcigpWzBdO1xuXG4gIHJldHVybiBlbnRpdHkuYm9keS5HZXRMaW5lYXJWZWxvY2l0eSgpLmdldF95KCk7XG59XG5cbnZhciBsUGx1cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCIrXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcbn1cbmxQbHVzLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xubFBsdXMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFBsdXM7XG5CZWhhdmlvci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbihsUGx1cyk7XG5cbmxQbHVzLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICsgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59XG5cbnZhciBsTXVsdGlwbHkgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiKlwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59XG5sTXVsdGlwbHkucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sTXVsdGlwbHkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE11bHRpcGx5O1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obE11bHRpcGx5KTtcblxubE11bHRpcGx5LnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICogdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59XG5cbnZhciBsRGl2aWRlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIi9cIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xufVxubERpdmlkZS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcbmxEaXZpZGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbERpdmlkZTtcbkJlaGF2aW9yLnByb3RvdHlwZS5yZWdpc3RlclRva2VuKGxEaXZpZGUpO1xuXG5sRGl2aWRlLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpIC8gdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59XG5cbnZhciBsTWludXMgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiLVwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59XG5sTWludXMucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5sTWludXMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE1pbnVzO1xuQmVoYXZpb3IucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW4obE1pbnVzKTtcblxubE1pbnVzLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICsgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59IiwidmFyIEVudGl0eSA9IHJlcXVpcmUoXCIuL2VudGl0eS5qc1wiKTtcclxuXHJcbi8vIENpcmNsZSBlbnRpdHlcclxudmFyIENpcmNsZSA9IGZ1bmN0aW9uKGNlbnRlciwgcmFkaXVzLCBmaXh0dXJlLCBpZCwgY29sbGlzaW9uR3JvdXApIHtcclxuICB2YXIgc2hhcGUgPSBuZXcgYjJDaXJjbGVTaGFwZSgpO1xyXG4gIHNoYXBlLnNldF9tX3JhZGl1cyhyYWRpdXMpO1xyXG5cclxuICB2YXIgYm9keSA9IG5ldyBiMkJvZHlEZWYoKTtcclxuICBib2R5LnNldF9wb3NpdGlvbihjZW50ZXIpO1xyXG5cclxuICBFbnRpdHkuY2FsbCh0aGlzLCBzaGFwZSwgZml4dHVyZSwgYm9keSwgaWQsIGNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcbkNpcmNsZS5wcm90b3R5cGUgPSBuZXcgRW50aXR5KCk7XHJcbkNpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaXJjbGU7XHJcblxyXG5DaXJjbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcblxyXG4gIGN0eC5hcmMoMCwgMCwgdGhpcy5yYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcblxyXG4gIGN0eC5maWxsKCk7XHJcblxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XHJcbiAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IFwiZGVzdGluYXRpb24tb3V0XCI7XHJcblxyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgubW92ZVRvKDAsIDApO1xyXG4gIGN0eC5saW5lVG8oMCwgdGhpcy5yYWRpdXMpO1xyXG4gIGN0eC5zdHJva2UoKTtcclxuICBjdHguY2xvc2VQYXRoKCk7XHJcbn1cclxuXHJcblxyXG4vLyBSZWN0YW5nbGUgZW50aXR5XHJcbnZhciBSZWN0YW5nbGUgPSBmdW5jdGlvbihjZW50ZXIsIGV4dGVudHMsIGZpeHR1cmUsIGlkLCBjb2xsaXNpb25Hcm91cCkge1xyXG4gIHZhciBzaGFwZSA9IG5ldyBiMlBvbHlnb25TaGFwZSgpO1xyXG4gIHNoYXBlLlNldEFzQm94KGV4dGVudHMuZ2V0X3goKSwgZXh0ZW50cy5nZXRfeSgpKVxyXG5cclxuICB2YXIgYm9keSA9IG5ldyBiMkJvZHlEZWYoKTtcclxuICBib2R5LnNldF9wb3NpdGlvbihjZW50ZXIpO1xyXG5cclxuICBFbnRpdHkuY2FsbCh0aGlzLCBzaGFwZSwgZml4dHVyZSwgYm9keSwgaWQsIGNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgdGhpcy5leHRlbnRzID0gZXh0ZW50cztcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuUmVjdGFuZ2xlLnByb3RvdHlwZSA9IG5ldyBFbnRpdHkoKTtcclxuUmVjdGFuZ2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlY3RhbmdsZTtcclxuXHJcblJlY3RhbmdsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGN0eCkge1xyXG4gIHZhciBoYWxmV2lkdGggPSB0aGlzLmV4dGVudHMuZ2V0X3goKTtcclxuICB2YXIgaGFsZkhlaWdodCA9IHRoaXMuZXh0ZW50cy5nZXRfeSgpO1xyXG5cclxuICBjdHguZmlsbFJlY3QoLWhhbGZXaWR0aCwgLWhhbGZIZWlnaHQsIGhhbGZXaWR0aCAqIDIsIGhhbGZIZWlnaHQgKiAyKTtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzLkNpcmNsZSA9IENpcmNsZTtcclxubW9kdWxlLmV4cG9ydHMuUmVjdGFuZ2xlID0gUmVjdGFuZ2xlOyIsInZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xyXG52YXIgRml4VHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5GaXhUeXBlO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxudmFyIFR5cGVFeGNlcHRpb24gPSBmdW5jdGlvbihleHBlY3RlZCwgcmVjZWl2ZWQsIHRva2VuKSB7XHJcbiAgdGhpcy5leHBlY3RlZCA9IGV4cGVjdGVkO1xyXG4gIHRoaXMucmVjZWl2ZWQgPSByZWNlaXZlZDtcclxuICB0aGlzLnRva2VuID0gdG9rZW47XHJcbn07XHJcblxyXG52YXIgVG9rZW4gPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBhcmdzLCBhcmd1bWVudF90eXBlcykge1xyXG4gIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5QUkVGSVg7XHJcbiAgdGhpcy5uYW1lID0gbmFtZTtcclxuICB0aGlzLmFyZ3MgPSBhcmdzID09IHVuZGVmaW5lZCA/IFtdIDogYXJncztcclxuICB0aGlzLmFyZ3VtZW50X3R5cGVzID0gYXJndW1lbnRfdHlwZXM7XHJcbiAgdGhpcy5hcmdzID0gW107XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hcmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoYXJnc1tpXS50eXBlICE9PSBhcmd1bWVudF90eXBlc1tpXSAmJiBhcmd1bWVudF90eXBlc1tpXSAhPT0gVHlwZS5MSVRFUkFMKVxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUV4Y2VwdGlvbihhcmd1bWVudF90eXBlc1tpXSwgYXJnc1tpXS50eXBlLCB0aGlzKTtcclxuICB9XHJcbn07XHJcblxyXG5Ub2tlbi5zdG9wQ2hhcnMgPSBbXCIoXCIsIFwiKVwiLCBcIixcIl07XHJcblxyXG5Ub2tlbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgcmV0ID0gXCJcIjtcclxuICB2YXIgYXJnU3RyaW5ncyA9IFtdO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgYXJnU3RyaW5ncy5wdXNoKHRoaXMuYXJnc1tpXS50b1N0cmluZygpKTtcclxuICB9XHJcblxyXG4gIGFyZ1N0cmluZ3MgPSBhcmdTdHJpbmdzLmpvaW4oXCIsIFwiKTtcclxuXHJcbiAgc3dpdGNoICh0aGlzLmZpeFR5cGUpIHtcclxuICAgIGNhc2UgRml4VHlwZS5QUkVGSVg6XHJcbiAgICAgIHJldCA9IHRoaXMubmFtZSArIFwiKFwiICsgYXJnU3RyaW5ncyArIFwiKVwiO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgRml4VHlwZS5JTkZJWDpcclxuICAgICAgcmV0ID0gdGhpcy5hcmdzWzBdLnRvU3RyaW5nKCkgKyBcIiBcIiArIHRoaXMubmFtZSArIFwiIFwiICsgdGhpcy5hcmdzWzFdLnRvU3RyaW5nKCk7XHJcbiAgICAgIGJyZWFrO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcblRva2VuLnBhcnNlID0gZnVuY3Rpb24oaW5wdXQpIHtcclxuICBUb2tlbi5wYXJzZXJJbnB1dCA9IGlucHV0O1xyXG4gIFRva2VuLnBhcnNlcklucHV0V2hvbGUgPSBpbnB1dDtcclxuICBUb2tlbi5wYXJzZXJTdGFjayA9IFtdO1xyXG5cclxuICBkbyB7XHJcbiAgICBUb2tlbi5wYXJzZVN0ZXAoKVxyXG4gIH0gd2hpbGUgKFRva2VuLnBhcnNlcklucHV0Lmxlbmd0aCk7XHJcblxyXG4gIHZhciByZXQgPSBUb2tlbi5wYXJzZXJTdGFjay5wb3AoKTtcclxuXHJcbiAgaWYgKFRva2VuLnBhcnNlclN0YWNrLmxlbmd0aClcclxuICAgIHRocm93IFwiVW5leHBlY3RlZCBcIiArIHJldC5uYW1lO1xyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuVG9rZW4ucmVhZFdoaXRlc3BhY2UgPSBmdW5jdGlvbigpIHtcclxuICB3aGlsZSAoL1xccy8udGVzdChUb2tlbi5wYXJzZXJJbnB1dFswXSkgJiYgVG9rZW4ucGFyc2VySW5wdXQubGVuZ3RoKSB7XHJcbiAgICBUb2tlbi5wYXJzZXJJbnB1dCA9IFRva2VuLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG4gIH1cclxufTtcclxuXHJcblRva2VuLnBhcnNlTmFtZSA9IGZ1bmN0aW9uKCkge1xyXG4gIFRva2VuLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gIHZhciByZXQgPSBcIlwiO1xyXG5cclxuICB3aGlsZSAoIS9cXHMvLnRlc3QoVG9rZW4ucGFyc2VySW5wdXRbMF0pICYmIFRva2VuLnBhcnNlcklucHV0Lmxlbmd0aCAmJiBUb2tlbi5zdG9wQ2hhcnMuaW5kZXhPZihUb2tlbi5wYXJzZXJJbnB1dFswXSkgPT09IC0xKSAvLyByZWFkIHVudGlsIGEgd2hpdGVzcGFjZSBvY2N1cnNcclxuICB7XHJcbiAgICByZXQgKz0gVG9rZW4ucGFyc2VySW5wdXRbMF1cclxuICAgIFRva2VuLnBhcnNlcklucHV0ID0gVG9rZW4ucGFyc2VySW5wdXQuc2xpY2UoMSk7XHJcbiAgfVxyXG5cclxuICBUb2tlbi5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuVG9rZW4ucmVhZENoYXIgPSBmdW5jdGlvbihjaGFyKSB7XHJcbiAgVG9rZW4ucmVhZFdoaXRlc3BhY2UoKTtcclxuXHJcbiAgaWYgKFRva2VuLnBhcnNlcklucHV0WzBdICE9PSBjaGFyKSB7XHJcbiAgICB2YXIgcG9zaXRpb24gPSBUb2tlbi5wYXJzZXJJbnB1dFdob2xlLmxlbmd0aCAtIFRva2VuLnBhcnNlcklucHV0Lmxlbmd0aDtcclxuICAgIHRocm93IFwiRXhwZWN0ZWQgJ1wiICsgY2hhciArIFwiJyBhdCBwb3NpdGlvbiBcIiArIHBvc2l0aW9uICsgXCIgYXQgJ1wiICsgVG9rZW4ucGFyc2VySW5wdXRXaG9sZS5zdWJzdHIocG9zaXRpb24pICsgXCInXCI7XHJcbiAgfVxyXG5cclxuICBUb2tlbi5wYXJzZXJJbnB1dCA9IFRva2VuLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG5cclxuICBUb2tlbi5yZWFkV2hpdGVzcGFjZSgpO1xyXG59O1xyXG5cclxuVG9rZW4ucGFyc2VTdGVwID0gZnVuY3Rpb24oZXhwZWN0ZWRUeXBlKSB7XHJcbiAgdmFyIG5hbWUgPSBUb2tlbi5wYXJzZU5hbWUoKTtcclxuICB2YXIgdG9rZW4gPSB3aW5kb3cudG9rZW5zW25hbWVdO1xyXG5cclxuICBpZiAodG9rZW4gPT09IHVuZGVmaW5lZCAmJiBleHBlY3RlZFR5cGUgPT09IFR5cGUuTElURVJBTCkge1xyXG4gICAgcmV0dXJuIG5hbWU7XHJcbiAgfVxyXG5cclxuICBpZiAodG9rZW4gPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aHJvdyBcIkV4cGVjdGVkIGFyZ3VtZW50IHdpdGggdHlwZSBcIiArIGV4cGVjdGVkVHlwZTtcclxuICB9XHJcblxyXG4gIGlmIChleHBlY3RlZFR5cGUgIT09IHVuZGVmaW5lZCAmJiB0b2tlbi50eXBlICE9PSBleHBlY3RlZFR5cGUpIHtcclxuICAgIHRocm93IFwiVW5leHBlY3RlZCBcIiArIHRva2VuLnR5cGUgKyBcIiAod2FzIGV4cGVjdGluZyBcIiArIGV4cGVjdGVkVHlwZSArIFwiKVwiO1xyXG4gIH1cclxuXHJcbiAgdmFyIG51bUFyZ3MgPSB0b2tlbi5hcmd1bWVudF90eXBlcy5sZW5ndGg7XHJcblxyXG4gIHZhciBhcmdzID0gW107XHJcblxyXG4gIGlmICh0b2tlbi5maXhUeXBlID09PSBGaXhUeXBlLklORklYKSB7XHJcbiAgICB2YXIgYSA9IFRva2VuLnBhcnNlclN0YWNrLnBvcCgpO1xyXG5cclxuICAgIGlmIChhLnR5cGUgIT09IHRva2VuLmFyZ3VtZW50X3R5cGVzWzBdKVxyXG4gICAgICB0aHJvdyBcIlVuZXhwZWN0ZWQgXCIgKyBhLnR5cGUgKyBcIiAod2FzIGV4cGVjdGluZyBcIiArIHRva2VuLmFyZ3VtZW50X3R5cGVzWzBdICsgXCIpXCI7XHJcblxyXG4gICAgYXJncyA9IFthLCBUb2tlbi5wYXJzZVN0ZXAodG9rZW4uYXJndW1lbnRfdHlwZXNbMV0pXTtcclxuICAgIFRva2VuLnBhcnNlclN0YWNrLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRva2VuLmZpeFR5cGUgPT09IEZpeFR5cGUuUFJFRklYKSB7XHJcbiAgICBUb2tlbi5yZWFkQ2hhcihcIihcIik7XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IG51bUFyZ3M7IGkrKykge1xyXG4gICAgICBhcmdzLnB1c2goVG9rZW4ucGFyc2VTdGVwKHRva2VuLmFyZ3VtZW50X3R5cGVzW2ldKSk7XHJcblxyXG4gICAgICBUb2tlbi5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICAgICAgaWYgKFRva2VuLnBhcnNlcklucHV0WzBdID09PSBcIixcIilcclxuICAgICAgICBUb2tlbi5wYXJzZXJJbnB1dCA9IFRva2VuLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG4gICAgfVxyXG5cclxuICAgIFRva2VuLnJlYWRDaGFyKFwiKVwiKTtcclxuICB9XHJcblxyXG4gIHZhciBuZXdUb2tlbiA9IG5ldyB0b2tlbi5jb25zdHJ1Y3RvcigpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgbmV3VG9rZW4uYXJnc1tpXSA9IGFyZ3NbaV07XHJcblxyXG4gICAgVG9rZW4ucGFyc2VyU3RhY2sucG9wKCk7XHJcbiAgfVxyXG4gIFRva2VuLnBhcnNlclN0YWNrLnB1c2gobmV3VG9rZW4pO1xyXG5cclxuICByZXR1cm4gbmV3VG9rZW47XHJcbn07XHJcblxyXG5cclxudmFyIExvZ2ljID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICBUb2tlbi5jYWxsKHRoaXMsIG5hbWUsIHR5cGUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKTtcclxufTtcclxuTG9naWMucHJvdG90eXBlID0gbmV3IFRva2VuKCk7XHJcbkxvZ2ljLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvZ2ljO1xyXG5cclxuTG9naWMucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24oKSB7IC8vIFVzZSBhIGRlcml2ZWQgY2xhc3NcclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5cclxudmFyIEFjdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgVG9rZW4uY2FsbCh0aGlzLCBuYW1lLCBUeXBlLkFDVElPTiwgYXJncywgYXJndW1lbnRfdHlwZXMpO1xyXG59O1xyXG5BY3Rpb24ucHJvdG90eXBlID0gbmV3IFRva2VuKCk7XHJcbkFjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBY3Rpb247XHJcblxyXG5BY3Rpb24ucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHsgLy8gVXNlIGEgZGVyaXZlZCBjbGFzc1xyXG4gIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbkFjdGlvbi5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBlbnRpdGllcyA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB0aGlzLmVhY2goZW50aXRpZXNbaV0pO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG52YXIgRW50aXR5RmlsdGVyID0gZnVuY3Rpb24obmFtZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICBUb2tlbi5jYWxsKHRoaXMsIG5hbWUsIFR5cGUuRU5USVRZRklMVEVSLCBhcmdzLCBhcmd1bWVudF90eXBlcyk7XHJcbn07XHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUgPSBuZXcgVG9rZW4oKTtcclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVudGl0eUZpbHRlcjtcclxuXHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUuZGVjaWRlID0gZnVuY3Rpb24oZW50aXR5KSB7IC8vIFVzZSBkZXJpdmVkIGNsYXNzXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgcmV0ID0gW107XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZW5naW5lLmVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAodGhpcy5kZWNpZGUoX2VuZ2luZS5lbnRpdGllc1tpXSkpXHJcbiAgICAgIHJldC5wdXNoKF9lbmdpbmUuZW50aXRpZXNbaV0pO1xyXG4gIH1cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMuVG9rZW4gPSBUb2tlbjtcclxubW9kdWxlLmV4cG9ydHMuQWN0aW9uID0gQWN0aW9uO1xyXG5tb2R1bGUuZXhwb3J0cy5Mb2dpYyA9IExvZ2ljO1xyXG5tb2R1bGUuZXhwb3J0cy5FbnRpdHlGaWx0ZXIgPSBFbnRpdHlGaWx0ZXI7XHJcblxyXG4vLyBUT0RPOiBsaW5lYXIgYWN0aW9uLCBwb3Jvdm5hdmFuaWUsIHVobHksIHBsdXMsIG1pbnVzICwgZGVsZW5vLCBrcmF0LCB4IG5hIG4iLCJ2YXIgU2hhcGUgPSByZXF1aXJlKFwiLi9zaGFwZXMuanNcIik7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vYm9keXR5cGUuanNcIik7XHJcblxyXG52YXIgQmxhbmsgPSB7XHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge30sXHJcbiAgb25yZWxlYXNlOiBmdW5jdGlvbiAoKSB7fSxcclxuICBvbm1vdmU6IGZ1bmN0aW9uICgpIHt9XHJcbn07XHJcblxyXG5cclxudmFyIFNlbGVjdGlvbiA9IHtcclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBfZW5naW5lLnNlbGVjdEVudGl0eShudWxsKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gX2VuZ2luZS5lbnRpdGllcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBpZiAoX2VuZ2luZS5lbnRpdGllc1tpXS5maXh0dXJlLlRlc3RQb2ludChcclxuICAgICAgICAgIG5ldyBiMlZlYzIoX2VuZ2luZS52aWV3cG9ydC54IC0gX2VuZ2luZS52aWV3cG9ydC53aWR0aCAvIDIgKyB3aW5kb3cuSW5wdXQubW91c2UueCwgX2VuZ2luZS52aWV3cG9ydC55IC0gX2VuZ2luZS52aWV3cG9ydC5oZWlnaHQgLyAyICArIHdpbmRvdy5JbnB1dC5tb3VzZS55KSlcclxuICAgICAgKSB7XHJcbiAgICAgICAgX2VuZ2luZS5zZWxlY3RFbnRpdHkoaSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge30sXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7fVxyXG59O1xyXG5cclxuXHJcbnZhciBSZWN0YW5nbGUgPSB7XHJcbiAgb3JpZ2luOiBudWxsLFxyXG5cclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm9ubW92ZSA9IHRoaXMuZHJhZ2dpbmc7XHJcbiAgICB0aGlzLm9yaWdpbiA9IFt3aW5kb3cuSW5wdXQubW91c2UueCwgd2luZG93LklucHV0Lm1vdXNlLnldO1xyXG4gIH0sXHJcblxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHcgPSB3aW5kb3cuSW5wdXQubW91c2UueCAtIHRoaXMub3JpZ2luWzBdO1xyXG4gICAgdmFyIGggPSB3aW5kb3cuSW5wdXQubW91c2UueSAtIHRoaXMub3JpZ2luWzFdO1xyXG5cclxuICAgIF9lbmdpbmUuYWRkRW50aXR5KG5ldyBTaGFwZS5SZWN0YW5nbGUoXHJcbiAgICAgIG5ldyBiMlZlYzIodGhpcy5vcmlnaW5bMF0gKyB3IC8gMiwgdGhpcy5vcmlnaW5bMV0gKyBoIC8gMiksXHJcbiAgICAgIG5ldyBiMlZlYzIodyAvIDIsIGggLyAyKSksIFR5cGUuRFlOQU1JQ19CT0RZKTtcclxuXHJcbiAgICB0aGlzLm9ubW92ZSA9IGZ1bmN0aW9uKCl7fTtcclxuICAgIHRoaXMub3JpZ2luID0gbnVsbDtcclxuICB9LFxyXG5cclxuICBvbm1vdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgfSxcclxuXHJcbiAgZHJhZ2dpbmc6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsIDAsIDAsIDAuNClcIjtcclxuICAgIGN0eC5maWxsUmVjdCh0aGlzLm9yaWdpblswXSwgdGhpcy5vcmlnaW5bMV0sIHdpbmRvdy5JbnB1dC5tb3VzZS54IC0gdGhpcy5vcmlnaW5bMF0sIHdpbmRvdy5JbnB1dC5tb3VzZS55IC0gdGhpcy5vcmlnaW5bMV0pO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICB9XHJcbn07XHJcblxyXG5cclxudmFyIENpcmNsZSA9IHtcclxuICBvcmlnaW46IG51bGwsXHJcbiAgcmFkaXVzOiAwLFxyXG5cclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm9ubW92ZSA9IHRoaXMuZHJhZ2dpbmc7XHJcbiAgICB0aGlzLm9yaWdpbiA9IFt3aW5kb3cuSW5wdXQubW91c2UueCwgd2luZG93LklucHV0Lm1vdXNlLnldO1xyXG4gIH0sXHJcblxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge1xyXG4gICAgX2VuZ2luZS5hZGRFbnRpdHkobmV3IFNoYXBlLkNpcmNsZShcclxuICAgICAgbmV3IGIyVmVjMih0aGlzLm9yaWdpblswXSArIHRoaXMucmFkaXVzLCB0aGlzLm9yaWdpblsxXSArIHRoaXMucmFkaXVzKSxcclxuICAgICAgdGhpcy5yYWRpdXMpLCBUeXBlLkRZTkFNSUNfQk9EWSk7XHJcblxyXG4gICAgdGhpcy5vbm1vdmUgPSBmdW5jdGlvbigpe307XHJcbiAgICB0aGlzLm9yaWdpbiA9IG51bGw7XHJcbiAgICB0aGlzLnJhZGl1cyA9IDA7XHJcbiAgfSxcclxuXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIH0sXHJcblxyXG4gIGRyYWdnaW5nOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICB0aGlzLnJhZGl1cyA9IE1hdGgubWluKHdpbmRvdy5JbnB1dC5tb3VzZS54IC0gdGhpcy5vcmlnaW5bMF0sIHdpbmRvdy5JbnB1dC5tb3VzZS55IC0gdGhpcy5vcmlnaW5bMV0pIC8gMjtcclxuXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG5cclxuICAgIGN0eC5hcmModGhpcy5vcmlnaW5bMF0gKyB0aGlzLnJhZGl1cywgdGhpcy5vcmlnaW5bMV0gKyB0aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcblxyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLCAwLCAwLCAwLjQpXCI7XHJcbiAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMuQmxhbmsgPSBCbGFuaztcclxubW9kdWxlLmV4cG9ydHMuU2VsZWN0aW9uID0gU2VsZWN0aW9uO1xyXG5tb2R1bGUuZXhwb3J0cy5SZWN0YW5nbGUgPSBSZWN0YW5nbGU7XHJcbm1vZHVsZS5leHBvcnRzLkNpcmNsZSA9IENpcmNsZTsiLCJ2YXIgVHlwZSA9IHtcclxuICBCT09MRUFOOiBcImJvb2xlYW5cIixcclxuICBOVU1CRVI6IFwibnVtYmVyXCIsXHJcbiAgU1RSSU5HOiBcInN0cmluZ1wiLFxyXG4gIEFSUkFZOiBcImFycmF5XCIsXHJcbiAgQUNUSU9OOiBcImFjdGlvblwiLFxyXG4gIEVOVElUWUZJTFRFUjogXCJlbnRpdHlGaWx0ZXJcIixcclxuICBMSVRFUkFMOiBcImxpdGVyYWxcIlxyXG59O1xyXG5cclxudmFyIEZpeFR5cGUgPSB7XHJcbiAgSU5GSVg6IFwiaW5maXhcIixcclxuICBQUkVGSVg6IFwicHJlZml4XCJcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLlR5cGUgPSBUeXBlO1xyXG5tb2R1bGUuZXhwb3J0cy5GaXhUeXBlID0gRml4VHlwZTsiLCJ2YXIgVG9vbHMgPSByZXF1aXJlKFwiLi90b29scy5qc1wiKTtcclxudmFyIEJvZHlUeXBlID0gcmVxdWlyZShcIi4vYm9keXR5cGUuanNcIik7XHJcblxyXG4vLyBPYmplY3QgZm9yIGJ1aWxkaW5nIHRoZSBVSVxyXG52YXIgVUkgPSB7XHJcbiAgLy8gVUkgaW5pdGlhbGlzYXRpb25cclxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgdG9vbGJhciA9IGVsKFwiZGl2LnRvb2xiYXJcIik7XHJcblxyXG4gICAgdmFyIGNvbGxpc2lvbnNCdXR0b24gPSBlbChcImRpdi51aUNvbnRhaW5lci5idXR0b25cIiwge3N0cmluZ0lkOiAxfSk7XHJcbiAgICBjb2xsaXNpb25zQnV0dG9uLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgVUkucG9wdXAoVUkuY3JlYXRlQ29sbGlzaW9ucygpKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHBhdXNlQnV0dG9uID0gZWwoXCJkaXYudWlDb250YWluZXIuYnV0dG9uXCIsIHtzdHJpbmdJZDogMn0pO1xyXG4gICAgcGF1c2VCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBfZW5naW5lLnRvZ2dsZVBhdXNlKCk7XHJcbiAgICAgIHRoaXMuc3RyaW5nSWQgPSBfZW5naW5lLndvcmxkLnBhdXNlZCA/IDIgOiAzO1xyXG4gICAgICB0aGlzLmlubmVySFRNTCA9IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkKHRoaXMuc3RyaW5nSWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgbGFuZ3VhZ2VTZWxlY3RvciA9IGVsKFwic2VsZWN0XCIpO1xyXG4gICAgbGFuZ3VhZ2VTZWxlY3Rvci5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgVHJhbnNsYXRpb25zLnNldExhbmd1YWdlKHRoaXMudmFsdWUpO1xyXG4gICAgfTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgVHJhbnNsYXRpb25zLnN0cmluZ3MubGVuZ3RoOyBpKyspXHJcbiAgICB7XHJcbiAgICAgIHZhciBvcHRpb24gPSBlbChcIm9wdGlvblwiLCB7dmFsdWU6IGl9KTtcclxuICAgICAgb3B0aW9uLmlubmVySFRNTCA9IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkKDAsIGkpO1xyXG5cclxuICAgICAgbGFuZ3VhZ2VTZWxlY3Rvci5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIHRvb2xiYXIuYXBwZW5kQ2hpbGQocGF1c2VCdXR0b24pO1xyXG4gICAgdG9vbGJhci5hcHBlbmRDaGlsZChjb2xsaXNpb25zQnV0dG9uKTtcclxuICAgIHRvb2xiYXIuYXBwZW5kQ2hpbGQobGFuZ3VhZ2VTZWxlY3Rvcik7XHJcblxyXG4gICAgdmFyIGxhbmd1YWdlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBUcmFuc2xhdGlvbnMuc3RyaW5ncy5sZW5ndGg7IGkrKylcclxuICAgIHtcclxuICAgICAgbGFuZ3VhZ2VzLnB1c2goeyB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZCgwLCBpKSwgaWQ6IGkgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgJChcImJvZHlcIikudzJsYXlvdXQoXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiBcImVkaXRvckxheW91dFwiLFxyXG4gICAgICAgIHBhbmVsczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm1haW5cIixcclxuXHJcbiAgICAgICAgICAgIGNvbnRlbnQ6IFwiPGNhbnZhcyBpZD0nbWFpbkNhbnZhcyc+PC9jYW52YXM+XCIsXHJcblxyXG4gICAgICAgICAgICB0b29sYmFyOiB7XHJcbiAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgIHsgdHlwZTogXCJidXR0b25cIiwgaWQ6IFwicGF1c2VcIiwgY2FwdGlvbjogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIpLm91dGVySFRNTCwgc3RyaW5nSWQ6IDIgfSxcclxuICAgICAgICAgICAgICAgIHsgdHlwZTogJ2JyZWFrJywgaWQ6ICdicmVhazEnIH0sXHJcbiAgICAgICAgICAgICAgICB7IHR5cGU6IFwiYnV0dG9uXCIsIGlkOiBcImNvbGxpc2lvbnNcIiwgY2FwdGlvbjogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDEpLm91dGVySFRNTH0sXHJcbiAgICAgICAgICAgICAgICB7IHR5cGU6ICdicmVhaycsIGlkOiAnYnJlYWsyJyB9LFxyXG4gICAgICAgICAgICAgICAgeyB0eXBlOiBcInJhZGlvXCIsIGdyb3VwOiAxLCBpZDogXCJzZWxlY3Rpb25cIiwgY2hlY2tlZDogdHJ1ZSwgY2FwdGlvbjogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE3KS5vdXRlckhUTUx9LFxyXG4gICAgICAgICAgICAgICAgeyB0eXBlOiBcInJhZGlvXCIsIGdyb3VwOiAxLCBpZDogXCJyZWN0YW5nbGVcIiwgY2FwdGlvbjogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE4KS5vdXRlckhUTUx9LFxyXG4gICAgICAgICAgICAgICAgeyB0eXBlOiBcInJhZGlvXCIsIGdyb3VwOiAxLCBpZDogXCJjaXJjbGVcIiwgY2FwdGlvbjogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE5KS5vdXRlckhUTUx9LFxyXG4gICAgICAgICAgICAgICAgeyB0eXBlOiBcInNwYWNlclwiIH0sXHJcbiAgICAgICAgICAgICAgICB7IHR5cGU6IFwibWVudVwiLCBpZDogXCJsYW5ndWFnZVwiLCBjYXB0aW9uOiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMCkub3V0ZXJIVE1MLCBpdGVtczogbGFuZ3VhZ2VzfVxyXG4gICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgX2VuZ2luZS5zZWxlY3RFbnRpdHkobnVsbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChlLnRhcmdldClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgY2FzZSBcInBhdXNlXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgX2VuZ2luZS50b2dnbGVQYXVzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIFVJLmJ1aWxkU2lkZWJhcihudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB3MnVpLmVkaXRvckxheW91dC50b2dnbGUoXCJyaWdodFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldChcInBhdXNlXCIpLnN0cmluZ0lkID0gX2VuZ2luZS53b3JsZC5wYXVzZWQgPyAyIDogMztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldChcInBhdXNlXCIpLmNhcHRpb24gPSBcIjxzcGFuIHN0cmluZ0lkPSdcIisgdGhpcy5nZXQoXCJwYXVzZVwiKS5zdHJpbmdJZCArXCInPlwiK1xyXG4gICAgICAgICAgICAgICAgICAgICAgVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWQodGhpcy5nZXQoXCJwYXVzZVwiKS5zdHJpbmdJZClcclxuICAgICAgICAgICAgICAgICAgICArXCI8L3NwYW4+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKF9lbmdpbmUud29ybGQucGF1c2VkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmFibGUoXCJjb2xsaXNpb25zXCIsIFwic2VsZWN0aW9uXCIsIFwicmVjdGFuZ2xlXCIsIFwiY2lyY2xlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzYWJsZShcImNvbGxpc2lvbnNcIiwgXCJzZWxlY3Rpb25cIiwgXCJyZWN0YW5nbGVcIiwgXCJjaXJjbGVcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIFRyYW5zbGF0aW9ucy5yZWZyZXNoKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgY2FzZSBcImNvbGxpc2lvbnNcIjpcclxuICAgICAgICAgICAgICAgICAgICBVSS5wb3B1cChVSS5jcmVhdGVDb2xsaXNpb25zKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgY2FzZSBcInNlbGVjdGlvblwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5JbnB1dC50b29sID0gVG9vbHMuU2VsZWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgY2FzZSBcInJlY3RhbmdsZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5JbnB1dC50b29sID0gVG9vbHMuUmVjdGFuZ2xlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgY2FzZSBcImNpcmNsZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5JbnB1dC50b29sID0gVG9vbHMuQ2lyY2xlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC5zdGFydHNXaXRoKFwibGFuZ3VhZ2U6XCIpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBUcmFuc2xhdGlvbnMuc2V0TGFuZ3VhZ2UoZS5zdWJJdGVtLmlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwicmlnaHRcIixcclxuICAgICAgICAgICAgc2l6ZTogMjUwLFxyXG4gICAgICAgICAgICByZXNpemFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIHN0eWxlOiBcInBhZGRpbmc6IDFlbTtcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICAgIG9uUmVzaXplOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgaWYodHlwZW9mIChfZW5naW5lKSA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICBlLm9uQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF9lbmdpbmUudmlld3BvcnQuYXV0b1Jlc2l6ZSgpO1xyXG4gICAgICAgICAgICBfZW5naW5lLnZpZXdwb3J0LnJlc2V0RWxlbWVudCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25DbGljazogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgIGFsZXJ0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIFRyYW5zbGF0aW9ucy5yZWZyZXNoKCk7XHJcbiAgfSxcclxuXHJcbiAgLy8gQ3JlYXRpbmcgYSBwb3B1cCBtZXNzYWdlXHJcbiAgcG9wdXA6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8qdzJwb3B1cC5vcGVuKFxyXG4gICAgICB7XHJcbiAgICAgICAgYm9keTogXCI8ZGl2IGNsYXNzPSd3MnVpLWNlbnRlcmVkJz5cIisgZGF0YS5vdXRlckhUTUwgK1wiPC9kaXY+XCIsXHJcbiAgICAgICAgd2lkdGg6IFwiNzAwXCIsXHJcbiAgICAgICAgaGVpZ2h0OiBcIjcwMFwiLFxyXG4gICAgICAgIHNwZWVkOiAwLjE1XHJcbiAgICAgIH1cclxuICAgICk7Ki9cclxuICAgIHZhciBvdmVybGF5ID0gZWwoXCJkaXYjcG9wdXBPdmVybGF5XCIsIFtlbChcImRpdiNwb3B1cENvbnRlbnRcIiwgW2VsKFwiZGl2LncydWktY2VudGVyZWRcIiwgW2RhdGFdKV0pXSk7XHJcbiAgICBvdmVybGF5Lm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIFVJLmNsb3NlUG9wdXAoZSlcclxuICAgIH07XHJcblxyXG4gICAgZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUob3ZlcmxheSwgZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcclxuXHJcbiAgICBUcmFuc2xhdGlvbnMucmVmcmVzaCgpO1xyXG4gIH0sXHJcblxyXG4gIC8vIENsb3NpbmcgYSBwb3B1cCBtZXNzYWdlXHJcbiAgY2xvc2VQb3B1cDogZnVuY3Rpb24oZSkge1xyXG4gICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBvcHVwT3ZlcmxheVwiKTtcclxuICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3B1cENvbnRlbnRcIik7XHJcblxyXG4gICAgLy8gTWFrZSBzdXJlIGl0IHdhcyB0aGUgb3ZlcmxheSB0aGF0IHdhcyBjbGlja2VkLCBub3QgYW4gZWxlbWVudCBhYm92ZSBpdFxyXG4gICAgaWYgKHR5cGVvZiBlICE9PSBcInVuZGVmaW5lZFwiICYmIGUudGFyZ2V0ICE9PSBvdmVybGF5KVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICBjb250ZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY29udGVudCk7XHJcbiAgICBvdmVybGF5LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3ZlcmxheSk7XHJcbiAgfSxcclxuXHJcbiAgLy8gQnVpbGRpbmcgdGhlIGNvbGxpc2lvbiBncm91cCB0YWJsZVxyXG4gIGNyZWF0ZUNvbGxpc2lvbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRhYmxlID0gZWwoXCJ0YWJsZS5jb2xsaXNpb25UYWJsZVwiKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9lbmdpbmUuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgKyAxOyBpKyspIHtcclxuICAgICAgdmFyIHRyID0gZWwoXCJ0clwiKTtcclxuXHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX2VuZ2luZS5DT0xMSVNJT05fR1JPVVBTX05VTUJFUiArIDE7IGorKykge1xyXG4gICAgICAgIHZhciB0ZCA9IGVsKFwidGRcIik7XHJcblxyXG4gICAgICAgIC8vIGZpcnN0IHJvd1xyXG4gICAgICAgIGlmIChpID09PSAwICYmIGogPiAwKSB7XHJcbiAgICAgICAgICB0ZC5pbm5lckhUTUwgPSBcIjxkaXY+PHNwYW4+XCIgKyBfZW5naW5lLmNvbGxpc2lvbkdyb3Vwc1tqIC0gMV0ubmFtZSArIFwiPC9zcGFuPjwvZGl2PlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZmlyc3QgY29sdW1uXHJcbiAgICAgICAgZWxzZSBpZiAoaiA9PT0gMCAmJiBpICE9PSAwKVxyXG4gICAgICAgICAgdGQuaW5uZXJIVE1MID0gX2VuZ2luZS5jb2xsaXNpb25Hcm91cHNbaSAtIDFdLm5hbWU7XHJcblxyXG4gICAgICAgIC8vIHJlbGV2YW50IHRyaWFuZ2xlXHJcbiAgICAgICAgZWxzZSBpZiAoaSA8PSBqICYmIGogIT09IDAgJiYgaSAhPT0gMCkge1xyXG4gICAgICAgICAgdGQucm93ID0gaTtcclxuICAgICAgICAgIHRkLmNvbCA9IGo7XHJcblxyXG4gICAgICAgICAgLy8gaGlnaGxpZ2h0aW5nXHJcbiAgICAgICAgICB0ZC5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKGksIGosIHRhYmxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICB2YXIgdGRzID0gdGFibGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0ZFwiKTtcclxuICAgICAgICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IHRkcy5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgICAgICAgICAgdGRzW25dLmNsYXNzTmFtZSA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gb25seSBoaWdobGlnaHQgdXAgdG8gdGhlIHJlbGV2YW50IGNlbGxcclxuICAgICAgICAgICAgICAgIGlmICgodGRzW25dLnJvdyA9PT0gaSAmJiB0ZHNbbl0uY29sIDw9IGopIHx8ICh0ZHNbbl0uY29sID09PSBqICYmIHRkc1tuXS5yb3cgPD0gaSkpXHJcbiAgICAgICAgICAgICAgICAgIHRkc1tuXS5jbGFzc05hbWUgPSBcImhpZ2hsaWdodFwiO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfShpLCBqLCB0YWJsZSk7XHJcblxyXG4gICAgICAgICAgLy8gbW9yZSBoaWdobGlnaHRpbmdcclxuICAgICAgICAgIHRkLm9ubW91c2VvdXQgPSBmdW5jdGlvbih0YWJsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHRkcyA9IHRhYmxlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGRcIik7XHJcbiAgICAgICAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCB0ZHMubGVuZ3RoOyBuKyspIHtcclxuICAgICAgICAgICAgICAgIHRkc1tuXS5jbGFzc05hbWUgPSBcIlwiO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSh0YWJsZSk7XHJcblxyXG4gICAgICAgICAgLy8gY2hlY2tib3ggZm9yIGNvbGxpc2lvbiB0b2dnbGluZ1xyXG4gICAgICAgICAgdmFyIGNoZWNrYm94ID0gZWwoXCJpbnB1dFwiLCB7dHlwZTogXCJjaGVja2JveFwifSk7XHJcblxyXG4gICAgICAgICAgaWYgKF9lbmdpbmUuZ2V0Q29sbGlzaW9uKGkgLSAxLCBqIC0gMSkpXHJcbiAgICAgICAgICAgIGNoZWNrYm94LnNldEF0dHJpYnV0ZShcImNoZWNrZWRcIiwgXCJjaGVja2VkXCIpO1xyXG5cclxuICAgICAgICAgIGNoZWNrYm94Lm9uY2hhbmdlID0gZnVuY3Rpb24oaSwgaiwgY2hlY2tib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIF9lbmdpbmUuc2V0Q29sbGlzaW9uKGkgLSAxLCBqIC0gMSwgY2hlY2tib3guY2hlY2tlZCA/IDEgOiAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfShpLCBqLCBjaGVja2JveCk7XHJcblxyXG4gICAgICAgICAgLy8gY2xpY2tpbmcgdGhlIGNoZWNrYm94J3MgY2VsbCBzaG91bGQgd29yayBhcyB3ZWxsXHJcbiAgICAgICAgICB0ZC5vbmNsaWNrID0gZnVuY3Rpb24oY2hlY2tib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICBpZiAoZS50YXJnZXQgPT09IGNoZWNrYm94KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSAhY2hlY2tib3guY2hlY2tlZDtcclxuICAgICAgICAgICAgICBjaGVja2JveC5vbmNoYW5nZSgpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfShjaGVja2JveCk7XHJcblxyXG4gICAgICAgICAgdGQuYXBwZW5kQ2hpbGQoY2hlY2tib3gpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZml4IGZvciBhbHNvIGhpZ2hsaWdodGluZyBjZWxscyB3aXRob3V0IGNoZWNrYm94ZXNcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRkLnJvdyA9IGk7XHJcbiAgICAgICAgICB0ZC5jb2wgPSBqO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHIuYXBwZW5kQ2hpbGQodGQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0YWJsZS5hcHBlbmRDaGlsZCh0cik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhYmxlO1xyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZUJlaGF2aW9yOiBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgICByZXR1cm4gXCJUT0RPXCI7XHJcblxyXG4gICAgdmFyIGxvZ2ljID0gZWwoXCJ0ZXh0YXJlYVwiKTtcclxuICAgIGxvZ2ljLmlubmVySFRNTCA9IGVudGl0eS5iZWhhdmlvcnNbMF0udG9TdHJpbmcoKTtcclxuXHJcbiAgICByZXR1cm4gZWwoXCJkaXZcIiwgW1xyXG4gICAgICBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoNSksIGVsKFwiYnJcIiksXHJcbiAgICAgIGxvZ2ljLFxyXG4gICAgICBlbC5wKCksXHJcbiAgICAgIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg2KSwgZWwoXCJiclwiKSxcclxuXHJcbiAgICBdKTtcclxuICB9LFxyXG5cclxuICBidWlsZFNpZGViYXI6IGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICAgIHZhciBzaWRlYmFyID0gdzJ1aS5lZGl0b3JMYXlvdXQuZ2V0KFwicmlnaHRcIik7XHJcblxyXG4gICAgc2lkZWJhci5jb250ZW50ID0gXCJcIjtcclxuXHJcbiAgICBpZiAoZW50aXR5ID09PSBudWxsKSB7XHJcbiAgICAgIHcydWkuZWRpdG9yTGF5b3V0LnJlZnJlc2goXCJyaWdodFwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB2YXIgaWQgPSBlbC5pbnB1dCh7dHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBlbnRpdHkuaWR9KTtcclxuICAgIGlkLm9uaW5wdXQgPSBmdW5jdGlvbiAoKVxyXG4gICAge1xyXG4gICAgICBfZW5naW5lLmNoYW5nZUlkKGVudGl0eSwgdGhpcy52YWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBjb2xsaXNpb25Hcm91cCA9IGVsLmlucHV0KHt0eXBlOiBcIm51bWJlclwiLCBtaW46IDEsIG1heDogMTYsIHZhbHVlOiBlbnRpdHkuY29sbGlzaW9uR3JvdXAgKyAxfSk7XHJcbiAgICBjb2xsaXNpb25Hcm91cC5vbmNoYW5nZSA9IGZ1bmN0aW9uIChlKVxyXG4gICAge1xyXG4gICAgICBlbnRpdHkuc2V0Q29sbGlzaW9uR3JvdXAodGhpcy52YWx1ZSAqIDEgLSAxKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHggPSBlbC5pbnB1dCh7dHlwZTogXCJudW1iZXJcIiwgdmFsdWU6IGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3goKX0pO1xyXG4gICAgeC5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpXHJcbiAgICB7XHJcbiAgICAgIGVudGl0eS5ib2R5LlNldFRyYW5zZm9ybShuZXcgYjJWZWMyKHRoaXMudmFsdWUgKiAxLCBlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF95KCkpLCBlbnRpdHkuYm9keS5HZXRBbmdsZSgpKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHkgPSBlbC5pbnB1dCh7dHlwZTogXCJudW1iZXJcIiwgdmFsdWU6IGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3koKX0pO1xyXG4gICAgeS5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpXHJcbiAgICB7XHJcbiAgICAgIGVudGl0eS5ib2R5LlNldFRyYW5zZm9ybShuZXcgYjJWZWMyKGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3goKSwgdGhpcy52YWx1ZSAqIDEpLCBlbnRpdHkuYm9keS5HZXRBbmdsZSgpKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHJvdGF0aW9uID0gZWwuaW5wdXQoe3R5cGU6IFwibnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuYm9keS5HZXRBbmdsZSgpICogMTgwIC8gTWF0aC5QSX0pO1xyXG4gICAgcm90YXRpb24ub25jaGFuZ2UgPSBmdW5jdGlvbiAoKVxyXG4gICAge1xyXG4gICAgICBlbnRpdHkuYm9keS5TZXRUcmFuc2Zvcm0oZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKSwgKHRoaXMudmFsdWUgKiAxKSAqIE1hdGguUEkgLyAxODApO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgZml4ZWRSb3RhdGlvbiA9IGVsLmlucHV0KHt0eXBlOiBcImNoZWNrYm94XCJ9KTtcclxuICAgIGZpeGVkUm90YXRpb24uY2hlY2tlZCA9IGVudGl0eS5maXhlZFJvdGF0aW9uO1xyXG4gICAgZml4ZWRSb3RhdGlvbi5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpXHJcbiAgICB7XHJcbiAgICAgIGVudGl0eS5kaXNhYmxlUm90YXRpb24odGhpcy5jaGVja2VkKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGNvbG9yID0gZWwuaW5wdXQoe3R5cGU6IFwiY29sb3JcIiwgdmFsdWU6IGVudGl0eS5jb2xvcn0pO1xyXG4gICAgY29sb3Iub25jaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGVudGl0eS5jb2xvciA9IHRoaXMudmFsdWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBjaGFuZ2VCZWhhdmlvciA9IGVsKFwiYnV0dG9uXCIsIFtUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoNCldKTtcclxuICAgIGNoYW5nZUJlaGF2aW9yLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIFVJLnBvcHVwKFVJLmNyZWF0ZUJlaGF2aW9yKGVudGl0eSkpO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgdmFyIGJvZHlUeXBlID0gZWwoXCJzZWxlY3RcIiwge30sIFtcclxuICAgICAgZWwoXCJvcHRpb25cIiwge3ZhbHVlOiBCb2R5VHlwZS5EWU5BTUlDX0JPRFl9LCBbVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE1KV0pLFxyXG4gICAgICBlbChcIm9wdGlvblwiLCB7dmFsdWU6IEJvZHlUeXBlLktJTkVNQVRJQ19CT0RZfSwgW1RyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxNildKSxcclxuICAgIF0pO1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJvZHlUeXBlLm9wdGlvbnMubGVuZ3RoOyBpICsrKVxyXG4gICAge1xyXG4gICAgICBpZigoYm9keVR5cGUub3B0aW9uc1tpXS52YWx1ZSAqIDEpID09PSBlbnRpdHkuYm9keS5HZXRUeXBlKCkpIHtcclxuICAgICAgICBib2R5VHlwZS5vcHRpb25zW2ldLnNlbGVjdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGJvZHlUeXBlLm9uY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBlbnRpdHkuYm9keS5TZXRUeXBlKHRoaXMudmFsdWUgKiAxKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIHZhciBjb250ZW50ID0gZWwuZGl2KHt9LCBbXHJcbiAgICAgIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg3KSxcclxuICAgICAgZWwoXCJiclwiKSwgaWQsIGVsKFwicFwiKSxcclxuICAgICAgVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDgpLFxyXG4gICAgICBlbChcImJyXCIpLCBjb2xsaXNpb25Hcm91cCwgZWwoXCJwXCIpLFxyXG4gICAgICBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoOSksXHJcbiAgICAgIGVsKFwiYnJcIiksIHgsIGVsKFwicFwiKSxcclxuICAgICAgVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDEwKSxcclxuICAgICAgZWwoXCJiclwiKSwgeSwgZWwoXCJwXCIpLFxyXG4gICAgICBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTEpLFxyXG4gICAgICBlbChcImJyXCIpLCByb3RhdGlvbiwgZWwoXCJwXCIpLFxyXG4gICAgICBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTIpLFxyXG4gICAgICBlbChcImJyXCIpLCBmaXhlZFJvdGF0aW9uLCBlbChcInBcIiksXHJcbiAgICAgIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxMyksXHJcbiAgICAgIGVsKFwiYnJcIiksIGNvbG9yLCBlbChcInBcIiksXHJcbiAgICAgIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxNCksXHJcbiAgICAgIGVsKFwiYnJcIiksIGJvZHlUeXBlLCBlbChcInBcIiksXHJcbiAgICAgIC8qZWwoXCJiclwiKSwgY2hhbmdlQmVoYXZpb3IsIGVsKFwicFwiKSovXHJcbiAgICBdKTtcclxuXHJcbiAgICB3MnVpLmVkaXRvckxheW91dC5jb250ZW50KFwicmlnaHRcIiwgY29udGVudCk7XHJcblxyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUk7IiwiLy8gT2JqZWN0IGNvbnRhaW5pbmcgdXNlZnVsIG1ldGhvZHNcclxudmFyIFV0aWxzID0ge1xyXG4gIGdldEJyb3dzZXJXaWR0aDogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJChcIiNsYXlvdXRfZWRpdG9yTGF5b3V0X3BhbmVsX21haW4gLncydWktcGFuZWwtY29udGVudFwiKS5vdXRlcldpZHRoKCkgLSAyMDsvL3dpbmRvdy5pbm5lcldpZHRoO1xyXG4gIH0sXHJcblxyXG4gIGdldEJyb3dzZXJIZWlnaHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICQoXCIjbGF5b3V0X2VkaXRvckxheW91dF9wYW5lbF9tYWluIC53MnVpLXBhbmVsLWNvbnRlbnRcIikub3V0ZXJIZWlnaHQoKSAtIDIwOy8vd2luZG93LmlubmVySGVpZ2h0O1xyXG4gIH0sXHJcblxyXG4gIHJhbmRvbVJhbmdlOiBmdW5jdGlvbihtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluKTtcclxuICB9LFxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxzOyIsInZhciBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzLmpzXCIpO1xyXG5cclxuLy8gVklFV1BPUlRcclxuLy8gVGhpcyBpcyBiYXNpY2FsbHkgY2FtZXJhICsgcHJvamVjdG9yXHJcblxyXG52YXIgVmlld3BvcnQgPSBmdW5jdGlvbihjYW52YXNFbGVtZW50LCB3aWR0aCwgaGVpZ2h0LCB4LCB5KSB7XHJcbiAgLy8gQ2FudmFzIGRpbWVuc2lvbnNcclxuICBpZiAod2lkdGggIT0gdW5kZWZpbmVkICYmIGhlaWdodCAhPSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMuc2V0QXV0b1Jlc2l6ZShmYWxzZSk7XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5zZXRBdXRvUmVzaXplKHRydWUpO1xyXG4gICAgdGhpcy5hdXRvUmVzaXplKCk7XHJcbiAgfVxyXG5cclxuICAvLyBDZW50ZXIgcG9pbnQgb2YgdGhlIGNhbWVyYVxyXG4gIGlmICh4ICE9PSB1bmRlZmluZWQgJiYgeSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy54ID0gTWF0aC5mbG9vcih0aGlzLndpZHRoIC8gMik7XHJcbiAgICB0aGlzLnkgPSBNYXRoLmZsb29yKHRoaXMuaGVpZ2h0IC8gMik7XHJcbiAgfVxyXG5cclxuICAvLyBDYW52YXMgZWxlbWVudFxyXG4gIHRoaXMuY2FudmFzRWxlbWVudCA9IGNhbnZhc0VsZW1lbnQ7XHJcblxyXG4gIGlmIChjYW52YXNFbGVtZW50ID09PSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMuY2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzRWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICB0aGlzLnJlc2V0RWxlbWVudCgpOyAvLyBSZXNpemUgdG8gbmV3IGRpbWVuc2lvbnNcclxuXHJcbiAgdGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXNFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcclxufTtcclxuXHJcbi8vIFJlbG9hZHMgdmFsdWVzIGZvciB0aGUgY2FudmFzIGVsZW1lbnRcclxuVmlld3BvcnQucHJvdG90eXBlLnJlc2V0RWxlbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuY2FudmFzRWxlbWVudC53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgdGhpcy5jYW52YXNFbGVtZW50LmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG59XHJcblxyXG4vLyBBdXRvbWF0aWNhbGx5IHJlc2l6ZXMgdGhlIHZpZXdwb3J0IHRvIGZpbGwgdGhlIHNjcmVlblxyXG5WaWV3cG9ydC5wcm90b3R5cGUuYXV0b1Jlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMud2lkdGggPSBVdGlscy5nZXRCcm93c2VyV2lkdGgoKTtcclxuICB0aGlzLmhlaWdodCA9IFV0aWxzLmdldEJyb3dzZXJIZWlnaHQoKTtcclxuICB0aGlzLnggPSBNYXRoLmZsb29yKHRoaXMud2lkdGggLyAyKTtcclxuICB0aGlzLnkgPSBNYXRoLmZsb29yKHRoaXMuaGVpZ2h0IC8gMik7XHJcbn07XHJcblxyXG4vLyBUb2dnbGVzIHZpZXdwb3J0IGF1dG8gcmVzaXppbmdcclxuVmlld3BvcnQucHJvdG90eXBlLnNldEF1dG9SZXNpemUgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cclxuICB0aGlzLmF1dG9SZXNpemVBY3RpdmUgPSB2YWx1ZTtcclxuXHJcbiAgaWYgKHRoaXMuYXV0b1Jlc2l6ZUFjdGl2ZSkge1xyXG4gICAgdmFyIHQgPSB0aGlzO1xyXG4gICAgd2luZG93Lm9ucmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHQuYXV0b1Jlc2l6ZSgpO1xyXG4gICAgICB0LnJlc2V0RWxlbWVudCgpO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICB3aW5kb3cub25yZXNpemUgPSBudWxsO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVmlld3BvcnQ7Il19
