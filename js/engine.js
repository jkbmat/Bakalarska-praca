const DYNAMIC_BODY = Module.b2_dynamicBody;
const STATIC_BODY = Module.b2_staticBody;
const KINEMATIC_BODY = Module.b2_kinematicBody;

const AUTO_ID_PREFIX = "ENTITY_NUMBER_";
const AUTO_COLOR_RANGE = [0, 230];

const COLLISION_GROUPS_NUMBER = 16;


/*/ Myslienky

lockovanie kamery na objekt
 * prechody
ako funguje cela kamera?

/*/



// ENGINE

// constructor
var Engine = function(viewport, gravity)
{
	this.viewport = viewport;
	this.entities = [];

	this.collisionGroups = [];
	for (var i = 0; i < COLLISION_GROUPS_NUMBER; i++)
	{
		this.collisionGroups.push
		(
			{
				"name": i + 1,
				"mask": parseInt(Array(COLLISION_GROUPS_NUMBER + 1).join("1"), 2)
			}
		)
	}

	this.lifetimeEntities = 0;

	this.world = new b2World(gravity, true);
}


// Returns the entity with id specified by argument
Engine.prototype.getEntityById = function(id)
{
	for (var i = 0; i < this.entities.length; i++) {
		if(this.entities[i].id === id)
			return this.entities[i];
	}

	return null;
}

// Returns an array of entities with specified collisionGroup
Engine.prototype.getEntitiesByCollisionGroup = function(group)
{
	var ret = [];

	for (var i = 0; i < this.entities.length; i++) {
		if(this.entities[i].collisionGroup === group)
			ret.push(this.entities[i]);
	}

	return ret;
}

// Adding an entity to the world
Engine.prototype.addEntity = function(entity, type)
{
	// generate auto id
	if (entity.id == undefined)
	{
		entity.id = AUTO_ID_PREFIX + this.lifetimeEntities;
	}

	this.lifetimeEntities ++;

	entity.body.set_type(type);

	entity.body = this.world.CreateBody(entity.body);
	entity.fixture = entity.body.CreateFixture(entity.fixture);
	this.entities.push(entity);

	return entity;
}

// Checks whether two groups should collide
Engine.prototype.getCollision = function(groupA, groupB)
{
	return (this.collisionGroups[groupA].mask >> groupB) & 1;
}

// Sets two groups up to collide
Engine.prototype.setCollision = function(groupA, groupB, value)
{
	var maskA = (1 << groupB);
	var maskB = (1 << groupA);

	if(value)
	{
		this.collisionGroups[groupA].mask = this.collisionGroups[groupA].mask | maskA;
		this.collisionGroups[groupB].mask = this.collisionGroups[groupB].mask | maskB;
	}
	else
	{
		this.collisionGroups[groupA].mask = this.collisionGroups[groupA].mask & ~maskA;
		this.collisionGroups[groupB].mask = this.collisionGroups[groupB].mask & ~maskB;
	}
	this.updateCollisions()

	return this;
}

// Updates collision masks for all entities, based on engine's collisionGroups table
Engine.prototype.updateCollisions = function()
{

	for (var i = 0; i < this.entities.length; i++)
	{
		this.updateCollision(this.entities[i]);
	}

	return this;
}

// Updates collision mask for an entity, based on engine's collisionGroups table
Engine.prototype.updateCollision = function(entity)
{
	var filterData = entity.fixture.GetFilterData();
	filterData.set_maskBits(this.collisionGroups[entity.collisionGroup].mask);
	entity.fixture.SetFilterData(filterData);

	return this;
}

// One simulation step. Simulation logic happens here.
Engine.prototype.step = function()
{
	// FPS timer
	var start = Date.now();

	ctx = this.viewport.context;

	// clear screen
	ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);

	ctx.save()

	// draw all entities
	for (var i = this.entities.length - 1; i >= 0; i--)
	{
		ctx.save();
		ctx.translate(this.viewport.x - this.viewport.width / 2, this.viewport.y - this.viewport.height / 2);
		ctx.fillStyle = this.entities[i].color;

		this.entities[i].draw(ctx);

		ctx.restore();

		for(var j = 0; j < this.entities[i].behaviors.length; j++)
		{
			var behavior = this.entities[i].behaviors[j];

			if(behavior.check(this.entities[i]))
				behavior.result();
		}
	}

	// box2d simulation step
	this.world.Step(1/60, 3, 3)

	// CUSTOM TESTING CODE STARTS HERE
	// -------------------------------

	// keyboard controlled platform
	var x = 0;
	var y = 0;
	if (_keyboard.isDown(40)) {
		y = 1;
	}if (_keyboard.isDown(39)) {
		x = 1
	}if (_keyboard.isDown(38)) {
		y = -1
	}if (_keyboard.isDown(37)) {
		x = -1;
	}
	var speed = 150;
	//this.entities[2].setLinearVelocity(new b2Vec2(speed * x, speed * y));

	// drawing rectangles
	var w = (_mouse.x - _mouse.dragOrigin[0]) / 2;
	var h = (_mouse.y - _mouse.dragOrigin[1]) / 2;

	if(_mouse.leftDown && w > 5 && h > 5)
	{
		ctx.save();
		ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
		ctx.fillRect(_mouse.dragOrigin[0], _mouse.dragOrigin[1], w*2, h*2);
		ctx.restore();
	}
	if(_mouse.leftUp && w > 5 && h > 5)
	{
			_engine.addEntity(new Rectangle(new b2Vec2(_mouse.x - w, _mouse.y - h), new b2Vec2(w, h)), DYNAMIC_BODY)
	}

	// -------------------------------
	//  CUSTOM TESTING CODE ENDS HERE


	// Released keys are only to be processed once
	_mouse.cleanUp();
	_keyboard.cleanUp();

	end = Date.now();

	// Call next step
	setTimeout(window.requestAnimationFrame(function(){ _engine.step() }), Math.min(60 - end - start, 0));
}




