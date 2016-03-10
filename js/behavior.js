const TYPE_BOOLEAN = "boolean";
const TYPE_NUMBER = "number";
const TYPE_STRING = "string";
const TYPE_ARRAY = "array";

var Behavior = function(logic, results)
{
  this.logic = logic;
  this.results = Array.isArray(results) ? results : [results];
}

Behavior.prototype.check = function(entity)
{
  return this.logic.evaluate(entity);
}

Behavior.prototype.result = function() // Use a derived class
{
  for(var i = 0; i < this.results.length; i++)
  {
    this.results[i].execute()
  }
}


var Logic = function(type)
{
  this.type = type;
}

Logic.prototype.evaluate = function() // Use a derived class
{
  return false;
}


var Action = function()
{

}

Action.prototype.execute = function() // Use a derived class
{
  return false;
}


var EntityFilter = function(checkBehavior)
{
  this.checkBehavior = checkBehavior;
}

EntityFilter.prototype.decide = function (entity)
{
  return new Behavior(this.checkBehavior).check(entity);
};

EntityFilter.prototype.filter = function ()
{
  var ret = [];
  for(var i = 0; i < _engine.entities.length; i++)
  {
    if(this.decide(_engine.entities[i]))
      ret.push(_engine.entities[i]);
  }
  return ret;
};


var lAnd = function(a, b)
{
  this.a = a;
  this.b = b;

  this.type = TYPE_BOOLEAN;
}
lAnd.prototype = new Logic();
lAnd.prototype.constructor = lAnd;

lAnd.prototype.evaluate = function()
{
  if(this.a.evaluate() && this.b.evaluate())
    return true;

  return false;
}

var lOr = function(a, b)
{
  this.a = a;
  this.b = b;

  this.type = TYPE_BOOLEAN;
}
lOr.prototype = new Logic();
lOr.prototype.constructor = lOr;

lOr.prototype.evaluate = function()
{
  if(this.a.evaluate() || this.b.evaluate())
    return true;

  return false;
}

var lNot = function(a)
{
  this.a = a;

  this.type = TYPE_BOOLEAN;
}
lNot.prototype = new Logic();
lNot.prototype.constructor = lNot;

lNot.prototype.evaluate = function()
{
  return !this.a.evaluate();
}

var lLiteral = function(value, type)
{
  this.value = value;
  this.type = type;
}
lLiteral.prototype = new Logic();
lLiteral.prototype.constructor = lLiteral;

lLiteral.prototype.evaluate = function()
{
  return this.value;
}

var lButtonDown = function(button)
{
  this.button = button;

  this.type = TYPE_BOOLEAN;
}
lButtonDown.prototype = new Logic();
lButtonDown.prototype.constructor = lButtonDown;

lButtonDown.prototype.evaluate = function()
{
  return _keyboard.isDown(this.button.evaluate());
}

var lButtonUp = function(button)
{
  this.button = button;

  this.type = TYPE_BOOLEAN;
}
lButtonUp.prototype = new Logic();
lButtonUp.prototype.constructor = lButtonUp;

lButtonUp.prototype.evaluate = function()
{
  return _keyboard.isUp(this.button.evaluate());
}


var aSetColor = function(ef, color)
{
  this.entityFilter = ef;
  this.color = color;
}
aSetColor.prototype = new Action();
aSetColor.prototype.constructor = aSetColor;

aSetColor.prototype.execute = function()
{
  var entities = this.entityFilter.filter();
  for (var i = 0; i < entities.length; i++)
  {
    entities[i].setColor(this.color.evaluate());
  }
}


var efById = function(id)
{
  this.id = id;
}
efById.prototype = new EntityFilter();
efById.prototype.constructor = efById;

efById.prototype.decide = function(entity)
{
  return entity.id === this.id;
}

var efByCollisionGroup = function(group)
{
  this.group = group;
}
efByCollisionGroup.prototype = new EntityFilter();
efByCollisionGroup.prototype.constructor = efByCollisionGroup;

efByCollisionGroup.prototype.decide = function(entity)
{
  return entity.collisionGroup === this.group;
}
