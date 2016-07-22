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
var Type = require("./typing.js").Type;

var BehaviorBuilder = function (tokenManager) {
  this.tokenManager = tokenManager;
};

BehaviorBuilder.prototype.initialize = function (type, container) {
  var btn = el("span.ui.button", {}, ["+"]);
  btn.type = type;

  btn.onclick = this.buildChoiceClick();

  $(container).html(btn);
};

BehaviorBuilder.prototype.buildChoiceClick = function () {
  var that = this;

  return function (e) {
    e.stopPropagation();

    that.buildChoice(that.tokenManager.getTokensByType(this.type), this);
  };
};

BehaviorBuilder.prototype.buildArgument = function (token, argIndex, argHolder) {
  // Builds an argument or argument placeholder. Returns false on bad literal input.

  if (token.args[argIndex] != undefined) {
    // Token in argument exists, build it
    
    if (token.argument_types[argIndex] === Type.LITERAL) {
      // Literals are dealt with and done

      $(argHolder).replaceWith(document.createTextNode(token.evaluate()));
      return true;
    }

    this.buildToken(token.args[argIndex], argHolder);
    return true;
  }
  else {
    // Argument is empty so far, add a button to create new

    if (token.argument_types[argIndex] === Type.LITERAL) {
      // Literals are dealt with and done

      token.populate();
      if (! token.validate())
        return false;

      $(argHolder).replaceWith(document.createTextNode(token.evaluate()));
      return true;
    }

    this.initialize(token.argument_types[argIndex], argHolder);
    return true;
  }
};

BehaviorBuilder.prototype.buildToken = function (token, holder) {
  var ret = el("span.token", {}, [el("span.name", {}, [token.name])]);

  ret.type = token.type;
  ret.onclick = this.buildChoiceClick();

  // Fix, so :hover triggers only on actual hovered token, not its ancestors
  ret.onmouseover = function (e) {
    e.stopPropagation();

    $(this).addClass("hover");
  };
  ret.onmouseout = function (e) {
    $(this).removeClass("hover");
  };

  if (token.fixType === FixType.PREFIX) {
    ret.appendChild(document.createTextNode("( "));

    var that = this;

    for (var index = 0; index < token.argument_types.length; index ++) {
      var argHolder = el("span.argument");
      ret.appendChild(argHolder);

      if (! that.buildArgument(token, index, argHolder)) {
        return;
      }

      if (index !== token.argument_types.length - 1)
        ret.appendChild(document.createTextNode(", "));
    }

    ret.appendChild(document.createTextNode(" )"));
  }

  if (token.fixType === FixType.INFIX) {
    ret.insertBefore(document.createTextNode(" "), ret.firstChild);
    ret.appendChild(document.createTextNode(" "));

    var argHolder = el("span");
    ret.insertBefore(argHolder, ret.firstChild);

    this.buildArgument(token, 0, argHolder);

    argHolder = el("span");
    ret.appendChild(argHolder);

    this.buildArgument(token, 1, argHolder);
  }

  $(holder).replaceWith(ret);
};

BehaviorBuilder.prototype.buildChoice = function (tokens, holder) {
  $("div#tokenChoice").remove();
  var container = el("div#tokenChoice");
  var that = this;

  tokens.forEach(function (token) {
    var text = el("div.token", {}, [el("span.name", {}, [token.name])]);

    if (token.fixType === FixType.PREFIX)
      text.appendChild(el("span.argument", {}, ["( ", token.argument_types.join(", "), " )"]));

    if (token.fixType === FixType.INFIX) {
      text.insertBefore(el("span.argument", {}, ["( ", token.argument_types[0], " )"]), text.firstChild);
      text.appendChild(el("span.argument", {}, ["( ", token.argument_types[1], " )"]));
    }

    $(text).on("click", function (e) {
      that.buildToken(new token.constructor(), holder);
    });

    container.appendChild(text);
  });

  document.body.appendChild(container);

  $(document).one("click", function(e) {
    $("div#tokenChoice").remove();
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
  this.selectedTool = Tools.Selection;
  
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

  $(viewport.canvasElement).on("mousedown", function(){_engine.selectedTool.onclick();});
  $(viewport.canvasElement).on("mouseup", function(){_engine.selectedTool.onrelease();});
};

// Changes running state of the simulation
Engine.prototype.togglePause = function () {
  this.world.paused = !this.world.paused;
  this.selectEntity(null);

  this.selectTool(this.world.paused ? Tools.Selection : Tools.Blank);
  $("#selectionTool")[0].checked = true;
};

Engine.prototype.selectTool = function (tool) {
  this.selectedTool = tool;
  this.selectEntity(null);
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
  this.updateCollisions();

  return this;
};

// Changes the ID of an entity
Engine.prototype.changeId = function (entity, id) {
  entity.id = id;
};

// Selects an entity and shows its properties in the sidebar
Engine.prototype.selectEntity = function (entity) {
  this.selectedEntity = entity === null ? null : entity;
  UI.buildSidebar(this.selectedEntity);
};

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
};

// One simulation step. Simulation logic happens here.
Engine.prototype.step = function() {
  // FPS timer
  var start = Date.now();

  ctx = this.viewport.context;

  // clear screen
  ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);

  ctx.save();

  if (!_engine.world.paused) {
    // box2d simulation step
    this.world.Step(1 / 60, 10, 5);
  }
  else {
    this.selectedTool.onmove(ctx);
  }
  
  // draw all entities
  for (var i = 0; i < this.LAYERS_NUMBER; i++)
  {
    this.drawArray(this.layers[i], ctx);
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
    ctx.translate(
      -this.viewport.x / this.viewport.scale + this.viewport.width / 2,
      -this.viewport.y / this.viewport.scale + this.viewport.height / 2);
    ctx.fillStyle = array[i].color;

    if(this.selectedEntity === array[i]) {
      ctx.shadowColor = "black";
      ctx.shadowBlur = 10;
    }

    var x = array[i].body.GetPosition().get_x();
    var y = array[i].body.GetPosition().get_y();
    ctx.translate(x / this.viewport.scale, y / this.viewport.scale);
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
  return entity.collisionGroup + 1 === this.args[0].evaluate();
};

efByCollisionGroup.prototype.constructor = efByCollisionGroup;
module.exports.push(efByCollisionGroup);


var efByLayer = function(layer) {
  EntityFilter.call(this, "filterByLayer", arguments, [Type.NUMBER]);

  this.args.push(layer);
};
efByLayer.prototype = new EntityFilter();

efByLayer.prototype.decide = function(entity) {
  return entity.layer + 1 === this.args[0].evaluate();
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

window._engine = new Engine(new Viewport($("#mainCanvas")[0]), new b2Vec2(0, 20));


_engine.addEntity(new Circle(new b2Vec2(0, 0), 2), BodyType.DYNAMIC_BODY)
  .setCollisionGroup(2)
  .setId("kruh")
  .disableRotation(false)
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("isButtonDown( number( 37 ) )"),
      _engine.tokenManager.parser.parse("setLinearVelocity( filterById( text( kruh ) ), number( -10 ), getVelocityY( filterById( text( kruh ) ) ) )")
    )
  )
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("isButtonDown(number(39))"),
      _engine.tokenManager.parser.parse("setLinearVelocity( filterById( text( kruh ) ), number( 10 ), getVelocityY( filterById( text( kruh ) ) ) )")
    )
  )
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("isButtonDown(number(38))"),
      _engine.tokenManager.parser.parse("setLinearVelocity( filterById( text( kruh ) ), getVelocityX( filterById( text( kruh ) ) ), number( -10 ) )")
    )
  );

_engine.addEntity(new Rectangle(new b2Vec2(0, 15), new b2Vec2(20, 0.2)), BodyType.KINEMATIC_BODY)
  .setId("platform")
  .setCollisionGroup(1);