// VIEWPORT
// This is basically camera + projector
var Viewport = function(canvasElement, width, height, x, y)
{
	// Canvas dimensions
	if (width != undefined && height != undefined)
	{
		this.setAutoResize(false);
		this.width = width;
		this.height = height;
	}
	else
	{
		this.setAutoResize(true);
		this.autoResize();
	}

	// Center point of the camera
	if (x != undefined && y != undefined)
	{
		this.x = x;
		this.y = y;
	}
	else
	{
		this.x = Math.floor(this.width / 2);
		this.y = Math.floor(this.height / 2);
	}

	// Canvas element
	this.canvasElement = canvasElement;

	if (canvasElement === undefined)
	{
		this.canvasElement = document.createElement("canvas");
		document.body.appendChild(this.canvasElement);
	}

	this.resetElement(); // Resize to new dimensions

	this.context = this.canvasElement.getContext("2d");
}

// Reloads values for the canvas element
Viewport.prototype.resetElement = function()
{
	this.canvasElement.width = this.width;
	this.canvasElement.height = this.height;
}

// Automatically resizes the viewport to fill the screen
Viewport.prototype.autoResize = function()
{
	this.width = Tools.getBrowserWidth();
	this.height = Tools.getBrowserHeight();
	this.x = Math.floor(this.width / 2);
	this.y = Math.floor(this.height / 2);
}

// Toggles viewport auto resizing
Viewport.prototype.setAutoResize = function(value) {

	this.autoResizeActive = value;

	if (this.autoResizeActive)
	{
		var t = this;
		window.onresize = function ()
		{
			t.autoResize();
			t.resetElement();
		}
	}

	else
	{
		window.onresize = null;
	}
}



// ENTITY

var Entity = function(shape, fixture, body, id, collisionGroup)
{
	this.id = id;
	this.dead = false;
	this.layer = 0;

	this.collisionGroup = collisionGroup;
	if(this.collisionGroup == undefined)
	{
		this.collisionGroup = 0;
	}

	this.behaviors = [];

	this.fixture = fixture;
	if (this.fixture == undefined)
	{
		var fixture = new b2FixtureDef();
		fixture.set_density(10)
		fixture.set_friction(0.1);
		fixture.set_restitution(0.2);

		this.fixture = fixture;
	}
	this.fixture.set_shape(shape);

	var filterData = this.fixture.get_filter();
	filterData.set_categoryBits(1 << collisionGroup);

	// Constructor is called when inheriting, so we need to check for _engine availability
	if(typeof _engine !== 'undefined')
		filterData.set_maskBits(_engine.collisionGroups[this.collisionGroup].mask);

	this.fixture.set_filter(filterData);

	this.body = body;
	if(this.body !== undefined)
		this.body.set_fixedRotation(false);

	// Auto generate color
	var r = Tools.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]);
	var g = Tools.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]);
	var b = Tools.randomRange(AUTO_COLOR_RANGE[0], AUTO_COLOR_RANGE[1]);
	this.color = "rgb("+ r +", "+ g +", "+ b +")";
}

Entity.prototype.die = function()
{
	this.dead = true;

	return this;
}

Entity.prototype.draw = function()
{
	alert("ERROR! Cannot draw Entity: Use derived classes.");
}

Entity.prototype.setColor = function(color)
{
	this.color = color;

	return this;
}

Entity.prototype.setId = function(id)
{
	this.id = id;

	return this;
}


Entity.prototype.setCollisionGroup = function(group)
{
	this.collisionGroup = group;

	var filterData = this.fixture.GetFilterData();
	filterData.set_categoryBits(1 << group);
	this.fixture.SetFilterData(filterData);

	_engine.updateCollision(this);

	return this;
}

Entity.prototype.setLinearVelocity = function(vector)
{
	this.body.SetLinearVelocity(vector);

	return this;
}

Entity.prototype.addBehavior = function(behavior)
{
  this.behaviors.push(behavior);

  return this;
}
