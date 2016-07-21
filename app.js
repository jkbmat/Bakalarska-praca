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
  this.updateCollisions();

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

  if (!_engine.world.paused) {
    // box2d simulation step
    this.world.Step(1 / 60, 10, 5);
  }
  else {
    Input.tool.onmove(ctx);
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
      -(this.viewport.x - this.viewport.width / 2) / this.viewport.scale,
      -(this.viewport.y - this.viewport.height / 2) / this.viewport.scale);
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


_engine.addEntity(new Circle(new b2Vec2(40, 6), 2), BodyType.DYNAMIC_BODY)
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

_engine.addEntity(new Rectangle(new b2Vec2(42, 35), new b2Vec2(35, 0.2)), BodyType.KINEMATIC_BODY)
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
      this.x = this.canvasX * _engine.viewport.scale + (_engine.viewport.x - _engine.viewport.width / 2);
      this.y = this.canvasY * _engine.viewport.scale + (_engine.viewport.y - _engine.viewport.height / 2);
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
    document.onselectstart = function () {
      return false;
    }
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
  w: 0,
  h: 0,
  minSize: 5,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [Input.mouse.canvasX, Input.mouse.canvasY];
  },

  onrelease: function () {
    if (this.w >= this.minSize && this.h >= this.minSize) {
      var x = this.origin[0] * _engine.viewport.scale + _engine.viewport.getOffset()[0];
      var y = this.origin[1] * _engine.viewport.scale + _engine.viewport.getOffset()[1];

      this.w *= _engine.viewport.scale;
      this.h *= _engine.viewport.scale;

      _engine.addEntity(new Shape.Rectangle(
        new b2Vec2(x + this.w / 2, y + this.h / 2),
        new b2Vec2(this.w / 2, this.h / 2)), Type.DYNAMIC_BODY);
    }

    this.onmove = function(){};
    this.origin = null;
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
  radius: 0,
  minRadius: 5,

  onclick: function () {
    this.onmove = this.dragging;
    this.origin = [Input.mouse.canvasX, Input.mouse.canvasY];
  },

  onrelease: function () {
    if (this.radius >= this.minRadius) {
      var x = this.origin[0] * _engine.viewport.scale + _engine.viewport.getOffset()[0];
      var y = this.origin[1] * _engine.viewport.scale + _engine.viewport.getOffset()[1];

      this.radius *= _engine.viewport.scale;

      _engine.addEntity(new Shape.Circle(
        new b2Vec2(x + this.radius, y + this.radius),
        this.radius), Type.DYNAMIC_BODY);
    }

    this.onmove = function(){};
    this.origin = null;
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
      { type: "inputNumber", value: entity.body.GetAngle() * 180 / Math.PI, id: "entity_rotation",
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

Viewport.prototype.getOffset = function()
{
  return [this.x - this.width / 2, this.y - this.height / 2];
};

module.exports = Viewport;
},{"./utils.js":19}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1VzZXJzL0pha3ViIE1hdHXFoWthL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2FjdGlvbnMuanMiLCJqcy9iZWhhdmlvci5qcyIsImpzL2JlaGF2aW9yYnVpbGRlci5qcyIsImpzL2JvZHl0eXBlLmpzIiwianMvZW5naW5lLmpzIiwianMvZW50aXR5LmpzIiwianMvZW50aXR5ZmlsdGVycy5qcyIsImpzL2VudHJ5LmpzIiwianMvaW5wdXQuanMiLCJqcy9sb2dpYy5qcyIsImpzL3BhcnNlci5qcyIsImpzL3NoYXBlcy5qcyIsImpzL3Rva2VuLmpzIiwianMvdG9rZW5tYW5hZ2VyLmpzIiwianMvdG9vbHMuanMiLCJqcy90eXBpbmcuanMiLCJqcy91aS5qcyIsImpzL3VpYnVpbGRlci5qcyIsImpzL3V0aWxzLmpzIiwianMvdmlld3BvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQWN0aW9uID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuQWN0aW9uO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBbXTtcclxuXHJcbnZhciBhU2V0Q29sb3IgPSBmdW5jdGlvbihlZiwgY29sb3IpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcInNldENvbG9yXCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLlNUUklOR10pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChlZik7XHJcbiAgdGhpcy5hcmdzLnB1c2goY29sb3IpO1xyXG59O1xyXG5hU2V0Q29sb3IucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYVNldENvbG9yLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LnNldENvbG9yKHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcclxufTtcclxuXHJcbmFTZXRDb2xvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhU2V0Q29sb3I7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goYVNldENvbG9yKTtcclxuXHJcblxyXG52YXIgYVRvcnF1ZSA9IGZ1bmN0aW9uKGVmLCBzdHJlbmd0aCkge1xyXG4gIEFjdGlvbi5jYWxsKHRoaXMsIFwiYXBwbHlUb3JxdWVcIiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaChzdHJlbmd0aCk7XHJcbn07XHJcbmFUb3JxdWUucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYVRvcnF1ZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5ib2R5LkFwcGx5VG9ycXVlKGVudGl0eS5nZXRNYXNzKCkgKiB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSk7XHJcbn07XHJcblxyXG5hVG9ycXVlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFUb3JxdWU7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goYVRvcnF1ZSk7XHJcblxyXG5cclxudmFyIGFBbmd1bGFySW1wdWxzZSA9IGZ1bmN0aW9uKGVmLCBzdHJlbmd0aCkge1xyXG4gIEFjdGlvbi5jYWxsKHRoaXMsIFwiYXBwbHlBbmd1bGFySW1wdWxzZVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHN0cmVuZ3RoKTtcclxufTtcclxuYUFuZ3VsYXJJbXB1bHNlLnByb3RvdHlwZSA9IG5ldyBBY3Rpb24oKTtcclxuXHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIGVudGl0eS5ib2R5LkFwcGx5QW5ndWxhckltcHVsc2UoZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcclxufTtcclxuXHJcbmFBbmd1bGFySW1wdWxzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhQW5ndWxhckltcHVsc2U7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goYUFuZ3VsYXJJbXB1bHNlKTtcclxuXHJcblxyXG52YXIgYUxpbmVhclZlbG9jaXR5ID0gZnVuY3Rpb24oZWYsIHgsIHkpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcInNldExpbmVhclZlbG9jaXR5XCIsIGFyZ3VtZW50cywgW1R5cGUuRU5USVRZRklMVEVSLCBUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2goZWYpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHgpO1xyXG4gIHRoaXMuYXJncy5wdXNoKHkpO1xyXG59O1xyXG5hTGluZWFyVmVsb2NpdHkucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYUxpbmVhclZlbG9jaXR5LnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgZW50aXR5LnNldExpbmVhclZlbG9jaXR5KG5ldyBiMlZlYzIodGhpcy5hcmdzWzFdLmV2YWx1YXRlKCksIHRoaXMuYXJnc1syXS5ldmFsdWF0ZSgpKSk7XHJcbn07XHJcblxyXG5hTGluZWFyVmVsb2NpdHkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYUxpbmVhclZlbG9jaXR5O1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFMaW5lYXJWZWxvY2l0eSk7XHJcblxyXG5cclxudmFyIGFMaW5lYXJJbXB1bHNlID0gZnVuY3Rpb24oZWYsIHgsIHkpIHtcclxuICBBY3Rpb24uY2FsbCh0aGlzLCBcImFwcGx5TGluZWFySW1wdWxzZVwiLCBhcmd1bWVudHMsIFtUeXBlLkVOVElUWUZJTFRFUiwgVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XHJcblxyXG4gIHRoaXMuYXJncy5wdXNoKGVmKTtcclxuICB0aGlzLmFyZ3MucHVzaCh4KTtcclxuICB0aGlzLmFyZ3MucHVzaCh5KTtcclxufTtcclxuYUxpbmVhckltcHVsc2UucHJvdG90eXBlID0gbmV3IEFjdGlvbigpO1xyXG5cclxuYUxpbmVhckltcHVsc2UucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICBlbnRpdHkuYXBwbHlMaW5lYXJJbXB1bHNlKG5ldyBiMlZlYzIoZW50aXR5LmdldE1hc3MoKSAqIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpLCBlbnRpdHkuZ2V0TWFzcygpICogdGhpcy5hcmdzWzJdLmV2YWx1YXRlKCkpKTtcclxufTtcclxuXHJcbmFMaW5lYXJJbXB1bHNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGFMaW5lYXJJbXB1bHNlO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGFMaW5lYXJJbXB1bHNlKTtcclxuXHJcbiIsInZhciBUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLlR5cGU7XG5cbnZhciBCZWhhdmlvciA9IGZ1bmN0aW9uKGxvZ2ljLCByZXN1bHRzKSB7XG4gIHRoaXMubG9naWMgPSBsb2dpYztcblxuICBpZiAodGhpcy5sb2dpYy50eXBlICE9PSBUeXBlLkJPT0xFQU4pXG4gICAgdGhyb3cgbmV3IFR5cGVFeGNlcHRpb24oVHlwZS5CT09MRUFOLCB0aGlzLmxvZ2ljLnR5cGUsIHRoaXMpO1xuXG4gIHRoaXMucmVzdWx0cyA9IEFycmF5LmlzQXJyYXkocmVzdWx0cykgPyByZXN1bHRzIDogW3Jlc3VsdHNdO1xufTtcblxuQmVoYXZpb3IucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oZW50aXR5KSB7XG4gIHJldHVybiB0aGlzLmxvZ2ljLmV2YWx1YXRlKGVudGl0eSk7XG59O1xuXG5CZWhhdmlvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIFwiQmVoYXZpb3IoXCIgKyB0aGlzLmxvZ2ljLnRvU3RyaW5nKCkgKyBcIiwgXCIgKyB0aGlzLnJlc3VsdHMudG9TdHJpbmcoKSArIFwiKVwiO1xufTtcblxuQmVoYXZpb3IucHJvdG90eXBlLnJlc3VsdCA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMucmVzdWx0c1tpXS5leGVjdXRlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQmVoYXZpb3I7IiwidmFyIEZpeFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuRml4VHlwZTtcclxudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbnZhciBCZWhhdmlvckJ1aWxkZXIgPSBmdW5jdGlvbiAodG9rZW5NYW5hZ2VyKSB7XHJcbiAgdGhpcy50b2tlbk1hbmFnZXIgPSB0b2tlbk1hbmFnZXI7XHJcbn07XHJcblxyXG5CZWhhdmlvckJ1aWxkZXIucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAodHlwZSwgY29udGFpbmVyKSB7XHJcbiAgdmFyIGJ0biA9IGVsKFwic3Bhbi51aS5idXR0b25cIiwge30sIFtcIitcIl0pO1xyXG4gIGJ0bi50eXBlID0gdHlwZTtcclxuXHJcbiAgYnRuLm9uY2xpY2sgPSB0aGlzLmJ1aWxkQ2hvaWNlQ2xpY2soKTtcclxuXHJcbiAgJChjb250YWluZXIpLmh0bWwoYnRuKTtcclxufTtcclxuXHJcbkJlaGF2aW9yQnVpbGRlci5wcm90b3R5cGUuYnVpbGRDaG9pY2VDbGljayA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gIHJldHVybiBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICB0aGF0LmJ1aWxkQ2hvaWNlKHRoYXQudG9rZW5NYW5hZ2VyLmdldFRva2Vuc0J5VHlwZSh0aGlzLnR5cGUpLCB0aGlzKTtcclxuICB9O1xyXG59O1xyXG5cclxuQmVoYXZpb3JCdWlsZGVyLnByb3RvdHlwZS5idWlsZEFyZ3VtZW50ID0gZnVuY3Rpb24gKHRva2VuLCBhcmdJbmRleCwgYXJnSG9sZGVyKSB7XHJcbiAgLy8gQnVpbGRzIGFuIGFyZ3VtZW50IG9yIGFyZ3VtZW50IHBsYWNlaG9sZGVyLiBSZXR1cm5zIGZhbHNlIG9uIGJhZCBsaXRlcmFsIGlucHV0LlxyXG5cclxuICBpZiAodG9rZW4uYXJnc1thcmdJbmRleF0gIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAvLyBUb2tlbiBpbiBhcmd1bWVudCBleGlzdHMsIGJ1aWxkIGl0XHJcbiAgICBcclxuICAgIGlmICh0b2tlbi5hcmd1bWVudF90eXBlc1thcmdJbmRleF0gPT09IFR5cGUuTElURVJBTCkge1xyXG4gICAgICAvLyBMaXRlcmFscyBhcmUgZGVhbHQgd2l0aCBhbmQgZG9uZVxyXG5cclxuICAgICAgJChhcmdIb2xkZXIpLnJlcGxhY2VXaXRoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRva2VuLmV2YWx1YXRlKCkpKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5idWlsZFRva2VuKHRva2VuLmFyZ3NbYXJnSW5kZXhdLCBhcmdIb2xkZXIpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgLy8gQXJndW1lbnQgaXMgZW1wdHkgc28gZmFyLCBhZGQgYSBidXR0b24gdG8gY3JlYXRlIG5ld1xyXG5cclxuICAgIGlmICh0b2tlbi5hcmd1bWVudF90eXBlc1thcmdJbmRleF0gPT09IFR5cGUuTElURVJBTCkge1xyXG4gICAgICAvLyBMaXRlcmFscyBhcmUgZGVhbHQgd2l0aCBhbmQgZG9uZVxyXG5cclxuICAgICAgdG9rZW4ucG9wdWxhdGUoKTtcclxuICAgICAgaWYgKCEgdG9rZW4udmFsaWRhdGUoKSlcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAkKGFyZ0hvbGRlcikucmVwbGFjZVdpdGgoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodG9rZW4uZXZhbHVhdGUoKSkpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemUodG9rZW4uYXJndW1lbnRfdHlwZXNbYXJnSW5kZXhdLCBhcmdIb2xkZXIpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuQmVoYXZpb3JCdWlsZGVyLnByb3RvdHlwZS5idWlsZFRva2VuID0gZnVuY3Rpb24gKHRva2VuLCBob2xkZXIpIHtcclxuICB2YXIgcmV0ID0gZWwoXCJzcGFuLnRva2VuXCIsIHt9LCBbZWwoXCJzcGFuLm5hbWVcIiwge30sIFt0b2tlbi5uYW1lXSldKTtcclxuXHJcbiAgcmV0LnR5cGUgPSB0b2tlbi50eXBlO1xyXG4gIHJldC5vbmNsaWNrID0gdGhpcy5idWlsZENob2ljZUNsaWNrKCk7XHJcblxyXG4gIC8vIEZpeCwgc28gOmhvdmVyIHRyaWdnZXJzIG9ubHkgb24gYWN0dWFsIGhvdmVyZWQgdG9rZW4sIG5vdCBpdHMgYW5jZXN0b3JzXHJcbiAgcmV0Lm9ubW91c2VvdmVyID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgJCh0aGlzKS5hZGRDbGFzcyhcImhvdmVyXCIpO1xyXG4gIH07XHJcbiAgcmV0Lm9ubW91c2VvdXQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImhvdmVyXCIpO1xyXG4gIH07XHJcblxyXG4gIGlmICh0b2tlbi5maXhUeXBlID09PSBGaXhUeXBlLlBSRUZJWCkge1xyXG4gICAgcmV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiKCBcIikpO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgdG9rZW4uYXJndW1lbnRfdHlwZXMubGVuZ3RoOyBpbmRleCArKykge1xyXG4gICAgICB2YXIgYXJnSG9sZGVyID0gZWwoXCJzcGFuLmFyZ3VtZW50XCIpO1xyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQoYXJnSG9sZGVyKTtcclxuXHJcbiAgICAgIGlmICghIHRoYXQuYnVpbGRBcmd1bWVudCh0b2tlbiwgaW5kZXgsIGFyZ0hvbGRlcikpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpbmRleCAhPT0gdG9rZW4uYXJndW1lbnRfdHlwZXMubGVuZ3RoIC0gMSlcclxuICAgICAgICByZXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIsIFwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIClcIikpO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRva2VuLmZpeFR5cGUgPT09IEZpeFR5cGUuSU5GSVgpIHtcclxuICAgIHJldC5pbnNlcnRCZWZvcmUoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIgXCIpLCByZXQuZmlyc3RDaGlsZCk7XHJcbiAgICByZXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIgXCIpKTtcclxuXHJcbiAgICB2YXIgYXJnSG9sZGVyID0gZWwoXCJzcGFuXCIpO1xyXG4gICAgcmV0Lmluc2VydEJlZm9yZShhcmdIb2xkZXIsIHJldC5maXJzdENoaWxkKTtcclxuXHJcbiAgICB0aGlzLmJ1aWxkQXJndW1lbnQodG9rZW4sIDAsIGFyZ0hvbGRlcik7XHJcblxyXG4gICAgYXJnSG9sZGVyID0gZWwoXCJzcGFuXCIpO1xyXG4gICAgcmV0LmFwcGVuZENoaWxkKGFyZ0hvbGRlcik7XHJcblxyXG4gICAgdGhpcy5idWlsZEFyZ3VtZW50KHRva2VuLCAxLCBhcmdIb2xkZXIpO1xyXG4gIH1cclxuXHJcbiAgJChob2xkZXIpLnJlcGxhY2VXaXRoKHJldCk7XHJcbn07XHJcblxyXG5CZWhhdmlvckJ1aWxkZXIucHJvdG90eXBlLmJ1aWxkQ2hvaWNlID0gZnVuY3Rpb24gKHRva2VucywgaG9sZGVyKSB7XHJcbiAgJChcImRpdiN0b2tlbkNob2ljZVwiKS5yZW1vdmUoKTtcclxuICB2YXIgY29udGFpbmVyID0gZWwoXCJkaXYjdG9rZW5DaG9pY2VcIik7XHJcbiAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICB0b2tlbnMuZm9yRWFjaChmdW5jdGlvbiAodG9rZW4pIHtcclxuICAgIHZhciB0ZXh0ID0gZWwoXCJkaXYudG9rZW5cIiwge30sIFtlbChcInNwYW4ubmFtZVwiLCB7fSwgW3Rva2VuLm5hbWVdKV0pO1xyXG5cclxuICAgIGlmICh0b2tlbi5maXhUeXBlID09PSBGaXhUeXBlLlBSRUZJWClcclxuICAgICAgdGV4dC5hcHBlbmRDaGlsZChlbChcInNwYW4uYXJndW1lbnRcIiwge30sIFtcIiggXCIsIHRva2VuLmFyZ3VtZW50X3R5cGVzLmpvaW4oXCIsIFwiKSwgXCIgKVwiXSkpO1xyXG5cclxuICAgIGlmICh0b2tlbi5maXhUeXBlID09PSBGaXhUeXBlLklORklYKSB7XHJcbiAgICAgIHRleHQuaW5zZXJ0QmVmb3JlKGVsKFwic3Bhbi5hcmd1bWVudFwiLCB7fSwgW1wiKCBcIiwgdG9rZW4uYXJndW1lbnRfdHlwZXNbMF0sIFwiIClcIl0pLCB0ZXh0LmZpcnN0Q2hpbGQpO1xyXG4gICAgICB0ZXh0LmFwcGVuZENoaWxkKGVsKFwic3Bhbi5hcmd1bWVudFwiLCB7fSwgW1wiKCBcIiwgdG9rZW4uYXJndW1lbnRfdHlwZXNbMV0sIFwiIClcIl0pKTtcclxuICAgIH1cclxuXHJcbiAgICAkKHRleHQpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgdGhhdC5idWlsZFRva2VuKG5ldyB0b2tlbi5jb25zdHJ1Y3RvcigpLCBob2xkZXIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRleHQpO1xyXG4gIH0pO1xyXG5cclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uZShcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICQoXCJkaXYjdG9rZW5DaG9pY2VcIikucmVtb3ZlKCk7XHJcbiAgfSk7XHJcblxyXG4gIHZhciBvZmZzZXQgPSAxNTtcclxuXHJcbiAgJChjb250YWluZXIpLmNzcyhcImxlZnRcIiwgSW5wdXQubW91c2UucmVhbFggKyBvZmZzZXQgKyBcInB4XCIpO1xyXG4gICQoY29udGFpbmVyKS5jc3MoXCJ0b3BcIiwgSW5wdXQubW91c2UucmVhbFkgKyBvZmZzZXQgKyBcInB4XCIpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCZWhhdmlvckJ1aWxkZXI7XHJcbiIsInZhciBCb2R5VHlwZSA9IHtcclxuICBEWU5BTUlDX0JPRFk6IE1vZHVsZS5iMl9keW5hbWljQm9keSxcclxuICBTVEFUSUNfQk9EWTogTW9kdWxlLmIyX3N0YXRpY0JvZHksXHJcbiAgS0lORU1BVElDX0JPRFk6IE1vZHVsZS5iMl9raW5lbWF0aWNCb2R5XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJvZHlUeXBlOyIsInZhciBVSSA9IHJlcXVpcmUoXCIuL3VpLmpzXCIpO1xyXG52YXIgVG9vbHMgPSByZXF1aXJlKFwiLi90b29scy5qc1wiKTtcclxudmFyIFRva2VuTWFuYWdlciA9IHJlcXVpcmUoXCIuL3Rva2VubWFuYWdlci5qc1wiKTtcclxuXHJcblxyXG5jb25zdCBBVVRPX0lEX1BSRUZJWCA9IFwiRU5USVRZX05VTUJFUl9cIjtcclxuXHJcbmNvbnN0IERJU1BMQVlfUkFUSU8gPSAyMDtcclxuXHJcbi8qLyBNeXNsaWVua3lcclxuXHJcbmxvY2tvdmFuaWUga2FtZXJ5IG5hIG9iamVrdFxyXG4gKiBwcmVjaG9keVxyXG5ha28gZnVuZ3VqZSBjZWxhIGthbWVyYT9cclxuXHJcbi8qL1xyXG5cclxuXHJcbi8vIEVOR0lORVxyXG5cclxuLy8gY29uc3RydWN0b3JcclxuXHJcbnZhciBFbmdpbmUgPSBmdW5jdGlvbih2aWV3cG9ydCwgZ3Jhdml0eSkge1xyXG4gIHRoaXMudmlld3BvcnQgPSB2aWV3cG9ydDtcclxuICB0aGlzLnNlbGVjdGVkRW50aXR5ID0gbnVsbDtcclxuICBcclxuICB0aGlzLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSID0gMTY7XHJcbiAgdGhpcy5MQVlFUlNfTlVNQkVSID0gMTA7XHJcblxyXG4gIHRoaXMubGF5ZXJzID0gbmV3IEFycmF5KHRoaXMuTEFZRVJTX05VTUJFUik7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLkxBWUVSU19OVU1CRVI7IGkrKylcclxuICB7XHJcbiAgICB0aGlzLmxheWVyc1tpXSA9IFtdO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5jb2xsaXNpb25Hcm91cHMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuQ09MTElTSU9OX0dST1VQU19OVU1CRVI7IGkrKykge1xyXG4gICAgdGhpcy5jb2xsaXNpb25Hcm91cHMucHVzaCh7XHJcbiAgICAgIFwibmFtZVwiOiBpICsgMSxcclxuICAgICAgXCJtYXNrXCI6IHBhcnNlSW50KEFycmF5KHRoaXMuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgKyAxKS5qb2luKFwiMVwiKSwgMilcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5saWZldGltZUVudGl0aWVzID0gMDtcclxuXHJcbiAgdGhpcy53b3JsZCA9IG5ldyBiMldvcmxkKGdyYXZpdHksIHRydWUpO1xyXG4gIHRoaXMud29ybGQucGF1c2VkID0gdHJ1ZTtcclxuXHJcbiAgdGhpcy50b2tlbk1hbmFnZXIgPSBuZXcgVG9rZW5NYW5hZ2VyKCk7XHJcblxyXG4gIElucHV0LmluaXRpYWxpemUodmlld3BvcnQuY2FudmFzRWxlbWVudCk7XHJcbn07XHJcblxyXG4vLyBDaGFuZ2VzIHJ1bm5pbmcgc3RhdGUgb2YgdGhlIHNpbXVsYXRpb25cclxuRW5naW5lLnByb3RvdHlwZS50b2dnbGVQYXVzZSA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLndvcmxkLnBhdXNlZCA9ICF0aGlzLndvcmxkLnBhdXNlZDtcclxuICB0aGlzLnNlbGVjdGVkRW50aXR5ID0gbnVsbDtcclxuXHJcbiAgSW5wdXQudG9vbCA9IFRvb2xzLkJsYW5rO1xyXG5cclxuICBpZih0aGlzLndvcmxkLnBhdXNlZClcclxuICAgIElucHV0LnRvb2wgPSBUb29scy5TZWxlY3Rpb247XHJcbn07XHJcblxyXG5FbmdpbmUucHJvdG90eXBlLnJlbW92ZUVudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICB0aGlzLndvcmxkLkRlc3Ryb3lCb2R5KGVudGl0eS5ib2R5KTtcclxuICB0aGlzLmxheWVyc1tlbnRpdHkubGF5ZXJdLnNwbGljZSh0aGlzLmxheWVyc1tlbnRpdHkubGF5ZXJdLmluZGV4T2YoZW50aXR5KSwgMSk7XHJcbn07XHJcblxyXG5FbmdpbmUucHJvdG90eXBlLnNldEVudGl0eUxheWVyID0gZnVuY3Rpb24gKGVudGl0eSwgbmV3TGF5ZXIpIHtcclxuICAvLyBSZW1vdmUgZnJvbSBvbGQgbGF5ZXJcclxuICB0aGlzLmxheWVyc1tlbnRpdHkubGF5ZXJdLnNwbGljZSh0aGlzLmxheWVyc1tlbnRpdHkubGF5ZXJdLmluZGV4T2YoZW50aXR5KSwgMSk7XHJcblxyXG4gIC8vIFNldCBuZXcgbGF5ZXJcclxuICBlbnRpdHkubGF5ZXIgPSBuZXdMYXllcjtcclxuICB0aGlzLmxheWVyc1tuZXdMYXllcl0ucHVzaChlbnRpdHkpO1xyXG59O1xyXG5cclxuLy8gUmV0dXJucyBhbGwgZW50aXRpZXMgaW4gb25lIGFycmF5XHJcbkVuZ2luZS5wcm90b3R5cGUuZW50aXRpZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgdGhpcy5sYXllcnMpO1xyXG59O1xyXG5cclxuXHJcbi8vIFJldHVybnMgdGhlIGVudGl0eSB3aXRoIGlkIHNwZWNpZmllZCBieSBhcmd1bWVudFxyXG5FbmdpbmUucHJvdG90eXBlLmdldEVudGl0eUJ5SWQgPSBmdW5jdGlvbihpZCkge1xyXG4gIHZhciBlbnRpdGllcyA9IHRoaXMuZW50aXRpZXMoKTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKGVudGl0aWVzW2ldLmlkID09PSBpZClcclxuICAgICAgcmV0dXJuIGVudGl0aWVzW2ldO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG4vLyBSZXR1cm5zIGFuIGFycmF5IG9mIGVudGl0aWVzIHdpdGggc3BlY2lmaWVkIGNvbGxpc2lvbkdyb3VwXHJcbkVuZ2luZS5wcm90b3R5cGUuZ2V0RW50aXRpZXNCeUNvbGxpc2lvbkdyb3VwID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuICB2YXIgcmV0ID0gW107XHJcbiAgdmFyIGVudGl0aWVzID0gdGhpcy5lbnRpdGllcygpO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoZW50aXRpZXNbaV0uY29sbGlzaW9uR3JvdXAgPT09IGdyb3VwKVxyXG4gICAgICByZXQucHVzaChlbnRpdGllc1tpXSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuLy8gQWRkaW5nIGFuIGVudGl0eSB0byB0aGUgd29ybGRcclxuRW5naW5lLnByb3RvdHlwZS5hZGRFbnRpdHkgPSBmdW5jdGlvbihlbnRpdHksIHR5cGUpIHtcclxuICAvLyBnZW5lcmF0ZSBhdXRvIGlkXHJcbiAgaWYgKGVudGl0eS5pZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICBlbnRpdHkuaWQgPSBBVVRPX0lEX1BSRUZJWCArIHRoaXMubGlmZXRpbWVFbnRpdGllcztcclxuICB9XHJcblxyXG4gIHRoaXMubGlmZXRpbWVFbnRpdGllcysrO1xyXG5cclxuICBlbnRpdHkuYm9keS5zZXRfdHlwZSh0eXBlKTtcclxuXHJcbiAgZW50aXR5LmJvZHkgPSB0aGlzLndvcmxkLkNyZWF0ZUJvZHkoZW50aXR5LmJvZHkpO1xyXG4gIGVudGl0eS5maXh0dXJlID0gZW50aXR5LmJvZHkuQ3JlYXRlRml4dHVyZShlbnRpdHkuZml4dHVyZSk7XHJcblxyXG4gIHRoaXMubGF5ZXJzW2VudGl0eS5sYXllcl0ucHVzaChlbnRpdHkpO1xyXG5cclxuICByZXR1cm4gZW50aXR5O1xyXG59O1xyXG5cclxuLy8gQ2hlY2tzIHdoZXRoZXIgdHdvIGdyb3VwcyBzaG91bGQgY29sbGlkZVxyXG5FbmdpbmUucHJvdG90eXBlLmdldENvbGxpc2lvbiA9IGZ1bmN0aW9uKGdyb3VwQSwgZ3JvdXBCKSB7XHJcbiAgcmV0dXJuICh0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEFdLm1hc2sgPj4gZ3JvdXBCKSAmIDE7XHJcbn07XHJcblxyXG4vLyBTZXRzIHR3byBncm91cHMgdXAgdG8gY29sbGlkZVxyXG5FbmdpbmUucHJvdG90eXBlLnNldENvbGxpc2lvbiA9IGZ1bmN0aW9uKGdyb3VwQSwgZ3JvdXBCLCB2YWx1ZSkge1xyXG4gIHZhciBtYXNrQSA9ICgxIDw8IGdyb3VwQik7XHJcbiAgdmFyIG1hc2tCID0gKDEgPDwgZ3JvdXBBKTtcclxuXHJcbiAgaWYgKHZhbHVlKSB7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEFdLm1hc2sgPSB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEFdLm1hc2sgfCBtYXNrQTtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQl0ubWFzayA9IHRoaXMuY29sbGlzaW9uR3JvdXBzW2dyb3VwQl0ubWFzayB8IG1hc2tCO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEFdLm1hc2sgPSB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEFdLm1hc2sgJiB+bWFza0E7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgPSB0aGlzLmNvbGxpc2lvbkdyb3Vwc1tncm91cEJdLm1hc2sgJiB+bWFza0I7XHJcbiAgfVxyXG4gIHRoaXMudXBkYXRlQ29sbGlzaW9ucygpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuLy8gQ2hhbmdlcyB0aGUgSUQgb2YgYW4gZW50aXR5XHJcbkVuZ2luZS5wcm90b3R5cGUuY2hhbmdlSWQgPSBmdW5jdGlvbiAoZW50aXR5LCBpZCkge1xyXG4gIGVudGl0eS5pZCA9IGlkO1xyXG59O1xyXG5cclxuLy8gU2VsZWN0cyBhbiBlbnRpdHkgYW5kIHNob3dzIGl0cyBwcm9wZXJ0aWVzIGluIHRoZSBzaWRlYmFyXHJcbkVuZ2luZS5wcm90b3R5cGUuc2VsZWN0RW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gIHRoaXMuc2VsZWN0ZWRFbnRpdHkgPSBlbnRpdHkgPT09IG51bGwgPyBudWxsIDogZW50aXR5O1xyXG4gIFVJLmJ1aWxkU2lkZWJhcih0aGlzLnNlbGVjdGVkRW50aXR5KTtcclxufVxyXG5cclxuLy8gVXBkYXRlcyBjb2xsaXNpb24gbWFza3MgZm9yIGFsbCBlbnRpdGllcywgYmFzZWQgb24gZW5naW5lJ3MgY29sbGlzaW9uR3JvdXBzIHRhYmxlXHJcbkVuZ2luZS5wcm90b3R5cGUudXBkYXRlQ29sbGlzaW9ucyA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBlbnRpdGllcyA9IHRoaXMuZW50aXRpZXMoKTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdGhpcy51cGRhdGVDb2xsaXNpb24oZW50aXRpZXNbaV0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vLyBVcGRhdGVzIGNvbGxpc2lvbiBtYXNrIGZvciBhbiBlbnRpdHksIGJhc2VkIG9uIGVuZ2luZSdzIGNvbGxpc2lvbkdyb3VwcyB0YWJsZVxyXG5FbmdpbmUucHJvdG90eXBlLnVwZGF0ZUNvbGxpc2lvbiA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHZhciBmaWx0ZXJEYXRhID0gZW50aXR5LmZpeHR1cmUuR2V0RmlsdGVyRGF0YSgpO1xyXG4gIGZpbHRlckRhdGEuc2V0X21hc2tCaXRzKHRoaXMuY29sbGlzaW9uR3JvdXBzW2VudGl0eS5jb2xsaXNpb25Hcm91cF0ubWFzayk7XHJcbiAgZW50aXR5LmZpeHR1cmUuU2V0RmlsdGVyRGF0YShmaWx0ZXJEYXRhKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbi8vIE9uZSBzaW11bGF0aW9uIHN0ZXAuIFNpbXVsYXRpb24gbG9naWMgaGFwcGVucyBoZXJlLlxyXG5FbmdpbmUucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbigpIHtcclxuICAvLyBGUFMgdGltZXJcclxuICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpO1xyXG5cclxuICBjdHggPSB0aGlzLnZpZXdwb3J0LmNvbnRleHQ7XHJcblxyXG4gIC8vIGNsZWFyIHNjcmVlblxyXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy52aWV3cG9ydC53aWR0aCwgdGhpcy52aWV3cG9ydC5oZWlnaHQpO1xyXG5cclxuICBjdHguc2F2ZSgpO1xyXG5cclxuICBpZiAoIV9lbmdpbmUud29ybGQucGF1c2VkKSB7XHJcbiAgICAvLyBib3gyZCBzaW11bGF0aW9uIHN0ZXBcclxuICAgIHRoaXMud29ybGQuU3RlcCgxIC8gNjAsIDEwLCA1KTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBJbnB1dC50b29sLm9ubW92ZShjdHgpO1xyXG4gIH1cclxuICBcclxuICAvLyBkcmF3IGFsbCBlbnRpdGllc1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5MQVlFUlNfTlVNQkVSOyBpKyspXHJcbiAge1xyXG4gICAgdGhpcy5kcmF3QXJyYXkodGhpcy5sYXllcnNbaV0sIGN0eCk7XHJcbiAgfVxyXG5cclxuXHJcblxyXG4gIC8vIFJlbGVhc2VkIGtleXMgYXJlIG9ubHkgdG8gYmUgcHJvY2Vzc2VkIG9uY2VcclxuICBJbnB1dC5tb3VzZS5jbGVhblVwKCk7XHJcbiAgSW5wdXQua2V5Ym9hcmQuY2xlYW5VcCgpO1xyXG5cclxuICB2YXIgZW5kID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgLy8gQ2FsbCBuZXh0IHN0ZXBcclxuICBzZXRUaW1lb3V0KHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgICBfZW5naW5lLnN0ZXAoKVxyXG4gIH0pLCBNYXRoLm1pbig2MCAtIGVuZCAtIHN0YXJ0LCAwKSk7XHJcbn07XHJcblxyXG5FbmdpbmUucHJvdG90eXBlLmRyYXdBcnJheSA9IGZ1bmN0aW9uKGFycmF5LCBjdHgpIHtcclxuICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHgudHJhbnNsYXRlKFxyXG4gICAgICAtKHRoaXMudmlld3BvcnQueCAtIHRoaXMudmlld3BvcnQud2lkdGggLyAyKSAvIHRoaXMudmlld3BvcnQuc2NhbGUsXHJcbiAgICAgIC0odGhpcy52aWV3cG9ydC55IC0gdGhpcy52aWV3cG9ydC5oZWlnaHQgLyAyKSAvIHRoaXMudmlld3BvcnQuc2NhbGUpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGFycmF5W2ldLmNvbG9yO1xyXG5cclxuICAgIGlmKHRoaXMuc2VsZWN0ZWRFbnRpdHkgPT09IGFycmF5W2ldKSB7XHJcbiAgICAgIGN0eC5zaGFkb3dDb2xvciA9IFwiYmxhY2tcIjtcclxuICAgICAgY3R4LnNoYWRvd0JsdXIgPSAxMDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgeCA9IGFycmF5W2ldLmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpO1xyXG4gICAgdmFyIHkgPSBhcnJheVtpXS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3koKTtcclxuICAgIGN0eC50cmFuc2xhdGUoeCAvIHRoaXMudmlld3BvcnQuc2NhbGUsIHkgLyB0aGlzLnZpZXdwb3J0LnNjYWxlKTtcclxuICAgIGN0eC5yb3RhdGUoYXJyYXlbaV0uYm9keS5HZXRBbmdsZSgpKTtcclxuXHJcbiAgICBhcnJheVtpXS5kcmF3KGN0eCk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuXHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFycmF5W2ldLmJlaGF2aW9ycy5sZW5ndGg7IGorKykge1xyXG4gICAgICB2YXIgYmVoYXZpb3IgPSBhcnJheVtpXS5iZWhhdmlvcnNbal07XHJcblxyXG4gICAgICBpZiAoYmVoYXZpb3IuY2hlY2soYXJyYXlbaV0pKVxyXG4gICAgICAgIGJlaGF2aW9yLnJlc3VsdCgpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTsiLCIvLyBFTlRJVFlcclxudmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHMuanNcIik7XHJcblxyXG5jb25zdCBBVVRPX0NPTE9SX1JBTkdFID0gWzAsIDIzMF07XHJcblxyXG52YXIgRW50aXR5ID0gZnVuY3Rpb24oc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCkge1xyXG4gIHRoaXMuaWQgPSBpZDtcclxuICB0aGlzLmRlYWQgPSBmYWxzZTtcclxuICB0aGlzLmxheWVyID0gMDtcclxuXHJcbiAgdGhpcy5maXhlZFJvdGF0aW9uID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXAgPSBjb2xsaXNpb25Hcm91cDtcclxuICBpZiAodGhpcy5jb2xsaXNpb25Hcm91cCA9PSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMuY29sbGlzaW9uR3JvdXAgPSAwO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5iZWhhdmlvcnMgPSBbXTtcclxuXHJcbiAgdGhpcy5maXh0dXJlID0gZml4dHVyZTtcclxuICBpZiAodGhpcy5maXh0dXJlID09IHVuZGVmaW5lZCkge1xyXG4gICAgdmFyIGZpeHR1cmUgPSBuZXcgYjJGaXh0dXJlRGVmKCk7XHJcbiAgICBmaXh0dXJlLnNldF9kZW5zaXR5KDEwKVxyXG4gICAgZml4dHVyZS5zZXRfZnJpY3Rpb24oMC41KTtcclxuICAgIGZpeHR1cmUuc2V0X3Jlc3RpdHV0aW9uKDAuMik7XHJcblxyXG4gICAgdGhpcy5maXh0dXJlID0gZml4dHVyZTtcclxuICB9XHJcbiAgdGhpcy5maXh0dXJlLnNldF9zaGFwZShzaGFwZSk7XHJcblxyXG4gIHZhciBmaWx0ZXJEYXRhID0gdGhpcy5maXh0dXJlLmdldF9maWx0ZXIoKTtcclxuICBmaWx0ZXJEYXRhLnNldF9jYXRlZ29yeUJpdHMoMSA8PCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIC8vIENvbnN0cnVjdG9yIGlzIGNhbGxlZCB3aGVuIGluaGVyaXRpbmcsIHNvIHdlIG5lZWQgdG8gY2hlY2sgZm9yIF9lbmdpbmUgYXZhaWxhYmlsaXR5XHJcbiAgaWYgKHR5cGVvZiBfZW5naW5lICE9PSAndW5kZWZpbmVkJylcclxuICAgIGZpbHRlckRhdGEuc2V0X21hc2tCaXRzKF9lbmdpbmUuY29sbGlzaW9uR3JvdXBzW3RoaXMuY29sbGlzaW9uR3JvdXBdLm1hc2spO1xyXG5cclxuICB0aGlzLmZpeHR1cmUuc2V0X2ZpbHRlcihmaWx0ZXJEYXRhKTtcclxuXHJcbiAgdGhpcy5ib2R5ID0gYm9keTtcclxuICBpZiAodGhpcy5ib2R5ICE9PSB1bmRlZmluZWQpXHJcbiAgICB0aGlzLmJvZHkuc2V0X2ZpeGVkUm90YXRpb24oZmFsc2UpO1xyXG5cclxuICAvLyBBdXRvIGdlbmVyYXRlIGNvbG9yXHJcbiAgdmFyIHIgPSBVdGlscy5yYW5kb21SYW5nZShBVVRPX0NPTE9SX1JBTkdFWzBdLCBBVVRPX0NPTE9SX1JBTkdFWzFdKS50b1N0cmluZygxNik7IHIgPSByLmxlbmd0aCA9PSAxID8gXCIwXCIgKyByIDogcjtcclxuICB2YXIgZyA9IFV0aWxzLnJhbmRvbVJhbmdlKEFVVE9fQ09MT1JfUkFOR0VbMF0sIEFVVE9fQ09MT1JfUkFOR0VbMV0pLnRvU3RyaW5nKDE2KTsgZyA9IGcubGVuZ3RoID09IDEgPyBcIjBcIiArIGcgOiBnO1xyXG4gIHZhciBiID0gVXRpbHMucmFuZG9tUmFuZ2UoQVVUT19DT0xPUl9SQU5HRVswXSwgQVVUT19DT0xPUl9SQU5HRVsxXSkudG9TdHJpbmcoMTYpOyBiID0gYi5sZW5ndGggPT0gMSA/IFwiMFwiICsgYiA6IGI7XHJcbiAgdGhpcy5jb2xvciA9IFwiI1wiICsgciAgKyBnICsgYiA7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5kZWFkID0gdHJ1ZTtcclxuXHJcbiAgXHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XHJcbiAgYWxlcnQoXCJFUlJPUiEgQ2Fubm90IGRyYXcgRW50aXR5OiBVc2UgZGVyaXZlZCBjbGFzc2VzLlwiKTtcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRDb2xvciA9IGZ1bmN0aW9uKGNvbG9yKSB7XHJcbiAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuRW50aXR5LnByb3RvdHlwZS5zZXRJZCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgdGhpcy5pZCA9IGlkO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gIHRoaXMuY29sbGlzaW9uR3JvdXAgPSBncm91cDtcclxuXHJcbiAgdmFyIGZpbHRlckRhdGEgPSB0aGlzLmZpeHR1cmUuR2V0RmlsdGVyRGF0YSgpO1xyXG4gIGZpbHRlckRhdGEuc2V0X2NhdGVnb3J5Qml0cygxIDw8IGdyb3VwKTtcclxuICB0aGlzLmZpeHR1cmUuU2V0RmlsdGVyRGF0YShmaWx0ZXJEYXRhKTtcclxuXHJcbiAgX2VuZ2luZS51cGRhdGVDb2xsaXNpb24odGhpcyk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmdldExpbmVhclZlbG9jaXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMuYm9keS5HZXRMaW5lYXJWZWxvY2l0eSgpO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmdldE1hc3MgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gTWF0aC5tYXgoMSwgdGhpcy5ib2R5LkdldE1hc3MoKSk7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuc2V0TGluZWFyVmVsb2NpdHkgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICB0aGlzLmJvZHkuU2V0TGluZWFyVmVsb2NpdHkodmVjdG9yKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUuYXBwbHlUb3JxdWUgPSBmdW5jdGlvbihmb3JjZSkge1xyXG4gIHRoaXMuYm9keS5BcHBseVRvcnF1ZShmb3JjZSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFwcGx5TGluZWFySW1wdWxzZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gIHRoaXMuYm9keS5BcHBseUxpbmVhckltcHVsc2UodmVjdG9yLCB0aGlzLmJvZHkuR2V0V29ybGRDZW50ZXIoKSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmRpc2FibGVSb3RhdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgdGhpcy5maXhlZFJvdGF0aW9uID0gdmFsdWU7XHJcbiAgdGhpcy5ib2R5LlNldEZpeGVkUm90YXRpb24odmFsdWUpXHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFkZEJlaGF2aW9yID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcclxuICB0aGlzLmJlaGF2aW9ycy5wdXNoKGJlaGF2aW9yKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVudGl0eTsiLCJ2YXIgRW50aXR5RmlsdGVyID0gcmVxdWlyZShcIi4vdG9rZW4uanNcIikuRW50aXR5RmlsdGVyO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZy5qc1wiKS5UeXBlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBbXTtcclxuXHJcbnZhciBlZkJ5SWQgPSBmdW5jdGlvbihpZCkge1xyXG4gIEVudGl0eUZpbHRlci5jYWxsKHRoaXMsIFwiZmlsdGVyQnlJZFwiLCBhcmd1bWVudHMsIFtUeXBlLlNUUklOR10pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChpZCk7XHJcbn07XHJcbmVmQnlJZC5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcblxyXG5lZkJ5SWQucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkuaWQgPT09IHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xyXG59O1xyXG5cclxuZWZCeUlkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGVmQnlJZDtcclxubW9kdWxlLmV4cG9ydHMucHVzaChlZkJ5SWQpO1xyXG5cclxuXHJcbnZhciBlZkJ5Q29sbGlzaW9uR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gIEVudGl0eUZpbHRlci5jYWxsKHRoaXMsIFwiZmlsdGVyQnlHcm91cFwiLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUl0pO1xyXG5cclxuICB0aGlzLmFyZ3MucHVzaChncm91cCk7XHJcbn07XHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUgPSBuZXcgRW50aXR5RmlsdGVyKCk7XHJcblxyXG5lZkJ5Q29sbGlzaW9uR3JvdXAucHJvdG90eXBlLmRlY2lkZSA9IGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkuY29sbGlzaW9uR3JvdXAgKyAxID09PSB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKTtcclxufTtcclxuXHJcbmVmQnlDb2xsaXNpb25Hcm91cC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBlZkJ5Q29sbGlzaW9uR3JvdXA7XHJcbm1vZHVsZS5leHBvcnRzLnB1c2goZWZCeUNvbGxpc2lvbkdyb3VwKTtcclxuXHJcblxyXG52YXIgZWZCeUxheWVyID0gZnVuY3Rpb24obGF5ZXIpIHtcclxuICBFbnRpdHlGaWx0ZXIuY2FsbCh0aGlzLCBcImZpbHRlckJ5TGF5ZXJcIiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcclxuXHJcbiAgdGhpcy5hcmdzLnB1c2gobGF5ZXIpO1xyXG59O1xyXG5lZkJ5TGF5ZXIucHJvdG90eXBlID0gbmV3IEVudGl0eUZpbHRlcigpO1xyXG5cclxuZWZCeUxheWVyLnByb3RvdHlwZS5kZWNpZGUgPSBmdW5jdGlvbihlbnRpdHkpIHtcclxuICByZXR1cm4gZW50aXR5LmxheWVyICsgMSA9PT0gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCk7XHJcbn07XHJcblxyXG5lZkJ5TGF5ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gZWZCeUxheWVyO1xyXG5tb2R1bGUuZXhwb3J0cy5wdXNoKGVmQnlMYXllcik7IiwicmVxdWlyZShcIi4vaW5wdXQuanNcIik7XHJcblxyXG52YXIgRW5naW5lID0gcmVxdWlyZShcIi4vZW5naW5lLmpzXCIpO1xyXG52YXIgVmlld3BvcnQgPSByZXF1aXJlKFwiLi92aWV3cG9ydC5qc1wiKTtcclxudmFyIFVJID0gcmVxdWlyZShcIi4vdWkuanNcIik7XHJcbnZhciBCb2R5VHlwZSA9IHJlcXVpcmUoXCIuL2JvZHl0eXBlLmpzXCIpO1xyXG52YXIgQmVoYXZpb3IgPSByZXF1aXJlKFwiLi9iZWhhdmlvci5qc1wiKTtcclxuXHJcbnZhciBDaXJjbGUgPSByZXF1aXJlKFwiLi9zaGFwZXMuanNcIikuQ2lyY2xlO1xyXG52YXIgUmVjdGFuZ2xlID0gcmVxdWlyZShcIi4vc2hhcGVzLmpzXCIpLlJlY3RhbmdsZTtcclxuXHJcblVJLmluaXRpYWxpemUoKTtcclxuXHJcbndpbmRvdy5fZW5naW5lID0gbmV3IEVuZ2luZShuZXcgVmlld3BvcnQoJChcIiNtYWluQ2FudmFzXCIpWzBdKSwgbmV3IGIyVmVjMigwLCAyMCkpO1xyXG5cclxuXHJcbl9lbmdpbmUuYWRkRW50aXR5KG5ldyBDaXJjbGUobmV3IGIyVmVjMig0MCwgNiksIDIpLCBCb2R5VHlwZS5EWU5BTUlDX0JPRFkpXHJcbiAgLnNldENvbGxpc2lvbkdyb3VwKDIpXHJcbiAgLnNldElkKFwia3J1aFwiKVxyXG4gIC5kaXNhYmxlUm90YXRpb24oZmFsc2UpXHJcbiAgLmFkZEJlaGF2aW9yKFxyXG4gICAgbmV3IEJlaGF2aW9yKFxyXG4gICAgICBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UoXCJpc0J1dHRvbkRvd24oIG51bWJlciggMzcgKSApXCIpLFxyXG4gICAgICBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UoXCJzZXRMaW5lYXJWZWxvY2l0eSggZmlsdGVyQnlJZCggdGV4dCgga3J1aCApICksIG51bWJlciggLTEwICksIGdldFZlbG9jaXR5WSggZmlsdGVyQnlJZCggdGV4dCgga3J1aCApICkgKSApXCIpXHJcbiAgICApXHJcbiAgKVxyXG4gIC5hZGRCZWhhdmlvcihcclxuICAgIG5ldyBCZWhhdmlvcihcclxuICAgICAgX2VuZ2luZS50b2tlbk1hbmFnZXIucGFyc2VyLnBhcnNlKFwiaXNCdXR0b25Eb3duKG51bWJlcigzOSkpXCIpLFxyXG4gICAgICBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UoXCJzZXRMaW5lYXJWZWxvY2l0eSggZmlsdGVyQnlJZCggdGV4dCgga3J1aCApICksIG51bWJlciggMTAgKSwgZ2V0VmVsb2NpdHlZKCBmaWx0ZXJCeUlkKCB0ZXh0KCBrcnVoICkgKSApIClcIilcclxuICAgIClcclxuICApXHJcbiAgLmFkZEJlaGF2aW9yKFxyXG4gICAgbmV3IEJlaGF2aW9yKFxyXG4gICAgICBfZW5naW5lLnRva2VuTWFuYWdlci5wYXJzZXIucGFyc2UoXCJpc0J1dHRvbkRvd24obnVtYmVyKDM4KSlcIiksXHJcbiAgICAgIF9lbmdpbmUudG9rZW5NYW5hZ2VyLnBhcnNlci5wYXJzZShcInNldExpbmVhclZlbG9jaXR5KCBmaWx0ZXJCeUlkKCB0ZXh0KCBrcnVoICkgKSwgZ2V0VmVsb2NpdHlYKCBmaWx0ZXJCeUlkKCB0ZXh0KCBrcnVoICkgKSApLCBudW1iZXIoIC0xMCApIClcIilcclxuICAgIClcclxuICApO1xyXG5cclxuX2VuZ2luZS5hZGRFbnRpdHkobmV3IFJlY3RhbmdsZShuZXcgYjJWZWMyKDQyLCAzNSksIG5ldyBiMlZlYzIoMzUsIDAuMikpLCBCb2R5VHlwZS5LSU5FTUFUSUNfQk9EWSlcclxuICAuc2V0SWQoXCJwbGF0Zm9ybVwiKVxyXG4gIC5zZXRDb2xsaXNpb25Hcm91cCgxKTtcclxuXHJcbndpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgX2VuZ2luZS5zdGVwKCk7XHJcbn0pO1xyXG5cclxuXHJcblxyXG5cclxuIiwiLy8gSU5QVVQgQ0FQVFVSSU5HXHJcblxyXG52YXIgVG9vbHMgPSByZXF1aXJlKFwiLi90b29scy5qc1wiKTtcclxuXHJcbndpbmRvdy5JbnB1dCA9IHtcclxuICB0b29sOiBUb29scy5TZWxlY3Rpb24sXHJcbiAgZWxlbWVudDogbnVsbCxcclxuXHJcbiAgbW91c2U6IHtcclxuICAgIHg6IDAsXHJcbiAgICB5OiAwLFxyXG4gICAgY2FudmFzWDogMCxcclxuICAgIGNhbnZhc1k6IDAsXHJcbiAgICByZWFsWDogMCxcclxuICAgIHJlYWxZOiAwLFxyXG4gICAgbGVmdERvd246IGZhbHNlLFxyXG4gICAgcmlnaHREb3duOiBmYWxzZSxcclxuICAgIGxlZnRVcDogZmFsc2UsXHJcbiAgICByaWdodFVwOiBmYWxzZSxcclxuXHJcbiAgICB1cGRhdGVQb3NpdGlvbjogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHRoaXMuY2FudmFzWSA9IGV2ZW50LnBhZ2VZIC0gSW5wdXQuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgIHRoaXMuY2FudmFzWCA9IGV2ZW50LnBhZ2VYIC0gSW5wdXQuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gICAgICB0aGlzLnggPSB0aGlzLmNhbnZhc1ggKiBfZW5naW5lLnZpZXdwb3J0LnNjYWxlICsgKF9lbmdpbmUudmlld3BvcnQueCAtIF9lbmdpbmUudmlld3BvcnQud2lkdGggLyAyKTtcclxuICAgICAgdGhpcy55ID0gdGhpcy5jYW52YXNZICogX2VuZ2luZS52aWV3cG9ydC5zY2FsZSArIChfZW5naW5lLnZpZXdwb3J0LnkgLSBfZW5naW5lLnZpZXdwb3J0LmhlaWdodCAvIDIpO1xyXG4gICAgICB0aGlzLnJlYWxYID0gZXZlbnQucGFnZVg7XHJcbiAgICAgIHRoaXMucmVhbFkgPSBldmVudC5wYWdlWTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQnV0dG9uc0Rvd246IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEpXHJcbiAgICAgICAgdGhpcy5sZWZ0RG93biA9IHRydWU7XHJcblxyXG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDMpXHJcbiAgICAgICAgdGhpcy5yaWdodERvd24gPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gSW5wdXQuZWxlbWVudCkge1xyXG4gICAgICAgIElucHV0LnRvb2wub25jbGljaygpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUJ1dHRvbnNVcDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC50YXJnZXQgPT09IElucHV0LmVsZW1lbnQpXHJcbiAgICAgICAgSW5wdXQudG9vbC5vbnJlbGVhc2UoKTtcclxuXHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMSkge1xyXG4gICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmxlZnRVcCA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChldmVudC53aGljaCA9PT0gMykge1xyXG4gICAgICAgIHRoaXMucmlnaHREb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yaWdodFVwID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhblVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMubGVmdFVwID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucmlnaHRVcCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGtleWJvYXJkOiB7XHJcbiAgICBkb3duOiBuZXcgU2V0KCksXHJcbiAgICB1cDogbmV3IFNldCgpLFxyXG5cclxuICAgIGlzRG93bjogZnVuY3Rpb24gKGtleUNvZGUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZG93bi5oYXMoa2V5Q29kZSlcclxuICAgIH0sXHJcblxyXG4gICAgaXNVcDogZnVuY3Rpb24gKGtleUNvZGUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudXAuaGFzKGtleUNvZGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVCdXR0b25zRG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHRoaXMuZG93bi5hZGQoZXZlbnQud2hpY2gpO1xyXG5cclxuICAgICAgaWYoZXZlbnQud2hpY2ggPT09IDMyKVxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUJ1dHRvbnNVcDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHRoaXMuZG93bi5kZWxldGUoZXZlbnQud2hpY2gpO1xyXG4gICAgICB0aGlzLnVwLmFkZChldmVudC53aGljaCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFuVXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy51cC5jbGVhcigpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblxyXG4gICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIElucHV0Lm1vdXNlLnVwZGF0ZVBvc2l0aW9uKGUpO1xyXG4gICAgfTtcclxuICAgIGRvY3VtZW50Lm9ubW91c2Vkb3duID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICBJbnB1dC5tb3VzZS51cGRhdGVCdXR0b25zRG93bihlKTtcclxuICAgIH07XHJcbiAgICBkb2N1bWVudC5vbm1vdXNldXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIElucHV0Lm1vdXNlLnVwZGF0ZUJ1dHRvbnNVcChlKTtcclxuICAgIH07XHJcblxyXG4gICAgZG9jdW1lbnQub25rZXlkb3duID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICBJbnB1dC5rZXlib2FyZC51cGRhdGVCdXR0b25zRG93bihlKTtcclxuICAgIH07XHJcbiAgICBkb2N1bWVudC5vbmtleXVwID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICBJbnB1dC5rZXlib2FyZC51cGRhdGVCdXR0b25zVXAoZSk7XHJcbiAgICB9O1xyXG4gICAgZG9jdW1lbnQub25zZWxlY3RzdGFydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbiIsInZhciBMb2dpYyA9IHJlcXVpcmUoXCIuL3Rva2VuLmpzXCIpLkxvZ2ljO1xudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcbnZhciBGaXhUeXBlID0gcmVxdWlyZShcIi4vdHlwaW5nLmpzXCIpLkZpeFR5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gW107XG5cbnZhciBsQW5kID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIkFORFwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuQk9PTEVBTiwgVHlwZS5CT09MRUFOXSk7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG59O1xubEFuZC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubEFuZC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAodGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgJiYgdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCkpO1xufTtcblxubEFuZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQW5kO1xubW9kdWxlLmV4cG9ydHMucHVzaChsQW5kKTtcblxuXG52YXIgbE9yID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIk9SXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5CT09MRUFOLCBUeXBlLkJPT0xFQU5dKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcbn07XG5sT3IucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxPci5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSB8fCB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKSlcbiAgICByZXR1cm4gdHJ1ZTtcblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5sT3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE9yO1xubW9kdWxlLmV4cG9ydHMucHVzaChsT3IpO1xuXG5cbnZhciBsTm90ID0gZnVuY3Rpb24gKGEpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIk5PVFwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuQk9PTEVBTl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xufTtcbmxOb3QucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxOb3QucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gIXRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpO1xufTtcblxubE5vdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsTm90O1xubW9kdWxlLmV4cG9ydHMucHVzaChsTm90KTtcblxuXG52YXIgbFN0cmluZyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwidGV4dFwiLCBUeXBlLlNUUklORywgYXJndW1lbnRzLCBbVHlwZS5MSVRFUkFMXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2godmFsdWUpO1xufTtcbmxTdHJpbmcucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxTdHJpbmcucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdO1xufTtcblxubFN0cmluZy5wcm90b3R5cGUudmFsaWRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0cnVlO1xufTtcblxubFN0cmluZy5wcm90b3R5cGUucG9wdWxhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuYXJnc1swXSA9IHByb21wdChUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZCgyNCkgKyB0aGlzLm5hbWUpO1xuICB0aGlzLmFyZ3NbMF0gPSB0aGlzLmFyZ3NbMF0gPT09IG51bGwgPyBcIlwiIDogdGhpcy5hcmdzWzBdO1xufTtcblxubFN0cmluZy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsU3RyaW5nO1xubW9kdWxlLmV4cG9ydHMucHVzaChsU3RyaW5nKTtcblxuXG52YXIgbE51bWJlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwibnVtYmVyXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLkxJVEVSQUxdKTtcblxuICB0aGlzLmFyZ3MucHVzaCh2YWx1ZSk7XG59O1xubE51bWJlci5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubE51bWJlci5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBwYXJzZUZsb2F0KHRoaXMuYXJnc1swXSk7XG59O1xuXG5sTnVtYmVyLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICQuaXNOdW1lcmljKHRoaXMuYXJnc1swXSk7XG59O1xuXG5sTnVtYmVyLnByb3RvdHlwZS5wb3B1bGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5hcmdzWzBdID0gcHJvbXB0KFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkKDI0KSArIHRoaXMubmFtZSk7XG59O1xuXG5sTnVtYmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxOdW1iZXI7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxOdW1iZXIpO1xuXG5cbnZhciBsVHJ1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcInRydWVcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtdKTtcbn07XG5sVHJ1ZS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubFRydWUucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmxUcnVlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxUcnVlO1xubW9kdWxlLmV4cG9ydHMucHVzaChsVHJ1ZSk7XG5cblxudmFyIGxGYWxzZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiZmFsc2VcIiwgVHlwZS5CT09MRUFOLCBhcmd1bWVudHMsIFtdKTtcbn07XG5sRmFsc2UucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxGYWxzZS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmxGYWxzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsRmFsc2U7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxGYWxzZSk7XG5cblxudmFyIGxCdXR0b25Eb3duID0gZnVuY3Rpb24gKGJ1dHRvbikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiaXNCdXR0b25Eb3duXCIsIFR5cGUuQk9PTEVBTiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChidXR0b24pO1xufTtcbmxCdXR0b25Eb3duLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sQnV0dG9uRG93bi5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBJbnB1dC5rZXlib2FyZC5pc0Rvd24odGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkpO1xufTtcblxubEJ1dHRvbkRvd24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbEJ1dHRvbkRvd247XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxCdXR0b25Eb3duKTtcblxuXG52YXIgbEJ1dHRvblVwID0gZnVuY3Rpb24gKGJ1dHRvbikge1xuICBMb2dpYy5jYWxsKHRoaXMsIFwiaXNCdXR0b25VcFwiLCBUeXBlLkJPT0xFQU4sIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2goYnV0dG9uKTtcbn07XG5sQnV0dG9uVXAucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxCdXR0b25VcC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBJbnB1dC5rZXlib2FyZC5pc1VwKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpKTtcbn07XG5cbmxCdXR0b25VcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBsQnV0dG9uVXA7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxCdXR0b25VcCk7XG5cblxudmFyIGxSYW5kb20gPSBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcInJhbmRvbU51bWJlclwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5OVU1CRVIsIFR5cGUuTlVNQkVSXSk7XG5cbiAgdGhpcy5hcmdzLnB1c2gobWluKTtcbiAgdGhpcy5hcmdzLnB1c2gobWF4KTtcbn07XG5sUmFuZG9tLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sUmFuZG9tLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIFV0aWxzLnJhbmRvbVJhbmdlKHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICYmIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpKTtcbn07XG5cbmxSYW5kb20ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFJhbmRvbTtcbm1vZHVsZS5leHBvcnRzLnB1c2gobFJhbmRvbSk7XG5cblxudmFyIGxWZWxvY2l0eVggPSBmdW5jdGlvbiAoZWYpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImdldFZlbG9jaXR5WFwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChlZik7XG59O1xubFZlbG9jaXR5WC5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubFZlbG9jaXR5WC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbnRpdHkgPSB0aGlzLmFyZ3NbMF0uZmlsdGVyKClbMF07XG5cbiAgcmV0dXJuIGVudGl0eS5ib2R5LkdldExpbmVhclZlbG9jaXR5KCkuZ2V0X3goKTtcbn07XG5cbmxWZWxvY2l0eVgucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFZlbG9jaXR5WDtcbm1vZHVsZS5leHBvcnRzLnB1c2gobFZlbG9jaXR5WCk7XG5cblxudmFyIGxWZWxvY2l0eVkgPSBmdW5jdGlvbiAoZWYpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcImdldFZlbG9jaXR5WVwiLCBUeXBlLk5VTUJFUiwgYXJndW1lbnRzLCBbVHlwZS5FTlRJVFlGSUxURVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChlZik7XG59O1xubFZlbG9jaXR5WS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubFZlbG9jaXR5WS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbnRpdHkgPSB0aGlzLmFyZ3NbMF0uZmlsdGVyKClbMF07XG5cbiAgcmV0dXJuIGVudGl0eS5ib2R5LkdldExpbmVhclZlbG9jaXR5KCkuZ2V0X3koKTtcbn07XG5cbmxWZWxvY2l0eVkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFZlbG9jaXR5WTtcbm1vZHVsZS5leHBvcnRzLnB1c2gobFZlbG9jaXR5WSk7XG5cblxudmFyIGxQbHVzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIitcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xufTtcbmxQbHVzLnByb3RvdHlwZSA9IG5ldyBMb2dpYygpO1xuXG5sUGx1cy5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSArIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpO1xufTtcblxubFBsdXMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbFBsdXM7XG5tb2R1bGUuZXhwb3J0cy5wdXNoKGxQbHVzKTtcblxuXG52YXIgbE11bHRpcGx5ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIipcIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xufTtcbmxNdWx0aXBseS5wcm90b3R5cGUgPSBuZXcgTG9naWMoKTtcblxubE11bHRpcGx5LnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuYXJnc1swXS5ldmFsdWF0ZSgpICogdGhpcy5hcmdzWzFdLmV2YWx1YXRlKCk7XG59O1xuXG5sTXVsdGlwbHkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbE11bHRpcGx5O1xubW9kdWxlLmV4cG9ydHMucHVzaChsTXVsdGlwbHkpO1xuXG5cbnZhciBsRGl2aWRlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgTG9naWMuY2FsbCh0aGlzLCBcIi9cIiwgVHlwZS5OVU1CRVIsIGFyZ3VtZW50cywgW1R5cGUuTlVNQkVSLCBUeXBlLk5VTUJFUl0pO1xuXG4gIHRoaXMuYXJncy5wdXNoKGEpO1xuICB0aGlzLmFyZ3MucHVzaChiKTtcblxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLklORklYO1xufTtcbmxEaXZpZGUucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxEaXZpZGUucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hcmdzWzBdLmV2YWx1YXRlKCkgLyB0aGlzLmFyZ3NbMV0uZXZhbHVhdGUoKTtcbn07XG5cbmxEaXZpZGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbERpdmlkZTtcbm1vZHVsZS5leHBvcnRzLnB1c2gobERpdmlkZSk7XG5cblxudmFyIGxNaW51cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIExvZ2ljLmNhbGwodGhpcywgXCItXCIsIFR5cGUuTlVNQkVSLCBhcmd1bWVudHMsIFtUeXBlLk5VTUJFUiwgVHlwZS5OVU1CRVJdKTtcblxuICB0aGlzLmFyZ3MucHVzaChhKTtcbiAgdGhpcy5hcmdzLnB1c2goYik7XG5cbiAgdGhpcy5maXhUeXBlID0gRml4VHlwZS5JTkZJWDtcbn07XG5sTWludXMucHJvdG90eXBlID0gbmV3IExvZ2ljKCk7XG5cbmxNaW51cy5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmFyZ3NbMF0uZXZhbHVhdGUoKSArIHRoaXMuYXJnc1sxXS5ldmFsdWF0ZSgpO1xufTtcblxubE1pbnVzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGxNaW51cztcbm1vZHVsZS5leHBvcnRzLnB1c2gobE1pbnVzKTsiLCJ2YXIgRml4VHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZ1wiKS5GaXhUeXBlO1xyXG52YXIgVHlwZSA9IHJlcXVpcmUoXCIuL3R5cGluZ1wiKS5UeXBlO1xyXG5cclxudmFyIFR5cGVFeGNlcHRpb24gPSBmdW5jdGlvbihleHBlY3RlZCwgcmVjZWl2ZWQsIHRva2VuKSB7XHJcbiAgdGhpcy5leHBlY3RlZCA9IGV4cGVjdGVkO1xyXG4gIHRoaXMucmVjZWl2ZWQgPSByZWNlaXZlZDtcclxuICB0aGlzLnRva2VuID0gdG9rZW47XHJcbn07XHJcblxyXG52YXIgUGFyc2VyID0gZnVuY3Rpb24gKHRva2VuTWFuYWdlcikge1xyXG4gIHRoaXMudG9rZW5NYW5hZ2VyID0gdG9rZW5NYW5hZ2VyO1xyXG5cclxuICB0aGlzLnN0b3BDaGFycyA9IFtcIihcIiwgXCIpXCIsIFwiLFwiXTtcclxuXHJcbiAgdGhpcy5wYXJzZXJJbnB1dCA9IFwiXCI7XHJcbiAgdGhpcy5wYXJzZXJJbnB1dFdob2xlID0gXCJcIjtcclxuICB0aGlzLnBhcnNlclN0YWNrID0gW107XHJcbn07XHJcblxyXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oaW5wdXQpIHtcclxuICB0aGlzLnBhcnNlcklucHV0ID0gaW5wdXQ7XHJcbiAgdGhpcy5wYXJzZXJJbnB1dFdob2xlID0gaW5wdXQ7XHJcbiAgdGhpcy5wYXJzZXJTdGFjayA9IFtdO1xyXG5cclxuICBkbyB7XHJcbiAgICB0aGlzLnBhcnNlU3RlcCgpO1xyXG4gIH0gd2hpbGUgKHRoaXMucGFyc2VySW5wdXQubGVuZ3RoKTtcclxuXHJcbiAgdmFyIHJldCA9IHRoaXMucGFyc2VyU3RhY2sucG9wKCk7XHJcblxyXG4gIGlmICh0aGlzLnBhcnNlclN0YWNrLmxlbmd0aClcclxuICAgIHRocm93IFwiVW5leHBlY3RlZCBcIiArIHJldC5uYW1lO1xyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuUGFyc2VyLnByb3RvdHlwZS5yZWFkV2hpdGVzcGFjZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHdoaWxlICgvXFxzLy50ZXN0KHRoaXMucGFyc2VySW5wdXRbMF0pICYmIHRoaXMucGFyc2VySW5wdXQubGVuZ3RoKSB7XHJcbiAgICB0aGlzLnBhcnNlcklucHV0ID0gdGhpcy5wYXJzZXJJbnB1dC5zbGljZSgxKTtcclxuICB9XHJcbn07XHJcblxyXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlTmFtZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMucmVhZFdoaXRlc3BhY2UoKTtcclxuXHJcbiAgdmFyIHJldCA9IFwiXCI7XHJcblxyXG4gIHdoaWxlICghL1xccy8udGVzdCh0aGlzLnBhcnNlcklucHV0WzBdKSAmJiB0aGlzLnBhcnNlcklucHV0Lmxlbmd0aCAmJiB0aGlzLnN0b3BDaGFycy5pbmRleE9mKHRoaXMucGFyc2VySW5wdXRbMF0pID09PSAtMSkgLy8gcmVhZCB1bnRpbCBhIHdoaXRlc3BhY2Ugb2NjdXJzXHJcbiAge1xyXG4gICAgcmV0ICs9IHRoaXMucGFyc2VySW5wdXRbMF07XHJcbiAgICB0aGlzLnBhcnNlcklucHV0ID0gdGhpcy5wYXJzZXJJbnB1dC5zbGljZSgxKTtcclxuICB9XHJcblxyXG4gIHRoaXMucmVhZFdoaXRlc3BhY2UoKTtcclxuXHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcblBhcnNlci5wcm90b3R5cGUucmVhZENoYXIgPSBmdW5jdGlvbihjaGFyKSB7XHJcbiAgdGhpcy5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICBpZiAodGhpcy5wYXJzZXJJbnB1dFswXSAhPT0gY2hhcikge1xyXG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5wYXJzZXJJbnB1dFdob2xlLmxlbmd0aCAtIHRoaXMucGFyc2VySW5wdXQubGVuZ3RoO1xyXG4gICAgdGhyb3cgXCJFeHBlY3RlZCAnXCIgKyBjaGFyICsgXCInIGF0IHBvc2l0aW9uIFwiICsgcG9zaXRpb24gKyBcIiBhdCAnXCIgKyB0aGlzLnBhcnNlcklucHV0V2hvbGUuc3Vic3RyKHBvc2l0aW9uKSArIFwiJ1wiO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5wYXJzZXJJbnB1dCA9IHRoaXMucGFyc2VySW5wdXQuc2xpY2UoMSk7XHJcblxyXG4gIHRoaXMucmVhZFdoaXRlc3BhY2UoKTtcclxufTtcclxuXHJcblBhcnNlci5wcm90b3R5cGUucGFyc2VTdGVwID0gZnVuY3Rpb24oZXhwZWN0ZWRUeXBlKSB7XHJcbiAgdmFyIG5hbWUgPSB0aGlzLnBhcnNlTmFtZSgpO1xyXG4gIHZhciB0b2tlbiA9IHRoaXMudG9rZW5NYW5hZ2VyLmdldFRva2VuQnlOYW1lKG5hbWUpO1xyXG5cclxuICBpZiAodG9rZW4gPT09IHVuZGVmaW5lZCAmJiAoZXhwZWN0ZWRUeXBlID09PSBUeXBlLkxJVEVSQUwgfHwgZXhwZWN0ZWRUeXBlID09IHVuZGVmaW5lZCkpIHtcclxuICAgIHRoaXMucGFyc2VyU3RhY2sucHVzaChuYW1lKTtcclxuICAgIHJldHVybiBuYW1lO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRva2VuID09IHVuZGVmaW5lZCAmJiBleHBlY3RlZFR5cGUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhyb3cgXCJFeHBlY3RlZCBhcmd1bWVudCB3aXRoIHR5cGUgXCIgKyBleHBlY3RlZFR5cGU7XHJcbiAgfVxyXG5cclxuICBpZiAoZXhwZWN0ZWRUeXBlICE9PSB1bmRlZmluZWQgJiYgdG9rZW4udHlwZSAhPT0gZXhwZWN0ZWRUeXBlKSB7XHJcbiAgICB0aHJvdyBcIlVuZXhwZWN0ZWQgXCIgKyB0b2tlbi50eXBlICsgXCIgKHdhcyBleHBlY3RpbmcgXCIgKyBleHBlY3RlZFR5cGUgKyBcIilcIjtcclxuICB9XHJcblxyXG4gIHZhciBudW1BcmdzID0gdG9rZW4uYXJndW1lbnRfdHlwZXMubGVuZ3RoO1xyXG5cclxuICB2YXIgYXJncyA9IFtdO1xyXG5cclxuICBpZiAodG9rZW4uZml4VHlwZSA9PT0gRml4VHlwZS5JTkZJWCkge1xyXG4gICAgdmFyIGEgPSB0aGlzLnBhcnNlclN0YWNrLnBvcCgpO1xyXG5cclxuICAgIGlmIChhLnR5cGUgIT09IHRva2VuLmFyZ3VtZW50X3R5cGVzWzBdKVxyXG4gICAgICB0aHJvdyBcIlVuZXhwZWN0ZWQgXCIgKyBhLnR5cGUgKyBcIiAod2FzIGV4cGVjdGluZyBcIiArIHRva2VuLmFyZ3VtZW50X3R5cGVzWzBdICsgXCIpXCI7XHJcblxyXG4gICAgYXJncyA9IFthLCB0aGlzLnBhcnNlU3RlcCh0b2tlbi5hcmd1bWVudF90eXBlc1sxXSldO1xyXG4gICAgdGhpcy5wYXJzZXJTdGFjay5wb3AoKTtcclxuICB9XHJcblxyXG4gIGlmICh0b2tlbi5maXhUeXBlID09PSBGaXhUeXBlLlBSRUZJWCkge1xyXG4gICAgdGhpcy5yZWFkQ2hhcihcIihcIik7XHJcblxyXG4gICAgd2hpbGUodGhpcy5wYXJzZXJJbnB1dFswXSAhPT0gXCIpXCIpIHtcclxuICAgICAgdGhpcy5yZWFkV2hpdGVzcGFjZSgpO1xyXG5cclxuICAgICAgdGhpcy5wYXJzZVN0ZXAoKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLnBhcnNlcklucHV0WzBdID09PSBcIixcIilcclxuICAgICAgICB0aGlzLnBhcnNlcklucHV0ID0gdGhpcy5wYXJzZXJJbnB1dC5zbGljZSgxKTtcclxuXHJcbiAgICAgIHRoaXMucmVhZFdoaXRlc3BhY2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQXJnczsgaSsrKSB7XHJcbiAgICAgIHZhciBleHBlY3RlZEFyZyA9IHRva2VuLmFyZ3VtZW50X3R5cGVzW3Rva2VuLmFyZ3VtZW50X3R5cGVzLmxlbmd0aCAtIGkgLSAxXTtcclxuICAgICAgdmFyIGFjdHVhbEFyZyA9IHRoaXMucGFyc2VyU3RhY2tbdGhpcy5wYXJzZXJTdGFjay5sZW5ndGggLSAxXS50eXBlO1xyXG5cclxuICAgICAgaWYgKGV4cGVjdGVkQXJnICE9PSBUeXBlLkxJVEVSQUwgJiYgYWN0dWFsQXJnICE9PSBleHBlY3RlZEFyZylcclxuICAgICAge1xyXG4gICAgICAgIHRocm93IFwiVW5leHBlY3RlZCBcIiArIGFjdHVhbEFyZyArXHJcbiAgICAgICAgICBcIiAod2FzIGV4cGVjdGluZyBcIiArIGV4cGVjdGVkQXJnICsgXCIpXCI7XHJcbiAgICAgIH1cclxuICAgICAgYXJncy5wdXNoKHRoaXMucGFyc2VyU3RhY2sucG9wKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGFyZ3MucmV2ZXJzZSgpO1xyXG5cclxuICAgIHRoaXMucmVhZENoYXIoXCIpXCIpO1xyXG4gIH1cclxuXHJcbiAgdmFyIG5ld1Rva2VuID0gbmV3IHRva2VuLmNvbnN0cnVjdG9yKCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBuZXdUb2tlbi5hcmdzW2ldID0gYXJnc1tpXTtcclxuICB9XHJcbiAgdGhpcy5wYXJzZXJTdGFjay5wdXNoKG5ld1Rva2VuKTtcclxuXHJcbiAgcmV0dXJuIG5ld1Rva2VuO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXI7IiwidmFyIEVudGl0eSA9IHJlcXVpcmUoXCIuL2VudGl0eS5qc1wiKTtcclxuXHJcbi8vIENpcmNsZSBlbnRpdHlcclxudmFyIENpcmNsZSA9IGZ1bmN0aW9uKGNlbnRlciwgcmFkaXVzLCBmaXh0dXJlLCBpZCwgY29sbGlzaW9uR3JvdXApIHtcclxuICB2YXIgc2hhcGUgPSBuZXcgYjJDaXJjbGVTaGFwZSgpO1xyXG4gIHNoYXBlLnNldF9tX3JhZGl1cyhyYWRpdXMpO1xyXG5cclxuICB2YXIgYm9keSA9IG5ldyBiMkJvZHlEZWYoKTtcclxuICBib2R5LnNldF9wb3NpdGlvbihjZW50ZXIpO1xyXG5cclxuICBFbnRpdHkuY2FsbCh0aGlzLCBzaGFwZSwgZml4dHVyZSwgYm9keSwgaWQsIGNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcbkNpcmNsZS5wcm90b3R5cGUgPSBuZXcgRW50aXR5KCk7XHJcbkNpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaXJjbGU7XHJcblxyXG5DaXJjbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjdHgpIHtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcblxyXG4gIGN0eC5hcmMoMCwgMCwgdGhpcy5yYWRpdXMgLyBfZW5naW5lLnZpZXdwb3J0LnNjYWxlLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG5cclxuICBjdHguZmlsbCgpO1xyXG5cclxuICBjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xyXG4gIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSBcImRlc3RpbmF0aW9uLW91dFwiO1xyXG5cclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4Lm1vdmVUbygwLCAwKTtcclxuICBjdHgubGluZVRvKDAsIHRoaXMucmFkaXVzIC8gX2VuZ2luZS52aWV3cG9ydC5zY2FsZSk7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG4gIGN0eC5jbG9zZVBhdGgoKTtcclxufTtcclxuXHJcblxyXG4vLyBSZWN0YW5nbGUgZW50aXR5XHJcbnZhciBSZWN0YW5nbGUgPSBmdW5jdGlvbihjZW50ZXIsIGV4dGVudHMsIGZpeHR1cmUsIGlkLCBjb2xsaXNpb25Hcm91cCkge1xyXG4gIHZhciBzaGFwZSA9IG5ldyBiMlBvbHlnb25TaGFwZSgpO1xyXG4gIHNoYXBlLlNldEFzQm94KGV4dGVudHMuZ2V0X3goKSwgZXh0ZW50cy5nZXRfeSgpKTtcclxuXHJcbiAgdmFyIGJvZHkgPSBuZXcgYjJCb2R5RGVmKCk7XHJcbiAgYm9keS5zZXRfcG9zaXRpb24oY2VudGVyKTtcclxuXHJcbiAgRW50aXR5LmNhbGwodGhpcywgc2hhcGUsIGZpeHR1cmUsIGJvZHksIGlkLCBjb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gIHRoaXMuZXh0ZW50cyA9IGV4dGVudHM7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5SZWN0YW5nbGUucHJvdG90eXBlID0gbmV3IEVudGl0eSgpO1xyXG5SZWN0YW5nbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVjdGFuZ2xlO1xyXG5cclxuUmVjdGFuZ2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY3R4KSB7XHJcbiAgdmFyIGhhbGZXaWR0aCA9IHRoaXMuZXh0ZW50cy5nZXRfeCgpIC8gX2VuZ2luZS52aWV3cG9ydC5zY2FsZTtcclxuICB2YXIgaGFsZkhlaWdodCA9IHRoaXMuZXh0ZW50cy5nZXRfeSgpIC8gX2VuZ2luZS52aWV3cG9ydC5zY2FsZTtcclxuXHJcbiAgY3R4LmZpbGxSZWN0KC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0LCBoYWxmV2lkdGggKiAyLCBoYWxmSGVpZ2h0ICogMik7XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMuQ2lyY2xlID0gQ2lyY2xlO1xyXG5tb2R1bGUuZXhwb3J0cy5SZWN0YW5nbGUgPSBSZWN0YW5nbGU7IiwidmFyIEZpeFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuRml4VHlwZTtcclxudmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbnZhciBUb2tlbiA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKSB7XHJcbiAgdGhpcy50eXBlID0gdHlwZTtcclxuICB0aGlzLmZpeFR5cGUgPSBGaXhUeXBlLlBSRUZJWDtcclxuICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gIHRoaXMuYXJncyA9IGFyZ3MgPT0gdW5kZWZpbmVkID8gW10gOiBhcmdzO1xyXG4gIHRoaXMuYXJndW1lbnRfdHlwZXMgPSBhcmd1bWVudF90eXBlcztcclxuICB0aGlzLmFyZ3MgPSBbXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFyZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChhcmdzW2ldLnR5cGUgIT09IGFyZ3VtZW50X3R5cGVzW2ldICYmIGFyZ3VtZW50X3R5cGVzW2ldICE9PSBUeXBlLkxJVEVSQUwpXHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXhjZXB0aW9uKGFyZ3VtZW50X3R5cGVzW2ldLCBhcmdzW2ldLnR5cGUsIHRoaXMpO1xyXG4gIH1cclxufTtcclxuXHJcblRva2VuLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciByZXQgPSBcIlwiO1xyXG4gIHZhciBhcmdTdHJpbmdzID0gW107XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hcmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBhcmdTdHJpbmdzLnB1c2godGhpcy5hcmdzW2ldLnRvU3RyaW5nKCkpO1xyXG4gIH1cclxuXHJcbiAgYXJnU3RyaW5ncyA9IGFyZ1N0cmluZ3Muam9pbihcIiwgXCIpO1xyXG5cclxuICBzd2l0Y2ggKHRoaXMuZml4VHlwZSkge1xyXG4gICAgY2FzZSBGaXhUeXBlLlBSRUZJWDpcclxuICAgICAgcmV0ID0gdGhpcy5uYW1lICsgXCIoXCIgKyBhcmdTdHJpbmdzICsgXCIpXCI7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBGaXhUeXBlLklORklYOlxyXG4gICAgICByZXQgPSB0aGlzLmFyZ3NbMF0udG9TdHJpbmcoKSArIFwiIFwiICsgdGhpcy5uYW1lICsgXCIgXCIgKyB0aGlzLmFyZ3NbMV0udG9TdHJpbmcoKTtcclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxuXHJcblxyXG52YXIgTG9naWMgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBhcmdzLCBhcmd1bWVudF90eXBlcykge1xyXG4gIFRva2VuLmNhbGwodGhpcywgbmFtZSwgdHlwZSwgYXJncywgYXJndW1lbnRfdHlwZXMpO1xyXG59O1xyXG5Mb2dpYy5wcm90b3R5cGUgPSBuZXcgVG9rZW4oKTtcclxuTG9naWMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9naWM7XHJcblxyXG5Mb2dpYy5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbigpIHsgLy8gVXNlIGEgZGVyaXZlZCBjbGFzc1xyXG4gIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcblxyXG52YXIgQWN0aW9uID0gZnVuY3Rpb24obmFtZSwgYXJncywgYXJndW1lbnRfdHlwZXMpIHtcclxuICBUb2tlbi5jYWxsKHRoaXMsIG5hbWUsIFR5cGUuQUNUSU9OLCBhcmdzLCBhcmd1bWVudF90eXBlcyk7XHJcbn07XHJcbkFjdGlvbi5wcm90b3R5cGUgPSBuZXcgVG9rZW4oKTtcclxuQWN0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFjdGlvbjtcclxuXHJcbkFjdGlvbi5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGVudGl0eSkgeyAvLyBVc2UgYSBkZXJpdmVkIGNsYXNzXHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuQWN0aW9uLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGVudGl0aWVzID0gdGhpcy5hcmdzWzBdLmZpbHRlcigpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHRoaXMuZWFjaChlbnRpdGllc1tpXSk7XHJcbiAgfVxyXG59O1xyXG5cclxuXHJcbnZhciBFbnRpdHlGaWx0ZXIgPSBmdW5jdGlvbihuYW1lLCBhcmdzLCBhcmd1bWVudF90eXBlcykge1xyXG4gIFRva2VuLmNhbGwodGhpcywgbmFtZSwgVHlwZS5FTlRJVFlGSUxURVIsIGFyZ3MsIGFyZ3VtZW50X3R5cGVzKTtcclxufTtcclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZSA9IG5ldyBUb2tlbigpO1xyXG5FbnRpdHlGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW50aXR5RmlsdGVyO1xyXG5cclxuRW50aXR5RmlsdGVyLnByb3RvdHlwZS5kZWNpZGUgPSBmdW5jdGlvbihlbnRpdHkpIHsgLy8gVXNlIGRlcml2ZWQgY2xhc3NcclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5FbnRpdHlGaWx0ZXIucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciByZXQgPSBbXTtcclxuICB2YXIgZW50aXRpZXMgPSBfZW5naW5lLmVudGl0aWVzKCk7XHJcbiAgXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKHRoaXMuZGVjaWRlKGVudGl0aWVzW2ldKSlcclxuICAgICAgcmV0LnB1c2goZW50aXRpZXNbaV0pO1xyXG4gIH1cclxuICByZXR1cm4gcmV0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMuVG9rZW4gPSBUb2tlbjtcclxubW9kdWxlLmV4cG9ydHMuQWN0aW9uID0gQWN0aW9uO1xyXG5tb2R1bGUuZXhwb3J0cy5Mb2dpYyA9IExvZ2ljO1xyXG5tb2R1bGUuZXhwb3J0cy5FbnRpdHlGaWx0ZXIgPSBFbnRpdHlGaWx0ZXI7XHJcblxyXG4vLyBUT0RPOiBsaW5lYXIgYWN0aW9uLCBwb3Jvdm5hdmFuaWUsIHVobHksIHBsdXMsIG1pbnVzICwgZGVsZW5vLCBrcmF0LCB4IG5hIG4iLCJ2YXIgUGFyc2VyID0gcmVxdWlyZShcIi4vcGFyc2VyLmpzXCIpO1xyXG5cclxudmFyIFRva2VuTWFuYWdlciA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLnRva2VucyA9IFtdO1xyXG5cclxuICB0aGlzLnJlZ2lzdGVyVG9rZW5zKHJlcXVpcmUoXCIuL2xvZ2ljLmpzXCIpKTtcclxuICB0aGlzLnJlZ2lzdGVyVG9rZW5zKHJlcXVpcmUoXCIuL2FjdGlvbnMuanNcIikpO1xyXG4gIHRoaXMucmVnaXN0ZXJUb2tlbnMocmVxdWlyZShcIi4vZW50aXR5ZmlsdGVycy5qc1wiKSk7XHJcblxyXG4gIHRoaXMucGFyc2VyID0gbmV3IFBhcnNlcih0aGlzKTtcclxufTtcclxuXHJcblRva2VuTWFuYWdlci5wcm90b3R5cGUucmVnaXN0ZXJUb2tlbnMgPSBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgdG9rZW5zLmZvckVhY2goZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyB0b2tlbigpKTtcclxuICB9LCB0aGlzKTtcclxufTtcclxuXHJcblRva2VuTWFuYWdlci5wcm90b3R5cGUuZ2V0VG9rZW5CeU5hbWUgPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50b2tlbnMubGVuZ3RoOyBpKyspXHJcbiAge1xyXG4gICAgaWYgKHRoaXMudG9rZW5zW2ldLm5hbWUgPT09IG5hbWUpXHJcbiAgICAgIHJldHVybiB0aGlzLnRva2Vuc1tpXTtcclxuICB9XHJcbn07XHJcblxyXG5Ub2tlbk1hbmFnZXIucHJvdG90eXBlLmdldFRva2Vuc0J5VHlwZSA9IGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgdmFyIHJldCA9IFtdO1xyXG5cclxuICB0aGlzLnRva2Vucy5mb3JFYWNoKGZ1bmN0aW9uICh0b2tlbikge1xyXG4gICAgaWYgKHRva2VuLnR5cGUgPT09IHR5cGUpXHJcbiAgICAgIHJldC5wdXNoKHRva2VuKTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHJldDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVG9rZW5NYW5hZ2VyOyIsInZhciBTaGFwZSA9IHJlcXVpcmUoXCIuL3NoYXBlcy5qc1wiKTtcclxudmFyIFR5cGUgPSByZXF1aXJlKFwiLi9ib2R5dHlwZS5qc1wiKTtcclxuXHJcbnZhciBCbGFuayA9IHtcclxuICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7fSxcclxuICBvbnJlbGVhc2U6IGZ1bmN0aW9uICgpIHt9LFxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge31cclxufTtcclxuXHJcblxyXG52YXIgU2VsZWN0aW9uID0ge1xyXG4gIG9yaWdpbjogbnVsbCxcclxuICBvZmZzZXQ6IG51bGwsXHJcbiAgbW9kZTogbnVsbCxcclxuXHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgX2VuZ2luZS5zZWxlY3RFbnRpdHkobnVsbCk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IF9lbmdpbmUuTEFZRVJTX05VTUJFUiAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX2VuZ2luZS5sYXllcnNbaV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICBpZiAoX2VuZ2luZS5sYXllcnNbaV1bal0uZml4dHVyZS5UZXN0UG9pbnQoXHJcbiAgICAgICAgICAgIG5ldyBiMlZlYzIoSW5wdXQubW91c2UueCwgSW5wdXQubW91c2UueSkpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBfZW5naW5lLnNlbGVjdEVudGl0eShfZW5naW5lLmxheWVyc1tpXVtqXSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5vcmlnaW4gPSBbSW5wdXQubW91c2UueCwgSW5wdXQubW91c2UueV07XHJcbiAgICAgICAgICB0aGlzLm9mZnNldCA9IFtcclxuICAgICAgICAgICAgX2VuZ2luZS5zZWxlY3RlZEVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3goKSAtIHRoaXMub3JpZ2luWzBdLFxyXG4gICAgICAgICAgICBfZW5naW5lLnNlbGVjdGVkRW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeSgpIC0gdGhpcy5vcmlnaW5bMV1cclxuICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgdGhpcy5tb2RlID0gXCJyZXBvc2l0aW9uXCI7XHJcbiAgICAgICAgICB0aGlzLm9yaWdpbiA9IFtJbnB1dC5tb3VzZS54LCBJbnB1dC5tb3VzZS55XTtcclxuXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5tb2RlID0gXCJjYW1lcmFcIjtcclxuXHJcbiAgICB0aGlzLm9yaWdpbiA9IFtfZW5naW5lLnZpZXdwb3J0LngsIF9lbmdpbmUudmlld3BvcnQueV07XHJcbiAgICB0aGlzLm9mZnNldCA9IFtJbnB1dC5tb3VzZS5jYW52YXNYLCBJbnB1dC5tb3VzZS5jYW52YXNZXTtcclxuICAgIF9lbmdpbmUudmlld3BvcnQuY2FudmFzRWxlbWVudC5zdHlsZS5jdXJzb3IgPSBcInVybChpbWcvZ3JhYmJpbmdjdXJzb3IucG5nKSwgbW92ZVwiO1xyXG4gIH0sXHJcbiAgb25yZWxlYXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm9yaWdpbiA9IHRoaXMub2Zmc2V0ID0gdGhpcy5tb2RlID0gbnVsbDtcclxuICAgIF9lbmdpbmUudmlld3BvcnQuY2FudmFzRWxlbWVudC5zdHlsZS5jdXJzb3IgPSBcImRlZmF1bHRcIjtcclxuICB9LFxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gbnVsbClcclxuICAgICAgcmV0dXJuO1xyXG5cclxuICAgIGlmICh0aGlzLm1vZGUgPT09IFwiY2FtZXJhXCIpIHtcclxuICAgICAgX2VuZ2luZS52aWV3cG9ydC54ID0gdGhpcy5vcmlnaW5bMF0gKyAodGhpcy5vZmZzZXRbMF0gLSBJbnB1dC5tb3VzZS5jYW52YXNYKSAqIF9lbmdpbmUudmlld3BvcnQuc2NhbGU7XHJcbiAgICAgIF9lbmdpbmUudmlld3BvcnQueSA9IHRoaXMub3JpZ2luWzFdICsgKHRoaXMub2Zmc2V0WzFdIC0gSW5wdXQubW91c2UuY2FudmFzWSkgKiBfZW5naW5lLnZpZXdwb3J0LnNjYWxlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLm1vZGUgPT09IFwicmVwb3NpdGlvblwiKSB7XHJcbiAgICAgIHZhciBib2R5ID0gX2VuZ2luZS5zZWxlY3RlZEVudGl0eS5ib2R5O1xyXG4gICAgICB2YXIgeCA9IE1hdGgucm91bmQoKElucHV0Lm1vdXNlLnggKyB0aGlzLm9mZnNldFswXSkgKiAxMDAwKSAvIDEwMDA7XHJcbiAgICAgIHZhciB5ID0gTWF0aC5yb3VuZCgoSW5wdXQubW91c2UueSArIHRoaXMub2Zmc2V0WzFdKSAqIDEwMDApIC8gMTAwMDtcclxuXHJcbiAgICAgIGJvZHkuU2V0VHJhbnNmb3JtKG5ldyBiMlZlYzIoeCwgeSksIGJvZHkuR2V0QW5nbGUoKSk7XHJcbiAgICAgICQoXCIjZW50aXR5X3hcIikudmFsKHgpO1xyXG4gICAgICAkKFwiI2VudGl0eV95XCIpLnZhbCh5KTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5cclxudmFyIFJlY3RhbmdsZSA9IHtcclxuICBvcmlnaW46IG51bGwsXHJcbiAgdzogMCxcclxuICBoOiAwLFxyXG4gIG1pblNpemU6IDUsXHJcblxyXG4gIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMub25tb3ZlID0gdGhpcy5kcmFnZ2luZztcclxuICAgIHRoaXMub3JpZ2luID0gW0lucHV0Lm1vdXNlLmNhbnZhc1gsIElucHV0Lm1vdXNlLmNhbnZhc1ldO1xyXG4gIH0sXHJcblxyXG4gIG9ucmVsZWFzZTogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMudyA+PSB0aGlzLm1pblNpemUgJiYgdGhpcy5oID49IHRoaXMubWluU2l6ZSkge1xyXG4gICAgICB2YXIgeCA9IHRoaXMub3JpZ2luWzBdICogX2VuZ2luZS52aWV3cG9ydC5zY2FsZSArIF9lbmdpbmUudmlld3BvcnQuZ2V0T2Zmc2V0KClbMF07XHJcbiAgICAgIHZhciB5ID0gdGhpcy5vcmlnaW5bMV0gKiBfZW5naW5lLnZpZXdwb3J0LnNjYWxlICsgX2VuZ2luZS52aWV3cG9ydC5nZXRPZmZzZXQoKVsxXTtcclxuXHJcbiAgICAgIHRoaXMudyAqPSBfZW5naW5lLnZpZXdwb3J0LnNjYWxlO1xyXG4gICAgICB0aGlzLmggKj0gX2VuZ2luZS52aWV3cG9ydC5zY2FsZTtcclxuXHJcbiAgICAgIF9lbmdpbmUuYWRkRW50aXR5KG5ldyBTaGFwZS5SZWN0YW5nbGUoXHJcbiAgICAgICAgbmV3IGIyVmVjMih4ICsgdGhpcy53IC8gMiwgeSArIHRoaXMuaCAvIDIpLFxyXG4gICAgICAgIG5ldyBiMlZlYzIodGhpcy53IC8gMiwgdGhpcy5oIC8gMikpLCBUeXBlLkRZTkFNSUNfQk9EWSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5vbm1vdmUgPSBmdW5jdGlvbigpe307XHJcbiAgICB0aGlzLm9yaWdpbiA9IG51bGw7XHJcbiAgICB0aGlzLncgPSB0aGlzLmggPSAwO1xyXG4gIH0sXHJcblxyXG4gIG9ubW92ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICB9LFxyXG5cclxuICBkcmFnZ2luZzogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgdGhpcy53ID0gSW5wdXQubW91c2UuY2FudmFzWCAtIHRoaXMub3JpZ2luWzBdO1xyXG4gICAgdGhpcy5oID0gSW5wdXQubW91c2UuY2FudmFzWSAtIHRoaXMub3JpZ2luWzFdO1xyXG5cclxuICAgIGlmICh0aGlzLncgPCB0aGlzLm1pblNpemUgfHwgdGhpcy5oIDwgdGhpcy5taW5TaXplKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgMC40KVwiO1xyXG4gICAgY3R4LmZpbGxSZWN0KHRoaXMub3JpZ2luWzBdLCB0aGlzLm9yaWdpblsxXSwgdGhpcy53LCB0aGlzLmgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICB9XHJcbn07XHJcblxyXG5cclxudmFyIENpcmNsZSA9IHtcclxuICBvcmlnaW46IG51bGwsXHJcbiAgcmFkaXVzOiAwLFxyXG4gIG1pblJhZGl1czogNSxcclxuXHJcbiAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5vbm1vdmUgPSB0aGlzLmRyYWdnaW5nO1xyXG4gICAgdGhpcy5vcmlnaW4gPSBbSW5wdXQubW91c2UuY2FudmFzWCwgSW5wdXQubW91c2UuY2FudmFzWV07XHJcbiAgfSxcclxuXHJcbiAgb25yZWxlYXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5yYWRpdXMgPj0gdGhpcy5taW5SYWRpdXMpIHtcclxuICAgICAgdmFyIHggPSB0aGlzLm9yaWdpblswXSAqIF9lbmdpbmUudmlld3BvcnQuc2NhbGUgKyBfZW5naW5lLnZpZXdwb3J0LmdldE9mZnNldCgpWzBdO1xyXG4gICAgICB2YXIgeSA9IHRoaXMub3JpZ2luWzFdICogX2VuZ2luZS52aWV3cG9ydC5zY2FsZSArIF9lbmdpbmUudmlld3BvcnQuZ2V0T2Zmc2V0KClbMV07XHJcblxyXG4gICAgICB0aGlzLnJhZGl1cyAqPSBfZW5naW5lLnZpZXdwb3J0LnNjYWxlO1xyXG5cclxuICAgICAgX2VuZ2luZS5hZGRFbnRpdHkobmV3IFNoYXBlLkNpcmNsZShcclxuICAgICAgICBuZXcgYjJWZWMyKHggKyB0aGlzLnJhZGl1cywgeSArIHRoaXMucmFkaXVzKSxcclxuICAgICAgICB0aGlzLnJhZGl1cyksIFR5cGUuRFlOQU1JQ19CT0RZKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm9ubW92ZSA9IGZ1bmN0aW9uKCl7fTtcclxuICAgIHRoaXMub3JpZ2luID0gbnVsbDtcclxuICAgIHRoaXMucmFkaXVzID0gMDtcclxuICB9LFxyXG5cclxuICBvbm1vdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgfSxcclxuXHJcbiAgZHJhZ2dpbmc6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgIHRoaXMucmFkaXVzID0gTWF0aC5taW4oSW5wdXQubW91c2UuY2FudmFzWCAtIHRoaXMub3JpZ2luWzBdLCBJbnB1dC5tb3VzZS5jYW52YXNZIC0gdGhpcy5vcmlnaW5bMV0pIC8gMjtcclxuXHJcbiAgICBpZiAodGhpcy5yYWRpdXMgPCB0aGlzLm1pblJhZGl1cylcclxuICAgICAgcmV0dXJuO1xyXG5cclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcblxyXG4gICAgY3R4LmFyYyh0aGlzLm9yaWdpblswXSArIHRoaXMucmFkaXVzLCB0aGlzLm9yaWdpblsxXSArIHRoaXMucmFkaXVzLCB0aGlzLnJhZGl1cywgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuXHJcbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsIDAsIDAsIDAuNClcIjtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5CbGFuayA9IEJsYW5rO1xyXG5tb2R1bGUuZXhwb3J0cy5TZWxlY3Rpb24gPSBTZWxlY3Rpb247XHJcbm1vZHVsZS5leHBvcnRzLlJlY3RhbmdsZSA9IFJlY3RhbmdsZTtcclxubW9kdWxlLmV4cG9ydHMuQ2lyY2xlID0gQ2lyY2xlOyIsInZhciBUeXBlID0ge1xyXG4gIEJPT0xFQU46IFwiYm9vbGVhblwiLFxyXG4gIE5VTUJFUjogXCJudW1iZXJcIixcclxuICBTVFJJTkc6IFwic3RyaW5nXCIsXHJcbiAgQVJSQVk6IFwiYXJyYXlcIixcclxuICBBQ1RJT046IFwiYWN0aW9uXCIsXHJcbiAgRU5USVRZRklMVEVSOiBcImVudGl0eUZpbHRlclwiLFxyXG4gIExJVEVSQUw6IFwibGl0ZXJhbFwiXHJcbn07XHJcblxyXG52YXIgRml4VHlwZSA9IHtcclxuICBJTkZJWDogXCJpbmZpeFwiLFxyXG4gIFBSRUZJWDogXCJwcmVmaXhcIlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMuVHlwZSA9IFR5cGU7XHJcbm1vZHVsZS5leHBvcnRzLkZpeFR5cGUgPSBGaXhUeXBlOyIsInZhciBUb29scyA9IHJlcXVpcmUoXCIuL3Rvb2xzLmpzXCIpO1xyXG52YXIgQm9keVR5cGUgPSByZXF1aXJlKFwiLi9ib2R5dHlwZS5qc1wiKTtcclxudmFyIFVJQnVpbGRlciA9IHJlcXVpcmUoXCIuL3VpYnVpbGRlci5qc1wiKTtcclxuXHJcbi8vIE9iamVjdCBmb3IgYnVpbGRpbmcgdGhlIFVJXHJcbnZhciBVSSA9IHtcclxuICAvLyBVSSBpbml0aWFsaXNhdGlvblxyXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGxhbmd1YWdlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBUcmFuc2xhdGlvbnMuc3RyaW5ncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBsYW5ndWFnZXMucHVzaCh7dGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWQoMCwgaSksIHZhbHVlOiBpfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHByb3BlcnRpZXMgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxyXG5cclxuICAgICAgICBpZDogXCJwbGF5XCIsXHJcbiAgICAgICAgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIpLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIF9lbmdpbmUudG9nZ2xlUGF1c2UoKTtcclxuXHJcbiAgICAgICAgICBpZiAoX2VuZ2luZS53b3JsZC5wYXVzZWQpIHtcclxuICAgICAgICAgICAgJChcIiNwbGF5XCIpLmh0bWwoVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIpKTtcclxuXHJcbiAgICAgICAgICAgICQoXCIjY29sbGlzaW9ucywgI3Rvb2xcIikuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5lbmFibGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJChcIiNwbGF5XCIpLmh0bWwoVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDMpKTtcclxuXHJcbiAgICAgICAgICAgICQoXCIjY29sbGlzaW9ucywgI3Rvb2xcIikuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5kaXNhYmxlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge3R5cGU6IFwiYnJlYWtcIn0sXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxyXG5cclxuICAgICAgICBpZDogXCJjb2xsaXNpb25zXCIsXHJcbiAgICAgICAgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDEpLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIFVJQnVpbGRlci5wb3B1cChVSS5jcmVhdGVDb2xsaXNpb25zKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge3R5cGU6IFwiYnJlYWtcIn0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxNykgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwicmFkaW9cIixcclxuXHJcbiAgICAgICAgaWQ6IFwidG9vbFwiLFxyXG4gICAgICAgIGVsZW1lbnRzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6IGVsLmltZyh7c3JjOiBcIi4vaW1nL3NlbGVjdGlvbi5wbmdcIn0pLCBjaGVja2VkOiB0cnVlLCBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIElucHV0LnRvb2wgPSBUb29scy5TZWxlY3Rpb247XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiBlbC5pbWcoe3NyYzogXCIuL2ltZy9yZWN0YW5nbGUucG5nXCJ9KSwgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBJbnB1dC50b29sID0gVG9vbHMuUmVjdGFuZ2xlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogZWwuaW1nKHtzcmM6IFwiLi9pbWcvY2lyY2xlLnBuZ1wifSksIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgSW5wdXQudG9vbCA9IFRvb2xzLkNpcmNsZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB7dHlwZTogXCJicmVha1wifSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6IFwic2VsZWN0XCIsXHJcbiAgICAgICAgb3B0aW9uczogbGFuZ3VhZ2VzLFxyXG5cclxuICAgICAgICBvbmNoYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICBUcmFuc2xhdGlvbnMuc2V0TGFuZ3VhZ2UodmFsdWUgKiAxKTtcclxuICAgICAgICB9LFxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIFVJQnVpbGRlci5idWlsZExheW91dCgpO1xyXG4gICAgJChcIi51aS50b29sYmFyXCIpWzBdLmFwcGVuZENoaWxkKFVJQnVpbGRlci5idWlsZChwcm9wZXJ0aWVzKSk7XHJcbiAgICAkKFwiLnVpLmNvbnRlbnRcIilbMF0uYXBwZW5kQ2hpbGQoZWwoXCJjYW52YXMjbWFpbkNhbnZhc1wiKSk7XHJcblxyXG4gIH0sXHJcblxyXG4gIC8vIEJ1aWxkaW5nIHRoZSBjb2xsaXNpb24gZ3JvdXAgdGFibGVcclxuICBjcmVhdGVDb2xsaXNpb25zOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0YWJsZSA9IGVsKFwidGFibGUuY29sbGlzaW9uVGFibGVcIik7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZW5naW5lLkNPTExJU0lPTl9HUk9VUFNfTlVNQkVSICsgMTsgaSsrKSB7XHJcbiAgICAgIHZhciB0ciA9IGVsKFwidHJcIik7XHJcblxyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF9lbmdpbmUuQ09MTElTSU9OX0dST1VQU19OVU1CRVIgKyAxOyBqKyspIHtcclxuICAgICAgICB2YXIgdGQgPSBlbChcInRkXCIpO1xyXG5cclxuICAgICAgICAvLyBmaXJzdCByb3dcclxuICAgICAgICBpZiAoaSA9PT0gMCAmJiBqID4gMCkge1xyXG4gICAgICAgICAgdGQuaW5uZXJIVE1MID0gXCI8ZGl2PjxzcGFuPlwiICsgX2VuZ2luZS5jb2xsaXNpb25Hcm91cHNbaiAtIDFdLm5hbWUgKyBcIjwvc3Bhbj48L2Rpdj5cIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpcnN0IGNvbHVtblxyXG4gICAgICAgIGVsc2UgaWYgKGogPT09IDAgJiYgaSAhPT0gMClcclxuICAgICAgICAgIHRkLmlubmVySFRNTCA9IF9lbmdpbmUuY29sbGlzaW9uR3JvdXBzW2kgLSAxXS5uYW1lO1xyXG5cclxuICAgICAgICAvLyByZWxldmFudCB0cmlhbmdsZVxyXG4gICAgICAgIGVsc2UgaWYgKGkgPD0gaiAmJiBqICE9PSAwICYmIGkgIT09IDApIHtcclxuICAgICAgICAgIHRkLnJvdyA9IGk7XHJcbiAgICAgICAgICB0ZC5jb2wgPSBqO1xyXG5cclxuICAgICAgICAgIC8vIGhpZ2hsaWdodGluZ1xyXG4gICAgICAgICAgdGQub25tb3VzZW92ZXIgPSBmdW5jdGlvbihpLCBqLCB0YWJsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHRkcyA9IHRhYmxlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGRcIik7XHJcbiAgICAgICAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCB0ZHMubGVuZ3RoOyBuKyspIHtcclxuICAgICAgICAgICAgICAgIHRkc1tuXS5jbGFzc05hbWUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG9ubHkgaGlnaGxpZ2h0IHVwIHRvIHRoZSByZWxldmFudCBjZWxsXHJcbiAgICAgICAgICAgICAgICBpZiAoKHRkc1tuXS5yb3cgPT09IGkgJiYgdGRzW25dLmNvbCA8PSBqKSB8fCAodGRzW25dLmNvbCA9PT0gaiAmJiB0ZHNbbl0ucm93IDw9IGkpKVxyXG4gICAgICAgICAgICAgICAgICB0ZHNbbl0uY2xhc3NOYW1lID0gXCJoaWdobGlnaHRcIjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0oaSwgaiwgdGFibGUpO1xyXG5cclxuICAgICAgICAgIC8vIG1vcmUgaGlnaGxpZ2h0aW5nXHJcbiAgICAgICAgICB0ZC5vbm1vdXNlb3V0ID0gZnVuY3Rpb24odGFibGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHZhciB0ZHMgPSB0YWJsZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRkXCIpO1xyXG4gICAgICAgICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgdGRzLmxlbmd0aDsgbisrKSB7XHJcbiAgICAgICAgICAgICAgICB0ZHNbbl0uY2xhc3NOYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0odGFibGUpO1xyXG5cclxuICAgICAgICAgIC8vIGNoZWNrYm94IGZvciBjb2xsaXNpb24gdG9nZ2xpbmdcclxuICAgICAgICAgIHZhciBjaGVja2JveCA9IGVsKFwiaW5wdXRcIiwge3R5cGU6IFwiY2hlY2tib3hcIn0pO1xyXG5cclxuICAgICAgICAgIGlmIChfZW5naW5lLmdldENvbGxpc2lvbihpIC0gMSwgaiAtIDEpKVxyXG4gICAgICAgICAgICBjaGVja2JveC5zZXRBdHRyaWJ1dGUoXCJjaGVja2VkXCIsIFwiY2hlY2tlZFwiKTtcclxuXHJcbiAgICAgICAgICBjaGVja2JveC5vbmNoYW5nZSA9IGZ1bmN0aW9uKGksIGosIGNoZWNrYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBfZW5naW5lLnNldENvbGxpc2lvbihpIC0gMSwgaiAtIDEsIGNoZWNrYm94LmNoZWNrZWQgPyAxIDogMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0oaSwgaiwgY2hlY2tib3gpO1xyXG5cclxuICAgICAgICAgIC8vIGNsaWNraW5nIHRoZSBjaGVja2JveCdzIGNlbGwgc2hvdWxkIHdvcmsgYXMgd2VsbFxyXG4gICAgICAgICAgdGQub25jbGljayA9IGZ1bmN0aW9uKGNoZWNrYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0ID09PSBjaGVja2JveClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gIWNoZWNrYm94LmNoZWNrZWQ7XHJcbiAgICAgICAgICAgICAgY2hlY2tib3gub25jaGFuZ2UoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0oY2hlY2tib3gpO1xyXG5cclxuICAgICAgICAgIHRkLmFwcGVuZENoaWxkKGNoZWNrYm94KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpeCBmb3IgYWxzbyBoaWdobGlnaHRpbmcgY2VsbHMgd2l0aG91dCBjaGVja2JveGVzXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0ZC5yb3cgPSBpO1xyXG4gICAgICAgICAgdGQuY29sID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGFibGUuYXBwZW5kQ2hpbGQodHIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YWJsZTtcclxuICB9LFxyXG5cclxuICBjcmVhdGVCZWhhdmlvcjogZnVuY3Rpb24gKGVudGl0eSkge1xyXG4gICAgdmFyIEJlaGF2aW9yQnVpbGRlciA9IG5ldyAocmVxdWlyZShcIi4vYmVoYXZpb3JidWlsZGVyLmpzXCIpKShfZW5naW5lLnRva2VuTWFuYWdlcik7XHJcbiAgICB2YXIgVUlCdWlsZGVyID0gcmVxdWlyZShcIi4vdWlidWlsZGVyLmpzXCIpO1xyXG4gICAgdmFyIFR5cGUgPSByZXF1aXJlKFwiLi90eXBpbmcuanNcIikuVHlwZTtcclxuXHJcbiAgICB2YXIgb25lQmVoYXZpb3IgPSBmdW5jdGlvbihiZWhhdmlvcikge1xyXG4gICAgICB2YXIgd3JhcHBlciA9IGVsKFwiZGl2LmJlaGF2aW9yXCIpO1xyXG4gICAgICB2YXIgbG9naWMgPSBlbChcImRpdi50b2tlbkJ1aWxkZXJcIiwge30sIFtcIlwiXSk7XHJcbiAgICAgIHZhciByZXN1bHRzID0gZWwoXCJkaXZcIik7XHJcblxyXG4gICAgICB2YXIgcmVtb3ZlciA9IFVJQnVpbGRlci5idXR0b24oe1xyXG4gICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgyOSksIG9uY2xpY2s6IChmdW5jdGlvbiAod3JhcHBlcikge1xyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIGZ1bmN0aW9uIGlzbid0IHdyYXBwZWQsIG9ubHkgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgYmVoYXZpb3IgZ2V0cyBwYXNzZWRcclxuXHJcbiAgICAgICAgICAgICQod3JhcHBlcikucmVtb3ZlKCk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pKHdyYXBwZXIpXHJcbiAgICAgIH0pO1xyXG4gICAgICByZW1vdmVyLnN0eWxlLmZsb2F0ID0gXCJyaWdodFwiO1xyXG5cclxuICAgICAgaWYgKGJlaGF2aW9yID09PSBudWxsKSB7XHJcbiAgICAgICAgQmVoYXZpb3JCdWlsZGVyLmluaXRpYWxpemUoVHlwZS5CT09MRUFOLCBsb2dpYyk7XHJcblxyXG4gICAgICAgIHJlc3VsdHMuYXBwZW5kQ2hpbGQob25lUmVzdWx0KG51bGwsIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg2KSwgZmFsc2UpKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBCZWhhdmlvckJ1aWxkZXIuYnVpbGRUb2tlbihiZWhhdmlvci5sb2dpYywgbG9naWMuZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgICAgIHJlc3VsdHMuYXBwZW5kQ2hpbGQob25lUmVzdWx0KGJlaGF2aW9yLnJlc3VsdHNbMF0sIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg2KSwgZmFsc2UpKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBiZWhhdmlvci5yZXN1bHRzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICByZXN1bHRzLmFwcGVuZENoaWxkKG9uZVJlc3VsdChiZWhhdmlvci5yZXN1bHRzW2pdLCBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMjUpLCB0cnVlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG5cclxuICAgICAgcmVzdWx0cy5hcHBlbmRDaGlsZChVSUJ1aWxkZXIuYnV0dG9uKHt0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMjYpLCBvbmNsaWNrOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUob25lUmVzdWx0KG51bGwsIFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgyNSksIHRydWUpLCB0aGlzKTtcclxuICAgICAgfX0pKTtcclxuXHJcbiAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQoZWwoXCJoMlwiLCB7fSwgW1RyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg1KSwgcmVtb3Zlcl0pKTtcclxuICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChsb2dpYyk7XHJcbiAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQocmVzdWx0cyk7XHJcblxyXG4gICAgICByZXR1cm4gd3JhcHBlcjtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIG9uZVJlc3VsdCA9IGZ1bmN0aW9uKHJlc3VsdCwgdGV4dCwgZW5hYmxlUmVtb3ZlKSB7XHJcbiAgICAgIHZhciB3cmFwcGVyID0gZWwoXCJkaXZcIik7XHJcbiAgICAgIHZhciByZXN1bHRFbGVtZW50ID0gZWwoXCJkaXYudG9rZW5CdWlsZGVyXCIsIHt9LCBbXCJcIl0pO1xyXG5cclxuICAgICAgdmFyIHJlc3VsdFJlbW92ZXIgPSBVSUJ1aWxkZXIuYnV0dG9uKHt0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMjgpLCBvbmNsaWNrOlxyXG4gICAgICAgIChmdW5jdGlvbihyZXN1bHRFbGVtZW50KXtyZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgICAgIC8vIElmIHRoZSBmdW5jdGlvbiBpc24ndCB3cmFwcGVkLCBvbmx5IHRoZSBsYXN0IGluc3RhbmNlIG9mIHJlc3VsdCBnZXRzIHBhc3NlZFxyXG5cclxuICAgICAgICAgICQocmVzdWx0RWxlbWVudCkucHJldigpLnJlbW92ZSgpOyAvLyBSZW1vdmUgdGhlIGhlYWRlclxyXG4gICAgICAgICAgJChyZXN1bHRFbGVtZW50KS5yZW1vdmUoKTsgLy8gQW5kIHRoZSB0b2tlbiBidWlsZGVyXHJcbiAgICAgICAgfTt9KShyZXN1bHRFbGVtZW50KX0pO1xyXG4gICAgICByZXN1bHRSZW1vdmVyLnN0eWxlLmZsb2F0ID0gXCJyaWdodFwiO1xyXG5cclxuICAgICAgaWYoISBlbmFibGVSZW1vdmUpXHJcbiAgICAgICAgcmVzdWx0UmVtb3ZlciA9IFwiXCI7XHJcblxyXG4gICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGVsKFwiaDJcIiwge30sIFtcclxuICAgICAgICB0ZXh0LFxyXG4gICAgICAgIHJlc3VsdFJlbW92ZXJcclxuICAgICAgXSkpO1xyXG4gICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKHJlc3VsdEVsZW1lbnQpO1xyXG5cclxuICAgICAgaWYocmVzdWx0ID09PSBudWxsKVxyXG4gICAgICAgIEJlaGF2aW9yQnVpbGRlci5pbml0aWFsaXplKFR5cGUuQUNUSU9OLCByZXN1bHRFbGVtZW50KTtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIEJlaGF2aW9yQnVpbGRlci5idWlsZFRva2VuKHJlc3VsdCwgcmVzdWx0RWxlbWVudC5maXJzdENoaWxkKTtcclxuXHJcbiAgICAgIHJldHVybiB3cmFwcGVyO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgdmFyIHJldCA9IGVsKFwiZGl2LmJlaGF2aW9yV3JhcHBlclwiKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0eS5iZWhhdmlvcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgcmV0LmFwcGVuZENoaWxkKG9uZUJlaGF2aW9yKGVudGl0eS5iZWhhdmlvcnNbaV0pKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgdmFyIGJ1dHRvbnMgPSBlbChcImRpdi5ib3R0b21cIiwge30sIFtcclxuICAgICAgVUlCdWlsZGVyLmJ1dHRvbih7XHJcbiAgICAgICAgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDI3KSxcclxuICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICByZXQuYXBwZW5kQ2hpbGQob25lQmVoYXZpb3IobnVsbCkpO1xyXG4gICAgICAgICAgcmV0LnNjcm9sbFRvcCA9IHJldC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KSxcclxuICAgICAgVUlCdWlsZGVyLmJyZWFrKCksXHJcbiAgICAgIFVJQnVpbGRlci5idXR0b24oe1xyXG4gICAgICAgIHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgzMSksXHJcbiAgICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgVUlCdWlsZGVyLmNsb3NlUG9wdXAoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pLFxyXG4gICAgICBVSUJ1aWxkZXIuYnV0dG9uKHtcclxuICAgICAgICB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMzApLFxyXG4gICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHRoYXQuc2F2ZUJlaGF2aW9yKGVudGl0eSk7XHJcbiAgICAgICAgICBVSUJ1aWxkZXIuY2xvc2VQb3B1cCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSksXHJcbiAgICBdKTtcclxuICAgIHZhciB3cmFwcGVyID0gZWwoXCJkaXZcIiwge30sIFtyZXQsIGJ1dHRvbnNdKTtcclxuXHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxuICB9LFxyXG5cclxuICBzYXZlQmVoYXZpb3I6IGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICAgIHZhciBCZWhhdmlvciA9IHJlcXVpcmUoXCIuL2JlaGF2aW9yLmpzXCIpO1xyXG5cclxuICAgIGVudGl0eS5iZWhhdmlvcnMgPSBbXTtcclxuICAgIHZhciBiZWhhdmlvcnMgPSAkKFwiLmJlaGF2aW9yV3JhcHBlciAuYmVoYXZpb3JcIik7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJlaGF2aW9ycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgdG9rZW5CdWlsZGVycyA9ICQoXCIudG9rZW5CdWlsZGVyXCIsIGJlaGF2aW9yc1tpXSk7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHZhciBsb2dpYyA9IF9lbmdpbmUudG9rZW5NYW5hZ2VyLnBhcnNlci5wYXJzZSh0b2tlbkJ1aWxkZXJzWzBdLnRleHRDb250ZW50KTtcclxuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IodmFyIGogPSAxOyBqIDwgdG9rZW5CdWlsZGVycy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKF9lbmdpbmUudG9rZW5NYW5hZ2VyLnBhcnNlci5wYXJzZSh0b2tlbkJ1aWxkZXJzW2pdLnRleHRDb250ZW50KSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXRjaCAoZXJyKSB7fVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgdGhyb3cgXCJBbGwgcmVzdWx0cyBibGFua1wiO1xyXG5cclxuICAgICAgICBlbnRpdHkuYmVoYXZpb3JzLnB1c2gobmV3IEJlaGF2aW9yKGxvZ2ljLCByZXN1bHRzKSk7XHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgIC8vIElnbm9yZSBwYXJzaW5nIGVycm9ycyAoc29tZXRoaW5nIGxlZnQgYmxhbmspXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICBidWlsZFNpZGViYXI6IGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICAgIHZhciBzaWRlYmFyID0gJChcIi5zaWRlYmFyLnVpIC5jb250ZW50XCIpO1xyXG5cclxuICAgIHNpZGViYXIuaHRtbChcIlwiKTtcclxuXHJcbiAgICBpZiAoZW50aXR5ID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcHJvcGVydGllcyA9IFtcclxuICAgICAgLy8gSURcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDcpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0VGV4dFwiLCB2YWx1ZTogZW50aXR5LmlkLCBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7X2VuZ2luZS5jaGFuZ2VJZChlbnRpdHksIHZhbCk7fX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBDb2xsaXNpb24gZ3JvdXBcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDgpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuY29sbGlzaW9uR3JvdXAgKyAxLCBtaW46IDEsIG1heDogX2VuZ2luZS5DT0xMSVNJT05fR1JPVVBTX05VTUJFUixcclxuICAgICAgICBvbmlucHV0OiBmdW5jdGlvbiAodmFsKSB7ZW50aXR5LnNldENvbGxpc2lvbkdyb3VwKHZhbCAqIDEgLSAxKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIExheWVyXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgyMSl9LFxyXG4gICAgICB7IHR5cGU6IFwiaW5wdXROdW1iZXJcIiwgdmFsdWU6IGVudGl0eS5sYXllciArIDEsIG1pbjogMSwgbWF4OiBfZW5naW5lLkxBWUVSU19OVU1CRVIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkgeyBfZW5naW5lLnNldEVudGl0eUxheWVyKGVudGl0eSwgdmFsKjEgLSAxKTsgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBYXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCg5KX0sXHJcbiAgICAgIHsgdHlwZTogXCJpbnB1dE51bWJlclwiLCB2YWx1ZTogZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpLCBpZDogXCJlbnRpdHlfeFwiLFxyXG4gICAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uICh2YWwpIHtcclxuICAgICAgICAgIGVudGl0eS5ib2R5LlNldFRyYW5zZm9ybShuZXcgYjJWZWMyKHZhbCAqIDEsIGVudGl0eS5ib2R5LkdldFBvc2l0aW9uKCkuZ2V0X3koKSksIGVudGl0eS5ib2R5LkdldEFuZ2xlKCkpO1xyXG4gICAgICAgIH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gWVxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTApfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLmdldF95KCksIGlkOiBcImVudGl0eV95XCIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgICAgZW50aXR5LmJvZHkuU2V0VHJhbnNmb3JtKG5ldyBiMlZlYzIoZW50aXR5LmJvZHkuR2V0UG9zaXRpb24oKS5nZXRfeCgpLCB2YWwgKiAxKSwgZW50aXR5LmJvZHkuR2V0QW5nbGUoKSk7XHJcbiAgICAgICAgfX0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBSb3RhdGlvblxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTEpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0TnVtYmVyXCIsIHZhbHVlOiBlbnRpdHkuYm9keS5HZXRBbmdsZSgpICogMTgwIC8gTWF0aC5QSSwgaWQ6IFwiZW50aXR5X3JvdGF0aW9uXCIsXHJcbiAgICAgICAgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5ib2R5LlNldFRyYW5zZm9ybShlbnRpdHkuYm9keS5HZXRQb3NpdGlvbigpLCAodmFsICogMSkgKiBNYXRoLlBJIC8gMTgwKTt9fSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIC8vIEZpeGVkIHJvdGF0aW9uXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxMil9LFxyXG4gICAgICB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogZW50aXR5LmZpeGVkUm90YXRpb24sIG9uY2hhbmdlOiBmdW5jdGlvbih2YWwpIHsgZW50aXR5LmRpc2FibGVSb3RhdGlvbih2YWwpOyB9IH0sXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IGVsKFwicFwiKX0sXHJcblxyXG4gICAgICAvLyBDb2xvclxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoMTMpfSxcclxuICAgICAgeyB0eXBlOiBcImlucHV0Q29sb3JcIiwgdmFsdWU6IGVudGl0eS5jb2xvciwgb25pbnB1dDogZnVuY3Rpb24gKHZhbCkge2VudGl0eS5jb2xvciA9IHZhbH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgLy8gQm9keSB0eXBlXHJcbiAgICAgIHsgdHlwZTogXCJodG1sXCIsIGNvbnRlbnQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxNCl9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogXCJzZWxlY3RcIiwgc2VsZWN0ZWQ6IGVudGl0eS5ib2R5LkdldFR5cGUoKSwgb25jaGFuZ2U6IGZ1bmN0aW9uICh2YWwpIHtlbnRpdHkuYm9keS5TZXRUeXBlKHZhbCAqIDEpfSxcclxuICAgICAgICBvcHRpb25zOiBbXHJcbiAgICAgICAgICB7IHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxNSksIHZhbHVlOiBCb2R5VHlwZS5EWU5BTUlDX0JPRFkgfSxcclxuICAgICAgICAgIHsgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIwKSwgdmFsdWU6IEJvZHlUeXBlLktJTkVNQVRJQ19CT0RZIH0sXHJcbiAgICAgICAgICB7IHRleHQ6IFRyYW5zbGF0aW9ucy5nZXRUcmFuc2xhdGVkV3JhcHBlZCgxNiksIHZhbHVlOiBCb2R5VHlwZS5TVEFUSUNfQk9EWSB9LFxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAgeyB0eXBlOiBcImh0bWxcIiwgY29udGVudDogZWwoXCJwXCIpfSxcclxuXHJcbiAgICAgIHsgdHlwZTogXCJidXR0b25cIiwgdGV4dDogVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWRXcmFwcGVkKDIyKSwgb25jbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmKGNvbmZpcm0oVHJhbnNsYXRpb25zLmdldFRyYW5zbGF0ZWQoMjMpKSlcclxuICAgICAgICAgIF9lbmdpbmUucmVtb3ZlRW50aXR5KGVudGl0eSk7XHJcbiAgICAgIH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgICAgeyB0eXBlOiBcImJ1dHRvblwiLCB0ZXh0OiBUcmFuc2xhdGlvbnMuZ2V0VHJhbnNsYXRlZFdyYXBwZWQoNCksIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBVSUJ1aWxkZXIucG9wdXAoVUkuY3JlYXRlQmVoYXZpb3IoZW50aXR5KSk7XHJcbiAgICAgIH19LFxyXG4gICAgICB7IHR5cGU6IFwiaHRtbFwiLCBjb250ZW50OiBlbChcInBcIil9LFxyXG5cclxuICAgIF07XHJcblxyXG4gICAgc2lkZWJhclswXS5hcHBlbmRDaGlsZChVSUJ1aWxkZXIuYnVpbGQocHJvcGVydGllcykpO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUk7IiwidmFyIFVJQnVpbGRlciA9IHtcclxuICByYWRpbzogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJyYWRpb0dyb3VwLVwiICsgJChcIi5yYWRpb0dyb3VwXCIpLmxlbmd0aCxcclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcImRpdi51aS5yYWRpb0dyb3VwXCIsIHtpZDogcHJvcGVydGllcy5pZH0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKFwiaW5wdXRbdHlwZT1yYWRpb11cIiwgdGhpcykuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJChcImlucHV0W3R5cGU9cmFkaW9dXCIsIHRoaXMpLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmVuYWJsZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIHZhciBpZENvdW50ID0gJChcImlucHV0W3R5cGU9cmFkaW9dXCIpLmxlbmd0aDtcclxuXHJcbiAgICBwcm9wZXJ0aWVzLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICBlbGVtZW50ID0gJC5leHRlbmQoe30sIHtcclxuICAgICAgICBpZDogXCJyYWRpby1cIiArIGlkQ291bnQrKyxcclxuICAgICAgICBjaGVja2VkOiBmYWxzZSxcclxuICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbigpe31cclxuICAgICAgfSwgZWxlbWVudCk7XHJcblxyXG4gICAgICB2YXIgaW5wdXQgPSBlbChcImlucHV0LnVpXCIsIHt0eXBlOiBcInJhZGlvXCIsIGlkOiBlbGVtZW50LmlkLCBuYW1lOiBwcm9wZXJ0aWVzLmlkfSk7XHJcbiAgICAgIHZhciBsYWJlbCA9IGVsKFwibGFiZWwudWkuYnV0dG9uXCIsIHtmb3I6IGVsZW1lbnQuaWR9LCBbZWxlbWVudC50ZXh0XSk7XHJcblxyXG4gICAgICBpbnB1dC5lbmFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgJChcIitsYWJlbFwiLCB0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgaW5wdXQuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICQoXCIrbGFiZWxcIiwgdGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGxhYmVsLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcyhcImRpc2FibGVkXCIpKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBlbGVtZW50Lm9uY2xpY2soKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlucHV0LmNoZWNrZWQgPSBlbGVtZW50LmNoZWNrZWQ7XHJcblxyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQoaW5wdXQpO1xyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQobGFiZWwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG4gIFxyXG4gIGJ1dHRvbjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJidXR0b24tXCIgKyAkKFwiLmJ1dHRvblwiKS5sZW5ndGgsXHJcbiAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwic3Bhbi51aS5idXR0b25cIiwgeyBpZDogcHJvcGVydGllcy5pZCB9LCBbcHJvcGVydGllcy50ZXh0XSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKVxyXG4gICAge1xyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0Lm9uY2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKFwiZGlzYWJsZWRcIikpXHJcbiAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgcHJvcGVydGllcy5vbmNsaWNrLmNhbGwodGhpcywgZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgc2VsZWN0OiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcInNlbGVjdC1cIiArICQoXCJzZWxlY3RcIikubGVuZ3RoLFxyXG4gICAgICBzZWxlY3RlZDogXCJcIixcclxuICAgICAgb25jaGFuZ2U6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwic2VsZWN0LnVpXCIsIHsgaWQ6IHByb3BlcnRpZXMuaWQgfSk7XHJcblxyXG4gICAgcmV0Lm9uY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uY2hhbmdlKHRoaXMudmFsdWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0LmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgICB0aGlzLmRpc2FibGVkID0gZW5hYmxlO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcm9wZXJ0aWVzLm9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob3B0aW9uLCBpbmRleCkge1xyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQoZWwoXCJvcHRpb25cIiwge3ZhbHVlOiBvcHRpb24udmFsdWV9LCBbb3B0aW9uLnRleHRdKSk7XHJcblxyXG4gICAgICBpZiAob3B0aW9uLnZhbHVlID09IHByb3BlcnRpZXMuc2VsZWN0ZWQpXHJcbiAgICAgICAgcmV0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgYnJlYWs6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBlbChcInNwYW4udWkuYnJlYWtcIik7XHJcbiAgfSxcclxuXHJcbiAgaW5wdXRUZXh0OiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGlkOiBcImlucHV0VGV4dC1cIiArICQoXCJpbnB1dFt0eXBlPXRleHRdXCIpLmxlbmd0aCxcclxuICAgICAgdmFsdWU6IFwiXCIsXHJcbiAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwiaW5wdXQudWlcIiwgeyB0eXBlOiBcInRleHRcIiwgaWQ6IHByb3BlcnRpZXMuaWQsIHZhbHVlOiBwcm9wZXJ0aWVzLnZhbHVlIH0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0Lm9uaW5wdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBpbnB1dE51bWJlcjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJpbnB1dE51bWJlci1cIiArICQoXCJpbnB1dFt0eXBlPW51bWJlcl1cIikubGVuZ3RoLFxyXG4gICAgICB2YWx1ZTogMCxcclxuICAgICAgbWluOiAtSW5maW5pdHksXHJcbiAgICAgIG1heDogSW5maW5pdHksXHJcbiAgICAgIG9uaW5wdXQ6IGZ1bmN0aW9uKCl7fVxyXG4gICAgfSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgdmFyIHJldCA9IGVsKFwiaW5wdXQudWlcIiwgeyB0eXBlOiBcIm51bWJlclwiLCBpZDogcHJvcGVydGllcy5pZCwgdmFsdWU6IHByb3BlcnRpZXMudmFsdWUsIG1pbjogcHJvcGVydGllcy5taW4sIG1heDogcHJvcGVydGllcy5tYXggfSk7XHJcblxyXG4gICAgcmV0LmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQub25pbnB1dCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBodG1sOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xyXG4gICAgcHJvcGVydGllcyA9ICQuZXh0ZW5kKHt9LCB7XHJcbiAgICAgIGNvbnRlbnQ6IFwiXCJcclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHJldHVybiBwcm9wZXJ0aWVzLmNvbnRlbnQ7XHJcbiAgfSxcclxuXHJcbiAgaW5wdXRDb2xvcjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJpbnB1dENvbG9yLVwiICsgJChcImlucHV0W3R5cGU9Y29sb3JdXCIpLmxlbmd0aCxcclxuICAgICAgdmFsdWU6IFwiIzAwMDAwMFwiLFxyXG4gICAgICBvbmlucHV0OiBmdW5jdGlvbigpe31cclxuICAgIH0sIHByb3BlcnRpZXMpO1xyXG5cclxuICAgIHZhciByZXQgPSBlbChcImlucHV0LnVpLmJ1dHRvblwiLCB7IHR5cGU6IFwiY29sb3JcIiwgaWQ6IHByb3BlcnRpZXMuaWQsIHZhbHVlOiBwcm9wZXJ0aWVzLnZhbHVlIH0pO1xyXG5cclxuICAgIHJldC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXQuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0Lm9uaW5wdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHByb3BlcnRpZXMub25pbnB1dCh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9LFxyXG5cclxuICBjaGVja2JveDogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcclxuICAgIHByb3BlcnRpZXMgPSAkLmV4dGVuZCh7fSwge1xyXG4gICAgICBpZDogXCJjaGVja2JveC1cIiArICQoXCJpbnB1dFt0eXBlPWNoZWNrYm94XVwiKS5sZW5ndGgsXHJcbiAgICAgIGNoZWNrZWQ6IGZhbHNlLFxyXG4gICAgICBvbmNoYW5nZTogZnVuY3Rpb24oKXt9XHJcbiAgICB9LCBwcm9wZXJ0aWVzKTtcclxuXHJcbiAgICB2YXIgcmV0ID0gZWwoXCJzcGFuXCIpO1xyXG4gICAgdmFyIGNoZWNrYm94ID0gZWwoXCJpbnB1dC51aVwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgaWQ6IHByb3BlcnRpZXMuaWQgfSk7XHJcbiAgICB2YXIgbGFiZWwgPSBlbChcImxhYmVsLnVpLmJ1dHRvblwiLCB7IGZvcjogcHJvcGVydGllcy5pZCB9KTtcclxuXHJcbiAgICByZXQuYXBwZW5kQ2hpbGQoY2hlY2tib3gpO1xyXG4gICAgcmV0LmFwcGVuZENoaWxkKGxhYmVsKTtcclxuXHJcbiAgICBjaGVja2JveC5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKFwiK2xhYmVsXCIsIHRoaXMpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICBjaGVja2JveC5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICQoXCIrbGFiZWxcIiwgdGhpcykucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICBjaGVja2JveC5jaGVja2VkID0gcHJvcGVydGllcy5jaGVja2VkO1xyXG5cclxuICAgIGNoZWNrYm94Lm9uY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBwcm9wZXJ0aWVzLm9uY2hhbmdlKHRoaXMuY2hlY2tlZCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxuXHJcbiAgYnVpbGQ6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XHJcbiAgICB2YXIgcmV0ID0gZWwuZGl2KCk7XHJcblxyXG4gICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgIHZhciBnZW5lcmF0ZWQ7XHJcbiAgICAgIFxyXG4gICAgICBzd2l0Y2ggKGVsZW1lbnQudHlwZSkge1xyXG4gICAgICAgIGNhc2UgXCJyYWRpb1wiOlxyXG4gICAgICAgICAgZ2VuZXJhdGVkID0gdGhpcy5yYWRpbyhlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiYnV0dG9uXCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmJ1dHRvbihlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwic2VsZWN0XCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLnNlbGVjdChlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiaW5wdXRUZXh0XCI6XHJcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0aGlzLmlucHV0VGV4dChlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiaW5wdXROdW1iZXJcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuaW5wdXROdW1iZXIoZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImlucHV0Q29sb3JcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuaW5wdXRDb2xvcihlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiY2hlY2tib3hcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuY2hlY2tib3goZWxlbWVudCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBcImh0bWxcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuaHRtbChlbGVtZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiYnJlYWtcIjpcclxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRoaXMuYnJlYWsoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXQuYXBwZW5kQ2hpbGQoZ2VuZXJhdGVkKTtcclxuICAgIH0sIHRoaXMpO1xyXG4gICAgXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH0sXHJcbiAgXHJcbiAgYnVpbGRMYXlvdXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvbnRlbnQgPSBlbChcImRpdi51aS5jb250ZW50LnBhbmVsXCIpO1xyXG4gICAgdmFyIHNpZGViYXIgPSBlbChcImRpdi51aS5zaWRlYmFyLnBhbmVsXCIsIHt9LCBbIGVsKFwiZGl2LmNvbnRlbnRcIikgXSk7XHJcbiAgICB2YXIgcmVzaXplciA9IGVsKFwiZGl2LnVpLnJlc2l6ZXJcIik7XHJcbiAgICB2YXIgdG9vbGJhciA9IGVsKFwiZGl2LnVpLnRvb2xiYXJcIik7XHJcblxyXG4gICAgdmFyIHcgPSAkKFwiYm9keVwiKS5vdXRlcldpZHRoKCk7XHJcbiAgICB2YXIgc2lkZWJhcldpZHRoID0gMjUwO1xyXG5cclxuICAgIGNvbnRlbnQuc3R5bGUud2lkdGggPSB3IC0gMjUwICsgXCJweFwiO1xyXG4gICAgc2lkZWJhci5zdHlsZS53aWR0aCA9IHNpZGViYXJXaWR0aCArIFwicHhcIjtcclxuXHJcbiAgICB2YXIgc2lkZWJhclJlc2l6ZUV2ZW50ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgdmFyIHdpbmRvd1dpZHRoID0gJChcImJvZHlcIikub3V0ZXJXaWR0aCgpO1xyXG4gICAgICB2YXIgc2lkZWJhcldpZHRoID0gTWF0aC5tYXgoMzAsIE1hdGgubWluKHdpbmRvd1dpZHRoICogMC42LCB3aW5kb3dXaWR0aCAtIGUuY2xpZW50WCkpO1xyXG4gICAgICB2YXIgY29udGVudFdpZHRoID0gd2luZG93V2lkdGggLSBzaWRlYmFyV2lkdGg7XHJcblxyXG4gICAgICBzaWRlYmFyLnN0eWxlLndpZHRoID0gc2lkZWJhcldpZHRoICsgXCJweFwiO1xyXG4gICAgICBjb250ZW50LnN0eWxlLndpZHRoID0gY29udGVudFdpZHRoICsgXCJweFwiO1xyXG5cclxuICAgICAgd2luZG93Lm9ucmVzaXplKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBtb3VzZVVwRXZlbnQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBzaWRlYmFyLnJlc2l6aW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAkKFwiLnJlc2l6ZXIudWlcIikucmVtb3ZlQ2xhc3MoXCJyZXNpemluZ1wiKTtcclxuXHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHNpZGViYXJSZXNpemVFdmVudCk7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBtb3VzZVVwRXZlbnQpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgd2luZG93UmVzaXplRXZlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciB3aW5kb3dXaWR0aCA9ICQoXCJib2R5XCIpLm91dGVyV2lkdGgoKTtcclxuICAgICAgdmFyIGNvbnRlbnRXaWR0aCA9IE1hdGgubWF4KHdpbmRvd1dpZHRoICogMC40LCBNYXRoLm1pbihcclxuICAgICAgICB3aW5kb3dXaWR0aCAtIDMwLFxyXG4gICAgICAgIHdpbmRvd1dpZHRoIC0gJChcIi5zaWRlYmFyLnVpXCIpLm91dGVyV2lkdGgoKVxyXG4gICAgICApKTtcclxuICAgICAgdmFyIHNpZGViYXJXaWR0aCA9IHdpbmRvd1dpZHRoIC0gY29udGVudFdpZHRoO1xyXG5cclxuICAgICAgc2lkZWJhci5zdHlsZS53aWR0aCA9IHNpZGViYXJXaWR0aCArIFwicHhcIjtcclxuICAgICAgY29udGVudC5zdHlsZS53aWR0aCA9IGNvbnRlbnRXaWR0aCArIFwicHhcIjtcclxuICAgIH07XHJcblxyXG4gICAgcmVzaXplci5vbm1vdXNlZG93biA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHNpZGViYXIucmVzaXppbmcgPSB0cnVlO1xyXG5cclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcInJlc2l6aW5nXCIpO1xyXG5cclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2lkZWJhclJlc2l6ZUV2ZW50KTtcclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG1vdXNlVXBFdmVudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHdpbmRvd1Jlc2l6ZUV2ZW50KTtcclxuXHJcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKHRvb2xiYXIpO1xyXG4gICAgc2lkZWJhci5hcHBlbmRDaGlsZChyZXNpemVyKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNpZGViYXIpO1xyXG4gIH0sXHJcblxyXG4gIC8vIENyZWF0aW5nIGEgcG9wdXAgbWVzc2FnZVxyXG4gIHBvcHVwOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICB2YXIgb3ZlcmxheSA9IGVsKFwiZGl2I3BvcHVwT3ZlcmxheVwiLCBbZWwoXCJkaXYjcG9wdXBDb250ZW50XCIsIFtkYXRhXSldKTtcclxuICAgIG92ZXJsYXkub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgVUlCdWlsZGVyLmNsb3NlUG9wdXAoZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKG92ZXJsYXksIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgVHJhbnNsYXRpb25zLnJlZnJlc2goKTtcclxuICB9LFxyXG5cclxuICAvLyBDbG9zaW5nIGEgcG9wdXAgbWVzc2FnZVxyXG4gIGNsb3NlUG9wdXA6IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3B1cE92ZXJsYXlcIik7XHJcbiAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9wdXBDb250ZW50XCIpO1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSBpdCB3YXMgdGhlIG92ZXJsYXkgdGhhdCB3YXMgY2xpY2tlZCwgbm90IGFuIGVsZW1lbnQgYWJvdmUgaXRcclxuICAgIGlmICh0eXBlb2YgZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBlLnRhcmdldCAhPT0gb3ZlcmxheSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgY29udGVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNvbnRlbnQpO1xyXG4gICAgb3ZlcmxheS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG92ZXJsYXkpO1xyXG4gIH0sXHJcblxyXG5cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJQnVpbGRlcjsiLCIvLyBPYmplY3QgY29udGFpbmluZyB1c2VmdWwgbWV0aG9kc1xyXG52YXIgVXRpbHMgPSB7XHJcbiAgZ2V0QnJvd3NlcldpZHRoOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkKFwiLnVpLmNvbnRlbnRcIikub3V0ZXJXaWR0aCgpO1xyXG4gIH0sXHJcblxyXG4gIGdldEJyb3dzZXJIZWlnaHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICQoXCIudWkuY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gJChcIi51aS50b29sYmFyXCIpLm91dGVySGVpZ2h0KCk7XHJcbiAgfSxcclxuXHJcbiAgcmFuZG9tUmFuZ2U6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pO1xyXG4gIH0sXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7IiwidmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHMuanNcIik7XHJcblxyXG4vLyBWSUVXUE9SVFxyXG4vLyBUaGlzIGlzIGJhc2ljYWxseSBjYW1lcmEgKyBwcm9qZWN0b3JcclxuXHJcbnZhciBWaWV3cG9ydCA9IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIHgsIHkpIHtcclxuICB0aGlzLnNjYWxlID0gMSAvIDIwO1xyXG5cclxuICAvLyBDYW52YXMgZGltZW5zaW9uc1xyXG4gIGlmICh3aWR0aCAhPSB1bmRlZmluZWQgJiYgaGVpZ2h0ICE9IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5zZXRBdXRvUmVzaXplKGZhbHNlKTtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnNldEF1dG9SZXNpemUodHJ1ZSk7XHJcbiAgICB0aGlzLmF1dG9SZXNpemUoKTtcclxuICB9XHJcblxyXG4gIC8vIENlbnRlciBwb2ludCBvZiB0aGUgY2FtZXJhXHJcbiAgaWYgKHggIT09IHVuZGVmaW5lZCAmJiB5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnggPSBNYXRoLmZsb29yKHRoaXMud2lkdGggLyAyKTtcclxuICAgIHRoaXMueSA9IE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyAyKTtcclxuICB9XHJcblxyXG4gIC8vIENhbnZhcyBlbGVtZW50XHJcbiAgdGhpcy5jYW52YXNFbGVtZW50ID0gY2FudmFzRWxlbWVudDtcclxuXHJcbiAgaWYgKGNhbnZhc0VsZW1lbnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5jYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXNFbGVtZW50KTtcclxuICB9XHJcblxyXG4gIHRoaXMucmVzZXRFbGVtZW50KCk7IC8vIFJlc2l6ZSB0byBuZXcgZGltZW5zaW9uc1xyXG5cclxuICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG59O1xyXG5cclxuLy8gUmVsb2FkcyB2YWx1ZXMgZm9yIHRoZSBjYW52YXMgZWxlbWVudFxyXG5WaWV3cG9ydC5wcm90b3R5cGUucmVzZXRFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5jYW52YXNFbGVtZW50LndpZHRoID0gdGhpcy53aWR0aDtcclxuICB0aGlzLmNhbnZhc0VsZW1lbnQuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbn1cclxuXHJcbi8vIEF1dG9tYXRpY2FsbHkgcmVzaXplcyB0aGUgdmlld3BvcnQgdG8gZmlsbCB0aGUgc2NyZWVuXHJcblZpZXdwb3J0LnByb3RvdHlwZS5hdXRvUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy53aWR0aCA9IFV0aWxzLmdldEJyb3dzZXJXaWR0aCgpO1xyXG4gIHRoaXMuaGVpZ2h0ID0gVXRpbHMuZ2V0QnJvd3NlckhlaWdodCgpO1xyXG59O1xyXG5cclxuLy8gVG9nZ2xlcyB2aWV3cG9ydCBhdXRvIHJlc2l6aW5nXHJcblZpZXdwb3J0LnByb3RvdHlwZS5zZXRBdXRvUmVzaXplID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHJcbiAgdGhpcy5hdXRvUmVzaXplQWN0aXZlID0gdmFsdWU7XHJcblxyXG4gIGlmICh0aGlzLmF1dG9SZXNpemVBY3RpdmUpIHtcclxuICAgIHZhciB0ID0gdGhpcztcclxuICAgIHdpbmRvdy5vbnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB0LmF1dG9SZXNpemUoKTtcclxuICAgICAgdC5yZXNldEVsZW1lbnQoKTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgd2luZG93Lm9ucmVzaXplID0gbnVsbDtcclxuICB9XHJcbn07XHJcblxyXG5WaWV3cG9ydC5wcm90b3R5cGUuZ2V0T2Zmc2V0ID0gZnVuY3Rpb24oKVxyXG57XHJcbiAgcmV0dXJuIFt0aGlzLnggLSB0aGlzLndpZHRoIC8gMiwgdGhpcy55IC0gdGhpcy5oZWlnaHQgLyAyXTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVmlld3BvcnQ7Il19