window.requestAnimationFrame(function() {
  _engine.step();
});





},{"./behavior.js":2,"./bodytype.js":4,"./engine.js":5,"./input.js":9,"./shapes.js":12,"./ui.js":17,"./viewport.js":20}],9:[function(require,module,exports){
// INPUT CAPTURING

window.Input = {
  element: null,

  mouse: {
    x: 0,
    y: 0,
    canvasX: 0,
    canvasY: 0,
    realX: 0,
    realY: 0,
    leftDown: false,
    rightDown: false,
    leftUp: false,
    rightUp: false,

    updatePosition: function (event) {
      this.canvasY = event.pageY - Input.element.getBoundingClientRect().top;
      this.canvasX = event.pageX - Input.element.getBoundingClientRect().left;
      this.x = this.canvasX * _engine.viewport.scale + _engine.viewport.x - (_engine.viewport.width * _engine.viewport.scale) / 2;
      this.y = this.canvasY * _engine.viewport.scale + _engine.viewport.y - (_engine.viewport.height * _engine.viewport.scale) / 2;
      this.realX = event.pageX;
      this.realY = event.pageY;
    },

    updateButtonsDown: function (event) {
      if (event.which === 1)
        this.leftDown = true;

      if (event.which === 3)
        this.rightDown = true;
    },

    updateButtonsUp: function (event) {
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
      return this.down.has(keyCode);
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
    document.onselectstart = function () {
      return false;
    }
  }
};


},{}],10:[function(require,module,exports){
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

lString.prototype.validate = function () {
  return true;
};

lString.prototype.populate = function () {
  this.args[0] = prompt(Translations.getTranslated(24) + this.name);
  this.args[0] = this.args[0] === null ? "" : this.args[0];
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

lNumber.prototype.validate = function () {
  return $.isNumeric(this.args[0]);
};

lNumber.prototype.populate = function () {
  this.args[0] = prompt(Translations.getTranslated(24) + this.name);
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

  if (token === undefined && (expectedType === Type.LITERAL || expectedType == undefined)) {
    this.parserStack.push(name);
    return name;
  }

  if (token == undefined && expectedType !== undefined) {
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

    while(this.parserInput[0] !== ")") {
      this.readWhitespace();

      this.parseStep();

      if (this.parserInput[0] === ",")
        this.parserInput = this.parserInput.slice(1);

      this.readWhitespace();
    }

    for (i = 0; i < numArgs; i++) {
      var expectedArg = token.argument_types[token.argument_types.length - i - 1];
      var actualArg = this.parserStack[this.parserStack.length - 1].type;

      if (expectedArg !== Type.LITERAL && actualArg !== expectedArg)
      {
        throw "Unexpected " + actualArg +
          " (was expecting " + expectedArg + ")";
      }
      args.push(this.parserStack.pop());
    }

    args.reverse();

    this.readChar(")");
  }

  var newToken = new token.constructor();
  for (var i = 0; i < args.length; i++) {
    newToken.args[i] = args[i];
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

  ctx.arc(0, 0, this.radius / _engine.viewport.scale, 0, 2 * Math.PI, false);

  ctx.fill();

  ctx.strokeStyle = "red";
  ctx.globalCompositeOperation = "destination-out";

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, this.radius / _engine.viewport.scale);
  ctx.stroke();
  ctx.closePath();
};


// Rectangle entity
var Rectangle = function(center, extents, fixture, id, collisionGroup) {
  var shape = new b2PolygonShape();
  shape.SetAsBox(extents.get_x(), extents.get_y());

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.extents = extents;

  return this;
};
Rectangle.prototype = new Entity();
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.draw = function(ctx) {
  var halfWidth = this.extents.get_x() / _engine.viewport.scale;
  var halfHeight = this.extents.get_y() / _engine.viewport.scale;

  ctx.fillRect(-halfWidth, -halfHeight, halfWidth * 2, halfHeight * 2);
};


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
  origin: null,
  offset: null,
  mode: null,

  onclick: function () {
    _engine.selectEntity(null);

    for (var i = _engine.LAYERS_NUMBER - 1; i >= 0; i--) {
      for (var j = 0; j < _engine.layers[i].length; j++) {
        // console.log([Input.mouse.x, Input.mouse.y], _engine.viewport.x);
        if (_engine.layers[i][j].fixture.TestPoint(
            new b2Vec2(Input.mouse.x, Input.mouse.y))
        ) {
          _engine.selectEntity(_engine.layers[i][j]);

          this.origin = [Input.mouse.x, Input.mouse.y];
          this.offset = [
            _engine.selectedEntity.body.GetPosition().get_x() - this.origin[0],
            _engine.selectedEntity.body.GetPosition().get_y() - this.origin[1]
          ];

          this.mode = "reposition";
          this.origin = [Input.mouse.x, Input.mouse.y];

          return;
        }
      }
    }

    this.mode = "camera";

    this.origin = [_engine.viewport.x, _engine.viewport.y];
    this.offset = [Input.mouse.canvasX, Input.mouse.canvasY];
    _engine.viewport.canvasElement.style.cursor = "url(img/grabbingcursor.png), move";
  },
  onrelease: function () {
    this.origin = this.offset = this.mode = null;
    _engine.viewport.canvasElement.style.cursor = "default";
  },
  onmove: function () {
    if (this.mode === null)
      return;

    if (this.mode === "camera") {
      _engine.viewport.x = this.origin[0] + (this.offset[0] - Input.mouse.canvasX) * _engine.viewport.scale;
      _engine.viewport.y = this.origin[1] + (this.offset[1] - Input.mouse.canvasY) * _engine.viewport.scale;
    }

    if (this.mode === "reposition") {
      var body = _engine.selectedEntity.body;
      var x = Math.round((Input.mouse.x + this.offset[0]) * 1000) / 1000;
      var y = Math.round((Input.mouse.y + this.offset[1]) * 1000) / 1000;

      body.SetTransform(new b2Vec2(x, y), body.GetAngle());
      $("#entity_x").val(x);
      $("#entity_y").val(y);
    }
  }
};


var Rectangle = {
  origin: null,
  worldOrigin: null,
  w: 0,
  h: 0,
  minSize: 5,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [Input.mouse.canvasX, Input.mouse.canvasY];
    this.worldOrigin = [Input.mouse.x, Input.mouse.y];
  },

  onrelease: function () {
    if (this.w >= this.minSize && this.h >= this.minSize) {
      this.w *= _engine.viewport.scale;
      this.h *= _engine.viewport.scale;

      _engine.addEntity(new Shape.Rectangle(
        new b2Vec2(this.worldOrigin[0] + this.w / 2, this.worldOrigin[1] + this.h / 2),
        new b2Vec2(this.w / 2, this.h / 2)), Type.DYNAMIC_BODY);
    }

    this.onmove = function(){};
    this.origin = null;
    this.worldOrigin = null;
    this.w = this.h = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.w = Input.mouse.canvasX - this.origin[0];
    this.h = Input.mouse.canvasY - this.origin[1];

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
  worldOrigin: null,
  radius: 0,
  minRadius: 5,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [Input.mouse.canvasX, Input.mouse.canvasY];
    this.worldOrigin = [Input.mouse.x, Input.mouse.y];
  },

  onrelease: function () {
    if (this.radius >= this.minRadius) {
      this.radius *= _engine.viewport.scale;

      _engine.addEntity(new Shape.Circle(
        new b2Vec2(this.worldOrigin[0] + this.radius, this.worldOrigin[1] + this.radius),
        this.radius), Type.DYNAMIC_BODY);
    }

    this.onmove = function(){};
    this.origin = null;
    this.worldOrigin = null;
    this.radius = 0;
  },

  onmove: function () {

  },

  dragging: function (ctx) {
    this.radius = Math.min(Input.mouse.canvasX - this.origin[0], Input.mouse.canvasY - this.origin[1]) / 2;

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
            text: el.img({src: "./img/selection.png"}), id: "selectionTool", checked: true, onclick: function () {
            _engine.selectTool(Tools.Selection);
          }
          },
          {
            text: el.img({src: "./img/rectangle.png"}), onclick: function () {
            _engine.selectTool(Tools.Rectangle);
          }
          },
          {
            text: el.img({src: "./img/circle.png"}), onclick: function () {
            _engine.selectTool(Tools.Circle);
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
    var BehaviorBuilder = new (require("./behaviorbuilder.js"))(_engine.tokenManager);
    var UIBuilder = require("./uibuilder.js");
    var Type = require("./typing.js").Type;

    var oneBehavior = function(behavior) {
      var wrapper = el("div.behavior");
      var logic = el("div.tokenBuilder", {}, [""]);
      var results = el("div");

      var remover = UIBuilder.button({
        text: Translations.getTranslatedWrapped(29), onclick: (function (wrapper) {
          return function () {
            // If the function isn't wrapped, only the last instance of behavior gets passed

            $(wrapper).remove();
          };
        })(wrapper)
      });
      remover.style.float = "right";

      if (behavior === null) {
        BehaviorBuilder.initialize(Type.BOOLEAN, logic);

        results.appendChild(oneResult(null, Translations.getTranslatedWrapped(6), false));
      }
      else {
        BehaviorBuilder.buildToken(behavior.logic, logic.firstChild);

        results.appendChild(oneResult(behavior.results[0], Translations.getTranslatedWrapped(6), false));

        for (var j = 1; j < behavior.results.length; j++) {
          results.appendChild(oneResult(behavior.results[j], Translations.getTranslatedWrapped(25), true));
        }
      }


      results.appendChild(UIBuilder.button({text: Translations.getTranslatedWrapped(26), onclick: function (e) {
        this.parentNode.insertBefore(oneResult(null, Translations.getTranslatedWrapped(25), true), this);
      }}));

      wrapper.appendChild(el("h2", {}, [Translations.getTranslatedWrapped(5), remover]));
      wrapper.appendChild(logic);
      wrapper.appendChild(results);

      return wrapper;
    };

    var oneResult = function(result, text, enableRemove) {
      var wrapper = el("div");
      var resultElement = el("div.tokenBuilder", {}, [""]);

      var resultRemover = UIBuilder.button({text: Translations.getTranslatedWrapped(28), onclick:
        (function(resultElement){return function(){
          // If the function isn't wrapped, only the last instance of result gets passed

          $(resultElement).prev().remove(); // Remove the header
          $(resultElement).remove(); // And the token builder
        };})(resultElement)});
      resultRemover.style.float = "right";

      if(! enableRemove)
        resultRemover = "";

      wrapper.appendChild(el("h2", {}, [
        text,
        resultRemover
      ]));
      wrapper.appendChild(resultElement);

      if(result === null)
        BehaviorBuilder.initialize(Type.ACTION, resultElement);
      else
        BehaviorBuilder.buildToken(result, resultElement.firstChild);

      return wrapper;
    };
    
    var ret = el("div.behaviorWrapper");

    for (var i = 0; i < entity.behaviors.length; i++) {
      ret.appendChild(oneBehavior(entity.behaviors[i]));
    }

    var that = this;

    var buttons = el("div.bottom", {}, [
      UIBuilder.button({
        text: Translations.getTranslatedWrapped(27),
        onclick: function () {
          ret.appendChild(oneBehavior(null));
          ret.scrollTop = ret.scrollHeight;
        }
      }),
      UIBuilder.break(),
      UIBuilder.button({
        text: Translations.getTranslatedWrapped(31),
        onclick: function () {
          UIBuilder.closePopup();
        }
      }),
      UIBuilder.button({
        text: Translations.getTranslatedWrapped(30),
        onclick: function () {
          that.saveBehavior(entity);
          UIBuilder.closePopup();
        }
      }),
    ]);
    var wrapper = el("div", {}, [ret, buttons]);

    return wrapper;
  },

  saveBehavior: function (entity) {
    var Behavior = require("./behavior.js");

    entity.behaviors = [];
    var behaviors = $(".behaviorWrapper .behavior");

    for(var i = 0; i < behaviors.length; i++) {
      var tokenBuilders = $(".tokenBuilder", behaviors[i]);

      try {
        var logic = _engine.tokenManager.parser.parse(tokenBuilders[0].textContent);
        var results = [];

        for(var j = 1; j < tokenBuilders.length; j++) {
          try {
            results.push(_engine.tokenManager.parser.parse(tokenBuilders[j].textContent));
          }
          catch (err) {}
        }

        if (results.length === 0)
          throw "All results blank";

        entity.behaviors.push(new Behavior(logic, results));
      }
      catch (err) {
        // Ignore parsing errors (something left blank)
      }
    }
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
      { type: "range", value: entity.collisionGroup + 1, min: 1, max: _engine.COLLISION_GROUPS_NUMBER,
        oninput: function (val) {entity.setCollisionGroup(val * 1 - 1);}},
      { type: "html", content: el("p")},

      // Layer
      { type: "html", content: Translations.getTranslatedWrapped(21)},
      { type: "range", value: entity.layer + 1, min: 1, max: _engine.LAYERS_NUMBER,
        oninput: function (val) { _engine.setEntityLayer(entity, val*1 - 1); }},
      { type: "html", content: el("p")},

      // X
      { type: "html", content: Translations.getTranslatedWrapped(9)},
      { type: "inputNumber", value: entity.body.GetPosition().get_x(), id: "entity_x",
        oninput: function (val) {
          entity.body.SetTransform(new b2Vec2(val * 1, entity.body.GetPosition().get_y()), entity.body.GetAngle());
        }},
      { type: "html", content: el("p")},

      // Y
      { type: "html", content: Translations.getTranslatedWrapped(10)},
      { type: "inputNumber", value: entity.body.GetPosition().get_y(), id: "entity_y",
        oninput: function (val) {
          entity.body.SetTransform(new b2Vec2(entity.body.GetPosition().get_x(), val * 1), entity.body.GetAngle());
        }},
      { type: "html", content: el("p")},

      // Rotation
      { type: "html", content: Translations.getTranslatedWrapped(11)},
      { type: "range", min: 0, max: 360, step: 1, value: (((entity.body.GetAngle() * 180 / Math.PI) % 360)+360)%360, id: "entity_rotation",
        oninput: function (val) {entity.body.SetTransform(entity.body.GetPosition(), ((val * 1) * Math.PI / 180)%360);}},
      { type: "html", content: el("p")},

      // Fixed rotation
      { type: "html", content: Translations.getTranslatedWrapped(12)},
      { type: "checkbox", checked: entity.fixedRotation, onchange: function(val) { entity.disableRotation(val); } },
      { type: "html", content: el("p")},

      // Restitution
      { type: "html", content: Translations.getTranslatedWrapped(32)},
      { type: "range", min: 0, max: 1, step: 0.1, value: entity.fixture.GetRestitution(),
        oninput: function (val) {entity.fixture.SetRestitution(val*1);}},
      { type: "html", content: el("p")},

      // Friction
      { type: "html", content: Translations.getTranslatedWrapped(33)},
      { type: "range", min: 0, max: 1, step: 0.1, value: entity.fixture.GetFriction(),
        oninput: function (val) {entity.fixture.SetFriction(val*1);}},
      { type: "html", content: el("p")},

      // Density
      { type: "html", content: Translations.getTranslatedWrapped(34)},
      { type: "inputNumber", value: entity.fixture.GetDensity(), min: 0,
        oninput: function (val) {entity.fixture.SetDensity(val*1);entity.body.ResetMassData();}},
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
},{"./behavior.js":2,"./behaviorbuilder.js":3,"./bodytype.js":4,"./tools.js":15,"./typing.js":16,"./uibuilder.js":18}],18:[function(require,module,exports){
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

    ret.onclick = function (e) {
      if($(this).hasClass("disabled"))
        return;

      properties.onclick.call(this, e);
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
      step: 1,
      oninput: function(){}
    }, properties);

    var ret = el("input.ui", { type: "number", id: properties.id, value: properties.value, min: properties.min, max: properties.max, step: properties.step });

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

  range: function (properties) {
    properties = $.extend({}, {
      id: "range-" + $("input[type=range]").length,
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      oninput: function(){}
    }, properties);

    var slider = el("input.ui", { type: "range", min: properties.min, max: properties.max, step: properties.step, value: properties.value, id: properties.id });
    var input = this.inputNumber(properties);

    input.oninput = function() {
      properties.oninput(input.value);
      slider.value = input.value;
    };

    slider.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;

      $(input).addClass("disabled");
      input.disabled = true;
    };

    slider.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;

      $(input).removeClass("disabled");
      input.disabled = false;
    };

    slider.oninput = function () {
      properties.oninput(this.value);
      input.value = this.value;
    };


    return el("div.ui.range", {}, [slider, input]);
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

        case "range":
          generated = this.range(element);
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
    };

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
  this.scale = 1 / 20;

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
    this.x = 0;
    this.y = 0;
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
};

// Automatically resizes the viewport to fill the screen
Viewport.prototype.autoResize = function() {
  this.width = Utils.getBrowserWidth();
  this.height = Utils.getBrowserHeight();
};

// Toggles viewport auto resizing
Viewport.prototype.setAutoResize = function(value) {

  this.autoResizeActive = value;

  if (this.autoResizeActive) {
    var t = this;
    window.onresize = function() {
      t.autoResize();
      t.resetElement();
    };
  } else {
    window.onresize = null;
  }
};

Viewport.prototype.getOffset = function()
{
  return [this.x - this.width / 2, this.y - this.height / 2];
};

module.exports = Viewport;
},{"./utils.js":19}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1VzZXJzL0pha3ViIE1hdHXFoWthL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2FjdGlvbnMuanMiLCJqcy9iZWhhdmlvci5qcyIsImpzL2JlaGF2aW9yYnVpbGRlci5qcyIsImpzL2JvZHl0eXBlLmpzIiwianMvZW5naW5lLmpzIiwianMvZW50aXR5LmpzIiwianMvZW50aXR5ZmlsdGVycy5qcyIsImpzL2VudHJ5LmpzIiwianMvaW5wdXQuanMiLCJqcy9sb2dpYy5qcyIsImpzL3BhcnNlci5qcyIsImpzL3NoYXBlcy5qcyIsImpzL3Rva2VuLmpzIiwianMvdG9rZW5tYW5hZ2VyLmpzIiwianMvdG9vbHMuanMiLCJqcy90eXBpbmcuanMiLCJqcy91aS5qcyIsImpzL3VpYnVpbGRlci5qcyIsImpzL3V0aWxzLmpzIiwianMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEFjdGlvbiA9IHJlcXVpcmUoXCIuL3Rva2VuLmpzXCIpLkFjdGlvbjtcclxudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gW107XHJcblxyXG52YXIgYVNldENvbG9yID0gZnVuY3Rpb24oZWYsIGNvbG9yKSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJzZXRDb2xvclwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5TVFJJTkddKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKGNvbG9yKTtcclxufTtcclxuYVNldENvbG9yLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuXHJcbmFTZXRDb2xvci5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5zZXRDb2xvcih0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XHJcbn07XHJcblxyXG5hU2V0Q29sb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYVNldENvbG9yO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFTZXRDb2xvcik7XHJcblxyXG5cclxudmFyIGFUb3JxdWUgPSBmdW5jdGlvbihlZiwgc3RyZW5ndGgpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5VG9ycXVlXCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goc3RyZW5ndGgpO1xyXG59O1xyXG5hVG9ycXVlLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuXHJcbmFUb3JxdWUucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuYm9keS5BcHBseVRvcnF1ZShlbnRpdHkuZ2V0TWFzcygpICogdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xyXG59O1xyXG5cclxuYVRvcnF1ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhVG9ycXVlO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFUb3JxdWUpO1xyXG5cclxuXHJcbnZhciBhQW5ndWxhckltcHVsc2UgPSBmdW5jdGlvbihlZiwgc3RyZW5ndGgpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5QW5ndWxhckltcHVsc2VcIiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaChzdHJlbmd0aCk7XHJcbn07XHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUgPSBuZXcgQWN0aW9uKCk7XHJcblxyXG5hQW5ndWxhckltcHVsc2UucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuYm9keS5BcHBseUFuZ3VsYXJJbXB1bHNlKGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XHJcbn07XHJcblxyXG5hQW5ndWxhckltcHVsc2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYUFuZ3VsYXJJbXB1bHNlO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFBbmd1bGFySW1wdWxzZSk7XHJcblxyXG5cclxudmFyIGFMaW5lYXJWZWxvY2l0eSA9IGZ1bmN0aW9uKGVmLCB4LCB5KSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJzZXRMaW5lYXJWZWxvY2l0eVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaCh4KTtcclxuICB0aGlzLmFyZ3MucHVzaCh5KTtcclxufTtcclxuYUxpbmVhclZlbG9jaXR5LnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuXHJcbmFMaW5lYXJWZWxvY2l0eS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5zZXRMaW5lYXJWZWxvY2l0eShuZXcgYjJWZWMyKHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpLCB0aGlzLmFyZ3NbMl0uZXZhbHVhdGUoKSkpO1xyXG59O1xyXG5cclxuYUxpbmVhclZlbG9jaXR5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFMaW5lYXJWZWxvY2l0eTtcclxubW9kdWxlLmV4cG9ydHMucHVzaChhTGluZWFyVmVsb2NpdHkpO1xyXG5cclxuXHJcbnZhciBhTGluZWFySW1wdWxzZSA9IGZ1bmN0aW9uKGVmLCB4LCB5KSB7XHJcbiAgQWN0aW9uLmNhbGwodGhpcywgXCJhcHBseUxpbmVhckltcHVsc2VcIiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goeCk7XHJcbiAgdGhpcy5hcmdzLnB1c2goeSk7XHJcbn07XHJcbmFMaW5lYXJJbXB1bHNlLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuXHJcbmFMaW5lYXJJbXB1bHNlLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LmFwcGx5TGluZWFySW1wdWxzZShuZXcgYjJWZWMyKGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSwgZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1syXS5ldmFsdWF0ZSgpKSk7XHJcbn07XHJcblxyXG5hTGluZWFySW1wdWxzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhTGluZWFySW1wdWxzZTtcclxubW9kdWxlLmV4cG9ydHMucHVzaChhTGluZWFySW1wdWxzZSk7XHJcblxyXG4iLCJ2YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xuXG52YXIgQmVoYXZpb3IgPSBmdW5jdGlvbihsb2dpYywgcmVzdWx0cykge1xuICB0aGlzLmxvZ2ljID0gbG9naWM7XG5cbiAgaWYgKHRoaXMubG9naWMudHlwZSAhPT0gVHlwZS5CT09MRUFOKVxuICAgIHRocm93IG5ldyBUeXBlRXhjZXB0aW9uKFR5cGUuQk9PTEVBTiwgdGhpcy5sb2dpYy50eXBlLCB0aGlzKTtcblxuICB0aGlzLnJlc3VsdHMgPSBBcnJheS5pc0FycmF5KHJlc3VsdHMpID8gcmVzdWx0cyA6IFtyZXN1bHRzXTtcbn07XG5cbkJlaGF2aW9yLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICByZXR1cm4gdGhpcy5sb2dpYy5ldmFsdWF0ZShlbnRpdHkpO1xufTtcblxuQmVoYXZpb3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBcIkJlaGF2aW9yKFwiICsgdGhpcy5sb2dpYy50b1N0cmluZygpICsgXCIsIFwiICsgdGhpcy5yZXN1bHRzLnRvU3RyaW5nKCkgKyBcIilcIjtcbn07XG5cbkJlaGF2aW9yLnByb3RvdHlwZS5yZXN1bHQgPSBmdW5jdGlvbigpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLnJlc3VsdHNbaV0uZXhlY3V0ZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJlaGF2aW9yOyIsInZhciBGaXhUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLkZpeFR5cGU7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XHJcblxyXG52YXIgQmVoYXZpb3JCdWlsZGVyID0gZnVuY3Rpb24gKHRva2VuTWFuYWdlcikge1xyXG4gIHRoaXMudG9rZW5NYW5hZ2VyID0gdG9rZW5NYW5hZ2VyO1xyXG59O1xyXG5cclxuQmVoYXZpb3JCdWlsZGVyLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gKHR5cGUsIGNvbnRhaW5lcikge1xyXG4gIHZhciBidG4gPSBlbChcInNwYW4udWkuYnV0dG9uXCIsIHt9LCBbXCIrXCJdKTtcclxuICBidG4udHlwZSA9IHR5cGU7XHJcblxyXG4gIGJ0bi5vbmNsaWNrID0gdGhpcy5idWlsZENob2ljZUNsaWNrKCk7XHJcblxyXG4gICQoY29udGFpbmVyKS5odG1sKGJ0bik7XHJcbn07XHJcblxyXG5CZWhhdmlvckJ1aWxkZXIucHJvdG90eXBlLmJ1aWxkQ2hvaWNlQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgdGhhdC5idWlsZENob2ljZSh0aGF0LnRva2VuTWFuYWdlci5nZXRUb2tlbnNCeVR5cGUodGhpcy50eXBlKSwgdGhpcyk7XHJcbiAgfTtcclxufTtcclxuXHJcbkJlaGF2aW9yQnVpbGRlci5wcm90b3R5cGUuYnVpbGRBcmd1bWVudCA9IGZ1bmN0aW9uICh0b2tlbiwgYXJnSW5kZXgsIGFyZ0hvbGRlcikge1xyXG4gIC8vIEJ1aWxkcyBhbiBhcmd1bWVudCBvciBhcmd1bWVudCBwbGFjZWhvbGRlci4gUmV0dXJucyBmYWxzZSBvbiBiYWQgbGl0ZXJhbCBpbnB1dC5cclxuXHJcbiAgaWYgKHRva2VuLmFyZ3NbYXJnSW5kZXhdICE9IHVuZGVmaW5lZCkge1xyXG4gICAgLy8gVG9rZW4gaW4gYXJndW1lbnQgZXhpc3RzLCBidWlsZCBpdFxyXG4gICAgXHJcbiAgICBpZiAodG9rZW4uYXJndW1lbnRfdHlwZXNbYXJnSW5kZXhdID09PSBUeXBlLkxJVEVSQUwpIHtcclxuICAgICAgLy8gTGl0ZXJhbHMgYXJlIGRlYWx0IHdpdGggYW5kIGRvbmVcclxuXHJcbiAgICAgICQoYXJnSG9sZGVyKS5yZXBsYWNlV2l0aChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0b2tlbi5ldmFsdWF0ZSgpKSk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYnVpbGRUb2tlbih0b2tlbi5hcmdzW2FyZ0luZGV4XSwgYXJnSG9sZGVyKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIC8vIEFyZ3VtZW50IGlzIGVtcHR5IHNvIGZhciwgYWRkIGEgYnV0dG9uIHRvIGNyZWF0ZSBuZXdcclxuXHJcbiAgICBpZiAodG9rZW4uYXJndW1lbnRfdHlwZXNbYXJnSW5kZXhdID09PSBUeXBlLkxJVEVSQUwpIHtcclxuICAgICAgLy8gTGl0ZXJhbHMgYXJlIGRlYWx0IHdpdGggYW5kIGRvbmVcclxuXHJcbiAgICAgIHRva2VuLnBvcHVsYXRlKCk7XHJcbiAgICAgIGlmICghIHRva2VuLnZhbGlkYXRlKCkpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgJChhcmdIb2xkZXIpLnJlcGxhY2VXaXRoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRva2VuLmV2YWx1YXRlKCkpKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplKHRva2VuLmFyZ3VtZW50X3R5cGVzW2FyZ0luZGV4XSwgYXJnSG9sZGVyKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbkJlaGF2aW9yQnVpbGRlci5wcm90b3R5cGUuYnVpbGRUb2tlbiA9IGZ1bmN0aW9uICh0b2tlbiwgaG9sZGVyKSB7XHJcbiAgdmFyIHJldCA9IGVsKFwic3Bhbi50b2tlblwiLCB7fSwgW2VsKFwic3Bhbi5uYW1lXCIsIHt9LCBbdG9rZW4ubmFtZV0pXSk7XHJcblxyXG4gIHJldC50eXBlID0gdG9rZW4udHlwZTtcclxuICByZXQub25jbGljayA9IHRoaXMuYnVpbGRDaG9pY2VDbGljaygpO1xyXG5cclxuICAvLyBGaXgsIHNvIDpob3ZlciB0cmlnZ2VycyBvbmx5IG9uIGFjdHVhbCBob3ZlcmVkIHRva2VuLCBub3QgaXRzIGFuY2VzdG9yc1xyXG4gIHJldC5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICQodGhpcykuYWRkQ2xhc3MoXCJob3ZlclwiKTtcclxuICB9O1xyXG4gIHJldC5vbm1vdXNlb3V0ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJob3ZlclwiKTtcclxuICB9O1xyXG5cclxuICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5QUkVGSVgpIHtcclxuICAgIHJldC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIiggXCIpKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHRva2VuLmFyZ3VtZW50X3R5cGVzLmxlbmd0aDsgaW5kZXggKyspIHtcclxuICAgICAgdmFyIGFyZ0hvbGRlciA9IGVsKFwic3Bhbi5hcmd1bWVudFwiKTtcclxuICAgICAgcmV0LmFwcGVuZENoaWxkKGFyZ0hvbGRlcik7XHJcblxyXG4gICAgICBpZiAoISB0aGF0LmJ1aWxkQXJndW1lbnQodG9rZW4sIGluZGV4LCBhcmdIb2xkZXIpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaW5kZXggIT09IHRva2VuLmFyZ3VtZW50X3R5cGVzLmxlbmd0aCAtIDEpXHJcbiAgICAgICAgcmV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiLCBcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIiApXCIpKTtcclxuICB9XHJcblxyXG4gIGlmICh0b2tlbi5maXhUeXBlID09PSBGaXhUeXBlLklORklYKSB7XHJcbiAgICByZXQuaW5zZXJ0QmVmb3JlKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIFwiKSwgcmV0LmZpcnN0Q2hpbGQpO1xyXG4gICAgcmV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIFwiKSk7XHJcblxyXG4gICAgdmFyIGFyZ0hvbGRlciA9IGVsKFwic3BhblwiKTtcclxuICAgIHJldC5pbnNlcnRCZWZvcmUoYXJnSG9sZGVyLCByZXQuZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgdGhpcy5idWlsZEFyZ3VtZW50KHRva2VuLCAwLCBhcmdIb2xkZXIpO1xyXG5cclxuICAgIGFyZ0hvbGRlciA9IGVsKFwic3BhblwiKTtcclxuICAgIHJldC5hcHBlbmRDaGlsZChhcmdIb2xkZXIpO1xyXG5cclxuICAgIHRoaXMuYnVpbGRBcmd1bWVudCh0b2tlbiwgMSwgYXJnSG9sZGVyKTtcclxuICB9XHJcblxyXG4gICQoaG9sZGVyKS5yZXBsYWNlV2l0aChyZXQpO1xyXG59O1xyXG5cclxuQmVoYXZpb3JCdWlsZGVyLnByb3RvdHlwZS5idWlsZENob2ljZSA9IGZ1bmN0aW9uICh0b2tlbnMsIGhvbGRlcikge1xyXG4gICQoXCJkaXYjdG9rZW5DaG9pY2VcIikucmVtb3ZlKCk7XHJcbiAgdmFyIGNvbnRhaW5lciA9IGVsKFwiZGl2I3Rva2VuQ2hvaWNlXCIpO1xyXG4gIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgdG9rZW5zLmZvckVhY2goZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICB2YXIgdGV4dCA9IGVsKFwiZGl2LnRva2VuXCIsIHt9LCBbZWwoXCJzcGFuLm5hbWVcIiwge30sIFt0b2tlbi5uYW1lXSldKTtcclxuXHJcbiAgICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5QUkVGSVgpXHJcbiAgICAgIHRleHQuYXBwZW5kQ2hpbGQoZWwoXCJzcGFuLmFyZ3VtZW50XCIsIHt9LCBbXCIoIFwiLCB0b2tlbi5hcmd1bWVudF90eXBlcy5qb2luKFwiLCBcIiksIFwiIClcIl0pKTtcclxuXHJcbiAgICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5JTkZJWCkge1xyXG4gICAgICB0ZXh0Lmluc2VydEJlZm9yZShlbChcInNwYW4uYXJndW1lbnRcIiwge30sIFtcIiggXCIsIHRva2VuLmFyZ3VtZW50X3R5cGVzWzBdLCBcIiApXCJdKSwgdGV4dC5maXJzdENoaWxkKTtcclxuICAgICAgdGV4dC5hcHBlbmRDaGlsZChlbChcInNwYW4uYXJndW1lbnRcIiwge30sIFtcIiggXCIsIHRva2VuLmFyZ3VtZW50X3R5cGVzWzFdLCBcIiApXCJdKSk7XHJcbiAgICB9XHJcblxyXG4gICAgJCh0ZXh0KS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHRoYXQuYnVpbGRUb2tlbihuZXcgdG9rZW4uY29uc3RydWN0b3IoKSwgaG9sZGVyKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0KTtcclxuICB9KTtcclxuXHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xyXG5cclxuICAkKGRvY3VtZW50KS5vbmUoXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAkKFwiZGl2I3Rva2VuQ2hvaWNlXCIpLnJlbW92ZSgpO1xyXG4gIH0pO1xyXG5cclxuICB2YXIgb2Zmc2V0ID0gMTU7XHJcblxyXG4gICQoY29udGFpbmVyKS5jc3MoXCJsZWZ0XCIsIElucHV0Lm1vdXNlLnJlYWxYICsgb2Zmc2V0ICsgXCJweFwiKTtcclxuICAkKGNvbnRhaW5lcikuY3NzKFwidG9wXCIsIElucHV0Lm1vdXNlLnJlYWxZICsgb2Zmc2V0ICsgXCJweFwiKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmVoYXZpb3JCdWlsZGVyO1xyXG4iLCJ2YXIgQm9keVR5cGUgPSB7XHJcbiAgRFlOQU1JQ19CT0RZOiBNb2R1bGUuYjJfZHluYW1pY0JvZHksXHJcbiAgU1RBVElDX0JPRFk6IE1vZHVsZS5iMl9zdGF0aWNCb2R5LFxyXG4gIEtJTkVNQVRJQ19CT0RZOiBNb2R1bGUuYjJfa2luZW1hdGljQm9keVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCb2R5VHlwZTsiLCJ2YXIgVUkgPSByZXF1aXJlKFwiLi91aS5qc1wiKTtcclxudmFyIFRvb2xzID0gcmVxdWlyZShcIi4vdG9vbHMuanNcIik7XHJcbnZhciBUb2tlbk1hbmFnZXIgPSByZXF1aXJlKFwiLi90b2tlbm1hbmFnZXIuanNcIik7XHJcblxyXG5cclxuY29uc3QgQVVUT19JRF9QUkVGSVggPSBcIkVOVElUWV9OVU1CRVJfXCI7XHJcblxyXG5jb25zdCBESVNQTEFZX1JBVElPID0gMjA7XHJcblxyXG4vKi8gTXlzbGllbmt5XHJcblxyXG5sb2Nrb3ZhbmllIGthbWVyeSBuYSBvYmpla3RcclxuICogcHJlY2hvZHlcclxuYWtvIGZ1bmd1amUgY2VsYSBrYW1lcmE/XHJcblxyXG4vKi9cclxuXHJcblxyXG4vLyBFTkdJTkVcclxuXHJcbi8vIGNvbnN0cnVjdG9yXHJcblxyXG52YXIgRW5naW5lID0gZnVuY3Rpb24odmlld3BvcnQsIGdyYXZpdHkpIHtcclxuICB0aGlzLnZpZXdwb3J0ID0gdmlld3BvcnQ7XHJcbiAgdGhpcy5zZWxlY3RlZEVudGl0eSA9IG51bGw7XHJcbiAgdGhpcy5zZWxlY3RlZFRvb2wgPSBUb29scy5TZWxlY3Rpb247XHJcbiAgXHJcbiAgdGhpcy5DT0xMSVNJT05fR1JPVVBTX05VTUJFUiA9IDE2O1xyXG4gIHRoaXMuTEFZRVJTX05VTUJFUiA9IDEwO1xyXG5cclxuICB0aGlzLmxheWVycyA9IG5ldyBBcnJheSh0aGlzLkxBWUVSU19OVU1CRVIpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5MQVlFUlNfTlVNQkVSOyBpKyspXHJcbiAge1xyXG4gICAgdGhpcy5sYXllcnNbaV0gPSBbXTtcclxuICB9XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXBzID0gW107XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSOyBpKyspIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzLnB1c2goe1xyXG4gICAgICBcIm5hbWVcIjogaSArIDEsXHJcbiAgICAgIFwibWFza1wiOiBwYXJzZUludChBcnJheSh0aGlzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSICsgMSkuam9pbihcIjFcIiksIDIpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHRoaXMubGlmZXRpbWVFbnRpdGllcyA9IDA7XHJcblxyXG4gIHRoaXMud29ybGQgPSBuZXcgYjJXb3JsZChncmF2aXR5LCB0cnVlKTtcclxuICB0aGlzLndvcmxkLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gIHRoaXMudG9rZW5NYW5hZ2VyID0gbmV3IFRva2VuTWFuYWdlcigpO1xyXG5cclxuICBJbnB1dC5pbml0aWFsaXplKHZpZXdwb3J0LmNhbnZhc0VsZW1lbnQpO1xyXG5cclxuICAkKHZpZXdwb3J0LmNhbnZhc0VsZW1lbnQpLm9uKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKCl7X2VuZ2luZS5zZWxlY3RlZFRvb2wub25jbGljaygpO30pO1xyXG4gICQodmlld3BvcnQuY2FudmFzRWxlbWVudCkub24oXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKCl7X2VuZ2luZS5zZWxlY3RlZFRvb2wub25yZWxlYXNlKCk7fSk7XHJcbn07XHJcblxyXG4vLyBDaGFuZ2VzIHJ1bm5pbmcgc3RhdGUgb2YgdGhlIHNpbXVsYXRpb25cclxuRW5naW5lLnByb3RvdHlwZS50b2dnbGVQYXVzZSA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLndvcmxkLnBhdXNlZCA9ICF0aGlzLndvcmxkLnBhdXNlZDtcclxuICB0aGlzLnNlbGVjdEVudGl0eShudWxsKTtcclxuXHJcbiAgdGhpcy5zZWxlY3RUb29sKHRoaXMud29ybGQucGF1c2VkID8gVG9vbHMuU2VsZWN0aW9uIDogVG9vbHMuQmxhbmspO1xyXG4gICQoXCIjc2VsZWN0aW9uVG9vbFwiKVswXS5jaGVja2VkID0gdHJ1ZTtcclxufTtcclxuXHJcbkVuZ2luZS5wcm90b3R5cGUuc2VsZWN0VG9vbCA9IGZ1bmN0aW9uICh0b29sKSB7XHJcbiAgdGhpcy5zZWxlY3RlZFRvb2wgPSB0b29sO1xyXG4gIHRoaXMuc2VsZWN0RW50aXR5KG51bGwpO1xyXG59O1xyXG5cclxuRW5naW5lLnByb3RvdHlwZS5yZW1vdmVFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgdGhpcy53b3JsZC5EZXN0cm95Qm9keShlbnRpdHkuYm9keSk7XHJcbiAgdGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5zcGxpY2UodGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5pbmRleE9mKGVudGl0eSksIDEpO1xyXG59O1xyXG5cclxuRW5naW5lLnByb3RvdHlwZS5zZXRFbnRpdHlMYXllciA9IGZ1bmN0aW9uIChlbnRpdHksIG5ld0xheWVyKSB7XHJcbiAgLy8gUmVtb3ZlIGZyb20gb2xkIGxheWVyXHJcbiAgdGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5zcGxpY2UodGhpcy5sYXllcnNbZW50aXR5LmxheWVyXS5pbmRleE9mKGVudGl0eSksIDEpO1xyXG5cclxuICAvLyBTZXQgbmV3IGxheWVyXHJcbiAgZW50aXR5LmxheWVyID0gbmV3TGF5ZXI7XHJcbiAgdGhpcy5sYXllcnNbbmV3TGF5ZXJdLnB1c2goZW50aXR5KTtcclxufTtcclxuXHJcbi8vIFJldHVybnMgYWxsIGVudGl0aWVzIGluIG9uZSBhcnJheVxyXG5FbmdpbmUucHJvdG90eXBlLmVudGl0aWVzID0gZnVuY3Rpb24gKCkge1xyXG4gIHJldHVybiBbXS5jb25jYXQuYXBwbHkoW10sIHRoaXMubGF5ZXJzKTtcclxufTtcclxuXHJcblxyXG4vLyBSZXR1cm5zIHRoZSBlbnRpdHkgd2l0aCBpZCBzcGVjaWZpZWQgYnkgYXJndW1lbnRcclxuRW5naW5lLnByb3RvdHlwZS5nZXRFbnRpdHlCeUlkID0gZnVuY3Rpb24oaWQpIHtcclxuICB2YXIgZW50aXRpZXMgPSB0aGlzLmVudGl0aWVzKCk7XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChlbnRpdGllc1tpXS5pZCA9PT0gaWQpXHJcbiAgICAgIHJldHVybiBlbnRpdGllc1tpXTtcclxuICB9XHJcblxyXG4gIHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuLy8gUmV0dXJucyBhbiBhcnJheSBvZiBlbnRpdGllcyB3aXRoIHNwZWNpZmllZCBjb2xsaXNpb25Hcm91cFxyXG5FbmdpbmUucHJvdG90eXBlLmdldEVudGl0aWVzQnlDb2xsaXNpb25Hcm91cCA9IGZ1bmN0aW9uKGdyb3VwKSB7XHJcbiAgdmFyIHJldCA9IFtdO1xyXG4gIHZhciBlbnRpdGllcyA9IHRoaXMuZW50aXRpZXMoKTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKGVudGl0aWVzW2ldLmNvbGxpc2lvbkdyb3VwID09PSBncm91cClcclxuICAgICAgcmV0LnB1c2goZW50aXRpZXNbaV0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcbi8vIEFkZGluZyBhbiBlbnRpdHkgdG8gdGhlIHdvcmxkXHJcbkVuZ2luZS5wcm90b3R5cGUuYWRkRW50aXR5ID0gZnVuY3Rpb24oZW50aXR5LCB0eXBlKSB7XHJcbiAgLy8gZ2VuZXJhdGUgYXV0byBpZFxyXG4gIGlmIChlbnRpdHkuaWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgZW50aXR5LmlkID0gQVVUT19JRF9QUkVGSVggKyB0aGlzLmxpZmV0aW1lRW50aXRpZXM7XHJcbiAgfVxyXG5cclxuICB0aGlzLmxpZmV0aW1lRW50aXRpZXMrKztcclxuXHJcbiAgZW50aXR5LmJvZHkuc2V0X3R5cGUodHlwZSk7XHJcblxyXG4gIGVudGl0eS5ib2R5ID0gdGhpcy53b3JsZC5DcmVhdGVCb2R5KGVudGl0eS5ib2R5KTtcclxuICBlbnRpdHkuZml4dHVyZSA9IGVudGl0eS5ib2R5LkNyZWF0ZUZpeHR1cmUoZW50aXR5LmZpeHR1cmUpO1xyXG5cclxuICB0aGlzLmxheWVyc1tlbnRpdHkubGF5ZXJdLnB1c2goZW50aXR5KTtcclxuXHJcbiAgcmV0dXJuIGVudGl0eTtcclxufTtcclxuXHJcbi8vIENoZWNrcyB3aGV0aGVyIHR3byBncm91cHMgc2hvdWxkIGNvbGxpZGVcclxuRW5naW5lLnByb3RvdHlwZS5nZXRDb2xsaXNpb24gPSBmdW5jdGlvbihncm91cEEsIGdyb3VwQikge1xyXG4gIHJldHVybiAodGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID4+IGdyb3VwQikgJiAxO1xyXG59O1xyXG5cclxuLy8gU2V0cyB0d28gZ3JvdXBzIHVwIHRvIGNvbGxpZGVcclxuRW5naW5lLnByb3RvdHlwZS5zZXRDb2xsaXNpb24gPSBmdW5jdGlvbihncm91cEEsIGdyb3VwQiwgdmFsdWUpIHtcclxuICB2YXIgbWFza0EgPSAoMSA8PCBncm91cEIpO1xyXG4gIHZhciBtYXNrQiA9ICgxIDw8IGdyb3VwQSk7XHJcblxyXG4gIGlmICh2YWx1ZSkge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrIHwgbWFza0E7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgPSB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgfCBtYXNrQjtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBBXS5tYXNrICYgfm1hc2tBO1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrID0gdGhpcy5jb2xsaXNpb25Hcm91cHNbZ3JvdXBCXS5tYXNrICYgfm1hc2tCO1xyXG4gIH1cclxuICB0aGlzLnVwZGF0ZUNvbGxpc2lvbnMoKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vLyBDaGFuZ2VzIHRoZSBJRCBvZiBhbiBlbnRpdHlcclxuRW5naW5lLnByb3RvdHlwZS5jaGFuZ2VJZCA9IGZ1bmN0aW9uIChlbnRpdHksIGlkKSB7XHJcbiAgZW50aXR5LmlkID0gaWQ7XHJcbn07XHJcblxyXG4vLyBTZWxlY3RzIGFuIGVudGl0eSBhbmQgc2hvd3MgaXRzIHByb3BlcnRpZXMgaW4gdGhlIHNpZGViYXJcclxuRW5naW5lLnByb3RvdHlwZS5zZWxlY3RFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgdGhpcy5zZWxlY3RlZEVudGl0eSA9IGVudGl0eSA9PT0gbnVsbCA/IG51bGwgOiBlbnRpdHk7XHJcbiAgVUkuYnVpbGRTaWRlYmFyKHRoaXMuc2VsZWN0ZWRFbnRpdHkpO1xyXG59O1xyXG5cclxuLy8gVXBkYXRlcyBjb2xsaXNpb24gbWFza3MgZm9yIGFsbCBlbnRpdGllcywgYmFzZWQgb24gZW5naW5lJ3MgY29sbGlzaW9uR3JvdXBzIHRhYmxlXHJcbkVuZ2luZS5wcm90b3R5cGUudXBkYXRlQ29sbGlzaW9ucyA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBlbnRpdGllcyA9IHRoaXMuZW50aXRpZXMoKTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdGhpcy51cGRhdGVDb2xsaXNpb24oZW50aXRpZXNbaV0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vLyBVcGRhdGVzIGNvbGxpc2lvbiBtYXNrIGZvciBhbiBlbnRpdHksIGJhc2VkIG9uIGVuZ2luZSdzIGNvbGxpc2lvbkdyb3VwcyB0YWJsZVxyXG5FbmdpbmUucHJvdG90eXBlLnVwZGF0ZUNvbGxpc2lvbiA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHZhciBmaWx0ZXJEYXRhID0gZW50aXR5LmZpeHR1cmUuR2V0RmlsdGVyRGF0YSgpO1xyXG4gIGZpbHRlckRhdGEuc2V0X21hc2tCaXRzKHRoaXMuY29sbGlzaW9uR3JvdXBzW2VudGl0eS5jb2xsaXNpb25Hcm91cF0ubWFzayk7XHJcbiAgZW50aXR5LmZpeHR1cmUuU2V0RmlsdGVyRGF0YShmaWx0ZXJEYXRhKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vLyBPbmUgc2ltdWxhdGlvbiBzdGVwLiBTaW11bGF0aW9uIGxvZ2ljIGhhcHBlbnMgaGVyZS5cclxuRW5naW5lLnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gRlBTIHRpbWVyXHJcbiAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgY3R4ID0gdGhpcy52aWV3cG9ydC5jb250ZXh0O1xyXG5cclxuICAvLyBjbGVhciBzY3JlZW5cclxuICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMudmlld3BvcnQud2lkdGgsIHRoaXMudmlld3BvcnQuaGVpZ2h0KTtcclxuXHJcbiAgY3R4LnNhdmUoKTtcclxuXHJcbiAgaWYgKCFfZW5naW5lLndvcmxkLnBhdXNlZCkge1xyXG4gICAgLy8gYm94MmQgc2ltdWxhdGlvbiBzdGVwXHJcbiAgICB0aGlzLndvcmxkLlN0ZXAoMSAvIDYwLCAxMCwgNSk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgdGhpcy5zZWxlY3RlZFRvb2wub25tb3ZlKGN0eCk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIGRyYXcgYWxsIGVudGl0aWVzXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLkxBWUVSU19OVU1CRVI7IGkrKylcclxuICB7XHJcbiAgICB0aGlzLmRyYXdBcnJheSh0aGlzLmxheWVyc1tpXSwgY3R4KTtcclxuICB9XHJcblxyXG4gIC8vIFJlbGVhc2VkIGtleXMgYXJlIG9ubHkgdG8gYmUgcHJvY2Vzc2VkIG9uY2VcclxuICBJbnB1dC5tb3VzZS5jbGVhblVwKCk7XHJcbiAgSW5wdXQua2V5Ym9hcmQuY2xlYW5VcCgpO1xyXG5cclxuICB2YXIgZW5kID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgLy8gQ2FsbCBuZXh0IHN0ZXBcclxuICBzZXRUaW1lb3V0KHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgICBfZW5naW5lLnN0ZXAoKVxyXG4gIH0pLCBNYXRoLm1pbig2MCAtIGVuZCAtIHN0YXJ0LCAwKSk7XHJcbn07XHJcblxyXG5FbmdpbmUucHJvdG90eXBlLmRyYXdBcnJheSA9IGZ1bmN0aW9uKGFycmF5LCBjdHgpIHtcclxuICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHgudHJhbnNsYXRlKFxyXG4gICAgICAtdGhpcy52aWV3cG9ydC54IC8gdGhpcy52aWV3cG9ydC5zY2FsZSArIHRoaXMudmlld3BvcnQud2lkdGggLyAyLFxyXG4gICAgICAtdGhpcy52aWV3cG9ydC55IC8gdGhpcy52aWV3cG9ydC5zY2FsZSArIHRoaXMudmlld3BvcnQuaGVpZ2h0IC8gMik7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gYXJyYXlbaV0uY29sb3I7XHJcblxyXG4gICAgaWYodGhpcy5zZWxlY3RlZEVudGl0eSA9PT0gYXJyYXlbaV0pIHtcclxuICAgICAgY3R4LnNoYWRvd0NvbG9yID0gXCJibGFja1wiO1xyXG4gICAgICBjdHguc2hhZG93Qmx1ciA9IDEwO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB4ID0gYXJyYXlbaV0uYm9keS5HZXRQb3NpdGlvbigpLmdldF94KCk7XHJcbiAgICB2YXIgeSA9IGFycmF5W2ldLmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpO1xyXG4gICAgY3R4LnRyYW5zbGF0ZSh4IC8gdGhpcy52aWV3cG9ydC5zY2FsZSwgeSAvIHRoaXMudmlld3BvcnQuc2NhbGUpO1xyXG4gICAgY3R4LnJvdGF0ZShhcnJheVtpXS5ib2R5LkdldEFuZ2xlKCkpO1xyXG5cclxuICAgIGFycmF5W2ldLmRyYXcoY3R4KTtcclxuXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG5cclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgYXJyYXlbaV0uYmVoYXZpb3JzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgIHZhciBiZWhhdmlvciA9IGFycmF5W2ldLmJlaGF2aW9yc1tqXTtcclxuXHJcbiAgICAgIGlmIChiZWhhdmlvci5jaGVjayhhcnJheVtpXSkpXHJcbiAgICAgICAgYmVoYXZpb3IucmVzdWx0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW5naW5lOyIsIi8vIEVOVElUWVxyXG52YXIgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlscy5qc1wiKTtcclxuXHJcbmNvbnN0IEFVVE9fQ09MT1JfUkFOR0UgPSBbMCwgMjMwXTtcclxuXHJcbnZhciBFbnRpdHkgPSBmdW5jdGlvbihzaGFwZSwgZml4dHVyZSwgYm9keSwgaWQsIGNvbGxpc2lvbkdyb3VwKSB7XHJcbiAgdGhpcy5pZCA9IGlkO1xyXG4gIHRoaXMuZGVhZCA9IGZhbHNlO1xyXG4gIHRoaXMubGF5ZXIgPSAwO1xyXG5cclxuICB0aGlzLmZpeGVkUm90YXRpb24gPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25Hcm91cCA9IGNvbGxpc2lvbkdyb3VwO1xyXG4gIGlmICh0aGlzLmNvbGxpc2lvbkdyb3VwID09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cCA9IDA7XHJcbiAgfVxyXG5cclxuICB0aGlzLmJlaGF2aW9ycyA9IFtdO1xyXG5cclxuICB0aGlzLmZpeHR1cmUgPSBmaXh0dXJlO1xyXG4gIGlmICh0aGlzLmZpeHR1cmUgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB2YXIgZml4dHVyZSA9IG5ldyBiMkZpeHR1cmVEZWYoKTtcclxuICAgIGZpeHR1cmUuc2V0X2RlbnNpdHkoMTApXHJcbiAgICBmaXh0dXJlLnNldF9mcmljdGlvbigwLjUpO1xyXG4gICAgZml4dHVyZS5zZXRfcmVzdGl0dXRpb24oMC4yKTtcclxuXHJcbiAgICB0aGlzLmZpeHR1cmUgPSBmaXh0dXJlO1xyXG4gIH1cclxuICB0aGlzLmZpeHR1cmUuc2V0X3NoYXBlKHNoYXBlKTtcclxuXHJcbiAgdmFyIGZpbHRlckRhdGEgPSB0aGlzLmZpeHR1cmUuZ2V0X2ZpbHRlcigpO1xyXG4gIGZpbHRlckRhdGEuc2V0X2NhdGVnb3J5Qml0cygxIDw8IGNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgLy8gQ29uc3RydWN0b3IgaXMgY2FsbGVkIHdoZW4gaW5oZXJpdGluZywgc28gd2UgbmVlZCB0byBjaGVjayBmb3IgX2VuZ2luZSBhdmFpbGFiaWxpdHlcclxuICBpZiAodHlwZW9mIF9lbmdpbmUgIT09ICd1bmRlZmluZWQnKVxyXG4gICAgZmlsdGVyRGF0YS5zZXRfbWFza0JpdHMoX2VuZ2luZS5jb2xsaXNpb25Hcm91cHNbdGhpcy5jb2xsaXNpb25Hcm91cF0ubWFzayk7XHJcblxyXG4gIHRoaXMuZml4dHVyZS5zZXRfZmlsdGVyKGZpbHRlckRhdGEpO1xyXG5cclxuICB0aGlzLmJvZHkgPSBib2R5O1xyXG4gIGlmICh0aGlzLmJvZHkgIT09IHVuZGVmaW5lZClcclxuICAgIHRoaXMuYm9keS5zZXRfZml4ZWRSb3RhdGlvbihmYWxzZSk7XHJcblxyXG4gIC8vIEF1dG8gZ2VuZXJhdGUgY29sb3JcclxuICB2YXIgciA9IFV0aWxzLnJhbmRvbVJhbmdlKEFVVE9fQ09MT1JfUkFOR0VbMF0sIEFVVE9fQ09MT1JfUkFOR0VbMV0pLnRvU3RyaW5nKDE2KTsgciA9IHIubGVuZ3RoID09IDEgPyBcIjBcIiArIHIgOiByO1xyXG4gIHZhciBnID0gVXRpbHMucmFuZG9tUmFuZ2UoQVVUT19DT0xPUl9SQU5HRVswXSwgQVVUT19DT0xPUl9SQU5HRVsxXSkudG9TdHJpbmcoMTYpOyBnID0gZy5sZW5ndGggPT0gMSA/IFwiMFwiICsgZyA6IGc7XHJcbiAgdmFyIGIgPSBVdGlscy5yYW5kb21SYW5nZShBVVRPX0NPTE9SX1JBTkdFWzBdLCBBVVRPX0NPTE9SX1JBTkdFWzFdKS50b1N0cmluZygxNik7IGIgPSBiLmxlbmd0aCA9PSAxID8gXCIwXCIgKyBiIDogYjtcclxuICB0aGlzLmNvbG9yID0gXCIjXCIgKyByICArIGcgKyBiIDtcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLmRlYWQgPSB0cnVlO1xyXG5cclxuICBcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcclxuICBhbGVydChcIkVSUk9SISBDYW5ub3QgZHJhdyBFbnRpdHk6IFVzZSBkZXJpdmVkIGNsYXNzZXMuXCIpO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnNldENvbG9yID0gZnVuY3Rpb24oY29sb3IpIHtcclxuICB0aGlzLmNvbG9yID0gY29sb3I7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnNldElkID0gZnVuY3Rpb24oaWQpIHtcclxuICB0aGlzLmlkID0gaWQ7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRDb2xsaXNpb25Hcm91cCA9IGZ1bmN0aW9uKGdyb3VwKSB7XHJcbiAgdGhpcy5jb2xsaXNpb25Hcm91cCA9IGdyb3VwO1xyXG5cclxuICB2YXIgZmlsdGVyRGF0YSA9IHRoaXMuZml4dHVyZS5HZXRGaWx0ZXJEYXRhKCk7XHJcbiAgZmlsdGVyRGF0YS5zZXRfY2F0ZWdvcnlCaXRzKDEgPDwgZ3JvdXApO1xyXG4gIHRoaXMuZml4dHVyZS5TZXRGaWx0ZXJEYXRhKGZpbHRlckRhdGEpO1xyXG5cclxuICBfZW5naW5lLnVwZGF0ZUNvbGxpc2lvbih0aGlzKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZ2V0TGluZWFyVmVsb2NpdHkgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5ib2R5LkdldExpbmVhclZlbG9jaXR5KCk7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZ2V0TWFzcyA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBNYXRoLm1heCgxLCB0aGlzLmJvZHkuR2V0TWFzcygpKTtcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRMaW5lYXJWZWxvY2l0eSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gIHRoaXMuYm9keS5TZXRMaW5lYXJWZWxvY2l0eSh2ZWN0b3IpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5hcHBseVRvcnF1ZSA9IGZ1bmN0aW9uKGZvcmNlKSB7XHJcbiAgdGhpcy5ib2R5LkFwcGx5VG9ycXVlKGZvcmNlKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuYXBwbHlMaW5lYXJJbXB1bHNlID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgdGhpcy5ib2R5LkFwcGx5TGluZWFySW1wdWxzZSh2ZWN0b3IsIHRoaXMuYm9keS5HZXRXb3JsZENlbnRlcigpKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZGlzYWJsZVJvdGF0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICB0aGlzLmZpeGVkUm90YXRpb24gPSB2YWx1ZTtcclxuICB0aGlzLmJvZHkuU2V0Rml4ZWRSb3RhdGlvbih2YWx1ZSlcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuYWRkQmVoYXZpb3IgPSBmdW5jdGlvbihiZWhhdmlvcikge1xyXG4gIHRoaXMuYmVoYXZpb3JzLnB1c2goYmVoYXZpb3IpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW50aXR5OyIsInZhciBFbnRpdHlGaWx0ZXIgPSByZXF1aXJlKFwiLi90b2tlbi5qc1wiKS5FbnRpdHlGaWx0ZXI7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFtdO1xyXG5cclxudmFyIGVmQnlJZCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgRW50aXR5RmlsdGVyLmNhbGwodGhpcywgXCJmaWx0ZXJCeUlkXCIsIGFyZ3VtZW50cywgW1R5cGUuU1RSSU5HXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGlkKTtcclxufTtcclxuZWZCeUlkLnByb3RvdHlwZSA9IG5ldyBFbnRpdHlGaWx0ZXIoKTtcclxuXHJcbmVmQnlJZC5wcm90b3R5cGUuZGVjaWRlID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgcmV0dXJuIGVudGl0eS5pZCA9PT0gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCk7XHJcbn07XHJcblxyXG5lZkJ5SWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gZWZCeUlkO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGVmQnlJZCk7XHJcblxyXG5cclxudmFyIGVmQnlDb2xsaXNpb25Hcm91cCA9IGZ1bmN0aW9uKGdyb3VwKSB7XHJcbiAgRW50aXR5RmlsdGVyLmNhbGwodGhpcywgXCJmaWx0ZXJCeUdyb3VwXCIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGdyb3VwKTtcclxufTtcclxuZWZCeUNvbGxpc2lvbkdyb3VwLnByb3RvdHlwZSA9IG5ldyBFbnRpdHlGaWx0ZXIoKTtcclxuXHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUuZGVjaWRlID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgcmV0dXJuIGVudGl0eS5jb2xsaXNpb25Hcm91cCArIDEgPT09IHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xyXG59O1xyXG5cclxuZWZCeUNvbGxpc2lvbkdyb3VwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGVmQnlDb2xsaXNpb25Hcm91cDtcclxubW9kdWxlLmV4cG9ydHMucHVzaChlZkJ5Q29sbGlzaW9uR3JvdXApO1xyXG5cclxuXHJcbnZhciBlZkJ5TGF5ZXIgPSBmdW5jdGlvbihsYXllcikge1xyXG4gIEVudGl0eUZpbHRlci5jYWxsKHRoaXMsIFwiZmlsdGVyQnlMYXllclwiLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChsYXllcik7XHJcbn07XHJcbmVmQnlMYXllci5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcblxyXG5lZkJ5TGF5ZXIucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkubGF5ZXIgKyAxID09PSB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKTtcclxufTtcclxuXHJcbmVmQnlMYXllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBlZkJ5TGF5ZXI7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goZWZCeUxheWVyKTsiLCJyZXF1aXJlKFwiLi9pbnB1dC5qc1wiKTtcclxuXHJcbnZhciBFbmdpbmUgPSByZXF1aXJlKFwiLi9lbmdpbmUuanNcIik7XHJcbnZhciBWaWV3cG9ydCA9IHJlcXVpcmUoXCIuL3ZpZXdwb3J0LmpzXCIpO1xyXG52YXIgVUkgPSByZXF1aXJlKFwiLi91aS5qc1wiKTtcclxudmFyIEJvZHlUeXBlID0gcmVxdWlyZShcIi4vYm9keXR5cGUuanNcIik7XHJcbnZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xyXG5cclxudmFyIENpcmNsZSA9IHJlcXVpcmUoXCIuL3NoYXBlcy5qc1wiKS5DaXJjbGU7XHJcbnZhciBSZWN0YW5nbGUgPSByZXF1aXJlKFwiLi9zaGFwZXMuanNcIikuUmVjdGFuZ2xlO1xyXG5cclxuVUkuaW5pdGlhbGl6ZSgpO1xyXG5cclxud2luZG93Ll9lbmdpbmUgPSBuZXcgRW5naW5lKG5ldyBWaWV3cG9ydCgkKFwiI21haW5DYW52YXNcIilbMF0pLCBuZXcgYjJWZWMyKDAsIDIwKSk7XHJcblxyXG5cclxuX2VuZ2luZS5hZGRFbnRpdHkobmV3IENpcmNsZShuZXcgYjJWZWMyKDAsIDApLCAyKSwgQm9keVR5cGUuRFlOQU1JQ19CT0RZKVxyXG4gIC5zZXRDb2xsaXNpb25Hcm91cCgyKVxyXG4gIC5zZXRJZChcImtydWhcIilcclxuICAuZGlzYWJsZVJvdGF0aW9uKGZhbHNlKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwiaXNCdXR0b25Eb3duKCBudW1iZXIoIDM3ICkgKVwiKSxcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwic2V0TGluZWFyVmVsb2NpdHkoIGZpbHRlckJ5SWQoIHRleHQoIGtydWggKSApLCBudW1iZXIoIC0xMCApLCBnZXRWZWxvY2l0eVkoIGZpbHRlckJ5SWQoIHRleHQoIGtydWggKSApICkgKVwiKVxyXG4gICAgKVxyXG4gIClcclxuICAuYWRkQmVoYXZpb3IoXHJcbiAgICBuZXcgQmVoYXZpb3IoXHJcbiAgICAgIF9lbmdpbmUudG9rZW5NYW5hZ2VyLnBhcnNlci5wYXJzZShcImlzQnV0dG9uRG93bihudW1iZXIoMzkpKVwiKSxcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwic2V0TGluZWFyVmVsb2NpdHkoIGZpbHRlckJ5SWQoIHRleHQoIGtydWggKSApLCBudW1iZXIoIDEwICksIGdldFZlbG9jaXR5WSggZmlsdGVyQnlJZCggdGV4dCgga3J1aCApICkgKSApXCIpXHJcbiAgICApXHJcbiAgKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwiaXNCdXR0b25Eb3duKG51bWJlcigzOCkpXCIpLFxyXG4gICAgICBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UoXCJzZXRMaW5lYXJWZWxvY2l0eSggZmlsdGVyQnlJZCggdGV4dCgga3J1aCApICksIGdldFZlbG9jaXR5WCggZmlsdGVyQnlJZCggdGV4dCgga3J1aCApICkgKSwgbnVtYmVyKCAtMTAgKSApXCIpXHJcbiAgICApXHJcbiAgKTtcclxuXHJcbl9lbmdpbmUuYWRkRW50aXR5KG5ldyBSZWN0YW5nbGUobmV3IGIyVmVjMigwLCAxNSksIG5ldyBiMlZlYzIoMjAsIDAuMikpLCBCb2R5VHlwZS5LSU5FTUFUSUNfQk9EWSlcclxuICAuc2V0SWQoXCJwbGF0Zm9ybVwiKVxyXG4gIC5zZXRDb2xsaXNpb25Hcm91cCgxKTtcclxuXHJcbndpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgX2VuZ2luZS5zdGVwKCk7XHJcbn0pO1xyXG5cclxuXHJcblxyXG5cclxuIiwiLy8gSU5QVVQgQ0FQVFVSSU5HXHJcblxyXG53aW5kb3cuSW5wdXQgPSB7XHJcbiAgZWxlbWVudDogbnVsbCxcclxuXHJcbiAgbW91c2U6IHtcclxuICAgIHg6IDAsXHJcbiAgICB5OiAwLFxyXG4gICAgY2FudmFzWDogMCxcclxuICAgIGNhbnZhc1k6IDAsXHJcbiAgICByZWFsWDogMCxcclxuICAgIHJlYWxZOiAwLFxyXG4gICAgbGVmdERvd246IGZhbHNlLFxyXG4gICAgcmlnaHREb3duOiBmYWxzZSxcclxuICAgIGxlZnRVcDogZmFsc2UsXHJcbiAgICByaWdodFVwOiBmYWxzZSxcclxuXHJcbiAgICB1cGRhdGVQb3NpdGlvbjogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHRoaXMuY2FudmFzWSA9IGV2ZW50LnBhZ2VZIC0gSW5wdXQuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgIHRoaXMuY2FudmFzWCA9IGV2ZW50LnBhZ2VYIC0gSW5wdXQuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gICAgICB0aGlzLnggPSB0aGlzLmNhbnZhc1ggKiBfZW5naW5lLnZpZXdwb3J0LnNjYWxlICsgX2VuZ2luZS52aWV3cG9ydC54IC0gKF9lbmdpbmUudmlld3BvcnQud2lkdGggKiBfZW5naW5lLnZpZXdwb3J0LnNjYWxlKSAvIDI7XHJcbiAgICAgIHRoaXMueSA9IHRoaXMuY2FudmFzWSAqIF9lbmdpbmUudmlld3BvcnQuc2NhbGUgKyBfZW5naW5lLnZpZXdwb3J0LnkgLSAoX2VuZ2luZS52aWV3cG9ydC5oZWlnaHQgKiBfZW5naW5lLnZpZXdwb3J0LnNjYWxlKSAvIDI7XHJcbiAgICAgIHRoaXMucmVhbFggPSBldmVudC5wYWdlWDtcclxuICAgICAgdGhpcy5yZWFsWSA9IGV2ZW50LnBhZ2VZO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVCdXR0b25zRG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMSlcclxuICAgICAgICB0aGlzLmxlZnREb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMylcclxuICAgICAgICB0aGlzLnJpZ2h0RG93biA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUJ1dHRvbnNVcDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMSkge1xyXG4gICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmxlZnRVcCA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMykge1xyXG4gICAgICAgIHRoaXMucmlnaHREb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yaWdodFVwID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhblVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMubGVmdFVwID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucmlnaHRVcCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGtleWJvYXJkOiB7XHJcbiAgICBkb3duOiBuZXcgU2V0KCksXHJcbiAgICB1cDogbmV3IFNldCgpLFxyXG5cclxuICAgIGlzRG93bjogZnVuY3Rpb24gKGtleUNvZGUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZG93bi5oYXMoa2V5Q29kZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzVXA6IGZ1bmN0aW9uIChrZXlDb2RlKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnVwLmhhcyhrZXlDb2RlKTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc0Rvd246IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICB0aGlzLmRvd24uYWRkKGV2ZW50LndoaWNoKTtcclxuXHJcbiAgICAgIGlmKGV2ZW50LndoaWNoID09PSAzMilcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVCdXR0b25zVXA6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICB0aGlzLmRvd24uZGVsZXRlKGV2ZW50LndoaWNoKTtcclxuICAgICAgdGhpcy51cC5hZGQoZXZlbnQud2hpY2gpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhblVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMudXAuY2xlYXIoKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBpbml0aWFsaXplOiBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG5cclxuICAgIGRvY3VtZW50Lm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICBJbnB1dC5tb3VzZS51cGRhdGVQb3NpdGlvbihlKTtcclxuICAgIH07XHJcbiAgICBkb2N1bWVudC5vbm1vdXNlZG93biA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgSW5wdXQubW91c2UudXBkYXRlQnV0dG9uc0Rvd24oZSk7XHJcbiAgICB9O1xyXG4gICAgZG9jdW1lbnQub25tb3VzZXVwID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICBJbnB1dC5tb3VzZS51cGRhdGVCdXR0b25zVXAoZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50Lm9ua2V5ZG93biA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgSW5wdXQua2V5Ym9hcmQudXBkYXRlQnV0dG9uc0Rvd24oZSk7XHJcbiAgICB9O1xyXG4gICAgZG9jdW1lbnQub25rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgSW5wdXQua2V5Ym9hcmQudXBkYXRlQnV0dG9uc1VwKGUpO1xyXG4gICAgfTtcclxuICAgIGRvY3VtZW50Lm9uc2VsZWN0c3RhcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG4iLCJ2YXIgTG9naWMgPSByZXF1aXJlKFwiLi90b2tlbi5qc1wiKS5Mb2dpYztcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XG52YXIgRml4VHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5GaXhUeXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFtdO1xuXG52YXIgbEFuZCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJBTkRcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLkJPT0xFQU4sIFR5cGUuQk9PTEVBTl0pO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xufTtcbmxBbmQucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxBbmQucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICYmIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcbn07XG5cbmxBbmQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbEFuZDtcbm1vZHVsZS5leHBvcnRzLnB1c2gobEFuZCk7XG5cblxudmFyIGxPciA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJPUlwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuQk9PTEVBTiwgVHlwZS5CT09MRUFOXSk7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG59O1xubE9yLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sT3IucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgfHwgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxubE9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxPcjtcbm1vZHVsZS5leHBvcnRzLnB1c2gobE9yKTtcblxuXG52YXIgbE5vdCA9IGZ1bmN0aW9uIChhKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJOT1RcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLkJPT0xFQU5dKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbn07XG5sTm90LnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sTm90LnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICF0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKTtcbn07XG5cbmxOb3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE5vdDtcbm1vZHVsZS5leHBvcnRzLnB1c2gobE5vdCk7XG5cblxudmFyIGxTdHJpbmcgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcInRleHRcIiwgVHlwZS5TVFJJTkcsIGFyZ3VtZW50cywgW1R5cGUuTElURVJBTF0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKHZhbHVlKTtcbn07XG5sU3RyaW5nLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sU3RyaW5nLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXTtcbn07XG5cbmxTdHJpbmcucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmxTdHJpbmcucHJvdG90eXBlLnBvcHVsYXRlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmFyZ3NbMF0gPSBwcm9tcHQoVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWQoMjQpICsgdGhpcy5uYW1lKTtcbiAgdGhpcy5hcmdzWzBdID0gdGhpcy5hcmdzWzBdID09PSBudWxsID8gXCJcIiA6IHRoaXMuYXJnc1swXTtcbn07XG5cbmxTdHJpbmcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFN0cmluZztcbm1vZHVsZS5leHBvcnRzLnB1c2gobFN0cmluZyk7XG5cblxudmFyIGxOdW1iZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIm51bWJlclwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5MSVRFUkFMXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2godmFsdWUpO1xufTtcbmxOdW1iZXIucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxOdW1iZXIucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLmFyZ3NbMF0pO1xufTtcblxubE51bWJlci5wcm90b3R5cGUudmFsaWRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAkLmlzTnVtZXJpYyh0aGlzLmFyZ3NbMF0pO1xufTtcblxubE51bWJlci5wcm90b3R5cGUucG9wdWxhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuYXJnc1swXSA9IHByb21wdChUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZCgyNCkgKyB0aGlzLm5hbWUpO1xufTtcblxubE51bWJlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTnVtYmVyO1xubW9kdWxlLmV4cG9ydHMucHVzaChsTnVtYmVyKTtcblxuXG52YXIgbFRydWUgPSBmdW5jdGlvbiAoKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJ0cnVlXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbXSk7XG59O1xubFRydWUucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxUcnVlLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5sVHJ1ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsVHJ1ZTtcbm1vZHVsZS5leHBvcnRzLnB1c2gobFRydWUpO1xuXG5cbnZhciBsRmFsc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImZhbHNlXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbXSk7XG59O1xubEZhbHNlLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sRmFsc2UucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZmFsc2U7XG59O1xuXG5sRmFsc2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbEZhbHNlO1xubW9kdWxlLmV4cG9ydHMucHVzaChsRmFsc2UpO1xuXG5cbnZhciBsQnV0dG9uRG93biA9IGZ1bmN0aW9uIChidXR0b24pIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImlzQnV0dG9uRG93blwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYnV0dG9uKTtcbn07XG5sQnV0dG9uRG93bi5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubEJ1dHRvbkRvd24ucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gSW5wdXQua2V5Ym9hcmQuaXNEb3duKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpKTtcbn07XG5cbmxCdXR0b25Eb3duLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxCdXR0b25Eb3duO1xubW9kdWxlLmV4cG9ydHMucHVzaChsQnV0dG9uRG93bik7XG5cblxudmFyIGxCdXR0b25VcCA9IGZ1bmN0aW9uIChidXR0b24pIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImlzQnV0dG9uVXBcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGJ1dHRvbik7XG59O1xubEJ1dHRvblVwLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sQnV0dG9uVXAucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gSW5wdXQua2V5Ym9hcmQuaXNVcCh0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSk7XG59O1xuXG5sQnV0dG9uVXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbEJ1dHRvblVwO1xubW9kdWxlLmV4cG9ydHMucHVzaChsQnV0dG9uVXApO1xuXG5cbnZhciBsUmFuZG9tID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJyYW5kb21OdW1iZXJcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKG1pbik7XG4gIHRoaXMuYXJncy5wdXNoKG1heCk7XG59O1xubFJhbmRvbS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubFJhbmRvbS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBVdGlscy5yYW5kb21SYW5nZSh0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSAmJiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XG59O1xuXG5sUmFuZG9tLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxSYW5kb207XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxSYW5kb20pO1xuXG5cbnZhciBsVmVsb2NpdHlYID0gZnVuY3Rpb24gKGVmKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJnZXRWZWxvY2l0eVhcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xufTtcbmxWZWxvY2l0eVgucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxWZWxvY2l0eVgucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZW50aXR5ID0gdGhpcy5hcmdzWzBdLmZpbHRlcigpWzBdO1xuXG4gIHJldHVybiBlbnRpdHkuYm9keS5HZXRMaW5lYXJWZWxvY2l0eSgpLmdldF94KCk7XG59O1xuXG5sVmVsb2NpdHlYLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxWZWxvY2l0eVg7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxWZWxvY2l0eVgpO1xuXG5cbnZhciBsVmVsb2NpdHlZID0gZnVuY3Rpb24gKGVmKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCJnZXRWZWxvY2l0eVlcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xufTtcbmxWZWxvY2l0eVkucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxWZWxvY2l0eVkucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZW50aXR5ID0gdGhpcy5hcmdzWzBdLmZpbHRlcigpWzBdO1xuXG4gIHJldHVybiBlbnRpdHkuYm9keS5HZXRMaW5lYXJWZWxvY2l0eSgpLmdldF95KCk7XG59O1xuXG5sVmVsb2NpdHlZLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxWZWxvY2l0eVk7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxWZWxvY2l0eVkpO1xuXG5cbnZhciBsUGx1cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCIrXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcbn07XG5sUGx1cy5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubFBsdXMucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgKyB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKTtcbn07XG5cbmxQbHVzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxQbHVzO1xubW9kdWxlLmV4cG9ydHMucHVzaChsUGx1cyk7XG5cblxudmFyIGxNdWx0aXBseSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCIqXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcbn07XG5sTXVsdGlwbHkucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxNdWx0aXBseS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpO1xufTtcblxubE11bHRpcGx5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxNdWx0aXBseTtcbm1vZHVsZS5leHBvcnRzLnB1c2gobE11bHRpcGx5KTtcblxuXG52YXIgbERpdmlkZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCIvXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcbn07XG5sRGl2aWRlLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sRGl2aWRlLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpIC8gdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59O1xuXG5sRGl2aWRlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxEaXZpZGU7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxEaXZpZGUpO1xuXG5cbnZhciBsTWludXMgPSBmdW5jdGlvbiAoYSwgYikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiLVwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYSk7XG4gIHRoaXMuYXJncy5wdXNoKGIpO1xuXG4gIHRoaXMuZml4VHlwZSA9IEZpeFR5cGUuSU5GSVg7XG59O1xubE1pbnVzLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sTWludXMucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgKyB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKTtcbn07XG5cbmxNaW51cy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTWludXM7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxNaW51cyk7IiwidmFyIEZpeFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmdcIikuRml4VHlwZTtcclxudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmdcIikuVHlwZTtcclxuXHJcbnZhciBUeXBlRXhjZXB0aW9uID0gZnVuY3Rpb24oZXhwZWN0ZWQsIHJlY2VpdmVkLCB0b2tlbikge1xyXG4gIHRoaXMuZXhwZWN0ZWQgPSBleHBlY3RlZDtcclxuICB0aGlzLnJlY2VpdmVkID0gcmVjZWl2ZWQ7XHJcbiAgdGhpcy50b2tlbiA9IHRva2VuO1xyXG59O1xyXG5cclxudmFyIFBhcnNlciA9IGZ1bmN0aW9uICh0b2tlbk1hbmFnZXIpIHtcclxuICB0aGlzLnRva2VuTWFuYWdlciA9IHRva2VuTWFuYWdlcjtcclxuXHJcbiAgdGhpcy5zdG9wQ2hhcnMgPSBbXCIoXCIsIFwiKVwiLCBcIixcIl07XHJcblxyXG4gIHRoaXMucGFyc2VySW5wdXQgPSBcIlwiO1xyXG4gIHRoaXMucGFyc2VySW5wdXRXaG9sZSA9IFwiXCI7XHJcbiAgdGhpcy5wYXJzZXJTdGFjayA9IFtdO1xyXG59O1xyXG5cclxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgdGhpcy5wYXJzZXJJbnB1dCA9IGlucHV0O1xyXG4gIHRoaXMucGFyc2VySW5wdXRXaG9sZSA9IGlucHV0O1xyXG4gIHRoaXMucGFyc2VyU3RhY2sgPSBbXTtcclxuXHJcbiAgZG8ge1xyXG4gICAgdGhpcy5wYXJzZVN0ZXAoKTtcclxuICB9IHdoaWxlICh0aGlzLnBhcnNlcklucHV0Lmxlbmd0aCk7XHJcblxyXG4gIHZhciByZXQgPSB0aGlzLnBhcnNlclN0YWNrLnBvcCgpO1xyXG5cclxuICBpZiAodGhpcy5wYXJzZXJTdGFjay5sZW5ndGgpXHJcbiAgICB0aHJvdyBcIlVuZXhwZWN0ZWQgXCIgKyByZXQubmFtZTtcclxuXHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcblBhcnNlci5wcm90b3R5cGUucmVhZFdoaXRlc3BhY2UgPSBmdW5jdGlvbigpIHtcclxuICB3aGlsZSAoL1xccy8udGVzdCh0aGlzLnBhcnNlcklucHV0WzBdKSAmJiB0aGlzLnBhcnNlcklucHV0Lmxlbmd0aCkge1xyXG4gICAgdGhpcy5wYXJzZXJJbnB1dCA9IHRoaXMucGFyc2VySW5wdXQuc2xpY2UoMSk7XHJcbiAgfVxyXG59O1xyXG5cclxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZU5hbWUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gIHZhciByZXQgPSBcIlwiO1xyXG5cclxuICB3aGlsZSAoIS9cXHMvLnRlc3QodGhpcy5wYXJzZXJJbnB1dFswXSkgJiYgdGhpcy5wYXJzZXJJbnB1dC5sZW5ndGggJiYgdGhpcy5zdG9wQ2hhcnMuaW5kZXhPZih0aGlzLnBhcnNlcklucHV0WzBdKSA9PT0gLTEpIC8vIHJlYWQgdW50aWwgYSB3aGl0ZXNwYWNlIG9jY3Vyc1xyXG4gIHtcclxuICAgIHJldCArPSB0aGlzLnBhcnNlcklucHV0WzBdO1xyXG4gICAgdGhpcy5wYXJzZXJJbnB1dCA9IHRoaXMucGFyc2VySW5wdXQuc2xpY2UoMSk7XHJcbiAgfVxyXG5cclxuICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5QYXJzZXIucHJvdG90eXBlLnJlYWRDaGFyID0gZnVuY3Rpb24oY2hhcikge1xyXG4gIHRoaXMucmVhZFdoaXRlc3BhY2UoKTtcclxuXHJcbiAgaWYgKHRoaXMucGFyc2VySW5wdXRbMF0gIT09IGNoYXIpIHtcclxuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMucGFyc2VySW5wdXRXaG9sZS5sZW5ndGggLSB0aGlzLnBhcnNlcklucHV0Lmxlbmd0aDtcclxuICAgIHRocm93IFwiRXhwZWN0ZWQgJ1wiICsgY2hhciArIFwiJyBhdCBwb3NpdGlvbiBcIiArIHBvc2l0aW9uICsgXCIgYXQgJ1wiICsgdGhpcy5wYXJzZXJJbnB1dFdob2xlLnN1YnN0cihwb3NpdGlvbikgKyBcIidcIjtcclxuICB9XHJcblxyXG4gIHRoaXMucGFyc2VySW5wdXQgPSB0aGlzLnBhcnNlcklucHV0LnNsaWNlKDEpO1xyXG5cclxuICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcbn07XHJcblxyXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlU3RlcCA9IGZ1bmN0aW9uKGV4cGVjdGVkVHlwZSkge1xyXG4gIHZhciBuYW1lID0gdGhpcy5wYXJzZU5hbWUoKTtcclxuICB2YXIgdG9rZW4gPSB0aGlzLnRva2VuTWFuYWdlci5nZXRUb2tlbkJ5TmFtZShuYW1lKTtcclxuXHJcbiAgaWYgKHRva2VuID09PSB1bmRlZmluZWQgJiYgKGV4cGVjdGVkVHlwZSA9PT0gVHlwZS5MSVRFUkFMIHx8IGV4cGVjdGVkVHlwZSA9PSB1bmRlZmluZWQpKSB7XHJcbiAgICB0aGlzLnBhcnNlclN0YWNrLnB1c2gobmFtZSk7XHJcbiAgICByZXR1cm4gbmFtZTtcclxuICB9XHJcblxyXG4gIGlmICh0b2tlbiA9PSB1bmRlZmluZWQgJiYgZXhwZWN0ZWRUeXBlICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHRocm93IFwiRXhwZWN0ZWQgYXJndW1lbnQgd2l0aCB0eXBlIFwiICsgZXhwZWN0ZWRUeXBlO1xyXG4gIH1cclxuXHJcbiAgaWYgKGV4cGVjdGVkVHlwZSAhPT0gdW5kZWZpbmVkICYmIHRva2VuLnR5cGUgIT09IGV4cGVjdGVkVHlwZSkge1xyXG4gICAgdGhyb3cgXCJVbmV4cGVjdGVkIFwiICsgdG9rZW4udHlwZSArIFwiICh3YXMgZXhwZWN0aW5nIFwiICsgZXhwZWN0ZWRUeXBlICsgXCIpXCI7XHJcbiAgfVxyXG5cclxuICB2YXIgbnVtQXJncyA9IHRva2VuLmFyZ3VtZW50X3R5cGVzLmxlbmd0aDtcclxuXHJcbiAgdmFyIGFyZ3MgPSBbXTtcclxuXHJcbiAgaWYgKHRva2VuLmZpeFR5cGUgPT09IEZpeFR5cGUuSU5GSVgpIHtcclxuICAgIHZhciBhID0gdGhpcy5wYXJzZXJTdGFjay5wb3AoKTtcclxuXHJcbiAgICBpZiAoYS50eXBlICE9PSB0b2tlbi5hcmd1bWVudF90eXBlc1swXSlcclxuICAgICAgdGhyb3cgXCJVbmV4cGVjdGVkIFwiICsgYS50eXBlICsgXCIgKHdhcyBleHBlY3RpbmcgXCIgKyB0b2tlbi5hcmd1bWVudF90eXBlc1swXSArIFwiKVwiO1xyXG5cclxuICAgIGFyZ3MgPSBbYSwgdGhpcy5wYXJzZVN0ZXAodG9rZW4uYXJndW1lbnRfdHlwZXNbMV0pXTtcclxuICAgIHRoaXMucGFyc2VyU3RhY2sucG9wKCk7XHJcbiAgfVxyXG5cclxuICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5QUkVGSVgpIHtcclxuICAgIHRoaXMucmVhZENoYXIoXCIoXCIpO1xyXG5cclxuICAgIHdoaWxlKHRoaXMucGFyc2VySW5wdXRbMF0gIT09IFwiKVwiKSB7XHJcbiAgICAgIHRoaXMucmVhZFdoaXRlc3BhY2UoKTtcclxuXHJcbiAgICAgIHRoaXMucGFyc2VTdGVwKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5wYXJzZXJJbnB1dFswXSA9PT0gXCIsXCIpXHJcbiAgICAgICAgdGhpcy5wYXJzZXJJbnB1dCA9IHRoaXMucGFyc2VySW5wdXQuc2xpY2UoMSk7XHJcblxyXG4gICAgICB0aGlzLnJlYWRXaGl0ZXNwYWNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IG51bUFyZ3M7IGkrKykge1xyXG4gICAgICB2YXIgZXhwZWN0ZWRBcmcgPSB0b2tlbi5hcmd1bWVudF90eXBlc1t0b2tlbi5hcmd1bWVudF90eXBlcy5sZW5ndGggLSBpIC0gMV07XHJcbiAgICAgIHZhciBhY3R1YWxBcmcgPSB0aGlzLnBhcnNlclN0YWNrW3RoaXMucGFyc2VyU3RhY2subGVuZ3RoIC0gMV0udHlwZTtcclxuXHJcbiAgICAgIGlmIChleHBlY3RlZEFyZyAhPT0gVHlwZS5MSVRFUkFMICYmIGFjdHVhbEFyZyAhPT0gZXhwZWN0ZWRBcmcpXHJcbiAgICAgIHtcclxuICAgICAgICB0aHJvdyBcIlVuZXhwZWN0ZWQgXCIgKyBhY3R1YWxBcmcgK1xyXG4gICAgICAgICAgXCIgKHdhcyBleHBlY3RpbmcgXCIgKyBleHBlY3RlZEFyZyArIFwiKVwiO1xyXG4gICAgICB9XHJcbiAgICAgIGFyZ3MucHVzaCh0aGlzLnBhcnNlclN0YWNrLnBvcCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBhcmdzLnJldmVyc2UoKTtcclxuXHJcbiAgICB0aGlzLnJlYWRDaGFyKFwiKVwiKTtcclxuICB9XHJcblxyXG4gIHZhciBuZXdUb2tlbiA9IG5ldyB0b2tlbi5jb25zdHJ1Y3RvcigpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgbmV3VG9rZW4uYXJnc1tpXSA9IGFyZ3NbaV07XHJcbiAgfVxyXG4gIHRoaXMucGFyc2VyU3RhY2sucHVzaChuZXdUb2tlbik7XHJcblxyXG4gIHJldHVybiBuZXdUb2tlbjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyOyIsInZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi9lbnRpdHkuanNcIik7XHJcblxyXG4vLyBDaXJjbGUgZW50aXR5XHJcbnZhciBDaXJjbGUgPSBmdW5jdGlvbihjZW50ZXIsIHJhZGl1cywgZml4dHVyZSwgaWQsIGNvbGxpc2lvbkdyb3VwKSB7XHJcbiAgdmFyIHNoYXBlID0gbmV3IGIyQ2lyY2xlU2hhcGUoKTtcclxuICBzaGFwZS5zZXRfbV9yYWRpdXMocmFkaXVzKTtcclxuXHJcbiAgdmFyIGJvZHkgPSBuZXcgYjJCb2R5RGVmKCk7XHJcbiAgYm9keS5zZXRfcG9zaXRpb24oY2VudGVyKTtcclxuXHJcbiAgRW50aXR5LmNhbGwodGhpcywgc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5DaXJjbGUucHJvdG90eXBlID0gbmV3IEVudGl0eSgpO1xyXG5DaXJjbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2lyY2xlO1xyXG5cclxuQ2lyY2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY3R4KSB7XHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG5cclxuICBjdHguYXJjKDAsIDAsIHRoaXMucmFkaXVzIC8gX2VuZ2luZS52aWV3cG9ydC5zY2FsZSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuXHJcbiAgY3R4LmZpbGwoKTtcclxuXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcclxuICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gXCJkZXN0aW5hdGlvbi1vdXRcIjtcclxuXHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5tb3ZlVG8oMCwgMCk7XHJcbiAgY3R4LmxpbmVUbygwLCB0aGlzLnJhZGl1cyAvIF9lbmdpbmUudmlld3BvcnQuc2NhbGUpO1xyXG4gIGN0eC5zdHJva2UoKTtcclxuICBjdHguY2xvc2VQYXRoKCk7XHJcbn07XHJcblxyXG5cclxuLy8gUmVjdGFuZ2xlIGVudGl0eVxyXG52YXIgUmVjdGFuZ2xlID0gZnVuY3Rpb24oY2VudGVyLCBleHRlbnRzLCBmaXh0dXJlLCBpZCwgY29sbGlzaW9uR3JvdXApIHtcclxuICB2YXIgc2hhcGUgPSBuZXcgYjJQb2x5Z29uU2hhcGUoKTtcclxuICBzaGFwZS5TZXRBc0JveChleHRlbnRzLmdldF94KCksIGV4dGVudHMuZ2V0X3koKSk7XHJcblxyXG4gIHZhciBib2R5ID0gbmV3IGIyQm9keURlZigpO1xyXG4gIGJvZHkuc2V0X3Bvc2l0aW9uKGNlbnRlcik7XHJcblxyXG4gIEVudGl0eS5jYWxsKHRoaXMsIHNoYXBlLCBmaXh0dXJlLCBib2R5LCBpZCwgY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICB0aGlzLmV4dGVudHMgPSBleHRlbnRzO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuUmVjdGFuZ2xlLnByb3RvdHlwZSA9IG5ldyBFbnRpdHkoKTtcclxuUmVjdGFuZ2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlY3RhbmdsZTtcclxuXHJcblJlY3RhbmdsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGN0eCkge1xyXG4gIHZhciBoYWxmV2lkdGggPSB0aGlzLmV4dGVudHMuZ2V0X3goKSAvIF9lbmdpbmUudmlld3BvcnQuc2NhbGU7XHJcbiAgdmFyIGhhbGZIZWlnaHQgPSB0aGlzLmV4dGVudHMuZ2V0X3koKSAvIF9lbmdpbmUudmlld3BvcnQuc2NhbGU7XHJcblxyXG4gIGN0eC5maWxsUmVjdCgtaGFsZldpZHRoLCAtaGFsZkhlaWdodCwgaGFsZldpZHRoICogMiwgaGFsZkhlaWdodCAqIDIpO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzLkNpcmNsZSA9IENpcmNsZTtcclxubW9kdWxlLmV4cG9ydHMuUmVjdGFuZ2xlID0gUmVjdGFuZ2xlOyIsInZhciBGaXhUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLkZpeFR5cGU7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XHJcblxyXG52YXIgVG9rZW4gPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBhcmdzLCBhcmd1bWVudF90eXBlcykge1xyXG4gIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5QUkVGSVg7XHJcbiAgdGhpcy5uYW1lID0gbmFtZTtcclxuICB0aGlzLmFyZ3MgPSBhcmdzID09IHVuZGVmaW5lZCA/IFtdIDogYXJncztcclxuICB0aGlzLmFyZ3VtZW50X3R5cGVzID0gYXJndW1lbnRfdHlwZXM7XHJcbiAgdGhpcy5hcmdzID0gW107XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hcmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoYXJnc1tpXS50eXBlICE9PSBhcmd1bWVudF90eXBlc1tpXSAmJiBhcmd1bWVudF90eXBlc1tpXSAhPT0gVHlwZS5MSVRFUkFMKVxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUV4Y2VwdGlvbihhcmd1bWVudF90eXBlc1tpXSwgYXJnc1tpXS50eXBlLCB0aGlzKTtcclxuICB9XHJcbn07XHJcblxyXG5Ub2tlbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgcmV0ID0gXCJcIjtcclxuICB2YXIgYXJnU3RyaW5ncyA9IFtdO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgYXJnU3RyaW5ncy5wdXNoKHRoaXMuYXJnc1tpXS50b1N0cmluZygpKTtcclxuICB9XHJcblxyXG4gIGFyZ1N0cmluZ3MgPSBhcmdTdHJpbmdzLmpvaW4oXCIsIFwiKTtcclxuXHJcbiAgc3dpdGNoICh0aGlzLmZpeFR5cGUpIHtcclxuICAgIGNhc2UgRml4VHlwZS5QUkVGSVg6XHJcbiAgICAgIHJldCA9IHRoaXMubmFtZSArIFwiKFwiICsgYXJnU3RyaW5ncyArIFwiKVwiO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgRml4VHlwZS5JTkZJWDpcclxuICAgICAgcmV0ID0gdGhpcy5hcmdzWzBdLnRvU3RyaW5nKCkgKyBcIiBcIiArIHRoaXMubmFtZSArIFwiIFwiICsgdGhpcy5hcmdzWzFdLnRvU3RyaW5nKCk7XHJcbiAgICAgIGJyZWFrO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcblxyXG5cclxudmFyIExvZ2ljID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICBUb2tlbi5jYWxsKHRoaXMsIG5hbWUsIHR5cGUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKTtcclxufTtcclxuTG9naWMucHJvdG90eXBlID0gbmV3IFRva2VuKCk7XHJcbkxvZ2ljLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvZ2ljO1xyXG5cclxuTG9naWMucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24oKSB7IC8vIFVzZSBhIGRlcml2ZWQgY2xhc3NcclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5cclxudmFyIEFjdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgVG9rZW4uY2FsbCh0aGlzLCBuYW1lLCBUeXBlLkFDVElPTiwgYXJncywgYXJndW1lbnRfdHlwZXMpO1xyXG59O1xyXG5BY3Rpb24ucHJvdG90eXBlID0gbmV3IFRva2VuKCk7XHJcbkFjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBY3Rpb247XHJcblxyXG5BY3Rpb24ucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHsgLy8gVXNlIGEgZGVyaXZlZCBjbGFzc1xyXG4gIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbkFjdGlvbi5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBlbnRpdGllcyA9IHRoaXMuYXJnc1swXS5maWx0ZXIoKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB0aGlzLmVhY2goZW50aXRpZXNbaV0pO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG52YXIgRW50aXR5RmlsdGVyID0gZnVuY3Rpb24obmFtZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICBUb2tlbi5jYWxsKHRoaXMsIG5hbWUsIFR5cGUuRU5USVRZRklMVEVSLCBhcmdzLCBhcmd1bWVudF90eXBlcyk7XHJcbn07XHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUgPSBuZXcgVG9rZW4oKTtcclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVudGl0eUZpbHRlcjtcclxuXHJcbkVudGl0eUZpbHRlci5wcm90b3R5cGUuZGVjaWRlID0gZnVuY3Rpb24oZW50aXR5KSB7IC8vIFVzZSBkZXJpdmVkIGNsYXNzXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgcmV0ID0gW107XHJcbiAgdmFyIGVudGl0aWVzID0gX2VuZ2luZS5lbnRpdGllcygpO1xyXG4gIFxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmICh0aGlzLmRlY2lkZShlbnRpdGllc1tpXSkpXHJcbiAgICAgIHJldC5wdXNoKGVudGl0aWVzW2ldKTtcclxuICB9XHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLlRva2VuID0gVG9rZW47XHJcbm1vZHVsZS5leHBvcnRzLkFjdGlvbiA9IEFjdGlvbjtcclxubW9kdWxlLmV4cG9ydHMuTG9naWMgPSBMb2dpYztcclxubW9kdWxlLmV4cG9ydHMuRW50aXR5RmlsdGVyID0gRW50aXR5RmlsdGVyO1xyXG5cclxuLy8gVE9ETzogbGluZWFyIGFjdGlvbiwgcG9yb3ZuYXZhbmllLCB1aGx5LCBwbHVzLCBtaW51cyAsIGRlbGVubywga3JhdCwgeCBuYSBuIiwidmFyIFBhcnNlciA9IHJlcXVpcmUoXCIuL3BhcnNlci5qc1wiKTtcclxuXHJcbnZhciBUb2tlbk1hbmFnZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdGhpcy50b2tlbnMgPSBbXTtcclxuXHJcbiAgdGhpcy5yZWdpc3RlclRva2VucyhyZXF1aXJlKFwiLi9sb2dpYy5qc1wiKSk7XHJcbiAgdGhpcy5yZWdpc3RlclRva2VucyhyZXF1aXJlKFwiLi9hY3Rpb25zLmpzXCIpKTtcclxuICB0aGlzLnJlZ2lzdGVyVG9rZW5zKHJlcXVpcmUoXCIuL2VudGl0eWZpbHRlcnMuanNcIikpO1xyXG5cclxuICB0aGlzLnBhcnNlciA9IG5ldyBQYXJzZXIodGhpcyk7XHJcbn07XHJcblxyXG5Ub2tlbk1hbmFnZXIucHJvdG90eXBlLnJlZ2lzdGVyVG9rZW5zID0gZnVuY3Rpb24gKHRva2Vucykge1xyXG4gIHRva2Vucy5mb3JFYWNoKGZ1bmN0aW9uICh0b2tlbikge1xyXG4gICAgdGhpcy50b2tlbnMucHVzaChuZXcgdG9rZW4oKSk7XHJcbiAgfSwgdGhpcyk7XHJcbn07XHJcblxyXG5Ub2tlbk1hbmFnZXIucHJvdG90eXBlLmdldFRva2VuQnlOYW1lID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudG9rZW5zLmxlbmd0aDsgaSsrKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLnRva2Vuc1tpXS5uYW1lID09PSBuYW1lKVxyXG4gICAgICByZXR1cm4gdGhpcy50b2tlbnNbaV07XHJcbiAgfVxyXG59O1xyXG5cclxuVG9rZW5NYW5hZ2VyLnByb3RvdHlwZS5nZXRUb2tlbnNCeVR5cGUgPSBmdW5jdGlvbiAodHlwZSkge1xyXG4gIHZhciByZXQgPSBbXTtcclxuXHJcbiAgdGhpcy50b2tlbnMuZm9yRWFjaChmdW5jdGlvbiAodG9rZW4pIHtcclxuICAgIGlmICh0b2tlbi50eXBlID09PSB0eXBlKVxyXG4gICAgICByZXQucHVzaCh0b2tlbik7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRva2VuTWFuYWdlcjsiLCJ2YXIgU2hhcGUgPSByZXF1aXJlKFwiLi9zaGFwZXMuanNcIik7XHJcbnZhciBUeXBlID0gcmVxdWlyZShcIi4vYm9keXR5cGUuanNcIik7XHJcblxyXG52YXIgQmxhbmsgPSB7XHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge30sXHJcbiAgb25yZWxlYXNlOiBmdW5jdGlvbiAoKSB7fSxcclxuICBvbm1vdmU6IGZ1bmN0aW9uICgpIHt9XHJcbn07XHJcblxyXG5cclxudmFyIFNlbGVjdGlvbiA9IHtcclxuICBvcmlnaW46IG51bGwsXHJcbiAgb2Zmc2V0OiBudWxsLFxyXG4gIG1vZGU6IG51bGwsXHJcblxyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgIF9lbmdpbmUuc2VsZWN0RW50aXR5KG51bGwpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSBfZW5naW5lLkxBWUVSU19OVU1CRVIgLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF9lbmdpbmUubGF5ZXJzW2ldLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coW0lucHV0Lm1vdXNlLngsIElucHV0Lm1vdXNlLnldLCBfZW5naW5lLnZpZXdwb3J0LngpO1xyXG4gICAgICAgIGlmIChfZW5naW5lLmxheWVyc1tpXVtqXS5maXh0dXJlLlRlc3RQb2ludChcclxuICAgICAgICAgICAgbmV3IGIyVmVjMihJbnB1dC5tb3VzZS54LCBJbnB1dC5tb3VzZS55KSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgIF9lbmdpbmUuc2VsZWN0RW50aXR5KF9lbmdpbmUubGF5ZXJzW2ldW2pdKTtcclxuXHJcbiAgICAgICAgICB0aGlzLm9yaWdpbiA9IFtJbnB1dC5tb3VzZS54LCBJbnB1dC5tb3VzZS55XTtcclxuICAgICAgICAgIHRoaXMub2Zmc2V0ID0gW1xyXG4gICAgICAgICAgICBfZW5naW5lLnNlbGVjdGVkRW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpIC0gdGhpcy5vcmlnaW5bMF0sXHJcbiAgICAgICAgICAgIF9lbmdpbmUuc2VsZWN0ZWRFbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF95KCkgLSB0aGlzLm9yaWdpblsxXVxyXG4gICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICB0aGlzLm1vZGUgPSBcInJlcG9zaXRpb25cIjtcclxuICAgICAgICAgIHRoaXMub3JpZ2luID0gW0lucHV0Lm1vdXNlLngsIElucHV0Lm1vdXNlLnldO1xyXG5cclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1vZGUgPSBcImNhbWVyYVwiO1xyXG5cclxuICAgIHRoaXMub3JpZ2luID0gW19lbmdpbmUudmlld3BvcnQueCwgX2VuZ2luZS52aWV3cG9ydC55XTtcclxuICAgIHRoaXMub2Zmc2V0ID0gW0lucHV0Lm1vdXNlLmNhbnZhc1gsIElucHV0Lm1vdXNlLmNhbnZhc1ldO1xyXG4gICAgX2VuZ2luZS52aWV3cG9ydC5jYW52YXNFbGVtZW50LnN0eWxlLmN1cnNvciA9IFwidXJsKGltZy9ncmFiYmluZ2N1cnNvci5wbmcpLCBtb3ZlXCI7XHJcbiAgfSxcclxuICBvbnJlbGVhc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMub3JpZ2luID0gdGhpcy5vZmZzZXQgPSB0aGlzLm1vZGUgPSBudWxsO1xyXG4gICAgX2VuZ2luZS52aWV3cG9ydC5jYW52YXNFbGVtZW50LnN0eWxlLmN1cnNvciA9IFwiZGVmYXVsdFwiO1xyXG4gIH0sXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5tb2RlID09PSBudWxsKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJjYW1lcmFcIikge1xyXG4gICAgICBfZW5naW5lLnZpZXdwb3J0LnggPSB0aGlzLm9yaWdpblswXSArICh0aGlzLm9mZnNldFswXSAtIElucHV0Lm1vdXNlLmNhbnZhc1gpICogX2VuZ2luZS52aWV3cG9ydC5zY2FsZTtcclxuICAgICAgX2VuZ2luZS52aWV3cG9ydC55ID0gdGhpcy5vcmlnaW5bMV0gKyAodGhpcy5vZmZzZXRbMV0gLSBJbnB1dC5tb3VzZS5jYW52YXNZKSAqIF9lbmdpbmUudmlld3BvcnQuc2NhbGU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJyZXBvc2l0aW9uXCIpIHtcclxuICAgICAgdmFyIGJvZHkgPSBfZW5naW5lLnNlbGVjdGVkRW50aXR5LmJvZHk7XHJcbiAgICAgIHZhciB4ID0gTWF0aC5yb3VuZCgoSW5wdXQubW91c2UueCArIHRoaXMub2Zmc2V0WzBdKSAqIDEwMDApIC8gMTAwMDtcclxuICAgICAgdmFyIHkgPSBNYXRoLnJvdW5kKChJbnB1dC5tb3VzZS55ICsgdGhpcy5vZmZzZXRbMV0pICogMTAwMCkgLyAxMDAwO1xyXG5cclxuICAgICAgYm9keS5TZXRUcmFuc2Zvcm0obmV3IGIyVmVjMih4LCB5KSwgYm9keS5HZXRBbmdsZSgpKTtcclxuICAgICAgJChcIiNlbnRpdHlfeFwiKS52YWwoeCk7XHJcbiAgICAgICQoXCIjZW50aXR5X3lcIikudmFsKHkpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcblxyXG52YXIgUmVjdGFuZ2xlID0ge1xyXG4gIG9yaWdpbjogbnVsbCxcclxuICB3b3JsZE9yaWdpbjogbnVsbCxcclxuICB3OiAwLFxyXG4gIGg6IDAsXHJcbiAgbWluU2l6ZTogNSxcclxuXHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5vbm1vdmUgPSB0aGlzLmRyYWdnaW5nO1xyXG4gICAgdGhpcy5vcmlnaW4gPSBbSW5wdXQubW91c2UuY2FudmFzWCwgSW5wdXQubW91c2UuY2FudmFzWV07XHJcbiAgICB0aGlzLndvcmxkT3JpZ2luID0gW0lucHV0Lm1vdXNlLngsIElucHV0Lm1vdXNlLnldO1xyXG4gIH0sXHJcblxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMudyA+PSB0aGlzLm1pblNpemUgJiYgdGhpcy5oID49IHRoaXMubWluU2l6ZSkge1xyXG4gICAgICB0aGlzLncgKj0gX2VuZ2luZS52aWV3cG9ydC5zY2FsZTtcclxuICAgICAgdGhpcy5oICo9IF9lbmdpbmUudmlld3BvcnQuc2NhbGU7XHJcblxyXG4gICAgICBfZW5naW5lLmFkZEVudGl0eShuZXcgU2hhcGUuUmVjdGFuZ2xlKFxyXG4gICAgICAgIG5ldyBiMlZlYzIodGhpcy53b3JsZE9yaWdpblswXSArIHRoaXMudyAvIDIsIHRoaXMud29ybGRPcmlnaW5bMV0gKyB0aGlzLmggLyAyKSxcclxuICAgICAgICBuZXcgYjJWZWMyKHRoaXMudyAvIDIsIHRoaXMuaCAvIDIpKSwgVHlwZS5EWU5BTUlDX0JPRFkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMub25tb3ZlID0gZnVuY3Rpb24oKXt9O1xyXG4gICAgdGhpcy5vcmlnaW4gPSBudWxsO1xyXG4gICAgdGhpcy53b3JsZE9yaWdpbiA9IG51bGw7XHJcbiAgICB0aGlzLncgPSB0aGlzLmggPSAwO1xyXG4gIH0sXHJcblxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICB9LFxyXG5cclxuICBkcmFnZ2luZzogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgdGhpcy53ID0gSW5wdXQubW91c2UuY2FudmFzWCAtIHRoaXMub3JpZ2luWzBdO1xyXG4gICAgdGhpcy5oID0gSW5wdXQubW91c2UuY2FudmFzWSAtIHRoaXMub3JpZ2luWzFdO1xyXG5cclxuICAgIGlmICh0aGlzLncgPCB0aGlzLm1pblNpemUgfHwgdGhpcy5oIDwgdGhpcy5taW5TaXplKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgMC40KVwiO1xyXG4gICAgY3R4LmZpbGxSZWN0KHRoaXMub3JpZ2luWzBdLCB0aGlzLm9yaWdpblsxXSwgdGhpcy53LCB0aGlzLmgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICB9XHJcbn07XHJcblxyXG5cclxudmFyIENpcmNsZSA9IHtcclxuICBvcmlnaW46IG51bGwsXHJcbiAgd29ybGRPcmlnaW46IG51bGwsXHJcbiAgcmFkaXVzOiAwLFxyXG4gIG1pblJhZGl1czogNSxcclxuXHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5vbm1vdmUgPSB0aGlzLmRyYWdnaW5nO1xyXG4gICAgdGhpcy5vcmlnaW4gPSBbSW5wdXQubW91c2UuY2FudmFzWCwgSW5wdXQubW91c2UuY2FudmFzWV07XHJcbiAgICB0aGlzLndvcmxkT3JpZ2luID0gW0lucHV0Lm1vdXNlLngsIElucHV0Lm1vdXNlLnldO1xyXG4gIH0sXHJcblxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMucmFkaXVzID49IHRoaXMubWluUmFkaXVzKSB7XHJcbiAgICAgIHRoaXMucmFkaXVzICo9IF9lbmdpbmUudmlld3BvcnQuc2NhbGU7XHJcblxyXG4gICAgICBfZW5naW5lLmFkZEVudGl0eShuZXcgU2hhcGUuQ2lyY2xlKFxyXG4gICAgICAgIG5ldyBiMlZlYzIodGhpcy53b3JsZE9yaWdpblswXSArIHRoaXMucmFkaXVzLCB0aGlzLndvcmxkT3JpZ2luWzFdICsgdGhpcy5yYWRpdXMpLFxyXG4gICAgICAgIHRoaXMucmFkaXVzKSwgVHlwZS5EWU5BTUlDX0JPRFkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMub25tb3ZlID0gZnVuY3Rpb24oKXt9O1xyXG4gICAgdGhpcy5vcmlnaW4gPSBudWxsO1xyXG4gICAgdGhpcy53b3JsZE9yaWdpbiA9IG51bGw7XHJcbiAgICB0aGlzLnJhZGl1cyA9IDA7XHJcbiAgfSxcclxuXHJcbiAgb25tb3ZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIH0sXHJcblxyXG4gIGRyYWdnaW5nOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICB0aGlzLnJhZGl1cyA9IE1hdGgubWluKElucHV0Lm1vdXNlLmNhbnZhc1ggLSB0aGlzLm9yaWdpblswXSwgSW5wdXQubW91c2UuY2FudmFzWSAtIHRoaXMub3JpZ2luWzFdKSAvIDI7XHJcblxyXG4gICAgaWYgKHRoaXMucmFkaXVzIDwgdGhpcy5taW5SYWRpdXMpXHJcbiAgICAgIHJldHVybjtcclxuXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG5cclxuICAgIGN0eC5hcmModGhpcy5vcmlnaW5bMF0gKyB0aGlzLnJhZGl1cywgdGhpcy5vcmlnaW5bMV0gKyB0aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcblxyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLCAwLCAwLCAwLjQpXCI7XHJcbiAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMuQmxhbmsgPSBCbGFuaztcclxubW9kdWxlLmV4cG9ydHMuU2VsZWN0aW9uID0gU2VsZWN0aW9uO1xyXG5tb2R1bGUuZXhwb3J0cy5SZWN0YW5nbGUgPSBSZWN0YW5nbGU7XHJcbm1vZHVsZS5leHBvcnRzLkNpcmNsZSA9IENpcmNsZTsiLCJ2YXIgVHlwZSA9IHtcclxuICBCT09MRUFOOiBcImJvb2xlYW5cIixcclxuICBOVU1CRVI6IFwibnVtYmVyXCIsXHJcbiAgU1RSSU5HOiBcInN0cmluZ1wiLFxyXG4gIEFSUkFZOiBcImFycmF5XCIsXHJcbiAgQUNUSU9OOiBcImFjdGlvblwiLFxyXG4gIEVOVElUWUZJTFRFUjogXCJlbnRpdHlGaWx0ZXJcIixcclxuICBMSVRFUkFMOiBcImxpdGVyYWxcIlxyXG59O1xyXG5cclxudmFyIEZpeFR5cGUgPSB7XHJcbiAgSU5GSVg6IFwiaW5maXhcIixcclxuICBQUkVGSVg6IFwicHJlZml4XCJcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLlR5cGUgPSBUeXBlO1xyXG5tb2R1bGUuZXhwb3J0cy5GaXhUeXBlID0gRml4VHlwZTsiLCJ2YXIgVG9vbHMgPSByZXF1aXJlKFwiLi90b29scy5qc1wiKTtcclxudmFyIEJvZHlUeXBlID0gcmVxdWlyZShcIi4vYm9keXR5cGUuanNcIik7XHJcbnZhciBVSUJ1aWxkZXIgPSByZXF1aXJlKFwiLi91aWJ1aWxkZXIuanNcIik7XHJcblxyXG4vLyBPYmplY3QgZm9yIGJ1aWxkaW5nIHRoZSBVSVxyXG52YXIgVUkgPSB7XHJcbiAgLy8gVUkgaW5pdGlhbGlzYXRpb25cclxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBsYW5ndWFnZXMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgVHJhbnNsYXRpb25zLnN0cmluZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbGFuZ3VhZ2VzLnB1c2goe3RleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkKDAsIGkpLCB2YWx1ZTogaX0pO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwcm9wZXJ0aWVzID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogXCJidXR0b25cIixcclxuXHJcbiAgICAgICAgaWQ6IFwicGxheVwiLFxyXG4gICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgyKSxcclxuICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBfZW5naW5lLnRvZ2dsZVBhdXNlKCk7XHJcblxyXG4gICAgICAgICAgaWYgKF9lbmdpbmUud29ybGQucGF1c2VkKSB7XHJcbiAgICAgICAgICAgICQoXCIjcGxheVwiKS5odG1sKFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgyKSk7XHJcblxyXG4gICAgICAgICAgICAkKFwiI2NvbGxpc2lvbnMsICN0b29sXCIpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHRoaXMuZW5hYmxlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQoXCIjcGxheVwiKS5odG1sKFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgzKSk7XHJcblxyXG4gICAgICAgICAgICAkKFwiI2NvbGxpc2lvbnMsICN0b29sXCIpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHRoaXMuZGlzYWJsZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHt0eXBlOiBcImJyZWFrXCJ9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogXCJidXR0b25cIixcclxuXHJcbiAgICAgICAgaWQ6IFwiY29sbGlzaW9uc1wiLFxyXG4gICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxKSxcclxuICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBVSUJ1aWxkZXIucG9wdXAoVUkuY3JlYXRlQ29sbGlzaW9ucygpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHt0eXBlOiBcImJyZWFrXCJ9LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTcpIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcInJhZGlvXCIsXHJcblxyXG4gICAgICAgIGlkOiBcInRvb2xcIixcclxuICAgICAgICBlbGVtZW50czogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiBlbC5pbWcoe3NyYzogXCIuL2ltZy9zZWxlY3Rpb24ucG5nXCJ9KSwgaWQ6IFwic2VsZWN0aW9uVG9vbFwiLCBjaGVja2VkOiB0cnVlLCBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF9lbmdpbmUuc2VsZWN0VG9vbChUb29scy5TZWxlY3Rpb24pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogZWwuaW1nKHtzcmM6IFwiLi9pbWcvcmVjdGFuZ2xlLnBuZ1wifSksIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgX2VuZ2luZS5zZWxlY3RUb29sKFRvb2xzLlJlY3RhbmdsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiBlbC5pbWcoe3NyYzogXCIuL2ltZy9jaXJjbGUucG5nXCJ9KSwgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfZW5naW5lLnNlbGVjdFRvb2woVG9vbHMuQ2lyY2xlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB7dHlwZTogXCJicmVha1wifSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwic2VsZWN0XCIsXHJcbiAgICAgICAgb3B0aW9uczogbGFuZ3VhZ2VzLFxyXG5cclxuICAgICAgICBvbmNoYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICBUcmFuc2xhdGlvbnMuc2V0TGFuZ3VhZ2UodmFsdWUgKiAxKTtcclxuICAgICAgICB9LFxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIFVJQnVpbGRlci5idWlsZExheW91dCgpO1xyXG4gICAgJChcIi51aS50b29sYmFyXCIpWzBdLmFwcGVuZENoaWxkKFVJQnVpbGRlci5idWlsZChwcm9wZXJ0aWVzKSk7XHJcbiAgICAkKFwiLnVpLmNvbnRlbnRcIilbMF0uYXBwZW5kQ2hpbGQoZWwoXCJjYW52YXMjbWFpbkNhbnZhc1wiKSk7XHJcblxyXG4gIH0sXHJcblxyXG4gIC8vIEJ1aWxkaW5nIHRoZSBjb2xsaXNpb24gZ3JvdXAgdGFibGVcclxuICBjcmVhdGVDb2xsaXNpb25zOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0YWJsZSA9IGVsKFwidGFibGUuY29sbGlzaW9uVGFibGVcIik7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZW5naW5lLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSICsgMTsgaSsrKSB7XHJcbiAgICAgIHZhciB0ciA9IGVsKFwidHJcIik7XHJcblxyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF9lbmdpbmUuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgKyAxOyBqKyspIHtcclxuICAgICAgICB2YXIgdGQgPSBlbChcInRkXCIpO1xyXG5cclxuICAgICAgICAvLyBmaXJzdCByb3dcclxuICAgICAgICBpZiAoaSA9PT0gMCAmJiBqID4gMCkge1xyXG4gICAgICAgICAgdGQuaW5uZXJIVE1MID0gXCI8ZGl2PjxzcGFuPlwiICsgX2VuZ2luZS5jb2xsaXNpb25Hcm91cHNbaiAtIDFdLm5hbWUgKyBcIjwvc3Bhbj48L2Rpdj5cIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpcnN0IGNvbHVtblxyXG4gICAgICAgIGVsc2UgaWYgKGogPT09IDAgJiYgaSAhPT0gMClcclxuICAgICAgICAgIHRkLmlubmVySFRNTCA9IF9lbmdpbmUuY29sbGlzaW9uR3JvdXBzW2kgLSAxXS5uYW1lO1xyXG5cclxuICAgICAgICAvLyByZWxldmFudCB0cmlhbmdsZVxyXG4gICAgICAgIGVsc2UgaWYgKGkgPD0gaiAmJiBqICE9PSAwICYmIGkgIT09IDApIHtcclxuICAgICAgICAgIHRkLnJvdyA9IGk7XHJcbiAgICAgICAgICB0ZC5jb2wgPSBqO1xyXG5cclxuICAgICAgICAgIC8vIGhpZ2hsaWdodGluZ1xyXG4gICAgICAgICAgdGQub25tb3VzZW92ZXIgPSBmdW5jdGlvbihpLCBqLCB0YWJsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHRkcyA9IHRhYmxlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGRcIik7XHJcbiAgICAgICAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCB0ZHMubGVuZ3RoOyBuKyspIHtcclxuICAgICAgICAgICAgICAgIHRkc1tuXS5jbGFzc05hbWUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG9ubHkgaGlnaGxpZ2h0IHVwIHRvIHRoZSByZWxldmFudCBjZWxsXHJcbiAgICAgICAgICAgICAgICBpZiAoKHRkc1tuXS5yb3cgPT09IGkgJiYgdGRzW25dLmNvbCA8PSBqKSB8fCAodGRzW25dLmNvbCA9PT0gaiAmJiB0ZHNbbl0ucm93IDw9IGkpKVxyXG4gICAgICAgICAgICAgICAgICB0ZHNbbl0uY2xhc3NOYW1lID0gXCJoaWdobGlnaHRcIjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0oaSwgaiwgdGFibGUpO1xyXG5cclxuICAgICAgICAgIC8vIG1vcmUgaGlnaGxpZ2h0aW5nXHJcbiAgICAgICAgICB0ZC5vbm1vdXNlb3V0ID0gZnVuY3Rpb24odGFibGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHZhciB0ZHMgPSB0YWJsZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRkXCIpO1xyXG4gICAgICAgICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgdGRzLmxlbmd0aDsgbisrKSB7XHJcbiAgICAgICAgICAgICAgICB0ZHNbbl0uY2xhc3NOYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0odGFibGUpO1xyXG5cclxuICAgICAgICAgIC8vIGNoZWNrYm94IGZvciBjb2xsaXNpb24gdG9nZ2xpbmdcclxuICAgICAgICAgIHZhciBjaGVja2JveCA9IGVsKFwiaW5wdXRcIiwge3R5cGU6IFwiY2hlY2tib3hcIn0pO1xyXG5cclxuICAgICAgICAgIGlmIChfZW5naW5lLmdldENvbGxpc2lvbihpIC0gMSwgaiAtIDEpKVxyXG4gICAgICAgICAgICBjaGVja2JveC5zZXRBdHRyaWJ1dGUoXCJjaGVja2VkXCIsIFwiY2hlY2tlZFwiKTtcclxuXHJcbiAgICAgICAgICBjaGVja2JveC5vbmNoYW5nZSA9IGZ1bmN0aW9uKGksIGosIGNoZWNrYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBfZW5naW5lLnNldENvbGxpc2lvbihpIC0gMSwgaiAtIDEsIGNoZWNrYm94LmNoZWNrZWQgPyAxIDogMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0oaSwgaiwgY2hlY2tib3gpO1xyXG5cclxuICAgICAgICAgIC8vIGNsaWNraW5nIHRoZSBjaGVja2JveCdzIGNlbGwgc2hvdWxkIHdvcmsgYXMgd2VsbFxyXG4gICAgICAgICAgdGQub25jbGljayA9IGZ1bmN0aW9uKGNoZWNrYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0ID09PSBjaGVja2JveClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gIWNoZWNrYm94LmNoZWNrZWQ7XHJcbiAgICAgICAgICAgICAgY2hlY2tib3gub25jaGFuZ2UoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0oY2hlY2tib3gpO1xyXG5cclxuICAgICAgICAgIHRkLmFwcGVuZENoaWxkKGNoZWNrYm94KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpeCBmb3IgYWxzbyBoaWdobGlnaHRpbmcgY2VsbHMgd2l0aG91dCBjaGVja2JveGVzXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0ZC5yb3cgPSBpO1xyXG4gICAgICAgICAgdGQuY29sID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGFibGUuYXBwZW5kQ2hpbGQodHIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YWJsZTtcclxuICB9LFxyXG5cclxuICBjcmVhdGVCZWhhdmlvcjogZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gICAgdmFyIEJlaGF2aW9yQnVpbGRlciA9IG5ldyAocmVxdWlyZShcIi4vYmVoYXZpb3JidWlsZGVyLmpzXCIpKShfZW5naW5lLnRva2VuTWFuYWdlcik7XHJcbiAgICB2YXIgVUlCdWlsZGVyID0gcmVxdWlyZShcIi4vdWlidWlsZGVyLmpzXCIpO1xyXG4gICAgdmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbiAgICB2YXIgb25lQmVoYXZpb3IgPSBmdW5jdGlvbihiZWhhdmlvcikge1xyXG4gICAgICB2YXIgd3JhcHBlciA9IGVsKFwiZGl2LmJlaGF2aW9yXCIpO1xyXG4gICAgICB2YXIgbG9naWMgPSBlbChcImRpdi50b2tlbkJ1aWxkZXJcIiwge30sIFtcIlwiXSk7XHJcbiAgICAgIHZhciByZXN1bHRzID0gZWwoXCJkaXZcIik7XHJcblxyXG4gICAgICB2YXIgcmVtb3ZlciA9IFVJQnVpbGRlci5idXR0b24oe1xyXG4gICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgyOSksIG9uY2xpY2s6IChmdW5jdGlvbiAod3JhcHBlcikge1xyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIGZ1bmN0aW9uIGlzbid0IHdyYXBwZWQsIG9ubHkgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgYmVoYXZpb3IgZ2V0cyBwYXNzZWRcclxuXHJcbiAgICAgICAgICAgICQod3JhcHBlcikucmVtb3ZlKCk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pKHdyYXBwZXIpXHJcbiAgICAgIH0pO1xyXG4gICAgICByZW1vdmVyLnN0eWxlLmZsb2F0ID0gXCJyaWdodFwiO1xyXG5cclxuICAgICAgaWYgKGJlaGF2aW9yID09PSBudWxsKSB7XHJcbiAgICAgICAgQmVoYXZpb3JCdWlsZGVyLmluaXRpYWxpemUoVHlwZS5CT09MRUFOLCBsb2dpYyk7XHJcblxyXG4gICAgICAgIHJlc3VsdHMuYXBwZW5kQ2hpbGQob25lUmVzdWx0KG51bGwsIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg2KSwgZmFsc2UpKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBCZWhhdmlvckJ1aWxkZXIuYnVpbGRUb2tlbihiZWhhdmlvci5sb2dpYywgbG9naWMuZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgICAgIHJlc3VsdHMuYXBwZW5kQ2hpbGQob25lUmVzdWx0KGJlaGF2aW9yLnJlc3VsdHNbMF0sIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg2KSwgZmFsc2UpKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBiZWhhdmlvci5yZXN1bHRzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICByZXN1bHRzLmFwcGVuZENoaWxkKG9uZVJlc3VsdChiZWhhdmlvci5yZXN1bHRzW2pdLCBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMjUpLCB0cnVlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG5cclxuICAgICAgcmVzdWx0cy5hcHBlbmRDaGlsZChVSUJ1aWxkZXIuYnV0dG9uKHt0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMjYpLCBvbmNsaWNrOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUob25lUmVzdWx0KG51bGwsIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgyNSksIHRydWUpLCB0aGlzKTtcclxuICAgICAgfX0pKTtcclxuXHJcbiAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQoZWwoXCJoMlwiLCB7fSwgW1RyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg1KSwgcmVtb3Zlcl0pKTtcclxuICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChsb2dpYyk7XHJcbiAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQocmVzdWx0cyk7XHJcblxyXG4gICAgICByZXR1cm4gd3JhcHBlcjtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIG9uZVJlc3VsdCA9IGZ1bmN0aW9uKHJlc3VsdCwgdGV4dCwgZW5hYmxlUmVtb3ZlKSB7XHJcbiAgICAgIHZhciB3cmFwcGVyID0gZWwoXCJkaXZcIik7XHJcbiAgICAgIHZhciByZXN1bHRFbGVtZW50ID0gZWwoXCJkaXYudG9rZW5CdWlsZGVyXCIsIHt9LCBbXCJcIl0pO1xyXG5cclxuICAgICAgdmFyIHJlc3VsdFJlbW92ZXIgPSBVSUJ1aWxkZXIuYnV0dG9uKHt0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMjgpLCBvbmNsaWNrOlxyXG4gICAgICAgIChmdW5jdGlvbihyZXN1bHRFbGVtZW50KXtyZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgICAgIC8vIElmIHRoZSBmdW5jdGlvbiBpc24ndCB3cmFwcGVkLCBvbmx5IHRoZSBsYXN0IGluc3RhbmNlIG9mIHJlc3VsdCBnZXRzIHBhc3NlZFxyXG5cclxuICAgICAgICAgICQocmVzdWx0RWxlbWVudCkucHJldigpLnJlbW92ZSgpOyAvLyBSZW1vdmUgdGhlIGhlYWRlclxyXG4gICAgICAgICAgJChyZXN1bHRFbGVtZW50KS5yZW1vdmUoKTsgLy8gQW5kIHRoZSB0b2tlbiBidWlsZGVyXHJcbiAgICAgICAgfTt9KShyZXN1bHRFbGVtZW50KX0pO1xyXG4gICAgICByZXN1bHRSZW1vdmVyLnN0eWxlLmZsb2F0ID0gXCJyaWdodFwiO1xyXG5cclxuICAgICAgaWYoISBlbmFibGVSZW1vdmUpXHJcbiAgICAgICAgcmVzdWx0UmVtb3ZlciA9IFwiXCI7XHJcblxyXG4gICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGVsKFwiaDJcIiwge30sIFtcclxuICAgICAgICB0ZXh0LFxyXG4gICAgICAgIHJlc3VsdFJlbW92ZXJcclxuICAgICAgXSkpO1xyXG4gICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKHJlc3VsdEVsZW1lbnQpO1xyXG5cclxuICAgICAgaWYocmVzdWx0ID09PSBudWxsKVxyXG4gICAgICAgIEJlaGF2aW9yQnVpbGRlci5pbml0aWFsaXplKFR5cGUuQUNUSU9OLCByZXN1bHRFbGVtZW50KTtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIEJlaGF2aW9yQnVpbGRlci5idWlsZFRva2VuKHJlc3VsdCwgcmVzdWx0RWxlbWVudC5maXJzdENoaWxkKTtcclxuXHJcbiAgICAgIHJldHVybiB3cmFwcGVyO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgdmFyIHJldCA9IGVsKFwiZGl2LmJlaGF2aW9yV3JhcHBlclwiKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0eS5iZWhhdmlvcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgcmV0LmFwcGVuZENoaWxkKG9uZUJlaGF2aW9yKGVudGl0eS5iZWhhdmlvcnNbaV0pKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgdmFyIGJ1dHRvbnMgPSBlbChcImRpdi5ib3R0b21cIiwge30sIFtcclxuICAgICAgVUlCdWlsZGVyLmJ1dHRvbih7XHJcbiAgICAgICAgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDI3KSxcclxuICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICByZXQuYXBwZW5kQ2hpbGQob25lQmVoYXZpb3IobnVsbCkpO1xyXG4gICAgICAgICAgcmV0LnNjcm9sbFRvcCA9IHJldC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KSxcclxuICAgICAgVUlCdWlsZGVyLmJyZWFrKCksXHJcbiAgICAgIFVJQnVpbGRlci5idXR0b24oe1xyXG4gICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgzMSksXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgVUlCdWlsZGVyLmNsb3NlUG9wdXAoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pLFxyXG4gICAgICBVSUJ1aWxkZXIuYnV0dG9uKHtcclxuICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMzApLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHRoYXQuc2F2ZUJlaGF2aW9yKGVudGl0eSk7XHJcbiAgICAgICAgICBVSUJ1aWxkZXIuY2xvc2VQb3B1cCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSksXHJcbiAgICBdKTtcclxuICAgIHZhciB3cmFwcGVyID0gZWwoXCJkaXZcIiwge30sIFtyZXQsIGJ1dHRvbnNdKTtcclxuXHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxuICB9LFxyXG5cclxuICBzYXZlQmVoYXZpb3I6IGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICAgIHZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xyXG5cclxuICAgIGVudGl0eS5iZWhhdmlvcnMgPSBbXTtcclxuICAgIHZhciBiZWhhdmlvcnMgPSAkKFwiLmJlaGF2aW9yV3JhcHBlciAuYmVoYXZpb3JcIik7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJlaGF2aW9ycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgdG9rZW5CdWlsZGVycyA9ICQoXCIudG9rZW5CdWlsZGVyXCIsIGJlaGF2aW9yc1tpXSk7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHZhciBsb2dpYyA9IF9lbmdpbmUudG9rZW5NYW5hZ2VyLnBhcnNlci5wYXJzZSh0b2tlbkJ1aWxkZXJzWzBdLnRleHRDb250ZW50KTtcclxuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IodmFyIGogPSAxOyBqIDwgdG9rZW5CdWlsZGVycy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKF9lbmdpbmUudG9rZW5NYW5hZ2VyLnBhcnNlci5wYXJzZSh0b2tlbkJ1aWxkZXJzW2pdLnRleHRDb250ZW50KSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXRjaCAoZXJyKSB7fVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgdGhyb3cgXCJBbGwgcmVzdWx0cyBibGFua1wiO1xyXG5cclxuICAgICAgICBlbnRpdHkuYmVoYXZpb3JzLnB1c2gobmV3IEJlaGF2aW9yKGxvZ2ljLCByZXN1bHRzKSk7XHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgIC8vIElnbm9yZSBwYXJzaW5nIGVycm9ycyAoc29tZXRoaW5nIGxlZnQgYmxhbmspXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICBidWlsZFNpZGViYXI6IGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICAgIHZhciBzaWRlYmFyID0gJChcIi5zaWRlYmFyLnVpIC5jb250ZW50XCIpO1xyXG5cclxuICAgIHNpZGViYXIuaHRtbChcIlwiKTtcclxuXHJcbiAgICBpZiAoZW50aXR5ID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcHJvcGVydGllcyA9IFtcclxuICAgICAgLy8gSURcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDcpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0VGV4dFwiLCB2YWx1ZTogZW50aXR5LmlkLCBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7X2VuZ2luZS5jaGFuZ2VJZChlbnRpdHksIHZhbCk7fX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBDb2xsaXNpb24gZ3JvdXBcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDgpfSxcclxuICAgICAgeyB0eXBlOiBcInJhbmdlXCIsIHZhbHVlOiBlbnRpdHkuY29sbGlzaW9uR3JvdXAgKyAxLCBtaW46IDEsIG1heDogX2VuZ2luZS5DT0xMSVNJT05fR1JPVVBTX05VTUJFUixcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LnNldENvbGxpc2lvbkdyb3VwKHZhbCAqIDEgLSAxKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIExheWVyXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgyMSl9LFxyXG4gICAgICB7IHR5cGU6IFwicmFuZ2VcIiwgdmFsdWU6IGVudGl0eS5sYXllciArIDEsIG1pbjogMSwgbWF4OiBfZW5naW5lLkxBWUVSU19OVU1CRVIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkgeyBfZW5naW5lLnNldEVudGl0eUxheWVyKGVudGl0eSwgdmFsKjEgLSAxKTsgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBYXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg5KX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpLCBpZDogXCJlbnRpdHlfeFwiLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtcclxuICAgICAgICAgIGVudGl0eS5ib2R5LlNldFRyYW5zZm9ybShuZXcgYjJWZWMyKHZhbCAqIDEsIGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3koKSksIGVudGl0eS5ib2R5LkdldEFuZ2xlKCkpO1xyXG4gICAgICAgIH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gWVxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTApfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF95KCksIGlkOiBcImVudGl0eV95XCIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgICAgZW50aXR5LmJvZHkuU2V0VHJhbnNmb3JtKG5ldyBiMlZlYzIoZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpLCB2YWwgKiAxKSwgZW50aXR5LmJvZHkuR2V0QW5nbGUoKSk7XHJcbiAgICAgICAgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBSb3RhdGlvblxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTEpfSxcclxuICAgICAgeyB0eXBlOiBcInJhbmdlXCIsIG1pbjogMCwgbWF4OiAzNjAsIHN0ZXA6IDEsIHZhbHVlOiAoKChlbnRpdHkuYm9keS5HZXRBbmdsZSgpICogMTgwIC8gTWF0aC5QSSkgJSAzNjApKzM2MCklMzYwLCBpZDogXCJlbnRpdHlfcm90YXRpb25cIixcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LmJvZHkuU2V0VHJhbnNmb3JtKGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCksICgodmFsICogMSkgKiBNYXRoLlBJIC8gMTgwKSUzNjApO319LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gRml4ZWQgcm90YXRpb25cclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDEyKX0sXHJcbiAgICAgIHsgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBlbnRpdHkuZml4ZWRSb3RhdGlvbiwgb25jaGFuZ2U6IGZ1bmN0aW9uKHZhbCkgeyBlbnRpdHkuZGlzYWJsZVJvdGF0aW9uKHZhbCk7IH0gfSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIFJlc3RpdHV0aW9uXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgzMil9LFxyXG4gICAgICB7IHR5cGU6IFwicmFuZ2VcIiwgbWluOiAwLCBtYXg6IDEsIHN0ZXA6IDAuMSwgdmFsdWU6IGVudGl0eS5maXh0dXJlLkdldFJlc3RpdHV0aW9uKCksXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5maXh0dXJlLlNldFJlc3RpdHV0aW9uKHZhbCoxKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIEZyaWN0aW9uXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgzMyl9LFxyXG4gICAgICB7IHR5cGU6IFwicmFuZ2VcIiwgbWluOiAwLCBtYXg6IDEsIHN0ZXA6IDAuMSwgdmFsdWU6IGVudGl0eS5maXh0dXJlLkdldEZyaWN0aW9uKCksXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5maXh0dXJlLlNldEZyaWN0aW9uKHZhbCoxKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIERlbnNpdHlcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDM0KX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmZpeHR1cmUuR2V0RGVuc2l0eSgpLCBtaW46IDAsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5maXh0dXJlLlNldERlbnNpdHkodmFsKjEpO2VudGl0eS5ib2R5LlJlc2V0TWFzc0RhdGEoKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIENvbG9yXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxMyl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXRDb2xvclwiLCB2YWx1ZTogZW50aXR5LmNvbG9yLCBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LmNvbG9yID0gdmFsfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBCb2R5IHR5cGVcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE0KX0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcInNlbGVjdFwiLCBzZWxlY3RlZDogZW50aXR5LmJvZHkuR2V0VHlwZSgpLCBvbmNoYW5nZTogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5ib2R5LlNldFR5cGUodmFsICogMSl9LFxyXG4gICAgICAgIG9wdGlvbnM6IFtcclxuICAgICAgICAgIHsgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE1KSwgdmFsdWU6IEJvZHlUeXBlLkRZTkFNSUNfQk9EWSB9LFxyXG4gICAgICAgICAgeyB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMjApLCB2YWx1ZTogQm9keVR5cGUuS0lORU1BVElDX0JPRFkgfSxcclxuICAgICAgICAgIHsgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDE2KSwgdmFsdWU6IEJvZHlUeXBlLlNUQVRJQ19CT0RZIH0sXHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgeyB0eXBlOiBcImJ1dHRvblwiLCB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMjIpLCBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYoY29uZmlybShUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZCgyMykpKVxyXG4gICAgICAgICAgX2VuZ2luZS5yZW1vdmVFbnRpdHkoZW50aXR5KTtcclxuICAgICAgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICB7IHR5cGU6IFwiYnV0dG9uXCIsIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg0KSwgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIFVJQnVpbGRlci5wb3B1cChVSS5jcmVhdGVCZWhhdmlvcihlbnRpdHkpKTtcclxuICAgICAgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgXTtcclxuXHJcbiAgICBzaWRlYmFyWzBdLmFwcGVuZENoaWxkKFVJQnVpbGRlci5idWlsZChwcm9wZXJ0aWVzKSk7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSTsiLCJ2YXIgVUlCdWlsZGVyID0ge1xyXG4gIHJhZGlvOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcInJhZGlvR3JvdXAtXCIgKyAkKFwiLnJhZGlvR3JvdXBcIikubGVuZ3RoLFxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwiZGl2LnVpLnJhZGlvR3JvdXBcIiwge2lkOiBwcm9wZXJ0aWVzLmlkfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoXCJpbnB1dFt0eXBlPXJhZGlvXVwiLCB0aGlzKS5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKFwiaW5wdXRbdHlwZT1yYWRpb11cIiwgdGhpcykuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMuZW5hYmxlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgdmFyIGlkQ291bnQgPSAkKFwiaW5wdXRbdHlwZT1yYWRpb11cIikubGVuZ3RoO1xyXG5cclxuICAgIHByb3BlcnRpZXMuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgIGVsZW1lbnQgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICAgIGlkOiBcInJhZGlvLVwiICsgaWRDb3VudCsrLFxyXG4gICAgICAgIGNoZWNrZWQ6IGZhbHNlLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uKCl7fVxyXG4gICAgICB9LCBlbGVtZW50KTtcclxuXHJcbiAgICAgIHZhciBpbnB1dCA9IGVsKFwiaW5wdXQudWlcIiwge3R5cGU6IFwicmFkaW9cIiwgaWQ6IGVsZW1lbnQuaWQsIG5hbWU6IHByb3BlcnRpZXMuaWR9KTtcclxuICAgICAgdmFyIGxhYmVsID0gZWwoXCJsYWJlbC51aS5idXR0b25cIiwge2ZvcjogZWxlbWVudC5pZH0sIFtlbGVtZW50LnRleHRdKTtcclxuXHJcbiAgICAgIGlucHV0LmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAkKFwiK2xhYmVsXCIsIHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpbnB1dC5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgbGFiZWwub25jbGljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKFwiZGlzYWJsZWRcIikpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGVsZW1lbnQub25jbGljaygpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgaW5wdXQuY2hlY2tlZCA9IGVsZW1lbnQuY2hlY2tlZDtcclxuXHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChpbnB1dCk7XHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChsYWJlbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcbiAgXHJcbiAgYnV0dG9uOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImJ1dHRvbi1cIiArICQoXCIuYnV0dG9uXCIpLmxlbmd0aCxcclxuICAgICAgb25jbGljazogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJzcGFuLnVpLmJ1dHRvblwiLCB7IGlkOiBwcm9wZXJ0aWVzLmlkIH0sIFtwcm9wZXJ0aWVzLnRleHRdKTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpXHJcbiAgICB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQub25jbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGlmKCQodGhpcykuaGFzQ2xhc3MoXCJkaXNhYmxlZFwiKSlcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICBwcm9wZXJ0aWVzLm9uY2xpY2suY2FsbCh0aGlzLCBlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBzZWxlY3Q6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwic2VsZWN0LVwiICsgJChcInNlbGVjdFwiKS5sZW5ndGgsXHJcbiAgICAgIHNlbGVjdGVkOiBcIlwiLFxyXG4gICAgICBvbmNoYW5nZTogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJzZWxlY3QudWlcIiwgeyBpZDogcHJvcGVydGllcy5pZCB9KTtcclxuXHJcbiAgICByZXQub25jaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25jaGFuZ2UodGhpcy52YWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBlbmFibGU7XHJcbiAgICB9O1xyXG5cclxuICAgIHByb3BlcnRpZXMub3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvcHRpb24sIGluZGV4KSB7XHJcbiAgICAgIHJldC5hcHBlbmRDaGlsZChlbChcIm9wdGlvblwiLCB7dmFsdWU6IG9wdGlvbi52YWx1ZX0sIFtvcHRpb24udGV4dF0pKTtcclxuXHJcbiAgICAgIGlmIChvcHRpb24udmFsdWUgPT0gcHJvcGVydGllcy5zZWxlY3RlZClcclxuICAgICAgICByZXQuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBicmVhazogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGVsKFwic3Bhbi51aS5icmVha1wiKTtcclxuICB9LFxyXG5cclxuICBpbnB1dFRleHQ6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwiaW5wdXRUZXh0LVwiICsgJChcImlucHV0W3R5cGU9dGV4dF1cIikubGVuZ3RoLFxyXG4gICAgICB2YWx1ZTogXCJcIixcclxuICAgICAgb25pbnB1dDogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJpbnB1dC51aVwiLCB7IHR5cGU6IFwidGV4dFwiLCBpZDogcHJvcGVydGllcy5pZCwgdmFsdWU6IHByb3BlcnRpZXMudmFsdWUgfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQub25pbnB1dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcHJvcGVydGllcy5vbmlucHV0KHRoaXMudmFsdWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcblxyXG4gIGlucHV0TnVtYmVyOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImlucHV0TnVtYmVyLVwiICsgJChcImlucHV0W3R5cGU9bnVtYmVyXVwiKS5sZW5ndGgsXHJcbiAgICAgIHZhbHVlOiAwLFxyXG4gICAgICBtaW46IC1JbmZpbml0eSxcclxuICAgICAgbWF4OiBJbmZpbml0eSxcclxuICAgICAgc3RlcDogMSxcclxuICAgICAgb25pbnB1dDogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJpbnB1dC51aVwiLCB7IHR5cGU6IFwibnVtYmVyXCIsIGlkOiBwcm9wZXJ0aWVzLmlkLCB2YWx1ZTogcHJvcGVydGllcy52YWx1ZSwgbWluOiBwcm9wZXJ0aWVzLm1pbiwgbWF4OiBwcm9wZXJ0aWVzLm1heCwgc3RlcDogcHJvcGVydGllcy5zdGVwIH0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0Lm9uaW5wdXQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uaW5wdXQodGhpcy52YWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgaHRtbDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBjb250ZW50OiBcIlwiXHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICByZXR1cm4gcHJvcGVydGllcy5jb250ZW50O1xyXG4gIH0sXHJcblxyXG4gIGlucHV0Q29sb3I6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwiaW5wdXRDb2xvci1cIiArICQoXCJpbnB1dFt0eXBlPWNvbG9yXVwiKS5sZW5ndGgsXHJcbiAgICAgIHZhbHVlOiBcIiMwMDAwMDBcIixcclxuICAgICAgb25pbnB1dDogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJpbnB1dC51aS5idXR0b25cIiwgeyB0eXBlOiBcImNvbG9yXCIsIGlkOiBwcm9wZXJ0aWVzLmlkLCB2YWx1ZTogcHJvcGVydGllcy52YWx1ZSB9KTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5vbmlucHV0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uaW5wdXQodGhpcy52YWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgcmFuZ2U6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICBwcm9wZXJ0aWVzID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgaWQ6IFwicmFuZ2UtXCIgKyAkKFwiaW5wdXRbdHlwZT1yYW5nZV1cIikubGVuZ3RoLFxyXG4gICAgICB2YWx1ZTogMCxcclxuICAgICAgbWluOiAwLFxyXG4gICAgICBtYXg6IDEwLFxyXG4gICAgICBzdGVwOiAxLFxyXG4gICAgICBvbmlucHV0OiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciBzbGlkZXIgPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJyYW5nZVwiLCBtaW46IHByb3BlcnRpZXMubWluLCBtYXg6IHByb3BlcnRpZXMubWF4LCBzdGVwOiBwcm9wZXJ0aWVzLnN0ZXAsIHZhbHVlOiBwcm9wZXJ0aWVzLnZhbHVlLCBpZDogcHJvcGVydGllcy5pZCB9KTtcclxuICAgIHZhciBpbnB1dCA9IHRoaXMuaW5wdXROdW1iZXIocHJvcGVydGllcyk7XHJcblxyXG4gICAgaW5wdXQub25pbnB1dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uaW5wdXQoaW5wdXQudmFsdWUpO1xyXG4gICAgICBzbGlkZXIudmFsdWUgPSBpbnB1dC52YWx1ZTtcclxuICAgIH07XHJcblxyXG4gICAgc2xpZGVyLmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcblxyXG4gICAgICAkKGlucHV0KS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICBpbnB1dC5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHNsaWRlci5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgJChpbnB1dCkucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgaW5wdXQuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgc2xpZGVyLm9uaW5wdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgICAgaW5wdXQudmFsdWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgcmV0dXJuIGVsKFwiZGl2LnVpLnJhbmdlXCIsIHt9LCBbc2xpZGVyLCBpbnB1dF0pO1xyXG4gIH0sXHJcblxyXG4gIGNoZWNrYm94OiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImNoZWNrYm94LVwiICsgJChcImlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLmxlbmd0aCxcclxuICAgICAgY2hlY2tlZDogZmFsc2UsXHJcbiAgICAgIG9uY2hhbmdlOiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcInNwYW5cIik7XHJcbiAgICB2YXIgY2hlY2tib3ggPSBlbChcImlucHV0LnVpXCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBpZDogcHJvcGVydGllcy5pZCB9KTtcclxuICAgIHZhciBsYWJlbCA9IGVsKFwibGFiZWwudWkuYnV0dG9uXCIsIHsgZm9yOiBwcm9wZXJ0aWVzLmlkIH0pO1xyXG5cclxuICAgIHJldC5hcHBlbmRDaGlsZChjaGVja2JveCk7XHJcbiAgICByZXQuYXBwZW5kQ2hpbGQobGFiZWwpO1xyXG5cclxuICAgIGNoZWNrYm94LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoXCIrbGFiZWxcIiwgdGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIGNoZWNrYm94LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIGNoZWNrYm94LmNoZWNrZWQgPSBwcm9wZXJ0aWVzLmNoZWNrZWQ7XHJcblxyXG4gICAgY2hlY2tib3gub25jaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25jaGFuZ2UodGhpcy5jaGVja2VkKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBidWlsZDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHZhciByZXQgPSBlbC5kaXYoKTtcclxuXHJcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgdmFyIGdlbmVyYXRlZDtcclxuICAgICAgXHJcbiAgICAgIHN3aXRjaCAoZWxlbWVudC50eXBlKSB7XHJcbiAgICAgICAgY2FzZSBcInJhZGlvXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLnJhZGlvKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJidXR0b25cIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuYnV0dG9uKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJzZWxlY3RcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuc2VsZWN0KGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJpbnB1dFRleHRcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuaW5wdXRUZXh0KGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJpbnB1dE51bWJlclwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5pbnB1dE51bWJlcihlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiaW5wdXRDb2xvclwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5pbnB1dENvbG9yKGVsZW1lbnQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgXCJjaGVja2JveFwiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5jaGVja2JveChlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwicmFuZ2VcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMucmFuZ2UoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImh0bWxcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuaHRtbChlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiYnJlYWtcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuYnJlYWsoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQoZ2VuZXJhdGVkKTtcclxuICAgIH0sIHRoaXMpO1xyXG4gICAgXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcbiAgXHJcbiAgYnVpbGRMYXlvdXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvbnRlbnQgPSBlbChcImRpdi51aS5jb250ZW50LnBhbmVsXCIpO1xyXG4gICAgdmFyIHNpZGViYXIgPSBlbChcImRpdi51aS5zaWRlYmFyLnBhbmVsXCIsIHt9LCBbIGVsKFwiZGl2LmNvbnRlbnRcIikgXSk7XHJcbiAgICB2YXIgcmVzaXplciA9IGVsKFwiZGl2LnVpLnJlc2l6ZXJcIik7XHJcbiAgICB2YXIgdG9vbGJhciA9IGVsKFwiZGl2LnVpLnRvb2xiYXJcIik7XHJcblxyXG4gICAgdmFyIHcgPSAkKFwiYm9keVwiKS5vdXRlcldpZHRoKCk7XHJcbiAgICB2YXIgc2lkZWJhcldpZHRoID0gMjUwO1xyXG5cclxuICAgIGNvbnRlbnQuc3R5bGUud2lkdGggPSB3IC0gMjUwICsgXCJweFwiO1xyXG4gICAgc2lkZWJhci5zdHlsZS53aWR0aCA9IHNpZGViYXJXaWR0aCArIFwicHhcIjtcclxuXHJcbiAgICB2YXIgc2lkZWJhclJlc2l6ZUV2ZW50ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgdmFyIHdpbmRvd1dpZHRoID0gJChcImJvZHlcIikub3V0ZXJXaWR0aCgpO1xyXG4gICAgICB2YXIgc2lkZWJhcldpZHRoID0gTWF0aC5tYXgoMzAsIE1hdGgubWluKHdpbmRvd1dpZHRoICogMC42LCB3aW5kb3dXaWR0aCAtIGUuY2xpZW50WCkpO1xyXG4gICAgICB2YXIgY29udGVudFdpZHRoID0gd2luZG93V2lkdGggLSBzaWRlYmFyV2lkdGg7XHJcblxyXG4gICAgICBzaWRlYmFyLnN0eWxlLndpZHRoID0gc2lkZWJhcldpZHRoICsgXCJweFwiO1xyXG4gICAgICBjb250ZW50LnN0eWxlLndpZHRoID0gY29udGVudFdpZHRoICsgXCJweFwiO1xyXG5cclxuICAgICAgd2luZG93Lm9ucmVzaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBtb3VzZVVwRXZlbnQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBzaWRlYmFyLnJlc2l6aW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAkKFwiLnJlc2l6ZXIudWlcIikucmVtb3ZlQ2xhc3MoXCJyZXNpemluZ1wiKTtcclxuXHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHNpZGViYXJSZXNpemVFdmVudCk7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBtb3VzZVVwRXZlbnQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgd2luZG93UmVzaXplRXZlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciB3aW5kb3dXaWR0aCA9ICQoXCJib2R5XCIpLm91dGVyV2lkdGgoKTtcclxuICAgICAgdmFyIGNvbnRlbnRXaWR0aCA9IE1hdGgubWF4KHdpbmRvd1dpZHRoICogMC40LCBNYXRoLm1pbihcclxuICAgICAgICB3aW5kb3dXaWR0aCAtIDMwLFxyXG4gICAgICAgIHdpbmRvd1dpZHRoIC0gJChcIi5zaWRlYmFyLnVpXCIpLm91dGVyV2lkdGgoKVxyXG4gICAgICApKTtcclxuICAgICAgdmFyIHNpZGViYXJXaWR0aCA9IHdpbmRvd1dpZHRoIC0gY29udGVudFdpZHRoO1xyXG5cclxuICAgICAgc2lkZWJhci5zdHlsZS53aWR0aCA9IHNpZGViYXJXaWR0aCArIFwicHhcIjtcclxuICAgICAgY29udGVudC5zdHlsZS53aWR0aCA9IGNvbnRlbnRXaWR0aCArIFwicHhcIjtcclxuICAgIH07XHJcblxyXG4gICAgcmVzaXplci5vbm1vdXNlZG93biA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHNpZGViYXIucmVzaXppbmcgPSB0cnVlO1xyXG5cclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcInJlc2l6aW5nXCIpO1xyXG5cclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2lkZWJhclJlc2l6ZUV2ZW50KTtcclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG1vdXNlVXBFdmVudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHdpbmRvd1Jlc2l6ZUV2ZW50KTtcclxuXHJcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKHRvb2xiYXIpO1xyXG4gICAgc2lkZWJhci5hcHBlbmRDaGlsZChyZXNpemVyKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNpZGViYXIpO1xyXG4gIH0sXHJcblxyXG4gIC8vIENyZWF0aW5nIGEgcG9wdXAgbWVzc2FnZVxyXG4gIHBvcHVwOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICB2YXIgb3ZlcmxheSA9IGVsKFwiZGl2I3BvcHVwT3ZlcmxheVwiLCBbZWwoXCJkaXYjcG9wdXBDb250ZW50XCIsIFtkYXRhXSldKTtcclxuICAgIG92ZXJsYXkub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgVUlCdWlsZGVyLmNsb3NlUG9wdXAoZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKG92ZXJsYXksIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgVHJhbnNsYXRpb25zLnJlZnJlc2goKTtcclxuICB9LFxyXG5cclxuICAvLyBDbG9zaW5nIGEgcG9wdXAgbWVzc2FnZVxyXG4gIGNsb3NlUG9wdXA6IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3B1cE92ZXJsYXlcIik7XHJcbiAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9wdXBDb250ZW50XCIpO1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSBpdCB3YXMgdGhlIG92ZXJsYXkgdGhhdCB3YXMgY2xpY2tlZCwgbm90IGFuIGVsZW1lbnQgYWJvdmUgaXRcclxuICAgIGlmICh0eXBlb2YgZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBlLnRhcmdldCAhPT0gb3ZlcmxheSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgY29udGVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNvbnRlbnQpO1xyXG4gICAgb3ZlcmxheS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG92ZXJsYXkpO1xyXG4gIH0sXHJcblxyXG5cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJQnVpbGRlcjsiLCIvLyBPYmplY3QgY29udGFpbmluZyB1c2VmdWwgbWV0aG9kc1xyXG52YXIgVXRpbHMgPSB7XHJcbiAgZ2V0QnJvd3NlcldpZHRoOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkKFwiLnVpLmNvbnRlbnRcIikub3V0ZXJXaWR0aCgpO1xyXG4gIH0sXHJcblxyXG4gIGdldEJyb3dzZXJIZWlnaHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICQoXCIudWkuY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gJChcIi51aS50b29sYmFyXCIpLm91dGVySGVpZ2h0KCk7XHJcbiAgfSxcclxuXHJcbiAgcmFuZG9tUmFuZ2U6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pO1xyXG4gIH0sXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7IiwidmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHMuanNcIik7XHJcblxyXG4vLyBWSUVXUE9SVFxyXG4vLyBUaGlzIGlzIGJhc2ljYWxseSBjYW1lcmEgKyBwcm9qZWN0b3JcclxuXHJcbnZhciBWaWV3cG9ydCA9IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIHgsIHkpIHtcclxuICB0aGlzLnNjYWxlID0gMSAvIDIwO1xyXG5cclxuICAvLyBDYW52YXMgZGltZW5zaW9uc1xyXG4gIGlmICh3aWR0aCAhPSB1bmRlZmluZWQgJiYgaGVpZ2h0ICE9IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5zZXRBdXRvUmVzaXplKGZhbHNlKTtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnNldEF1dG9SZXNpemUodHJ1ZSk7XHJcbiAgICB0aGlzLmF1dG9SZXNpemUoKTtcclxuICB9XHJcblxyXG4gIC8vIENlbnRlciBwb2ludCBvZiB0aGUgY2FtZXJhXHJcbiAgaWYgKHggIT09IHVuZGVmaW5lZCAmJiB5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnggPSAwO1xyXG4gICAgdGhpcy55ID0gMDtcclxuICB9XHJcblxyXG4gIC8vIENhbnZhcyBlbGVtZW50XHJcbiAgdGhpcy5jYW52YXNFbGVtZW50ID0gY2FudmFzRWxlbWVudDtcclxuXHJcbiAgaWYgKGNhbnZhc0VsZW1lbnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5jYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXNFbGVtZW50KTtcclxuICB9XHJcblxyXG4gIHRoaXMucmVzZXRFbGVtZW50KCk7IC8vIFJlc2l6ZSB0byBuZXcgZGltZW5zaW9uc1xyXG5cclxuICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG59O1xyXG5cclxuLy8gUmVsb2FkcyB2YWx1ZXMgZm9yIHRoZSBjYW52YXMgZWxlbWVudFxyXG5WaWV3cG9ydC5wcm90b3R5cGUucmVzZXRFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5jYW52YXNFbGVtZW50LndpZHRoID0gdGhpcy53aWR0aDtcclxuICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbn07XHJcblxyXG4vLyBBdXRvbWF0aWNhbGx5IHJlc2l6ZXMgdGhlIHZpZXdwb3J0IHRvIGZpbGwgdGhlIHNjcmVlblxyXG5WaWV3cG9ydC5wcm90b3R5cGUuYXV0b1Jlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMud2lkdGggPSBVdGlscy5nZXRCcm93c2VyV2lkdGgoKTtcclxuICB0aGlzLmhlaWdodCA9IFV0aWxzLmdldEJyb3dzZXJIZWlnaHQoKTtcclxufTtcclxuXHJcbi8vIFRvZ2dsZXMgdmlld3BvcnQgYXV0byByZXNpemluZ1xyXG5WaWV3cG9ydC5wcm90b3R5cGUuc2V0QXV0b1Jlc2l6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblxyXG4gIHRoaXMuYXV0b1Jlc2l6ZUFjdGl2ZSA9IHZhbHVlO1xyXG5cclxuICBpZiAodGhpcy5hdXRvUmVzaXplQWN0aXZlKSB7XHJcbiAgICB2YXIgdCA9IHRoaXM7XHJcbiAgICB3aW5kb3cub25yZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdC5hdXRvUmVzaXplKCk7XHJcbiAgICAgIHQucmVzZXRFbGVtZW50KCk7XHJcbiAgICB9O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB3aW5kb3cub25yZXNpemUgPSBudWxsO1xyXG4gIH1cclxufTtcclxuXHJcblZpZXdwb3J0LnByb3RvdHlwZS5nZXRPZmZzZXQgPSBmdW5jdGlvbigpXHJcbntcclxuICByZXR1cm4gW3RoaXMueCAtIHRoaXMud2lkdGggLyAyLCB0aGlzLnkgLSB0aGlzLmhlaWdodCAvIDJdO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWV3cG9ydDsiXX0=
