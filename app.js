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
  Action.call(this, "applyLinearImpulse", arguments, [Type.ENTITYFILTER, Type.NUMBER, Type.NUMBER]);

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


},{"./token.js":13,"./typing.js":16}],2:[function(require,module,exports){
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
},{"./typing.js":16}],3:[function(require,module,exports){
var FixType = require("./typing.js").FixType;

var BehaviorBuilder = function (tokenManager) {
  this.tokenManager = tokenManager;
};

BehaviorBuilder.prototype.initialize = function (type, container) {
  var holder = el("span");
  var btn = el("span.ui.button", {}, ["+"]);

  var that = this;
  btn.onclick = function (e) {
    e.stopPropagation();

    that.buildChoice(that.tokenManager.getTokensByType(type), holder);
  };

  holder.appendChild(btn);
  $(container).html(holder);
};

BehaviorBuilder.prototype.buildChoice = function (tokens, holder) {
  var container = el("div#tokenChoice");
  var that = this;

  tokens.forEach(function (token) {
    var text = el("div.token", {}, [el("span.name", {}, [token.name])]);

    if (token.fixType === FixType.PREFIX && token.argument_types.length)
      text.appendChild(el("span.argument", {}, ["( ", token.argument_types.join(", "), " )"]));

    if (token.fixType === FixType.INFIX) {
      text.insertBefore(el("span.argument", {}, ["( ", token.argument_types[0], " )"]), text.firstChild);
      text.appendChild(el("span.argument", {}, ["( ", token.argument_types[1], " )"]));
    }

    $(text).on("click", function (e) {
      var ret = el("span", {}, [el("span.name", {}, [token.name])]);

      if (token.fixType === FixType.PREFIX && token.argument_types.length) {
        ret.appendChild(document.createTextNode("( "));

        token.argument_types.forEach(function (argument, index) {
          var argHolder = el("span");
          ret.appendChild(argHolder);

          that.initialize(argument, argHolder);

          if (index != token.argument_types.length - 1)
            ret.appendChild(document.createTextNode(", "));
        });

        ret.appendChild(document.createTextNode(" )"));
      }

      $(holder).html(ret);
    });

    container.appendChild(text);
  });

  document.body.appendChild(container);

  $(document).one("click", function(e) {
    container.parentNode.removeChild(container);
  });

  var offset = 15;

  $(container).css("left", Input.mouse.realX + offset + "px");
  $(container).css("top", Input.mouse.realY + offset + "px");
};

module.exports = BehaviorBuilder;

},{"./typing.js":16}],4:[function(require,module,exports){
var BodyType = {
  DYNAMIC_BODY: Module.b2_dynamicBody,
  STATIC_BODY: Module.b2_staticBody,
  KINEMATIC_BODY: Module.b2_kinematicBody
};

module.exports = BodyType;
},{}],5:[function(require,module,exports){
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
},{"./tokenmanager.js":14,"./tools.js":15,"./ui.js":17}],6:[function(require,module,exports){
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
},{"./utils.js":19}],7:[function(require,module,exports){
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
},{"./token.js":13,"./typing.js":16}],8:[function(require,module,exports){
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





},{"./behavior.js":2,"./bodytype.js":4,"./engine.js":5,"./input.js":9,"./shapes.js":12,"./ui.js":17,"./viewport.js":20}],9:[function(require,module,exports){
// INPUT CAPTURING

var Tools = require("./tools.js");

window.Input = {
  tool: Tools.Selection,
  element: null,

  mouse: {
    x: 0,
    y: 0,
    realX: 0,
    realY: 0,
    leftDown: false,
    rightDown: false,
    leftUp: false,
    rightUp: false,

    updatePosition: function (event) {
      this.x = event.pageX - Input.element.getBoundingClientRect().left;
      this.y = event.pageY - Input.element.getBoundingClientRect().top;
      this.realX = event.pageX;
      this.realY = event.pageY;
    },

    updateButtonsDown: function (event) {
      if (event.which === 1)
        this.leftDown = true;

      if (event.which === 3)
        this.rightDown = true;

      if (event.target === Input.element) {
        Input.tool.onclick();
        event.preventDefault();
      }
    },

    updateButtonsUp: function (event) {
      if (event.target === Input.element)
        Input.tool.onrelease();

      if (event.which === 1) {
        this.leftDown = false;
        this.leftUp = true;
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
    this.element = element;

    document.onmousemove = function(e) {
      Input.mouse.updatePosition(e);
    };
    document.onmousedown = function(e) {
      Input.mouse.updateButtonsDown(e);
    };
    document.onmouseup = function(e) {
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


},{"./tools.js":15}],10:[function(require,module,exports){
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


var lTrue = function () {
  Logic.call(this, "true", Type.BOOLEAN, arguments, []);
};
lTrue.prototype = new Logic();

lTrue.prototype.evaluate = function () {
  return true;
};

lTrue.prototype.constructor = lTrue;
module.exports.push(lTrue);


var lFalse = function (value) {
  Logic.call(this, "false", Type.BOOLEAN, arguments, []);
};
lFalse.prototype = new Logic();

lFalse.prototype.evaluate = function () {
  return false;
};

lFalse.prototype.constructor = lFalse;
module.exports.push(lFalse);


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
},{"./token.js":13,"./typing.js":16}],11:[function(require,module,exports){
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
},{"./typing":16}],12:[function(require,module,exports){
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
},{"./entity.js":6}],13:[function(require,module,exports){
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
},{"./typing.js":16}],14:[function(require,module,exports){
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
},{"./actions.js":1,"./entityfilters.js":7,"./logic.js":10,"./parser.js":11}],15:[function(require,module,exports){
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
},{"./bodytype.js":4,"./shapes.js":12}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
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
      { type: "html", content: Translations.getTranslatedWrapped(17) },
      {
        type: "radio",

        id: "tool",
        elements: [
          {
            text: el.img({src: "./img/selection.png"}), checked: true, onclick: function () {
            Input.tool = Tools.Selection;
          }
          },
          {
            text: el.img({src: "./img/rectangle.png"}), onclick: function () {
            Input.tool = Tools.Rectangle;
          }
          },
          {
            text: el.img({src: "./img/circle.png"}), onclick: function () {
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
    var BehaviorBuilder = require("./behaviorbuilder.js");
    var Type = require("./typing.js").Type;

    var bbuilder = new BehaviorBuilder(_engine.tokenManager);

    var c = el("div");

    bbuilder.initialize(Type.BOOLEAN, c);

    return c;

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

      { type: "button", text: Translations.getTranslatedWrapped(4), onclick: function () {
        UIBuilder.popup(UI.createBehavior(entity));
      }},
      { type: "html", content: el("p")},

    ];

    sidebar[0].appendChild(UIBuilder.build(properties));
  }
};

module.exports = UI;
},{"./behaviorbuilder.js":3,"./bodytype.js":4,"./tools.js":15,"./typing.js":16,"./uibuilder.js":18}],18:[function(require,module,exports){
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

    var ret = el("input.ui.button", { type: "color", id: properties.id, value: properties.value });

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
},{}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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
},{"./utils.js":19}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1VzZXJzL0pha3ViIE1hdHXFoWthL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2FjdGlvbnMuanMiLCJqcy9iZWhhdmlvci5qcyIsImpzL2JlaGF2aW9yYnVpbGRlci5qcyIsImpzL2JvZHl0eXBlLmpzIiwianMvZW5naW5lLmpzIiwianMvZW50aXR5LmpzIiwianMvZW50aXR5ZmlsdGVycy5qcyIsImpzL2VudHJ5LmpzIiwianMvaW5wdXQuanMiLCJqcy9sb2dpYy5qcyIsImpzL3BhcnNlci5qcyIsImpzL3NoYXBlcy5qcyIsImpzL3Rva2VuLmpzIiwianMvdG9rZW5tYW5hZ2VyLmpzIiwianMvdG9vbHMuanMiLCJqcy90eXBpbmcuanMiLCJqcy91aS5qcyIsImpzL3VpYnVpbGRlci5qcyIsImpzL3V0aWxzLmpzIiwianMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDallBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQWN0aW9uID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuQWN0aW9uO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBbXTtcclxuXHJcbnZhciBhU2V0Q29sb3IgPSBmdW5jdGlvbihlZiwgY29sb3IpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcInNldENvbG9yXCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLlNUUklOR10pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goY29sb3IpO1xyXG59O1xyXG5hU2V0Q29sb3IucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYVNldENvbG9yLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LnNldENvbG9yKHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcclxufTtcclxuXHJcbmFTZXRDb2xvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhU2V0Q29sb3I7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goYVNldENvbG9yKTtcclxuXHJcblxyXG52YXIgYVRvcnF1ZSA9IGZ1bmN0aW9uKGVmLCBzdHJlbmd0aCkge1xyXG4gIEFjdGlvbi5jYWxsKHRoaXMsIFwiYXBwbHlUb3JxdWVcIiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaChzdHJlbmd0aCk7XHJcbn07XHJcbmFUb3JxdWUucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYVRvcnF1ZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5ib2R5LkFwcGx5VG9ycXVlKGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XHJcbn07XHJcblxyXG5hVG9ycXVlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFUb3JxdWU7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goYVRvcnF1ZSk7XHJcblxyXG5cclxudmFyIGFBbmd1bGFySW1wdWxzZSA9IGZ1bmN0aW9uKGVmLCBzdHJlbmd0aCkge1xyXG4gIEFjdGlvbi5jYWxsKHRoaXMsIFwiYXBwbHlBbmd1bGFySW1wdWxzZVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHN0cmVuZ3RoKTtcclxufTtcclxuYUFuZ3VsYXJJbXB1bHNlLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuXHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5ib2R5LkFwcGx5QW5ndWxhckltcHVsc2UoZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcclxufTtcclxuXHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhQW5ndWxhckltcHVsc2U7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goYUFuZ3VsYXJJbXB1bHNlKTtcclxuXHJcblxyXG52YXIgYUxpbmVhclZlbG9jaXR5ID0gZnVuY3Rpb24oZWYsIHgsIHkpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcInNldExpbmVhclZlbG9jaXR5XCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHgpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHkpO1xyXG59O1xyXG5hTGluZWFyVmVsb2NpdHkucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYUxpbmVhclZlbG9jaXR5LnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LnNldExpbmVhclZlbG9jaXR5KG5ldyBiMlZlYzIodGhpcy5hcmdzWzFdLmV2YWx1YXRlKCksIHRoaXMuYXJnc1syXS5ldmFsdWF0ZSgpKSk7XHJcbn07XHJcblxyXG5hTGluZWFyVmVsb2NpdHkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYUxpbmVhclZlbG9jaXR5O1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFMaW5lYXJWZWxvY2l0eSk7XHJcblxyXG5cclxudmFyIGFMaW5lYXJJbXB1bHNlID0gZnVuY3Rpb24oZWYsIHgsIHkpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5TGluZWFySW1wdWxzZVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaCh4KTtcclxuICB0aGlzLmFyZ3MucHVzaCh5KTtcclxufTtcclxuYUxpbmVhckltcHVsc2UucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYUxpbmVhckltcHVsc2UucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuYXBwbHlMaW5lYXJJbXB1bHNlKG5ldyBiMlZlYzIoZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpLCBlbnRpdHkuZ2V0TWFzcygpICogdGhpcy5hcmdzWzJdLmV2YWx1YXRlKCkpKTtcclxufTtcclxuXHJcbmFMaW5lYXJJbXB1bHNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFMaW5lYXJJbXB1bHNlO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFMaW5lYXJJbXB1bHNlKTtcclxuXHJcbiIsInZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XG5cbnZhciBCZWhhdmlvciA9IGZ1bmN0aW9uKGxvZ2ljLCByZXN1bHRzKSB7XG4gIHRoaXMubG9naWMgPSBsb2dpYztcblxuICBpZiAodGhpcy5sb2dpYy50eXBlICE9PSBUeXBlLkJPT0xFQU4pXG4gICAgdGhyb3cgbmV3IFR5cGVFeGNlcHRpb24oVHlwZS5CT09MRUFOLCB0aGlzLmxvZ2ljLnR5cGUsIHRoaXMpO1xuXG4gIHRoaXMucmVzdWx0cyA9IEFycmF5LmlzQXJyYXkocmVzdWx0cykgPyByZXN1bHRzIDogW3Jlc3VsdHNdO1xufTtcblxuQmVoYXZpb3IucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gIHJldHVybiB0aGlzLmxvZ2ljLmV2YWx1YXRlKGVudGl0eSk7XG59O1xuXG5CZWhhdmlvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIFwiQmVoYXZpb3IoXCIgKyB0aGlzLmxvZ2ljLnRvU3RyaW5nKCkgKyBcIiwgXCIgKyB0aGlzLnJlc3VsdHMudG9TdHJpbmcoKSArIFwiKVwiO1xufTtcblxuQmVoYXZpb3IucHJvdG90eXBlLnJlc3VsdCA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMucmVzdWx0c1tpXS5leGVjdXRlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQmVoYXZpb3I7IiwidmFyIEZpeFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuRml4VHlwZTtcclxuXHJcbnZhciBCZWhhdmlvckJ1aWxkZXIgPSBmdW5jdGlvbiAodG9rZW5NYW5hZ2VyKSB7XHJcbiAgdGhpcy50b2tlbk1hbmFnZXIgPSB0b2tlbk1hbmFnZXI7XHJcbn07XHJcblxyXG5CZWhhdmlvckJ1aWxkZXIucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAodHlwZSwgY29udGFpbmVyKSB7XHJcbiAgdmFyIGhvbGRlciA9IGVsKFwic3BhblwiKTtcclxuICB2YXIgYnRuID0gZWwoXCJzcGFuLnVpLmJ1dHRvblwiLCB7fSwgW1wiK1wiXSk7XHJcblxyXG4gIHZhciB0aGF0ID0gdGhpcztcclxuICBidG4ub25jbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIHRoYXQuYnVpbGRDaG9pY2UodGhhdC50b2tlbk1hbmFnZXIuZ2V0VG9rZW5zQnlUeXBlKHR5cGUpLCBob2xkZXIpO1xyXG4gIH07XHJcblxyXG4gIGhvbGRlci5hcHBlbmRDaGlsZChidG4pO1xyXG4gICQoY29udGFpbmVyKS5odG1sKGhvbGRlcik7XHJcbn07XHJcblxyXG5CZWhhdmlvckJ1aWxkZXIucHJvdG90eXBlLmJ1aWxkQ2hvaWNlID0gZnVuY3Rpb24gKHRva2VucywgaG9sZGVyKSB7XHJcbiAgdmFyIGNvbnRhaW5lciA9IGVsKFwiZGl2I3Rva2VuQ2hvaWNlXCIpO1xyXG4gIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgdG9rZW5zLmZvckVhY2goZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICB2YXIgdGV4dCA9IGVsKFwiZGl2LnRva2VuXCIsIHt9LCBbZWwoXCJzcGFuLm5hbWVcIiwge30sIFt0b2tlbi5uYW1lXSldKTtcclxuXHJcbiAgICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5QUkVGSVggJiYgdG9rZW4uYXJndW1lbnRfdHlwZXMubGVuZ3RoKVxyXG4gICAgICB0ZXh0LmFwcGVuZENoaWxkKGVsKFwic3Bhbi5hcmd1bWVudFwiLCB7fSwgW1wiKCBcIiwgdG9rZW4uYXJndW1lbnRfdHlwZXMuam9pbihcIiwgXCIpLCBcIiApXCJdKSk7XHJcblxyXG4gICAgaWYgKHRva2VuLmZpeFR5cGUgPT09IEZpeFR5cGUuSU5GSVgpIHtcclxuICAgICAgdGV4dC5pbnNlcnRCZWZvcmUoZWwoXCJzcGFuLmFyZ3VtZW50XCIsIHt9LCBbXCIoIFwiLCB0b2tlbi5hcmd1bWVudF90eXBlc1swXSwgXCIgKVwiXSksIHRleHQuZmlyc3RDaGlsZCk7XHJcbiAgICAgIHRleHQuYXBwZW5kQ2hpbGQoZWwoXCJzcGFuLmFyZ3VtZW50XCIsIHt9LCBbXCIoIFwiLCB0b2tlbi5hcmd1bWVudF90eXBlc1sxXSwgXCIgKVwiXSkpO1xyXG4gICAgfVxyXG5cclxuICAgICQodGV4dCkub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICB2YXIgcmV0ID0gZWwoXCJzcGFuXCIsIHt9LCBbZWwoXCJzcGFuLm5hbWVcIiwge30sIFt0b2tlbi5uYW1lXSldKTtcclxuXHJcbiAgICAgIGlmICh0b2tlbi5maXhUeXBlID09PSBGaXhUeXBlLlBSRUZJWCAmJiB0b2tlbi5hcmd1bWVudF90eXBlcy5sZW5ndGgpIHtcclxuICAgICAgICByZXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIoIFwiKSk7XHJcblxyXG4gICAgICAgIHRva2VuLmFyZ3VtZW50X3R5cGVzLmZvckVhY2goZnVuY3Rpb24gKGFyZ3VtZW50LCBpbmRleCkge1xyXG4gICAgICAgICAgdmFyIGFyZ0hvbGRlciA9IGVsKFwic3BhblwiKTtcclxuICAgICAgICAgIHJldC5hcHBlbmRDaGlsZChhcmdIb2xkZXIpO1xyXG5cclxuICAgICAgICAgIHRoYXQuaW5pdGlhbGl6ZShhcmd1bWVudCwgYXJnSG9sZGVyKTtcclxuXHJcbiAgICAgICAgICBpZiAoaW5kZXggIT0gdG9rZW4uYXJndW1lbnRfdHlwZXMubGVuZ3RoIC0gMSlcclxuICAgICAgICAgICAgcmV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiLCBcIikpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIgKVwiKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICQoaG9sZGVyKS5odG1sKHJldCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dCk7XHJcbiAgfSk7XHJcblxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcclxuXHJcbiAgJChkb2N1bWVudCkub25lKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgY29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY29udGFpbmVyKTtcclxuICB9KTtcclxuXHJcbiAgdmFyIG9mZnNldCA9IDE1O1xyXG5cclxuICAkKGNvbnRhaW5lcikuY3NzKFwibGVmdFwiLCBJbnB1dC5tb3VzZS5yZWFsWCArIG9mZnNldCArIFwicHhcIik7XHJcbiAgJChjb250YWluZXIpLmNzcyhcInRvcFwiLCBJbnB1dC5tb3VzZS5yZWFsWSArIG9mZnNldCArIFwicHhcIik7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJlaGF2aW9yQnVpbGRlcjtcclxuIiwidmFyIEJvZHlUeXBlID0ge1xyXG4gIERZTkFNSUNfQk9EWTogTW9kdWxlLmIyX2R5bmFtaWNCb2R5LFxyXG4gIFNUQVRJQ19CT0RZOiBNb2R1bGUuYjJfc3RhdGljQm9keSxcclxuICBLSU5FTUFUSUNfQk9EWTogTW9kdWxlLmIyX2tpbmVtYXRpY0JvZHlcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQm9keVR5cGU7IiwidmFyIFVJID0gcmVxdWlyZShcIi4vdWkuanNcIik7XHJcbnZhciBUb29scyA9IHJlcXVpcmUoXCIuL3Rvb2xzLmpzXCIpO1xyXG52YXIgVG9rZW5NYW5hZ2VyID0gcmVxdWlyZShcIi4vdG9rZW5tYW5hZ2VyLmpzXCIpO1xyXG5cclxuXHJcbmNvbnN0IEFVVE9fSURfUFJFRklYID0gXCJFTlRJVFlfTlVNQkVSX1wiO1xyXG5cclxuY29uc3QgRElTUExBWV9SQVRJTyA9IDIwO1xyXG5cclxuLyovIE15c2xpZW5reVxyXG5cclxubG9ja292YW5pZSBrYW1lcnkgbmEgb2JqZWt0XHJcbiAqIHByZWNob2R5XHJcbmFrbyBmdW5ndWplIGNlbGEga2FtZXJhP1xyXG5cclxuLyovXHJcblxyXG5cclxuLy8gRU5HSU5FXHJcblxyXG4vLyBjb25zdHJ1Y3RvclxyXG5cclxudmFyIEVuZ2luZSA9IGZ1bmN0aW9uKHZpZXdwb3J0LCBncmF2aXR5KSB7XHJcbiAgdGhpcy52aWV3cG9ydCA9IHZpZXdwb3J0O1xyXG4gIHRoaXMuc2VsZWN0ZWRFbnRpdHkgPSBudWxsO1xyXG4gIFxyXG4gIHRoaXMuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgPSAxNjtcclxuICB0aGlzLkxBWUVSU19OVU1CRVIgPSAxMDtcclxuXHJcbiAgdGhpcy5sYXllcnMgPSBuZXcgQXJyYXkodGhpcy5MQVlFUlNfTlVNQkVSKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuTEFZRVJTX05VTUJFUjsgaSsrKVxyXG4gIHtcclxuICAgIHRoaXMubGF5ZXJzW2ldID0gW107XHJcbiAgfVxyXG5cclxuICB0aGlzLmNvbGxpc2lvbkdyb3VwcyA9IFtdO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5DT0xMSVNJT05fR1JPVVBTX05VTUJFUjsgaSsrKSB7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3Vwcy5wdXNoKHtcclxuICAgICAgXCJuYW1lXCI6IGkgKyAxLFxyXG4gICAgICBcIm1hc2tcIjogcGFyc2VJbnQoQXJyYXkodGhpcy5DT0xMSVNJT05fR1JPVVBTX05VTUJFUiArIDEpLmpvaW4oXCIxXCIpLCAyKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB0aGlzLmxpZmV0aW1lRW50aXRpZXMgPSAwO1xyXG5cclxuICB0aGlzLndvcmxkID0gbmV3IGIyV29ybGQoZ3Jhdml0eSwgdHJ1ZSk7XHJcbiAgdGhpcy53b3JsZC5wYXVzZWQgPSB0cnVlO1xyXG5cclxuICB0aGlzLnRva2VuTWFuYWdlciA9IG5ldyBUb2tlbk1hbmFnZXIoKTtcclxuXHJcbiAgSW5wdXQuaW5pdGlhbGl6ZSh2aWV3cG9ydC5jYW52YXNFbGVtZW50KTtcclxufTtcclxuXHJcbi8vIENoYW5nZXMgcnVubmluZyBzdGF0ZSBvZiB0aGUgc2ltdWxhdGlvblxyXG5FbmdpbmUucHJvdG90eXBlLnRvZ2dsZVBhdXNlID0gZnVuY3Rpb24gKCkge1xyXG4gIHRoaXMud29ybGQucGF1c2VkID0gIXRoaXMud29ybGQucGF1c2VkO1xyXG4gIHRoaXMuc2VsZWN0ZWRFbnRpdHkgPSBudWxsO1xyXG5cclxuICBJbnB1dC50b29sID0gVG9vbHMuQmxhbms7XHJcblxyXG4gIGlmKHRoaXMud29ybGQucGF1c2VkKVxyXG4gICAgSW5wdXQudG9vbCA9IFRvb2xzLlNlbGVjdGlvbjtcclxufTtcclxuXHJcbkVuZ2luZS5wcm90b3R5cGUucmVtb3ZlRW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gIHRoaXMud29ybGQuRGVzdHJveUJvZHkoZW50aXR5LmJvZHkpO1xyXG4gIHRoaXMubGF5ZXJzW2VudGl0eS5sYXllcl0uc3BsaWNlKHRoaXMubGF5ZXJzW2VudGl0eS5sYXllcl0uaW5kZXhPZihlbnRpdHkpLCAxKTtcclxufTtcclxuXHJcbkVuZ2luZS5wcm90b3R5cGUuc2V0RW50aXR5TGF5ZXIgPSBmdW5jdGlvbiAoZW50aXR5LCBuZXdMYXllcikge1xyXG4gIC8vIFJlbW92ZSBmcm9tIG9sZCBsYXllclxyXG4gIHRoaXMubGF5ZXJzW2VudGl0eS5sYXllcl0uc3BsaWNlKHRoaXMubGF5ZXJzW2VudGl0eS5sYXllcl0uaW5kZXhPZihlbnRpdHkpLCAxKTtcclxuXHJcbiAgLy8gU2V0IG5ldyBsYXllclxyXG4gIGVudGl0eS5sYXllciA9IG5ld0xheWVyO1xyXG4gIHRoaXMubGF5ZXJzW25ld0xheWVyXS5wdXNoKGVudGl0eSk7XHJcbn07XHJcblxyXG4vLyBSZXR1cm5zIGFsbCBlbnRpdGllcyBpbiBvbmUgYXJyYXlcclxuRW5naW5lLnByb3RvdHlwZS5lbnRpdGllcyA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFtdLCB0aGlzLmxheWVycyk7XHJcbn07XHJcblxyXG5cclxuLy8gUmV0dXJucyB0aGUgZW50aXR5IHdpdGggaWQgc3BlY2lmaWVkIGJ5IGFyZ3VtZW50XHJcbkVuZ2luZS5wcm90b3R5cGUuZ2V0RW50aXR5QnlJZCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgdmFyIGVudGl0aWVzID0gdGhpcy5lbnRpdGllcygpO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoZW50aXRpZXNbaV0uaWQgPT09IGlkKVxyXG4gICAgICByZXR1cm4gZW50aXRpZXNbaV07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbi8vIFJldHVybnMgYW4gYXJyYXkgb2YgZW50aXRpZXMgd2l0aCBzcGVjaWZpZWQgY29sbGlzaW9uR3JvdXBcclxuRW5naW5lLnByb3RvdHlwZS5nZXRFbnRpdGllc0J5Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gIHZhciByZXQgPSBbXTtcclxuICB2YXIgZW50aXRpZXMgPSB0aGlzLmVudGl0aWVzKCk7XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChlbnRpdGllc1tpXS5jb2xsaXNpb25Hcm91cCA9PT0gZ3JvdXApXHJcbiAgICAgIHJldC5wdXNoKGVudGl0aWVzW2ldKTtcclxuICB9XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG4vLyBBZGRpbmcgYW4gZW50aXR5IHRvIHRoZSB3b3JsZFxyXG5FbmdpbmUucHJvdG90eXBlLmFkZEVudGl0eSA9IGZ1bmN0aW9uKGVudGl0eSwgdHlwZSkge1xyXG4gIC8vIGdlbmVyYXRlIGF1dG8gaWRcclxuICBpZiAoZW50aXR5LmlkID09PSB1bmRlZmluZWQpIHtcclxuICAgIGVudGl0eS5pZCA9IEFVVE9fSURfUFJFRklYICsgdGhpcy5saWZldGltZUVudGl0aWVzO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5saWZldGltZUVudGl0aWVzKys7XHJcblxyXG4gIGVudGl0eS5ib2R5LnNldF90eXBlKHR5cGUpO1xyXG5cclxuICBlbnRpdHkuYm9keSA9IHRoaXMud29ybGQuQ3JlYXRlQm9keShlbnRpdHkuYm9keSk7XHJcbiAgZW50aXR5LmZpeHR1cmUgPSBlbnRpdHkuYm9keS5DcmVhdGVGaXh0dXJlKGVudGl0eS5maXh0dXJlKTtcclxuXHJcbiAgdGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5wdXNoKGVudGl0eSk7XHJcblxyXG4gIHJldHVybiBlbnRpdHk7XHJcbn07XHJcblxyXG4vLyBDaGVja3Mgd2hldGhlciB0d28gZ3JvdXBzIHNob3VsZCBjb2xsaWRlXHJcbkVuZ2luZS5wcm90b3R5cGUuZ2V0Q29sbGlzaW9uID0gZnVuY3Rpb24oZ3JvdXBBLCBncm91cEIpIHtcclxuICByZXR1cm4gKHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayA+PiBncm91cEIpICYgMTtcclxufTtcclxuXHJcbi8vIFNldHMgdHdvIGdyb3VwcyB1cCB0byBjb2xsaWRlXHJcbkVuZ2luZS5wcm90b3R5cGUuc2V0Q29sbGlzaW9uID0gZnVuY3Rpb24oZ3JvdXBBLCBncm91cEIsIHZhbHVlKSB7XHJcbiAgdmFyIG1hc2tBID0gKDEgPDwgZ3JvdXBCKTtcclxuICB2YXIgbWFza0IgPSAoMSA8PCBncm91cEEpO1xyXG5cclxuICBpZiAodmFsdWUpIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayB8IG1hc2tBO1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrIHwgbWFza0I7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQV0ubWFzayAmIH5tYXNrQTtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQl0ubWFzayA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQl0ubWFzayAmIH5tYXNrQjtcclxuICB9XHJcbiAgdGhpcy51cGRhdGVDb2xsaXNpb25zKClcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbi8vIENoYW5nZXMgdGhlIElEIG9mIGFuIGVudGl0eVxyXG5FbmdpbmUucHJvdG90eXBlLmNoYW5nZUlkID0gZnVuY3Rpb24gKGVudGl0eSwgaWQpIHtcclxuICBlbnRpdHkuaWQgPSBpZDtcclxufTtcclxuXHJcbi8vIFNlbGVjdHMgYW4gZW50aXR5IGFuZCBzaG93cyBpdHMgcHJvcGVydGllcyBpbiB0aGUgc2lkZWJhclxyXG5FbmdpbmUucHJvdG90eXBlLnNlbGVjdEVudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICB0aGlzLnNlbGVjdGVkRW50aXR5ID0gZW50aXR5ID09PSBudWxsID8gbnVsbCA6IGVudGl0eTtcclxuICBVSS5idWlsZFNpZGViYXIodGhpcy5zZWxlY3RlZEVudGl0eSk7XHJcbn1cclxuXHJcbi8vIFVwZGF0ZXMgY29sbGlzaW9uIG1hc2tzIGZvciBhbGwgZW50aXRpZXMsIGJhc2VkIG9uIGVuZ2luZSdzIGNvbGxpc2lvbkdyb3VwcyB0YWJsZVxyXG5FbmdpbmUucHJvdG90eXBlLnVwZGF0ZUNvbGxpc2lvbnMgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgZW50aXRpZXMgPSB0aGlzLmVudGl0aWVzKCk7XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHRoaXMudXBkYXRlQ29sbGlzaW9uKGVudGl0aWVzW2ldKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy8gVXBkYXRlcyBjb2xsaXNpb24gbWFzayBmb3IgYW4gZW50aXR5LCBiYXNlZCBvbiBlbmdpbmUncyBjb2xsaXNpb25Hcm91cHMgdGFibGVcclxuRW5naW5lLnByb3RvdHlwZS51cGRhdGVDb2xsaXNpb24gPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICB2YXIgZmlsdGVyRGF0YSA9IGVudGl0eS5maXh0dXJlLkdldEZpbHRlckRhdGEoKTtcclxuICBmaWx0ZXJEYXRhLnNldF9tYXNrQml0cyh0aGlzLmNvbGxpc2lvbkdyb3Vwc1tlbnRpdHkuY29sbGlzaW9uR3JvdXBdLm1hc2spO1xyXG4gIGVudGl0eS5maXh0dXJlLlNldEZpbHRlckRhdGEoZmlsdGVyRGF0YSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG4vLyBPbmUgc2ltdWxhdGlvbiBzdGVwLiBTaW11bGF0aW9uIGxvZ2ljIGhhcHBlbnMgaGVyZS5cclxuRW5naW5lLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gRlBTIHRpbWVyXHJcbiAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgY3R4ID0gdGhpcy52aWV3cG9ydC5jb250ZXh0O1xyXG5cclxuICAvLyBjbGVhciBzY3JlZW5cclxuICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMudmlld3BvcnQud2lkdGgsIHRoaXMudmlld3BvcnQuaGVpZ2h0KTtcclxuXHJcbiAgY3R4LnNhdmUoKTtcclxuXHJcbiAgLy8gZHJhdyBhbGwgZW50aXRpZXNcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuTEFZRVJTX05VTUJFUjsgaSsrKVxyXG4gIHtcclxuICAgIHRoaXMuZHJhd0FycmF5KHRoaXMubGF5ZXJzW2ldLCBjdHgpO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFfZW5naW5lLndvcmxkLnBhdXNlZCkge1xyXG4gICAgLy8gYm94MmQgc2ltdWxhdGlvbiBzdGVwXHJcbiAgICB0aGlzLndvcmxkLlN0ZXAoMSAvIDYwLCAxMCwgNSk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgSW5wdXQudG9vbC5vbm1vdmUoY3R4KTtcclxuICB9XHJcbiAgXHJcblxyXG4gIC8vIFJlbGVhc2VkIGtleXMgYXJlIG9ubHkgdG8gYmUgcHJvY2Vzc2VkIG9uY2VcclxuICBJbnB1dC5tb3VzZS5jbGVhblVwKCk7XHJcbiAgSW5wdXQua2V5Ym9hcmQuY2xlYW5VcCgpO1xyXG5cclxuICB2YXIgZW5kID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgLy8gQ2FsbCBuZXh0IHN0ZXBcclxuICBzZXRUaW1lb3V0KHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgICBfZW5naW5lLnN0ZXAoKVxyXG4gIH0pLCBNYXRoLm1pbig2MCAtIGVuZCAtIHN0YXJ0LCAwKSk7XHJcbn07XHJcblxyXG5FbmdpbmUucHJvdG90eXBlLmRyYXdBcnJheSA9IGZ1bmN0aW9uKGFycmF5LCBjdHgpIHtcclxuICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHgudHJhbnNsYXRlKHRoaXMudmlld3BvcnQueCAtIHRoaXMudmlld3BvcnQud2lkdGggLyAyLCB0aGlzLnZpZXdwb3J0LnkgLSB0aGlzLnZpZXdwb3J0LmhlaWdodCAvIDIpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGFycmF5W2ldLmNvbG9yO1xyXG5cclxuICAgIGlmKHRoaXMuc2VsZWN0ZWRFbnRpdHkgPT09IGFycmF5W2ldKSB7XHJcbiAgICAgIGN0eC5zaGFkb3dDb2xvciA9IFwiYmxhY2tcIjtcclxuICAgICAgY3R4LnNoYWRvd0JsdXIgPSAxMDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgeCA9IGFycmF5W2ldLmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpO1xyXG4gICAgdmFyIHkgPSBhcnJheVtpXS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3koKTtcclxuICAgIGN0eC50cmFuc2xhdGUoeCwgeSk7XHJcbiAgICBjdHgucm90YXRlKGFycmF5W2ldLmJvZHkuR2V0QW5nbGUoKSk7XHJcblxyXG4gICAgYXJyYXlbaV0uZHJhdyhjdHgpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBhcnJheVtpXS5iZWhhdmlvcnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgdmFyIGJlaGF2aW9yID0gYXJyYXlbaV0uYmVoYXZpb3JzW2pdO1xyXG5cclxuICAgICAgaWYgKGJlaGF2aW9yLmNoZWNrKGFycmF5W2ldKSlcclxuICAgICAgICBiZWhhdmlvci5yZXN1bHQoKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmU7IiwiLy8gRU5USVRZXHJcbnZhciBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzLmpzXCIpO1xyXG5cclxuY29uc3QgQVVUT19DT0xPUl9SQU5HRSA9IFswLCAyMzBdO1xyXG5cclxudmFyIEVudGl0eSA9IGZ1bmN0aW9uKHNoYXBlLCBmaXh0dXJlLCBib2R5LCBpZCwgY29sbGlzaW9uR3JvdXApIHtcclxuICB0aGlzLmlkID0gaWQ7XHJcbiAgdGhpcy5kZWFkID0gZmFsc2U7XHJcbiAgdGhpcy5sYXllciA9IDA7XHJcblxyXG4gIHRoaXMuZml4ZWRSb3RhdGlvbiA9IGZhbHNlO1xyXG5cclxuICB0aGlzLmNvbGxpc2lvbkdyb3VwID0gY29sbGlzaW9uR3JvdXA7XHJcbiAgaWYgKHRoaXMuY29sbGlzaW9uR3JvdXAgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3VwID0gMDtcclxuICB9XHJcblxyXG4gIHRoaXMuYmVoYXZpb3JzID0gW107XHJcblxyXG4gIHRoaXMuZml4dHVyZSA9IGZpeHR1cmU7XHJcbiAgaWYgKHRoaXMuZml4dHVyZSA9PSB1bmRlZmluZWQpIHtcclxuICAgIHZhciBmaXh0dXJlID0gbmV3IGIyRml4dHVyZURlZigpO1xyXG4gICAgZml4dHVyZS5zZXRfZGVuc2l0eSgxMClcclxuICAgIGZpeHR1cmUuc2V0X2ZyaWN0aW9uKDAuNSk7XHJcbiAgICBmaXh0dXJlLnNldF9yZXN0aXR1dGlvbigwLjIpO1xyXG5cclxuICAgIHRoaXMuZml4dHVyZSA9IGZpeHR1cmU7XHJcbiAgfVxyXG4gIHRoaXMuZml4dHVyZS5zZXRfc2hhcGUoc2hhcGUpO1xyXG5cclxuICB2YXIgZmlsdGVyRGF0YSA9IHRoaXMuZml4dHVyZS5nZXRfZmlsdGVyKCk7XHJcbiAgZmlsdGVyRGF0YS5zZXRfY2F0ZWdvcnlCaXRzKDEgPDwgY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAvLyBDb25zdHJ1Y3RvciBpcyBjYWxsZWQgd2hlbiBpbmhlcml0aW5nLCBzbyB3ZSBuZWVkIHRvIGNoZWNrIGZvciBfZW5naW5lIGF2YWlsYWJpbGl0eVxyXG4gIGlmICh0eXBlb2YgX2VuZ2luZSAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBmaWx0ZXJEYXRhLnNldF9tYXNrQml0cyhfZW5naW5lLmNvbGxpc2lvbkdyb3Vwc1t0aGlzLmNvbGxpc2lvbkdyb3VwXS5tYXNrKTtcclxuXHJcbiAgdGhpcy5maXh0dXJlLnNldF9maWx0ZXIoZmlsdGVyRGF0YSk7XHJcblxyXG4gIHRoaXMuYm9keSA9IGJvZHk7XHJcbiAgaWYgKHRoaXMuYm9keSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgdGhpcy5ib2R5LnNldF9maXhlZFJvdGF0aW9uKGZhbHNlKTtcclxuXHJcbiAgLy8gQXV0byBnZW5lcmF0ZSBjb2xvclxyXG4gIHZhciByID0gVXRpbHMucmFuZG9tUmFuZ2UoQVVUT19DT0xPUl9SQU5HRVswXSwgQVVUT19DT0xPUl9SQU5HRVsxXSkudG9TdHJpbmcoMTYpOyByID0gci5sZW5ndGggPT0gMSA/IFwiMFwiICsgciA6IHI7XHJcbiAgdmFyIGcgPSBVdGlscy5yYW5kb21SYW5nZShBVVRPX0NPTE9SX1JBTkdFWzBdLCBBVVRPX0NPTE9SX1JBTkdFWzFdKS50b1N0cmluZygxNik7IGcgPSBnLmxlbmd0aCA9PSAxID8gXCIwXCIgKyBnIDogZztcclxuICB2YXIgYiA9IFV0aWxzLnJhbmRvbVJhbmdlKEFVVE9fQ09MT1JfUkFOR0VbMF0sIEFVVE9fQ09MT1JfUkFOR0VbMV0pLnRvU3RyaW5nKDE2KTsgYiA9IGIubGVuZ3RoID09IDEgPyBcIjBcIiArIGIgOiBiO1xyXG4gIHRoaXMuY29sb3IgPSBcIiNcIiArIHIgICsgZyArIGIgO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmRpZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuZGVhZCA9IHRydWU7XHJcblxyXG4gIFxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCkge1xyXG4gIGFsZXJ0KFwiRVJST1IhIENhbm5vdCBkcmF3IEVudGl0eTogVXNlIGRlcml2ZWQgY2xhc3Nlcy5cIik7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0Q29sb3IgPSBmdW5jdGlvbihjb2xvcikge1xyXG4gIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0SWQgPSBmdW5jdGlvbihpZCkge1xyXG4gIHRoaXMuaWQgPSBpZDtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnNldENvbGxpc2lvbkdyb3VwID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuICB0aGlzLmNvbGxpc2lvbkdyb3VwID0gZ3JvdXA7XHJcblxyXG4gIHZhciBmaWx0ZXJEYXRhID0gdGhpcy5maXh0dXJlLkdldEZpbHRlckRhdGEoKTtcclxuICBmaWx0ZXJEYXRhLnNldF9jYXRlZ29yeUJpdHMoMSA8PCBncm91cCk7XHJcbiAgdGhpcy5maXh0dXJlLlNldEZpbHRlckRhdGEoZmlsdGVyRGF0YSk7XHJcblxyXG4gIF9lbmdpbmUudXBkYXRlQ29sbGlzaW9uKHRoaXMpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRMaW5lYXJWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLmJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKTtcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRNYXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIE1hdGgubWF4KDEsIHRoaXMuYm9keS5HZXRNYXNzKCkpO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnNldExpbmVhclZlbG9jaXR5ID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgdGhpcy5ib2R5LlNldExpbmVhclZlbG9jaXR5KHZlY3Rvcik7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFwcGx5VG9ycXVlID0gZnVuY3Rpb24oZm9yY2UpIHtcclxuICB0aGlzLmJvZHkuQXBwbHlUb3JxdWUoZm9yY2UpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5hcHBseUxpbmVhckltcHVsc2UgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICB0aGlzLmJvZHkuQXBwbHlMaW5lYXJJbXB1bHNlKHZlY3RvciwgdGhpcy5ib2R5LkdldFdvcmxkQ2VudGVyKCkpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5kaXNhYmxlUm90YXRpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gIHRoaXMuZml4ZWRSb3RhdGlvbiA9IHZhbHVlO1xyXG4gIHRoaXMuYm9keS5TZXRGaXhlZFJvdGF0aW9uKHZhbHVlKVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5hZGRCZWhhdmlvciA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XHJcbiAgdGhpcy5iZWhhdmlvcnMucHVzaChiZWhhdmlvcik7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbnRpdHk7IiwidmFyIEVudGl0eUZpbHRlciA9IHJlcXVpcmUoXCIuL3Rva2VuLmpzXCIpLkVudGl0eUZpbHRlcjtcclxudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gW107XHJcblxyXG52YXIgZWZCeUlkID0gZnVuY3Rpb24oaWQpIHtcclxuICBFbnRpdHlGaWx0ZXIuY2FsbCh0aGlzLCBcImZpbHRlckJ5SWRcIiwgYXJndW1lbnRzLCBbVHlwZS5TVFJJTkddKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goaWQpO1xyXG59O1xyXG5lZkJ5SWQucHJvdG90eXBlID0gbmV3IEVudGl0eUZpbHRlcigpO1xyXG5cclxuZWZCeUlkLnByb3RvdHlwZS5kZWNpZGUgPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICByZXR1cm4gZW50aXR5LmlkID09PSB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKTtcclxufTtcclxuXHJcbmVmQnlJZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBlZkJ5SWQ7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goZWZCeUlkKTtcclxuXHJcblxyXG52YXIgZWZCeUNvbGxpc2lvbkdyb3VwID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuICBFbnRpdHlGaWx0ZXIuY2FsbCh0aGlzLCBcImZpbHRlckJ5R3JvdXBcIiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZ3JvdXApO1xyXG59O1xyXG5lZkJ5Q29sbGlzaW9uR3JvdXAucHJvdG90eXBlID0gbmV3IEVudGl0eUZpbHRlcigpO1xyXG5cclxuZWZCeUNvbGxpc2lvbkdyb3VwLnByb3RvdHlwZS5kZWNpZGUgPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICByZXR1cm4gZW50aXR5LmNvbGxpc2lvbkdyb3VwID09PSB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKTtcclxufTtcclxuXHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBlZkJ5Q29sbGlzaW9uR3JvdXA7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goZWZCeUNvbGxpc2lvbkdyb3VwKTtcclxuXHJcblxyXG52YXIgZWZCeUxheWVyID0gZnVuY3Rpb24obGF5ZXIpIHtcclxuICBFbnRpdHlGaWx0ZXIuY2FsbCh0aGlzLCBcImZpbHRlckJ5TGF5ZXJcIiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2gobGF5ZXIpO1xyXG59O1xyXG5lZkJ5TGF5ZXIucHJvdG90eXBlID0gbmV3IEVudGl0eUZpbHRlcigpO1xyXG5cclxuZWZCeUxheWVyLnByb3RvdHlwZS5kZWNpZGUgPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICByZXR1cm4gZW50aXR5LmxheWVyID09PSB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKTtcclxufTtcclxuXHJcbmVmQnlMYXllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBlZkJ5TGF5ZXI7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goZWZCeUxheWVyKTsiLCJyZXF1aXJlKFwiLi9pbnB1dC5qc1wiKTtcclxuXHJcbnZhciBFbmdpbmUgPSByZXF1aXJlKFwiLi9lbmdpbmUuanNcIik7XHJcbnZhciBWaWV3cG9ydCA9IHJlcXVpcmUoXCIuL3ZpZXdwb3J0LmpzXCIpO1xyXG52YXIgVUkgPSByZXF1aXJlKFwiLi91aS5qc1wiKTtcclxudmFyIEJvZHlUeXBlID0gcmVxdWlyZShcIi4vYm9keXR5cGUuanNcIik7XHJcbnZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xyXG5cclxudmFyIENpcmNsZSA9IHJlcXVpcmUoXCIuL3NoYXBlcy5qc1wiKS5DaXJjbGU7XHJcbnZhciBSZWN0YW5nbGUgPSByZXF1aXJlKFwiLi9zaGFwZXMuanNcIikuUmVjdGFuZ2xlO1xyXG5cclxuVUkuaW5pdGlhbGl6ZSgpO1xyXG5cclxuX2VuZ2luZSA9IG5ldyBFbmdpbmUobmV3IFZpZXdwb3J0KCQoXCIjbWFpbkNhbnZhc1wiKVswXSksIG5ldyBiMlZlYzIoMCwgNTAwKSk7XHJcblxyXG5fZW5naW5lLmFkZEVudGl0eShuZXcgQ2lyY2xlKG5ldyBiMlZlYzIoNTAwLCA1MCksIDIwKSwgQm9keVR5cGUuRFlOQU1JQ19CT0RZKVxyXG4gIC5zZXRDb2xsaXNpb25Hcm91cCgyKVxyXG4gIC5zZXRJZChcImtydWhcIilcclxuICAuZGlzYWJsZVJvdGF0aW9uKGZhbHNlKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwiaXNCdXR0b25VcChudW1iZXIoMzIpKVwiKSxcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwic2V0TGluZWFyVmVsb2NpdHkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSwgZ2V0VmVsb2NpdHlYKGZpbHRlckJ5SWQodGV4dChrcnVoKSkpLCBudW1iZXIoLTk5OTk5OTk5OTk5OTk5OTk5OSkpXCIpXHJcbiAgICApXHJcbiAgKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwiaXNCdXR0b25Eb3duKG51bWJlcigzNykpXCIpLFxyXG4gICAgICBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UoXCJzZXRMaW5lYXJWZWxvY2l0eShmaWx0ZXJCeUlkKHRleHQoa3J1aCkpLCBudW1iZXIoLTEwMCksIGdldFZlbG9jaXR5WShmaWx0ZXJCeUlkKHRleHQoa3J1aCkpKSlcIilcclxuICAgIClcclxuICApXHJcbiAgLmFkZEJlaGF2aW9yKFxyXG4gICAgbmV3IEJlaGF2aW9yKFxyXG4gICAgICBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UoXCJpc0J1dHRvbkRvd24obnVtYmVyKDM5KSlcIiksXHJcbiAgICAgIF9lbmdpbmUudG9rZW5NYW5hZ2VyLnBhcnNlci5wYXJzZShcInNldExpbmVhclZlbG9jaXR5KGZpbHRlckJ5SWQodGV4dChrcnVoKSksIG51bWJlcigxMDApLCBnZXRWZWxvY2l0eVkoZmlsdGVyQnlJZCh0ZXh0KGtydWgpKSkpXCIpXHJcbiAgICApXHJcbiAgKTtcclxuXHJcbl9lbmdpbmUuYWRkRW50aXR5KG5ldyBSZWN0YW5nbGUobmV3IGIyVmVjMig0MDAsIDQwMCksIG5ldyBiMlZlYzIoNDAwLCAzKSksIEJvZHlUeXBlLktJTkVNQVRJQ19CT0RZKVxyXG4gIC5zZXRJZChcInBsYXRmb3JtXCIpXHJcbiAgLnNldENvbGxpc2lvbkdyb3VwKDEpO1xyXG5cclxud2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICBfZW5naW5lLnN0ZXAoKTtcclxufSk7XHJcblxyXG5cclxuXHJcblxyXG4iLCIvLyBJTlBVVCBDQVBUVVJJTkdcclxuXHJcbnZhciBUb29scyA9IHJlcXVpcmUoXCIuL3Rvb2xzLmpzXCIpO1xyXG5cclxud2luZG93LklucHV0ID0ge1xyXG4gIHRvb2w6IFRvb2xzLlNlbGVjdGlvbixcclxuICBlbGVtZW50OiBudWxsLFxyXG5cclxuICBtb3VzZToge1xyXG4gICAgeDogMCxcclxuICAgIHk6IDAsXHJcbiAgICByZWFsWDogMCxcclxuICAgIHJlYWxZOiAwLFxyXG4gICAgbGVmdERvd246IGZhbHNlLFxyXG4gICAgcmlnaHREb3duOiBmYWxzZSxcclxuICAgIGxlZnRVcDogZmFsc2UsXHJcbiAgICByaWdodFVwOiBmYWxzZSxcclxuXHJcbiAgICB1cGRhdGVQb3NpdGlvbjogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHRoaXMueCA9IGV2ZW50LnBhZ2VYIC0gSW5wdXQuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gICAgICB0aGlzLnkgPSBldmVudC5wYWdlWSAtIElucHV0LmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gICAgICB0aGlzLnJlYWxYID0gZXZlbnQucGFnZVg7XHJcbiAgICAgIHRoaXMucmVhbFkgPSBldmVudC5wYWdlWTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc0Rvd246IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEpXHJcbiAgICAgICAgdGhpcy5sZWZ0RG93biA9IHRydWU7XHJcblxyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDMpXHJcbiAgICAgICAgdGhpcy5yaWdodERvd24gPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gSW5wdXQuZWxlbWVudCkge1xyXG4gICAgICAgIElucHV0LnRvb2wub25jbGljaygpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc1VwOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gSW5wdXQuZWxlbWVudClcclxuICAgICAgICBJbnB1dC50b29sLm9ucmVsZWFzZSgpO1xyXG5cclxuICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxKSB7XHJcbiAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubGVmdFVwID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAzKSB7XHJcbiAgICAgICAgdGhpcy5yaWdodERvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJpZ2h0VXAgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFuVXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy5sZWZ0VXAgPSBmYWxzZTtcclxuICAgICAgdGhpcy5yaWdodFVwID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAga2V5Ym9hcmQ6IHtcclxuICAgIGRvd246IG5ldyBTZXQoKSxcclxuICAgIHVwOiBuZXcgU2V0KCksXHJcblxyXG4gICAgaXNEb3duOiBmdW5jdGlvbiAoa2V5Q29kZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5kb3duLmhhcyhrZXlDb2RlKVxyXG4gICAgfSxcclxuXHJcbiAgICBpc1VwOiBmdW5jdGlvbiAoa2V5Q29kZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy51cC5oYXMoa2V5Q29kZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUJ1dHRvbnNEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgdGhpcy5kb3duLmFkZChldmVudC53aGljaCk7XHJcblxyXG4gICAgICBpZihldmVudC53aGljaCA9PT0gMzIpXHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc1VwOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgdGhpcy5kb3duLmRlbGV0ZShldmVudC53aGljaCk7XHJcbiAgICAgIHRoaXMudXAuYWRkKGV2ZW50LndoaWNoKTtcclxuICAgIH0sXHJcblxyXG4gICAgY2xlYW5VcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLnVwLmNsZWFyKCk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuXHJcbiAgICBkb2N1bWVudC5vbm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgSW5wdXQubW91c2UudXBkYXRlUG9zaXRpb24oZSk7XHJcbiAgICB9O1xyXG4gICAgZG9jdW1lbnQub25tb3VzZWRvd24gPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIElucHV0Lm1vdXNlLnVwZGF0ZUJ1dHRvbnNEb3duKGUpO1xyXG4gICAgfTtcclxuICAgIGRvY3VtZW50Lm9ubW91c2V1cCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgSW5wdXQubW91c2UudXBkYXRlQnV0dG9uc1VwKGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBkb2N1bWVudC5vbmtleWRvd24gPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIElucHV0LmtleWJvYXJkLnVwZGF0ZUJ1dHRvbnNEb3duKGUpO1xyXG4gICAgfTtcclxuICAgIGRvY3VtZW50Lm9ua2V5dXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIElucHV0LmtleWJvYXJkLnVwZGF0ZUJ1dHRvbnNVcChlKTtcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG5cclxuIiwidmFyIExvZ2ljID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuTG9naWM7XG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xudmFyIEZpeFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuRml4VHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBbXTtcblxudmFyIGxBbmQgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiQU5EXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOLCBUeXBlLkJPT0xFQU5dKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcbn07XG5sQW5kLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sQW5kLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICh0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSAmJiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XG59O1xuXG5sQW5kLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxBbmQ7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxBbmQpO1xuXG5cbnZhciBsT3IgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiT1JcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLkJPT0xFQU4sIFR5cGUuQk9PTEVBTl0pO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xufTtcbmxPci5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubE9yLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpIHx8IHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmxPci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsT3I7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxPcik7XG5cblxudmFyIGxOb3QgPSBmdW5jdGlvbiAoYSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiTk9UXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG59O1xubE5vdC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubE5vdC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAhdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCk7XG59O1xuXG5sTm90LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxOb3Q7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxOb3QpO1xuXG5cbnZhciBsU3RyaW5nID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJ0ZXh0XCIsIFR5cGUuU1RSSU5HLCBhcmd1bWVudHMsIFtUeXBlLkxJVEVSQUxdKTtcblxuICB0aGlzLmFyZ3MucHVzaCh2YWx1ZSk7XG59O1xubFN0cmluZy5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubFN0cmluZy5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF07XG59O1xuXG5sU3RyaW5nLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxTdHJpbmc7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxTdHJpbmcpO1xuXG5cbnZhciBsTnVtYmVyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJudW1iZXJcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTElURVJBTF0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKHZhbHVlKTtcbn07XG5sTnVtYmVyLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sTnVtYmVyLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5hcmdzWzBdKTtcbn07XG5cbmxOdW1iZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE51bWJlcjtcbm1vZHVsZS5leHBvcnRzLnB1c2gobE51bWJlcik7XG5cblxudmFyIGxUcnVlID0gZnVuY3Rpb24gKCkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwidHJ1ZVwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW10pO1xufTtcbmxUcnVlLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sVHJ1ZS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0cnVlO1xufTtcblxubFRydWUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFRydWU7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxUcnVlKTtcblxuXG52YXIgbEZhbHNlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJmYWxzZVwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW10pO1xufTtcbmxGYWxzZS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubEZhbHNlLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGZhbHNlO1xufTtcblxubEZhbHNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxGYWxzZTtcbm1vZHVsZS5leHBvcnRzLnB1c2gobEZhbHNlKTtcblxuXG52YXIgbEJ1dHRvbkRvd24gPSBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJpc0J1dHRvbkRvd25cIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGJ1dHRvbik7XG59O1xubEJ1dHRvbkRvd24ucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxCdXR0b25Eb3duLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIElucHV0LmtleWJvYXJkLmlzRG93bih0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSk7XG59O1xuXG5sQnV0dG9uRG93bi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQnV0dG9uRG93bjtcbm1vZHVsZS5leHBvcnRzLnB1c2gobEJ1dHRvbkRvd24pO1xuXG5cbnZhciBsQnV0dG9uVXAgPSBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJpc0J1dHRvblVwXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChidXR0b24pO1xufTtcbmxCdXR0b25VcC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubEJ1dHRvblVwLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIElucHV0LmtleWJvYXJkLmlzVXAodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkpO1xufTtcblxubEJ1dHRvblVwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxCdXR0b25VcDtcbm1vZHVsZS5leHBvcnRzLnB1c2gobEJ1dHRvblVwKTtcblxuXG52YXIgbFJhbmRvbSA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwicmFuZG9tTnVtYmVyXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChtaW4pO1xuICB0aGlzLmFyZ3MucHVzaChtYXgpO1xufTtcbmxSYW5kb20ucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxSYW5kb20ucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gVXRpbHMucmFuZG9tUmFuZ2UodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgJiYgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xufTtcblxubFJhbmRvbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsUmFuZG9tO1xubW9kdWxlLmV4cG9ydHMucHVzaChsUmFuZG9tKTtcblxuXG52YXIgbFZlbG9jaXR5WCA9IGZ1bmN0aW9uIChlZikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiZ2V0VmVsb2NpdHlYXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcbn07XG5sVmVsb2NpdHlYLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sVmVsb2NpdHlYLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVudGl0eSA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKVswXTtcblxuICByZXR1cm4gZW50aXR5LmJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKS5nZXRfeCgpO1xufTtcblxubFZlbG9jaXR5WC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsVmVsb2NpdHlYO1xubW9kdWxlLmV4cG9ydHMucHVzaChsVmVsb2NpdHlYKTtcblxuXG52YXIgbFZlbG9jaXR5WSA9IGZ1bmN0aW9uIChlZikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiZ2V0VmVsb2NpdHlZXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcbn07XG5sVmVsb2NpdHlZLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sVmVsb2NpdHlZLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVudGl0eSA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKVswXTtcblxuICByZXR1cm4gZW50aXR5LmJvZHkuR2V0TGluZWFyVmVsb2NpdHkoKS5nZXRfeSgpO1xufTtcblxubFZlbG9jaXR5WS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsVmVsb2NpdHlZO1xubW9kdWxlLmV4cG9ydHMucHVzaChsVmVsb2NpdHlZKTtcblxuXG52YXIgbFBsdXMgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiK1wiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59O1xubFBsdXMucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxQbHVzLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICsgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59O1xuXG5sUGx1cy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsUGx1cztcbm1vZHVsZS5leHBvcnRzLnB1c2gobFBsdXMpO1xuXG5cbnZhciBsTXVsdGlwbHkgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiKlwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59O1xubE11bHRpcGx5LnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sTXVsdGlwbHkucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKTtcbn07XG5cbmxNdWx0aXBseS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTXVsdGlwbHk7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxNdWx0aXBseSk7XG5cblxudmFyIGxEaXZpZGUgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiL1wiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59O1xubERpdmlkZS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubERpdmlkZS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSAvIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpO1xufTtcblxubERpdmlkZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsRGl2aWRlO1xubW9kdWxlLmV4cG9ydHMucHVzaChsRGl2aWRlKTtcblxuXG52YXIgbE1pbnVzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIi1cIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xufTtcbmxNaW51cy5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubE1pbnVzLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICsgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59O1xuXG5sTWludXMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE1pbnVzO1xubW9kdWxlLmV4cG9ydHMucHVzaChsTWludXMpOyIsInZhciBGaXhUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nXCIpLkZpeFR5cGU7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nXCIpLlR5cGU7XHJcblxyXG52YXIgVHlwZUV4Y2VwdGlvbiA9IGZ1bmN0aW9uKGV4cGVjdGVkLCByZWNlaXZlZCwgdG9rZW4pIHtcclxuICB0aGlzLmV4cGVjdGVkID0gZXhwZWN0ZWQ7XHJcbiAgdGhpcy5yZWNlaXZlZCA9IHJlY2VpdmVkO1xyXG4gIHRoaXMudG9rZW4gPSB0b2tlbjtcclxufTtcclxuXHJcbnZhciBQYXJzZXIgPSBmdW5jdGlvbiAodG9rZW5NYW5hZ2VyKSB7XHJcbiAgdGhpcy50b2tlbk1hbmFnZXIgPSB0b2tlbk1hbmFnZXI7XHJcblxyXG4gIHRoaXMuc3RvcENoYXJzID0gW1wiKFwiLCBcIilcIiwgXCIsXCJdO1xyXG5cclxuICB0aGlzLnBhcnNlcklucHV0ID0gXCJcIjtcclxuICB0aGlzLnBhcnNlcklucHV0V2hvbGUgPSBcIlwiO1xyXG4gIHRoaXMucGFyc2VyU3RhY2sgPSBbXTtcclxufTtcclxuXHJcblBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihpbnB1dCkge1xyXG4gIHRoaXMucGFyc2VySW5wdXQgPSBpbnB1dDtcclxuICB0aGlzLnBhcnNlcklucHV0V2hvbGUgPSBpbnB1dDtcclxuICB0aGlzLnBhcnNlclN0YWNrID0gW107XHJcblxyXG4gIGRvIHtcclxuICAgIHRoaXMucGFyc2VTdGVwKCk7XHJcbiAgfSB3aGlsZSAodGhpcy5wYXJzZXJJbnB1dC5sZW5ndGgpO1xyXG5cclxuICB2YXIgcmV0ID0gdGhpcy5wYXJzZXJTdGFjay5wb3AoKTtcclxuXHJcbiAgaWYgKHRoaXMucGFyc2VyU3RhY2subGVuZ3RoKVxyXG4gICAgdGhyb3cgXCJVbmV4cGVjdGVkIFwiICsgcmV0Lm5hbWU7XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5QYXJzZXIucHJvdG90eXBlLnJlYWRXaGl0ZXNwYWNlID0gZnVuY3Rpb24oKSB7XHJcbiAgd2hpbGUgKC9cXHMvLnRlc3QodGhpcy5wYXJzZXJJbnB1dFswXSkgJiYgdGhpcy5wYXJzZXJJbnB1dC5sZW5ndGgpIHtcclxuICAgIHRoaXMucGFyc2VySW5wdXQgPSB0aGlzLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG4gIH1cclxufTtcclxuXHJcblBhcnNlci5wcm90b3R5cGUucGFyc2VOYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICB2YXIgcmV0ID0gXCJcIjtcclxuXHJcbiAgd2hpbGUgKCEvXFxzLy50ZXN0KHRoaXMucGFyc2VySW5wdXRbMF0pICYmIHRoaXMucGFyc2VySW5wdXQubGVuZ3RoICYmIHRoaXMuc3RvcENoYXJzLmluZGV4T2YodGhpcy5wYXJzZXJJbnB1dFswXSkgPT09IC0xKSAvLyByZWFkIHVudGlsIGEgd2hpdGVzcGFjZSBvY2N1cnNcclxuICB7XHJcbiAgICByZXQgKz0gdGhpcy5wYXJzZXJJbnB1dFswXTtcclxuICAgIHRoaXMucGFyc2VySW5wdXQgPSB0aGlzLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuUGFyc2VyLnByb3RvdHlwZS5yZWFkQ2hhciA9IGZ1bmN0aW9uKGNoYXIpIHtcclxuICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gIGlmICh0aGlzLnBhcnNlcklucHV0WzBdICE9PSBjaGFyKSB7XHJcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLnBhcnNlcklucHV0V2hvbGUubGVuZ3RoIC0gdGhpcy5wYXJzZXJJbnB1dC5sZW5ndGg7XHJcbiAgICB0aHJvdyBcIkV4cGVjdGVkICdcIiArIGNoYXIgKyBcIicgYXQgcG9zaXRpb24gXCIgKyBwb3NpdGlvbiArIFwiIGF0ICdcIiArIHRoaXMucGFyc2VySW5wdXRXaG9sZS5zdWJzdHIocG9zaXRpb24pICsgXCInXCI7XHJcbiAgfVxyXG5cclxuICB0aGlzLnBhcnNlcklucHV0ID0gdGhpcy5wYXJzZXJJbnB1dC5zbGljZSgxKTtcclxuXHJcbiAgdGhpcy5yZWFkV2hpdGVzcGFjZSgpO1xyXG59O1xyXG5cclxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZVN0ZXAgPSBmdW5jdGlvbihleHBlY3RlZFR5cGUpIHtcclxuICB2YXIgbmFtZSA9IHRoaXMucGFyc2VOYW1lKCk7XHJcbiAgdmFyIHRva2VuID0gdGhpcy50b2tlbk1hbmFnZXIuZ2V0VG9rZW5CeU5hbWUobmFtZSk7XHJcblxyXG4gIGlmICh0b2tlbiA9PT0gdW5kZWZpbmVkICYmIGV4cGVjdGVkVHlwZSA9PT0gVHlwZS5MSVRFUkFMKSB7XHJcbiAgICByZXR1cm4gbmFtZTtcclxuICB9XHJcblxyXG4gIGlmICh0b2tlbiA9PSB1bmRlZmluZWQpIHtcclxuICAgIHRocm93IFwiRXhwZWN0ZWQgYXJndW1lbnQgd2l0aCB0eXBlIFwiICsgZXhwZWN0ZWRUeXBlO1xyXG4gIH1cclxuXHJcbiAgaWYgKGV4cGVjdGVkVHlwZSAhPT0gdW5kZWZpbmVkICYmIHRva2VuLnR5cGUgIT09IGV4cGVjdGVkVHlwZSkge1xyXG4gICAgdGhyb3cgXCJVbmV4cGVjdGVkIFwiICsgdG9rZW4udHlwZSArIFwiICh3YXMgZXhwZWN0aW5nIFwiICsgZXhwZWN0ZWRUeXBlICsgXCIpXCI7XHJcbiAgfVxyXG5cclxuICB2YXIgbnVtQXJncyA9IHRva2VuLmFyZ3VtZW50X3R5cGVzLmxlbmd0aDtcclxuXHJcbiAgdmFyIGFyZ3MgPSBbXTtcclxuXHJcbiAgaWYgKHRva2VuLmZpeFR5cGUgPT09IEZpeFR5cGUuSU5GSVgpIHtcclxuICAgIHZhciBhID0gdGhpcy5wYXJzZXJTdGFjay5wb3AoKTtcclxuXHJcbiAgICBpZiAoYS50eXBlICE9PSB0b2tlbi5hcmd1bWVudF90eXBlc1swXSlcclxuICAgICAgdGhyb3cgXCJVbmV4cGVjdGVkIFwiICsgYS50eXBlICsgXCIgKHdhcyBleHBlY3RpbmcgXCIgKyB0b2tlbi5hcmd1bWVudF90eXBlc1swXSArIFwiKVwiO1xyXG5cclxuICAgIGFyZ3MgPSBbYSwgdGhpcy5wYXJzZVN0ZXAodG9rZW4uYXJndW1lbnRfdHlwZXNbMV0pXTtcclxuICAgIHRoaXMucGFyc2VyU3RhY2sucG9wKCk7XHJcbiAgfVxyXG5cclxuICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5QUkVGSVgpIHtcclxuICAgIHRoaXMucmVhZENoYXIoXCIoXCIpO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBudW1BcmdzOyBpKyspIHtcclxuICAgICAgYXJncy5wdXNoKHRoaXMucGFyc2VTdGVwKHRva2VuLmFyZ3VtZW50X3R5cGVzW2ldKSk7XHJcblxyXG4gICAgICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5wYXJzZXJJbnB1dFswXSA9PT0gXCIsXCIpXHJcbiAgICAgICAgdGhpcy5wYXJzZXJJbnB1dCA9IHRoaXMucGFyc2VySW5wdXQuc2xpY2UoMSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZWFkQ2hhcihcIilcIik7XHJcbiAgfVxyXG5cclxuICB2YXIgbmV3VG9rZW4gPSBuZXcgdG9rZW4uY29uc3RydWN0b3IoKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIG5ld1Rva2VuLmFyZ3NbaV0gPSBhcmdzW2ldO1xyXG5cclxuICAgIHRoaXMucGFyc2VyU3RhY2sucG9wKCk7XHJcbiAgfVxyXG4gIHRoaXMucGFyc2VyU3RhY2sucHVzaChuZXdUb2tlbik7XHJcblxyXG4gIHJldHVybiBuZXdUb2tlbjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyOyIsInZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi9lbnRpdHkuanNcIik7XHJcblxyXG4vLyBDaXJjbGUgZW50aXR5XHJcbnZhciBDaXJjbGUgPSBmdW5jdGlvbihjZW50ZXIsIHJhZGl1cywgZml4dHVyZSwgaWQsIGNvbGxpc2lvbkdyb3VwKSB7XHJcbiAgdmFyIHNoYXBlID0gbmV3IGIyQ2lyY2xlU2hhcGUoKTtcclxuICBzaGFwZS5zZXRfbV9yYWRpdXMocmFkaXVzKTtcclxuXHJcbiAgdmFyIGJvZHkgPSBuZXcgYjJCb2R5RGVmKCk7XHJcbiAgYm9keS5zZXRfcG9zaXRpb24oY2VudGVyKTtcclxuXHJcbiAgRW50aXR5LmNhbGwodGhpcywgc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5DaXJjbGUucHJvdG90eXBlID0gbmV3IEVudGl0eSgpO1xyXG5DaXJjbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2lyY2xlO1xyXG5cclxuQ2lyY2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY3R4KSB7XHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG5cclxuICBjdHguYXJjKDAsIDAsIHRoaXMucmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG5cclxuICBjdHguZmlsbCgpO1xyXG5cclxuICBjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xyXG4gIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSBcImRlc3RpbmF0aW9uLW91dFwiO1xyXG5cclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4Lm1vdmVUbygwLCAwKTtcclxuICBjdHgubGluZVRvKDAsIHRoaXMucmFkaXVzKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbiAgY3R4LmNsb3NlUGF0aCgpO1xyXG59XHJcblxyXG5cclxuLy8gUmVjdGFuZ2xlIGVudGl0eVxyXG52YXIgUmVjdGFuZ2xlID0gZnVuY3Rpb24oY2VudGVyLCBleHRlbnRzLCBmaXh0dXJlLCBpZCwgY29sbGlzaW9uR3JvdXApIHtcclxuICB2YXIgc2hhcGUgPSBuZXcgYjJQb2x5Z29uU2hhcGUoKTtcclxuICBzaGFwZS5TZXRBc0JveChleHRlbnRzLmdldF94KCksIGV4dGVudHMuZ2V0X3koKSlcclxuXHJcbiAgdmFyIGJvZHkgPSBuZXcgYjJCb2R5RGVmKCk7XHJcbiAgYm9keS5zZXRfcG9zaXRpb24oY2VudGVyKTtcclxuXHJcbiAgRW50aXR5LmNhbGwodGhpcywgc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIHRoaXMuZXh0ZW50cyA9IGV4dGVudHM7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblJlY3RhbmdsZS5wcm90b3R5cGUgPSBuZXcgRW50aXR5KCk7XHJcblJlY3RhbmdsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZWN0YW5nbGU7XHJcblxyXG5SZWN0YW5nbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcclxuICB2YXIgaGFsZldpZHRoID0gdGhpcy5leHRlbnRzLmdldF94KCk7XHJcbiAgdmFyIGhhbGZIZWlnaHQgPSB0aGlzLmV4dGVudHMuZ2V0X3koKTtcclxuXHJcbiAgY3R4LmZpbGxSZWN0KC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0LCBoYWxmV2lkdGggKiAyLCBoYWxmSGVpZ2h0ICogMik7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cy5DaXJjbGUgPSBDaXJjbGU7XHJcbm1vZHVsZS5leHBvcnRzLlJlY3RhbmdsZSA9IFJlY3RhbmdsZTsiLCJ2YXIgRml4VHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5GaXhUeXBlO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxudmFyIFRva2VuID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuUFJFRklYO1xyXG4gIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgdGhpcy5hcmdzID0gYXJncyA9PSB1bmRlZmluZWQgPyBbXSA6IGFyZ3M7XHJcbiAgdGhpcy5hcmd1bWVudF90eXBlcyA9IGFyZ3VtZW50X3R5cGVzO1xyXG4gIHRoaXMuYXJncyA9IFtdO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKGFyZ3NbaV0udHlwZSAhPT0gYXJndW1lbnRfdHlwZXNbaV0gJiYgYXJndW1lbnRfdHlwZXNbaV0gIT09IFR5cGUuTElURVJBTClcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFeGNlcHRpb24oYXJndW1lbnRfdHlwZXNbaV0sIGFyZ3NbaV0udHlwZSwgdGhpcyk7XHJcbiAgfVxyXG59O1xyXG5cclxuVG9rZW4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIHJldCA9IFwiXCI7XHJcbiAgdmFyIGFyZ1N0cmluZ3MgPSBbXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFyZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGFyZ1N0cmluZ3MucHVzaCh0aGlzLmFyZ3NbaV0udG9TdHJpbmcoKSk7XHJcbiAgfVxyXG5cclxuICBhcmdTdHJpbmdzID0gYXJnU3RyaW5ncy5qb2luKFwiLCBcIik7XHJcblxyXG4gIHN3aXRjaCAodGhpcy5maXhUeXBlKSB7XHJcbiAgICBjYXNlIEZpeFR5cGUuUFJFRklYOlxyXG4gICAgICByZXQgPSB0aGlzLm5hbWUgKyBcIihcIiArIGFyZ1N0cmluZ3MgKyBcIilcIjtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIEZpeFR5cGUuSU5GSVg6XHJcbiAgICAgIHJldCA9IHRoaXMuYXJnc1swXS50b1N0cmluZygpICsgXCIgXCIgKyB0aGlzLm5hbWUgKyBcIiBcIiArIHRoaXMuYXJnc1sxXS50b1N0cmluZygpO1xyXG4gICAgICBicmVhaztcclxuICB9XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5cclxuXHJcbnZhciBMb2dpYyA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgVG9rZW4uY2FsbCh0aGlzLCBuYW1lLCB0eXBlLCBhcmdzLCBhcmd1bWVudF90eXBlcyk7XHJcbn07XHJcbkxvZ2ljLnByb3RvdHlwZSA9IG5ldyBUb2tlbigpO1xyXG5Mb2dpYy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMb2dpYztcclxuXHJcbkxvZ2ljLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uKCkgeyAvLyBVc2UgYSBkZXJpdmVkIGNsYXNzXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuXHJcbnZhciBBY3Rpb24gPSBmdW5jdGlvbihuYW1lLCBhcmdzLCBhcmd1bWVudF90eXBlcykge1xyXG4gIFRva2VuLmNhbGwodGhpcywgbmFtZSwgVHlwZS5BQ1RJT04sIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKTtcclxufTtcclxuQWN0aW9uLnByb3RvdHlwZSA9IG5ldyBUb2tlbigpO1xyXG5BY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQWN0aW9uO1xyXG5cclxuQWN0aW9uLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7IC8vIFVzZSBhIGRlcml2ZWQgY2xhc3NcclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5BY3Rpb24ucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgZW50aXRpZXMgPSB0aGlzLmFyZ3NbMF0uZmlsdGVyKCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdGhpcy5lYWNoKGVudGl0aWVzW2ldKTtcclxuICB9XHJcbn07XHJcblxyXG5cclxudmFyIEVudGl0eUZpbHRlciA9IGZ1bmN0aW9uKG5hbWUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgVG9rZW4uY2FsbCh0aGlzLCBuYW1lLCBUeXBlLkVOVElUWUZJTFRFUiwgYXJncywgYXJndW1lbnRfdHlwZXMpO1xyXG59O1xyXG5FbnRpdHlGaWx0ZXIucHJvdG90eXBlID0gbmV3IFRva2VuKCk7XHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbnRpdHlGaWx0ZXI7XHJcblxyXG5FbnRpdHlGaWx0ZXIucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkgeyAvLyBVc2UgZGVyaXZlZCBjbGFzc1xyXG4gIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIHJldCA9IFtdO1xyXG4gIHZhciBlbnRpdGllcyA9IF9lbmdpbmUuZW50aXRpZXMoKTtcclxuICBcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAodGhpcy5kZWNpZGUoZW50aXRpZXNbaV0pKVxyXG4gICAgICByZXQucHVzaChlbnRpdGllc1tpXSk7XHJcbiAgfVxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5Ub2tlbiA9IFRva2VuO1xyXG5tb2R1bGUuZXhwb3J0cy5BY3Rpb24gPSBBY3Rpb247XHJcbm1vZHVsZS5leHBvcnRzLkxvZ2ljID0gTG9naWM7XHJcbm1vZHVsZS5leHBvcnRzLkVudGl0eUZpbHRlciA9IEVudGl0eUZpbHRlcjtcclxuXHJcbi8vIFRPRE86IGxpbmVhciBhY3Rpb24sIHBvcm92bmF2YW5pZSwgdWhseSwgcGx1cywgbWludXMgLCBkZWxlbm8sIGtyYXQsIHggbmEgbiIsInZhciBQYXJzZXIgPSByZXF1aXJlKFwiLi9wYXJzZXIuanNcIik7XHJcblxyXG52YXIgVG9rZW5NYW5hZ2VyID0gZnVuY3Rpb24gKCkge1xyXG4gIHRoaXMudG9rZW5zID0gW107XHJcblxyXG4gIHRoaXMucmVnaXN0ZXJUb2tlbnMocmVxdWlyZShcIi4vbG9naWMuanNcIikpO1xyXG4gIHRoaXMucmVnaXN0ZXJUb2tlbnMocmVxdWlyZShcIi4vYWN0aW9ucy5qc1wiKSk7XHJcbiAgdGhpcy5yZWdpc3RlclRva2VucyhyZXF1aXJlKFwiLi9lbnRpdHlmaWx0ZXJzLmpzXCIpKTtcclxuXHJcbiAgdGhpcy5wYXJzZXIgPSBuZXcgUGFyc2VyKHRoaXMpO1xyXG59O1xyXG5cclxuVG9rZW5NYW5hZ2VyLnByb3RvdHlwZS5yZWdpc3RlclRva2VucyA9IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICB0b2tlbnMuZm9yRWFjaChmdW5jdGlvbiAodG9rZW4pIHtcclxuICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IHRva2VuKCkpO1xyXG4gIH0sIHRoaXMpO1xyXG59O1xyXG5cclxuVG9rZW5NYW5hZ2VyLnByb3RvdHlwZS5nZXRUb2tlbkJ5TmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRva2Vucy5sZW5ndGg7IGkrKylcclxuICB7XHJcbiAgICBpZiAodGhpcy50b2tlbnNbaV0ubmFtZSA9PT0gbmFtZSlcclxuICAgICAgcmV0dXJuIHRoaXMudG9rZW5zW2ldO1xyXG4gIH1cclxufTtcclxuXHJcblRva2VuTWFuYWdlci5wcm90b3R5cGUuZ2V0VG9rZW5zQnlUeXBlID0gZnVuY3Rpb24gKHR5cGUpIHtcclxuICB2YXIgcmV0ID0gW107XHJcblxyXG4gIHRoaXMudG9rZW5zLmZvckVhY2goZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICBpZiAodG9rZW4udHlwZSA9PT0gdHlwZSlcclxuICAgICAgcmV0LnB1c2godG9rZW4pO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUb2tlbk1hbmFnZXI7IiwidmFyIFNoYXBlID0gcmVxdWlyZShcIi4vc2hhcGVzLmpzXCIpO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL2JvZHl0eXBlLmpzXCIpO1xyXG5cclxudmFyIEJsYW5rID0ge1xyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHt9LFxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge30sXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7fVxyXG59O1xyXG5cclxuXHJcbnZhciBTZWxlY3Rpb24gPSB7XHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgX2VuZ2luZS5zZWxlY3RFbnRpdHkobnVsbCk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IF9lbmdpbmUuTEFZRVJTX05VTUJFUiAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX2VuZ2luZS5sYXllcnNbaV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBpZiAoX2VuZ2luZS5sYXllcnNbaV1bal0uZml4dHVyZS5UZXN0UG9pbnQoXHJcbiAgICAgICAgICAgIG5ldyBiMlZlYzIoX2VuZ2luZS52aWV3cG9ydC54IC0gX2VuZ2luZS52aWV3cG9ydC53aWR0aCAvIDIgKyBJbnB1dC5tb3VzZS54LCBfZW5naW5lLnZpZXdwb3J0LnkgLSBfZW5naW5lLnZpZXdwb3J0LmhlaWdodCAvIDIgKyBJbnB1dC5tb3VzZS55KSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgIF9lbmdpbmUuc2VsZWN0RW50aXR5KF9lbmdpbmUubGF5ZXJzW2ldW2pdKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge30sXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7fVxyXG59O1xyXG5cclxuXHJcbnZhciBSZWN0YW5nbGUgPSB7XHJcbiAgb3JpZ2luOiBudWxsLFxyXG4gIHc6IDAsXHJcbiAgaDogMCxcclxuICBtaW5TaXplOiA1LFxyXG5cclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm9ubW92ZSA9IHRoaXMuZHJhZ2dpbmc7XHJcbiAgICB0aGlzLm9yaWdpbiA9IFtJbnB1dC5tb3VzZS54LCBJbnB1dC5tb3VzZS55XTtcclxuICB9LFxyXG5cclxuICBvbnJlbGVhc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLncgPj0gdGhpcy5taW5TaXplICYmIHRoaXMuaCA+PSB0aGlzLm1pblNpemUpXHJcbiAgICAgIF9lbmdpbmUuYWRkRW50aXR5KG5ldyBTaGFwZS5SZWN0YW5nbGUoXHJcbiAgICAgICAgbmV3IGIyVmVjMih0aGlzLm9yaWdpblswXSArIHRoaXMudyAvIDIsIHRoaXMub3JpZ2luWzFdICsgdGhpcy5oIC8gMiksXHJcbiAgICAgICAgbmV3IGIyVmVjMih0aGlzLncgLyAyLCB0aGlzLmggLyAyKSksIFR5cGUuRFlOQU1JQ19CT0RZKTtcclxuXHJcbiAgICB0aGlzLm9ubW92ZSA9IGZ1bmN0aW9uKCl7fTtcclxuICAgIHRoaXMub3JpZ2luID0gbnVsbDtcclxuICAgIHRoaXMudyA9IHRoaXMuaCA9IDA7XHJcbiAgfSxcclxuXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIH0sXHJcblxyXG4gIGRyYWdnaW5nOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICB0aGlzLncgPSBJbnB1dC5tb3VzZS54IC0gdGhpcy5vcmlnaW5bMF07XHJcbiAgICB0aGlzLmggPSBJbnB1dC5tb3VzZS55IC0gdGhpcy5vcmlnaW5bMV07XHJcblxyXG4gICAgaWYgKHRoaXMudyA8IHRoaXMubWluU2l6ZSB8fCB0aGlzLmggPCB0aGlzLm1pblNpemUpXHJcbiAgICAgIHJldHVybjtcclxuXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLCAwLCAwLCAwLjQpXCI7XHJcbiAgICBjdHguZmlsbFJlY3QodGhpcy5vcmlnaW5bMF0sIHRoaXMub3JpZ2luWzFdLCB0aGlzLncsIHRoaXMuaCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG52YXIgQ2lyY2xlID0ge1xyXG4gIG9yaWdpbjogbnVsbCxcclxuICByYWRpdXM6IDAsXHJcbiAgbWluUmFkaXVzOiA1LFxyXG5cclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm9ubW92ZSA9IHRoaXMuZHJhZ2dpbmc7XHJcbiAgICB0aGlzLm9yaWdpbiA9IFtJbnB1dC5tb3VzZS54LCBJbnB1dC5tb3VzZS55XTtcclxuICB9LFxyXG5cclxuICBvbnJlbGVhc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnJhZGl1cyA+PSB0aGlzLm1pblJhZGl1cylcclxuICAgICAgX2VuZ2luZS5hZGRFbnRpdHkobmV3IFNoYXBlLkNpcmNsZShcclxuICAgICAgICBuZXcgYjJWZWMyKHRoaXMub3JpZ2luWzBdICsgdGhpcy5yYWRpdXMsIHRoaXMub3JpZ2luWzFdICsgdGhpcy5yYWRpdXMpLFxyXG4gICAgICAgIHRoaXMucmFkaXVzKSwgVHlwZS5EWU5BTUlDX0JPRFkpO1xyXG5cclxuICAgIHRoaXMub25tb3ZlID0gZnVuY3Rpb24oKXt9O1xyXG4gICAgdGhpcy5vcmlnaW4gPSBudWxsO1xyXG4gICAgdGhpcy5yYWRpdXMgPSAwO1xyXG4gIH0sXHJcblxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICB9LFxyXG5cclxuICBkcmFnZ2luZzogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgdGhpcy5yYWRpdXMgPSBNYXRoLm1pbihJbnB1dC5tb3VzZS54IC0gdGhpcy5vcmlnaW5bMF0sIElucHV0Lm1vdXNlLnkgLSB0aGlzLm9yaWdpblsxXSkgLyAyO1xyXG5cclxuICAgIGlmICh0aGlzLnJhZGl1cyA8IHRoaXMubWluUmFkaXVzKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuXHJcbiAgICBjdHguYXJjKHRoaXMub3JpZ2luWzBdICsgdGhpcy5yYWRpdXMsIHRoaXMub3JpZ2luWzFdICsgdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG5cclxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgMC40KVwiO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLkJsYW5rID0gQmxhbms7XHJcbm1vZHVsZS5leHBvcnRzLlNlbGVjdGlvbiA9IFNlbGVjdGlvbjtcclxubW9kdWxlLmV4cG9ydHMuUmVjdGFuZ2xlID0gUmVjdGFuZ2xlO1xyXG5tb2R1bGUuZXhwb3J0cy5DaXJjbGUgPSBDaXJjbGU7IiwidmFyIFR5cGUgPSB7XHJcbiAgQk9PTEVBTjogXCJib29sZWFuXCIsXHJcbiAgTlVNQkVSOiBcIm51bWJlclwiLFxyXG4gIFNUUklORzogXCJzdHJpbmdcIixcclxuICBBUlJBWTogXCJhcnJheVwiLFxyXG4gIEFDVElPTjogXCJhY3Rpb25cIixcclxuICBFTlRJVFlGSUxURVI6IFwiZW50aXR5RmlsdGVyXCIsXHJcbiAgTElURVJBTDogXCJsaXRlcmFsXCJcclxufTtcclxuXHJcbnZhciBGaXhUeXBlID0ge1xyXG4gIElORklYOiBcImluZml4XCIsXHJcbiAgUFJFRklYOiBcInByZWZpeFwiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5UeXBlID0gVHlwZTtcclxubW9kdWxlLmV4cG9ydHMuRml4VHlwZSA9IEZpeFR5cGU7IiwidmFyIFRvb2xzID0gcmVxdWlyZShcIi4vdG9vbHMuanNcIik7XHJcbnZhciBCb2R5VHlwZSA9IHJlcXVpcmUoXCIuL2JvZHl0eXBlLmpzXCIpO1xyXG52YXIgVUlCdWlsZGVyID0gcmVxdWlyZShcIi4vdWlidWlsZGVyLmpzXCIpO1xyXG5cclxuLy8gT2JqZWN0IGZvciBidWlsZGluZyB0aGUgVUlcclxudmFyIFVJID0ge1xyXG4gIC8vIFVJIGluaXRpYWxpc2F0aW9uXHJcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbGFuZ3VhZ2VzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IFRyYW5zbGF0aW9ucy5zdHJpbmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGxhbmd1YWdlcy5wdXNoKHt0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZCgwLCBpKSwgdmFsdWU6IGl9KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcHJvcGVydGllcyA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXHJcblxyXG4gICAgICAgIGlkOiBcInBsYXlcIixcclxuICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMiksXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgX2VuZ2luZS50b2dnbGVQYXVzZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChfZW5naW5lLndvcmxkLnBhdXNlZCkge1xyXG4gICAgICAgICAgICAkKFwiI3BsYXlcIikuaHRtbChUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMikpO1xyXG5cclxuICAgICAgICAgICAgJChcIiNjb2xsaXNpb25zLCAjdG9vbFwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0aGlzLmVuYWJsZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiI3BsYXlcIikuaHRtbChUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMykpO1xyXG5cclxuICAgICAgICAgICAgJChcIiNjb2xsaXNpb25zLCAjdG9vbFwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0aGlzLmRpc2FibGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7dHlwZTogXCJicmVha1wifSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXHJcblxyXG4gICAgICAgIGlkOiBcImNvbGxpc2lvbnNcIixcclxuICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMSksXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgVUlCdWlsZGVyLnBvcHVwKFVJLmNyZWF0ZUNvbGxpc2lvbnMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7dHlwZTogXCJicmVha1wifSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE3KSB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogXCJyYWRpb1wiLFxyXG5cclxuICAgICAgICBpZDogXCJ0b29sXCIsXHJcbiAgICAgICAgZWxlbWVudHM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogZWwuaW1nKHtzcmM6IFwiLi9pbWcvc2VsZWN0aW9uLnBuZ1wifSksIGNoZWNrZWQ6IHRydWUsIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgSW5wdXQudG9vbCA9IFRvb2xzLlNlbGVjdGlvbjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6IGVsLmltZyh7c3JjOiBcIi4vaW1nL3JlY3RhbmdsZS5wbmdcIn0pLCBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIElucHV0LnRvb2wgPSBUb29scy5SZWN0YW5nbGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiBlbC5pbWcoe3NyYzogXCIuL2ltZy9jaXJjbGUucG5nXCJ9KSwgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBJbnB1dC50b29sID0gVG9vbHMuQ2lyY2xlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHt0eXBlOiBcImJyZWFrXCJ9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogXCJzZWxlY3RcIixcclxuICAgICAgICBvcHRpb25zOiBsYW5ndWFnZXMsXHJcblxyXG4gICAgICAgIG9uY2hhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgIFRyYW5zbGF0aW9ucy5zZXRMYW5ndWFnZSh2YWx1ZSAqIDEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgVUlCdWlsZGVyLmJ1aWxkTGF5b3V0KCk7XHJcbiAgICAkKFwiLnVpLnRvb2xiYXJcIilbMF0uYXBwZW5kQ2hpbGQoVUlCdWlsZGVyLmJ1aWxkKHByb3BlcnRpZXMpKTtcclxuICAgICQoXCIudWkuY29udGVudFwiKVswXS5hcHBlbmRDaGlsZChlbChcImNhbnZhcyNtYWluQ2FudmFzXCIpKTtcclxuXHJcbiAgfSxcclxuXHJcbiAgLy8gQnVpbGRpbmcgdGhlIGNvbGxpc2lvbiBncm91cCB0YWJsZVxyXG4gIGNyZWF0ZUNvbGxpc2lvbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRhYmxlID0gZWwoXCJ0YWJsZS5jb2xsaXNpb25UYWJsZVwiKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9lbmdpbmUuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgKyAxOyBpKyspIHtcclxuICAgICAgdmFyIHRyID0gZWwoXCJ0clwiKTtcclxuXHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX2VuZ2luZS5DT0xMSVNJT05fR1JPVVBTX05VTUJFUiArIDE7IGorKykge1xyXG4gICAgICAgIHZhciB0ZCA9IGVsKFwidGRcIik7XHJcblxyXG4gICAgICAgIC8vIGZpcnN0IHJvd1xyXG4gICAgICAgIGlmIChpID09PSAwICYmIGogPiAwKSB7XHJcbiAgICAgICAgICB0ZC5pbm5lckhUTUwgPSBcIjxkaXY+PHNwYW4+XCIgKyBfZW5naW5lLmNvbGxpc2lvbkdyb3Vwc1tqIC0gMV0ubmFtZSArIFwiPC9zcGFuPjwvZGl2PlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZmlyc3QgY29sdW1uXHJcbiAgICAgICAgZWxzZSBpZiAoaiA9PT0gMCAmJiBpICE9PSAwKVxyXG4gICAgICAgICAgdGQuaW5uZXJIVE1MID0gX2VuZ2luZS5jb2xsaXNpb25Hcm91cHNbaSAtIDFdLm5hbWU7XHJcblxyXG4gICAgICAgIC8vIHJlbGV2YW50IHRyaWFuZ2xlXHJcbiAgICAgICAgZWxzZSBpZiAoaSA8PSBqICYmIGogIT09IDAgJiYgaSAhPT0gMCkge1xyXG4gICAgICAgICAgdGQucm93ID0gaTtcclxuICAgICAgICAgIHRkLmNvbCA9IGo7XHJcblxyXG4gICAgICAgICAgLy8gaGlnaGxpZ2h0aW5nXHJcbiAgICAgICAgICB0ZC5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKGksIGosIHRhYmxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICB2YXIgdGRzID0gdGFibGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0ZFwiKTtcclxuICAgICAgICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IHRkcy5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgICAgICAgICAgdGRzW25dLmNsYXNzTmFtZSA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gb25seSBoaWdobGlnaHQgdXAgdG8gdGhlIHJlbGV2YW50IGNlbGxcclxuICAgICAgICAgICAgICAgIGlmICgodGRzW25dLnJvdyA9PT0gaSAmJiB0ZHNbbl0uY29sIDw9IGopIHx8ICh0ZHNbbl0uY29sID09PSBqICYmIHRkc1tuXS5yb3cgPD0gaSkpXHJcbiAgICAgICAgICAgICAgICAgIHRkc1tuXS5jbGFzc05hbWUgPSBcImhpZ2hsaWdodFwiO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfShpLCBqLCB0YWJsZSk7XHJcblxyXG4gICAgICAgICAgLy8gbW9yZSBoaWdobGlnaHRpbmdcclxuICAgICAgICAgIHRkLm9ubW91c2VvdXQgPSBmdW5jdGlvbih0YWJsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHRkcyA9IHRhYmxlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGRcIik7XHJcbiAgICAgICAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCB0ZHMubGVuZ3RoOyBuKyspIHtcclxuICAgICAgICAgICAgICAgIHRkc1tuXS5jbGFzc05hbWUgPSBcIlwiO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSh0YWJsZSk7XHJcblxyXG4gICAgICAgICAgLy8gY2hlY2tib3ggZm9yIGNvbGxpc2lvbiB0b2dnbGluZ1xyXG4gICAgICAgICAgdmFyIGNoZWNrYm94ID0gZWwoXCJpbnB1dFwiLCB7dHlwZTogXCJjaGVja2JveFwifSk7XHJcblxyXG4gICAgICAgICAgaWYgKF9lbmdpbmUuZ2V0Q29sbGlzaW9uKGkgLSAxLCBqIC0gMSkpXHJcbiAgICAgICAgICAgIGNoZWNrYm94LnNldEF0dHJpYnV0ZShcImNoZWNrZWRcIiwgXCJjaGVja2VkXCIpO1xyXG5cclxuICAgICAgICAgIGNoZWNrYm94Lm9uY2hhbmdlID0gZnVuY3Rpb24oaSwgaiwgY2hlY2tib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIF9lbmdpbmUuc2V0Q29sbGlzaW9uKGkgLSAxLCBqIC0gMSwgY2hlY2tib3guY2hlY2tlZCA/IDEgOiAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfShpLCBqLCBjaGVja2JveCk7XHJcblxyXG4gICAgICAgICAgLy8gY2xpY2tpbmcgdGhlIGNoZWNrYm94J3MgY2VsbCBzaG91bGQgd29yayBhcyB3ZWxsXHJcbiAgICAgICAgICB0ZC5vbmNsaWNrID0gZnVuY3Rpb24oY2hlY2tib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICBpZiAoZS50YXJnZXQgPT09IGNoZWNrYm94KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSAhY2hlY2tib3guY2hlY2tlZDtcclxuICAgICAgICAgICAgICBjaGVja2JveC5vbmNoYW5nZSgpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfShjaGVja2JveCk7XHJcblxyXG4gICAgICAgICAgdGQuYXBwZW5kQ2hpbGQoY2hlY2tib3gpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZml4IGZvciBhbHNvIGhpZ2hsaWdodGluZyBjZWxscyB3aXRob3V0IGNoZWNrYm94ZXNcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRkLnJvdyA9IGk7XHJcbiAgICAgICAgICB0ZC5jb2wgPSBqO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHIuYXBwZW5kQ2hpbGQodGQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0YWJsZS5hcHBlbmRDaGlsZCh0cik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhYmxlO1xyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZUJlaGF2aW9yOiBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgICB2YXIgQmVoYXZpb3JCdWlsZGVyID0gcmVxdWlyZShcIi4vYmVoYXZpb3JidWlsZGVyLmpzXCIpO1xyXG4gICAgdmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbiAgICB2YXIgYmJ1aWxkZXIgPSBuZXcgQmVoYXZpb3JCdWlsZGVyKF9lbmdpbmUudG9rZW5NYW5hZ2VyKTtcclxuXHJcbiAgICB2YXIgYyA9IGVsKFwiZGl2XCIpO1xyXG5cclxuICAgIGJidWlsZGVyLmluaXRpYWxpemUoVHlwZS5CT09MRUFOLCBjKTtcclxuXHJcbiAgICByZXR1cm4gYztcclxuXHJcbiAgICByZXR1cm4gXCJUT0RPXCI7XHJcblxyXG4gICAgdmFyIGxvZ2ljID0gZWwoXCJ0ZXh0YXJlYVwiKTtcclxuICAgIGxvZ2ljLmlubmVySFRNTCA9IGVudGl0eS5iZWhhdmlvcnNbMF0udG9TdHJpbmcoKTtcclxuXHJcbiAgICByZXR1cm4gZWwoXCJkaXZcIiwgW1xyXG4gICAgICBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoNSksIGVsKFwiYnJcIiksXHJcbiAgICAgIGxvZ2ljLFxyXG4gICAgICBlbC5wKCksXHJcbiAgICAgIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg2KSwgZWwoXCJiclwiKSxcclxuXHJcbiAgICBdKTtcclxuICB9LFxyXG5cclxuICBidWlsZFNpZGViYXI6IGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICAgIHZhciBzaWRlYmFyID0gJChcIi5zaWRlYmFyLnVpIC5jb250ZW50XCIpO1xyXG5cclxuICAgIHNpZGViYXIuaHRtbChcIlwiKTtcclxuXHJcbiAgICBpZiAoZW50aXR5ID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcHJvcGVydGllcyA9IFtcclxuICAgICAgLy8gSURcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDcpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0VGV4dFwiLCB2YWx1ZTogZW50aXR5LmlkLCBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7X2VuZ2luZS5jaGFuZ2VJZChlbnRpdHksIHZhbCk7fX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBDb2xsaXNpb24gZ3JvdXBcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDgpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuY29sbGlzaW9uR3JvdXAgKyAxLCBtaW46IDEsIG1heDogX2VuZ2luZS5DT0xMSVNJT05fR1JPVVBTX05VTUJFUixcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LnNldENvbGxpc2lvbkdyb3VwKHZhbCAqIDEgLSAxKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIExheWVyXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgyMSl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXROdW1iZXJcIiwgdmFsdWU6IGVudGl0eS5sYXllciArIDEsIG1pbjogMSwgbWF4OiBfZW5naW5lLkxBWUVSU19OVU1CRVIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkgeyBfZW5naW5lLnNldEVudGl0eUxheWVyKGVudGl0eSwgdmFsKjEgLSAxKTsgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBYXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg5KX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtcclxuICAgICAgICAgIGVudGl0eS5ib2R5LlNldFRyYW5zZm9ybShuZXcgYjJWZWMyKHZhbCAqIDEsIGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3koKSksIGVudGl0eS5ib2R5LkdldEFuZ2xlKCkpO1xyXG4gICAgICAgIH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gWVxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTApfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF95KCksXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgICAgZW50aXR5LmJvZHkuU2V0VHJhbnNmb3JtKG5ldyBiMlZlYzIoZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpLCB2YWwgKiAxKSwgZW50aXR5LmJvZHkuR2V0QW5nbGUoKSk7XHJcbiAgICAgICAgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBSb3RhdGlvblxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTEpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuYm9keS5HZXRBbmdsZSgpICogMTgwIC8gTWF0aC5QSSxcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LmJvZHkuU2V0VHJhbnNmb3JtKGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCksICh2YWwgKiAxKSAqIE1hdGguUEkgLyAxODApO319LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gRml4ZWQgcm90YXRpb25cclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDEyKX0sXHJcbiAgICAgIHsgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBlbnRpdHkuZml4ZWRSb3RhdGlvbiwgb25jaGFuZ2U6IGZ1bmN0aW9uKHZhbCkgeyBlbnRpdHkuZGlzYWJsZVJvdGF0aW9uKHZhbCk7IH0gfSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIENvbG9yXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxMyl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXRDb2xvclwiLCB2YWx1ZTogZW50aXR5LmNvbG9yLCBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LmNvbG9yID0gdmFsfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBCb2R5IHR5cGVcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE0KX0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcInNlbGVjdFwiLCBzZWxlY3RlZDogZW50aXR5LmJvZHkuR2V0VHlwZSgpLCBvbmNoYW5nZTogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5ib2R5LlNldFR5cGUodmFsICogMSl9LFxyXG4gICAgICAgIG9wdGlvbnM6IFtcclxuICAgICAgICAgIHsgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE1KSwgdmFsdWU6IEJvZHlUeXBlLkRZTkFNSUNfQk9EWSB9LFxyXG4gICAgICAgICAgeyB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMjApLCB2YWx1ZTogQm9keVR5cGUuS0lORU1BVElDX0JPRFkgfSxcclxuICAgICAgICAgIHsgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE2KSwgdmFsdWU6IEJvZHlUeXBlLlNUQVRJQ19CT0RZIH0sXHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgeyB0eXBlOiBcImJ1dHRvblwiLCB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMjIpLCBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYoY29uZmlybShUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZCgyMykpKVxyXG4gICAgICAgICAgX2VuZ2luZS5yZW1vdmVFbnRpdHkoZW50aXR5KTtcclxuICAgICAgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICB7IHR5cGU6IFwiYnV0dG9uXCIsIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg0KSwgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIFVJQnVpbGRlci5wb3B1cChVSS5jcmVhdGVCZWhhdmlvcihlbnRpdHkpKTtcclxuICAgICAgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgXTtcclxuXHJcbiAgICBzaWRlYmFyWzBdLmFwcGVuZENoaWxkKFVJQnVpbGRlci5idWlsZChwcm9wZXJ0aWVzKSk7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSTsiLCJ2YXIgVUlCdWlsZGVyID0ge1xyXG4gIHJhZGlvOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcInJhZGlvR3JvdXAtXCIgKyAkKFwiLnJhZGlvR3JvdXBcIikubGVuZ3RoLFxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwiZGl2LnVpLnJhZGlvR3JvdXBcIiwge2lkOiBwcm9wZXJ0aWVzLmlkfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoXCJpbnB1dFt0eXBlPXJhZGlvXVwiLCB0aGlzKS5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKFwiaW5wdXRbdHlwZT1yYWRpb11cIiwgdGhpcykuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMuZW5hYmxlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgdmFyIGlkQ291bnQgPSAkKFwiaW5wdXRbdHlwZT1yYWRpb11cIikubGVuZ3RoO1xyXG5cclxuICAgIHByb3BlcnRpZXMuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgIGVsZW1lbnQgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICAgIGlkOiBcInJhZGlvLVwiICsgaWRDb3VudCsrLFxyXG4gICAgICAgIGNoZWNrZWQ6IGZhbHNlLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uKCl7fVxyXG4gICAgICB9LCBlbGVtZW50KTtcclxuXHJcbiAgICAgIHZhciBpbnB1dCA9IGVsKFwiaW5wdXQudWlcIiwge3R5cGU6IFwicmFkaW9cIiwgaWQ6IGVsZW1lbnQuaWQsIG5hbWU6IHByb3BlcnRpZXMuaWR9KTtcclxuICAgICAgdmFyIGxhYmVsID0gZWwoXCJsYWJlbC51aS5idXR0b25cIiwge2ZvcjogZWxlbWVudC5pZH0sIFtlbGVtZW50LnRleHRdKTtcclxuXHJcbiAgICAgIGlucHV0LmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAkKFwiK2xhYmVsXCIsIHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpbnB1dC5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgbGFiZWwub25jbGljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKFwiZGlzYWJsZWRcIikpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGVsZW1lbnQub25jbGljaygpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgaW5wdXQuY2hlY2tlZCA9IGVsZW1lbnQuY2hlY2tlZDtcclxuXHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChpbnB1dCk7XHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChsYWJlbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcbiAgXHJcbiAgYnV0dG9uOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImJ1dHRvbi1cIiArICQoXCIuYnV0dG9uXCIpLmxlbmd0aCxcclxuICAgICAgb25jbGljazogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJzcGFuLnVpLmJ1dHRvblwiLCB7IGlkOiBwcm9wZXJ0aWVzLmlkIH0sIFtwcm9wZXJ0aWVzLnRleHRdKTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpXHJcbiAgICB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQub25jbGljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcyhcImRpc2FibGVkXCIpKVxyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIHByb3BlcnRpZXMub25jbGljaygpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIHNlbGVjdDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJzZWxlY3QtXCIgKyAkKFwic2VsZWN0XCIpLmxlbmd0aCxcclxuICAgICAgc2VsZWN0ZWQ6IFwiXCIsXHJcbiAgICAgIG9uY2hhbmdlOiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcInNlbGVjdC51aVwiLCB7IGlkOiBwcm9wZXJ0aWVzLmlkIH0pO1xyXG5cclxuICAgIHJldC5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcHJvcGVydGllcy5vbmNoYW5nZSh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGVuYWJsZTtcclxuICAgIH07XHJcblxyXG4gICAgcHJvcGVydGllcy5vcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9wdGlvbiwgaW5kZXgpIHtcclxuICAgICAgcmV0LmFwcGVuZENoaWxkKGVsKFwib3B0aW9uXCIsIHt2YWx1ZTogb3B0aW9uLnZhbHVlfSwgW29wdGlvbi50ZXh0XSkpO1xyXG5cclxuICAgICAgaWYgKG9wdGlvbi52YWx1ZSA9PSBwcm9wZXJ0aWVzLnNlbGVjdGVkKVxyXG4gICAgICAgIHJldC5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGJyZWFrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gZWwoXCJzcGFuLnVpLmJyZWFrXCIpO1xyXG4gIH0sXHJcblxyXG4gIGlucHV0VGV4dDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJpbnB1dFRleHQtXCIgKyAkKFwiaW5wdXRbdHlwZT10ZXh0XVwiKS5sZW5ndGgsXHJcbiAgICAgIHZhbHVlOiBcIlwiLFxyXG4gICAgICBvbmlucHV0OiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJ0ZXh0XCIsIGlkOiBwcm9wZXJ0aWVzLmlkLCB2YWx1ZTogcHJvcGVydGllcy52YWx1ZSB9KTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5vbmlucHV0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uaW5wdXQodGhpcy52YWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgaW5wdXROdW1iZXI6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwiaW5wdXROdW1iZXItXCIgKyAkKFwiaW5wdXRbdHlwZT1udW1iZXJdXCIpLmxlbmd0aCxcclxuICAgICAgdmFsdWU6IDAsXHJcbiAgICAgIG1pbjogLUluZmluaXR5LFxyXG4gICAgICBtYXg6IEluZmluaXR5LFxyXG4gICAgICBvbmlucHV0OiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJudW1iZXJcIiwgaWQ6IHByb3BlcnRpZXMuaWQsIHZhbHVlOiBwcm9wZXJ0aWVzLnZhbHVlLCBtaW46IHByb3BlcnRpZXMubWluLCBtYXg6IHByb3BlcnRpZXMubWF4IH0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0Lm9uaW5wdXQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uaW5wdXQodGhpcy52YWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgaHRtbDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBjb250ZW50OiBcIlwiXHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICByZXR1cm4gcHJvcGVydGllcy5jb250ZW50O1xyXG4gIH0sXHJcblxyXG4gIGlucHV0Q29sb3I6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwiaW5wdXRDb2xvci1cIiArICQoXCJpbnB1dFt0eXBlPWNvbG9yXVwiKS5sZW5ndGgsXHJcbiAgICAgIHZhbHVlOiBcIiMwMDAwMDBcIixcclxuICAgICAgb25pbnB1dDogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJpbnB1dC51aS5idXR0b25cIiwgeyB0eXBlOiBcImNvbG9yXCIsIGlkOiBwcm9wZXJ0aWVzLmlkLCB2YWx1ZTogcHJvcGVydGllcy52YWx1ZSB9KTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5vbmlucHV0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uaW5wdXQodGhpcy52YWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgY2hlY2tib3g6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwiY2hlY2tib3gtXCIgKyAkKFwiaW5wdXRbdHlwZT1jaGVja2JveF1cIikubGVuZ3RoLFxyXG4gICAgICBjaGVja2VkOiBmYWxzZSxcclxuICAgICAgb25jaGFuZ2U6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwic3BhblwiKTtcclxuICAgIHZhciBjaGVja2JveCA9IGVsKFwiaW5wdXQudWlcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGlkOiBwcm9wZXJ0aWVzLmlkIH0pO1xyXG4gICAgdmFyIGxhYmVsID0gZWwoXCJsYWJlbC51aS5idXR0b25cIiwgeyBmb3I6IHByb3BlcnRpZXMuaWQgfSk7XHJcblxyXG4gICAgcmV0LmFwcGVuZENoaWxkKGNoZWNrYm94KTtcclxuICAgIHJldC5hcHBlbmRDaGlsZChsYWJlbCk7XHJcblxyXG4gICAgY2hlY2tib3guZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgY2hlY2tib3guZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKFwiK2xhYmVsXCIsIHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgY2hlY2tib3guY2hlY2tlZCA9IHByb3BlcnRpZXMuY2hlY2tlZDtcclxuXHJcbiAgICBjaGVja2JveC5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcHJvcGVydGllcy5vbmNoYW5nZSh0aGlzLmNoZWNrZWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGJ1aWxkOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgdmFyIHJldCA9IGVsLmRpdigpO1xyXG5cclxuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICB2YXIgZ2VuZXJhdGVkO1xyXG4gICAgICBcclxuICAgICAgc3dpdGNoIChlbGVtZW50LnR5cGUpIHtcclxuICAgICAgICBjYXNlIFwicmFkaW9cIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMucmFkaW8oZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImJ1dHRvblwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5idXR0b24oZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcInNlbGVjdFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5zZWxlY3QoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImlucHV0VGV4dFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5pbnB1dFRleHQoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImlucHV0TnVtYmVyXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmlucHV0TnVtYmVyKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJpbnB1dENvbG9yXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmlucHV0Q29sb3IoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImNoZWNrYm94XCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmNoZWNrYm94KGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJodG1sXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmh0bWwoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImJyZWFrXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmJyZWFrKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0LmFwcGVuZENoaWxkKGdlbmVyYXRlZCk7XHJcbiAgICB9LCB0aGlzKTtcclxuICAgIFxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG4gIFxyXG4gIGJ1aWxkTGF5b3V0OiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb250ZW50ID0gZWwoXCJkaXYudWkuY29udGVudC5wYW5lbFwiKTtcclxuICAgIHZhciBzaWRlYmFyID0gZWwoXCJkaXYudWkuc2lkZWJhci5wYW5lbFwiLCB7fSwgWyBlbChcImRpdi5jb250ZW50XCIpIF0pO1xyXG4gICAgdmFyIHJlc2l6ZXIgPSBlbChcImRpdi51aS5yZXNpemVyXCIpO1xyXG4gICAgdmFyIHRvb2xiYXIgPSBlbChcImRpdi51aS50b29sYmFyXCIpO1xyXG5cclxuICAgIHZhciB3ID0gJChcImJvZHlcIikub3V0ZXJXaWR0aCgpO1xyXG4gICAgdmFyIHNpZGViYXJXaWR0aCA9IDI1MDtcclxuXHJcbiAgICBjb250ZW50LnN0eWxlLndpZHRoID0gdyAtIDI1MCArIFwicHhcIjtcclxuICAgIHNpZGViYXIuc3R5bGUud2lkdGggPSBzaWRlYmFyV2lkdGggKyBcInB4XCI7XHJcblxyXG4gICAgdmFyIHNpZGViYXJSZXNpemVFdmVudCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHZhciB3aW5kb3dXaWR0aCA9ICQoXCJib2R5XCIpLm91dGVyV2lkdGgoKTtcclxuICAgICAgdmFyIHNpZGViYXJXaWR0aCA9IE1hdGgubWF4KDMwLCBNYXRoLm1pbih3aW5kb3dXaWR0aCAqIDAuNiwgd2luZG93V2lkdGggLSBlLmNsaWVudFgpKTtcclxuICAgICAgdmFyIGNvbnRlbnRXaWR0aCA9IHdpbmRvd1dpZHRoIC0gc2lkZWJhcldpZHRoO1xyXG5cclxuICAgICAgc2lkZWJhci5zdHlsZS53aWR0aCA9IHNpZGViYXJXaWR0aCArIFwicHhcIjtcclxuICAgICAgY29udGVudC5zdHlsZS53aWR0aCA9IGNvbnRlbnRXaWR0aCArIFwicHhcIjtcclxuXHJcbiAgICAgIHdpbmRvdy5vbnJlc2l6ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgbW91c2VVcEV2ZW50ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgc2lkZWJhci5yZXNpemluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgJChcIi5yZXNpemVyLnVpXCIpLnJlbW92ZUNsYXNzKFwicmVzaXppbmdcIik7XHJcblxyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBzaWRlYmFyUmVzaXplRXZlbnQpO1xyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbW91c2VVcEV2ZW50KTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHdpbmRvd1Jlc2l6ZUV2ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgd2luZG93V2lkdGggPSAkKFwiYm9keVwiKS5vdXRlcldpZHRoKCk7XHJcbiAgICAgIHZhciBjb250ZW50V2lkdGggPSBNYXRoLm1heCh3aW5kb3dXaWR0aCAqIDAuNCwgTWF0aC5taW4oXHJcbiAgICAgICAgd2luZG93V2lkdGggLSAzMCxcclxuICAgICAgICB3aW5kb3dXaWR0aCAtICQoXCIuc2lkZWJhci51aVwiKS5vdXRlcldpZHRoKClcclxuICAgICAgKSk7XHJcbiAgICAgIHZhciBzaWRlYmFyV2lkdGggPSB3aW5kb3dXaWR0aCAtIGNvbnRlbnRXaWR0aDtcclxuXHJcbiAgICAgIHNpZGViYXIuc3R5bGUud2lkdGggPSBzaWRlYmFyV2lkdGggKyBcInB4XCI7XHJcbiAgICAgIGNvbnRlbnQuc3R5bGUud2lkdGggPSBjb250ZW50V2lkdGggKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplci5vbm1vdXNlZG93biA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHNpZGViYXIucmVzaXppbmcgPSB0cnVlO1xyXG5cclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcInJlc2l6aW5nXCIpO1xyXG5cclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2lkZWJhclJlc2l6ZUV2ZW50KTtcclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG1vdXNlVXBFdmVudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHdpbmRvd1Jlc2l6ZUV2ZW50KTtcclxuXHJcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKHRvb2xiYXIpO1xyXG4gICAgc2lkZWJhci5hcHBlbmRDaGlsZChyZXNpemVyKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNpZGViYXIpO1xyXG4gIH0sXHJcblxyXG4gIC8vIENyZWF0aW5nIGEgcG9wdXAgbWVzc2FnZVxyXG4gIHBvcHVwOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICB2YXIgb3ZlcmxheSA9IGVsKFwiZGl2I3BvcHVwT3ZlcmxheVwiLCBbZWwoXCJkaXYjcG9wdXBDb250ZW50XCIsIFtkYXRhXSldKTtcclxuICAgIG92ZXJsYXkub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgVUlCdWlsZGVyLmNsb3NlUG9wdXAoZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKG92ZXJsYXksIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgVHJhbnNsYXRpb25zLnJlZnJlc2goKTtcclxuICB9LFxyXG5cclxuICAvLyBDbG9zaW5nIGEgcG9wdXAgbWVzc2FnZVxyXG4gIGNsb3NlUG9wdXA6IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3B1cE92ZXJsYXlcIik7XHJcbiAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9wdXBDb250ZW50XCIpO1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSBpdCB3YXMgdGhlIG92ZXJsYXkgdGhhdCB3YXMgY2xpY2tlZCwgbm90IGFuIGVsZW1lbnQgYWJvdmUgaXRcclxuICAgIGlmICh0eXBlb2YgZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBlLnRhcmdldCAhPT0gb3ZlcmxheSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgY29udGVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNvbnRlbnQpO1xyXG4gICAgb3ZlcmxheS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG92ZXJsYXkpO1xyXG4gIH0sXHJcblxyXG5cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJQnVpbGRlcjsiLCIvLyBPYmplY3QgY29udGFpbmluZyB1c2VmdWwgbWV0aG9kc1xyXG52YXIgVXRpbHMgPSB7XHJcbiAgZ2V0QnJvd3NlcldpZHRoOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkKFwiLnVpLmNvbnRlbnRcIikub3V0ZXJXaWR0aCgpO1xyXG4gIH0sXHJcblxyXG4gIGdldEJyb3dzZXJIZWlnaHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICQoXCIudWkuY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gJChcIi51aS50b29sYmFyXCIpLm91dGVySGVpZ2h0KCk7XHJcbiAgfSxcclxuXHJcbiAgcmFuZG9tUmFuZ2U6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pO1xyXG4gIH0sXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7IiwidmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHMuanNcIik7XHJcblxyXG4vLyBWSUVXUE9SVFxyXG4vLyBUaGlzIGlzIGJhc2ljYWxseSBjYW1lcmEgKyBwcm9qZWN0b3JcclxuXHJcbnZhciBWaWV3cG9ydCA9IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIHgsIHkpIHtcclxuICAvLyBDYW52YXMgZGltZW5zaW9uc1xyXG4gIGlmICh3aWR0aCAhPSB1bmRlZmluZWQgJiYgaGVpZ2h0ICE9IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5zZXRBdXRvUmVzaXplKGZhbHNlKTtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnNldEF1dG9SZXNpemUodHJ1ZSk7XHJcbiAgICB0aGlzLmF1dG9SZXNpemUoKTtcclxuICB9XHJcblxyXG4gIC8vIENlbnRlciBwb2ludCBvZiB0aGUgY2FtZXJhXHJcbiAgaWYgKHggIT09IHVuZGVmaW5lZCAmJiB5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnggPSBNYXRoLmZsb29yKHRoaXMud2lkdGggLyAyKTtcclxuICAgIHRoaXMueSA9IE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyAyKTtcclxuICB9XHJcblxyXG4gIC8vIENhbnZhcyBlbGVtZW50XHJcbiAgdGhpcy5jYW52YXNFbGVtZW50ID0gY2FudmFzRWxlbWVudDtcclxuXHJcbiAgaWYgKGNhbnZhc0VsZW1lbnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5jYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXNFbGVtZW50KTtcclxuICB9XHJcblxyXG4gIHRoaXMucmVzZXRFbGVtZW50KCk7IC8vIFJlc2l6ZSB0byBuZXcgZGltZW5zaW9uc1xyXG5cclxuICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG59O1xyXG5cclxuLy8gUmVsb2FkcyB2YWx1ZXMgZm9yIHRoZSBjYW52YXMgZWxlbWVudFxyXG5WaWV3cG9ydC5wcm90b3R5cGUucmVzZXRFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5jYW52YXNFbGVtZW50LndpZHRoID0gdGhpcy53aWR0aDtcclxuICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbn1cclxuXHJcbi8vIEF1dG9tYXRpY2FsbHkgcmVzaXplcyB0aGUgdmlld3BvcnQgdG8gZmlsbCB0aGUgc2NyZWVuXHJcblZpZXdwb3J0LnByb3RvdHlwZS5hdXRvUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy53aWR0aCA9IFV0aWxzLmdldEJyb3dzZXJXaWR0aCgpO1xyXG4gIHRoaXMuaGVpZ2h0ID0gVXRpbHMuZ2V0QnJvd3NlckhlaWdodCgpO1xyXG4gIHRoaXMueCA9IE1hdGguZmxvb3IodGhpcy53aWR0aCAvIDIpO1xyXG4gIHRoaXMueSA9IE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyAyKTtcclxufTtcclxuXHJcbi8vIFRvZ2dsZXMgdmlld3BvcnQgYXV0byByZXNpemluZ1xyXG5WaWV3cG9ydC5wcm90b3R5cGUuc2V0QXV0b1Jlc2l6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblxyXG4gIHRoaXMuYXV0b1Jlc2l6ZUFjdGl2ZSA9IHZhbHVlO1xyXG5cclxuICBpZiAodGhpcy5hdXRvUmVzaXplQWN0aXZlKSB7XHJcbiAgICB2YXIgdCA9IHRoaXM7XHJcbiAgICB3aW5kb3cub25yZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdC5hdXRvUmVzaXplKCk7XHJcbiAgICAgIHQucmVzZXRFbGVtZW50KCk7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHdpbmRvdy5vbnJlc2l6ZSA9IG51bGw7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWV3cG9ydDsiXX0=
