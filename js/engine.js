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
				"name": i,
				"mask": parseInt(Array(COLLISION_GROUPS_NUMBER + 1).join("1"), 2)
			}
		)
	}

	this.lifetimeEntities = 0;

	this.world = new b2World(gravity, true);

}

Engine.prototype.addEntity = function(entity, type)
{
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

Engine.prototype.getCollision = function(groupA, groupB)
{
	return (this.collisionGroups[groupA].mask >> groupB) & 1;
}

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

Engine.prototype.updateCollisions = function()
{

	for (var i = 0; i < this.entities.length; i++)
	{
		this.updateCollision(this.entities[i]);
	}

	return this;
}

Engine.prototype.updateCollision = function(entity)
{
	var filterData = entity.fixture.GetFilterData();
	filterData.set_maskBits(this.collisionGroups[entity.collisionGroup].mask);
	entity.fixture.SetFilterData(filterData);

	return this;
}

Engine.prototype.step = function()
{
	var start = Date.now();

	ctx = this.viewport.context;

	ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);

	ctx.save()

	for (var i = this.entities.length - 1; i >= 0; i--)
	{
		ctx.save();
		ctx.translate(this.viewport.x - this.viewport.width / 2, this.viewport.y - this.viewport.height / 2);
		ctx.fillStyle = this.entities[i].color;

		this.entities[i].draw(ctx);

		ctx.restore();
	}

	this.world.Step(1/60, 3, 3)

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
	this.entities[2].setLinearVelocity(new b2Vec2(speed * x, speed * y));

	if(_mouse.leftUp)
	{
		var w = (_mouse.x - _mouse.dragOrigin[0]) / 2;
		var h = (_mouse.y - _mouse.dragOrigin[1]) / 2;
		_engine.addEntity(new Rectangle(new b2Vec2(_mouse.x - w, _mouse.y - h), new b2Vec2(w, h)), DYNAMIC_BODY)
	}

	_mouse.cleanUp();
	_keyboard.cleanUp();

	end = Date.now();

	setTimeout(window.requestAnimationFrame(function(){ _engine.step() }), Math.min(60 - end - start, 0));
}




// VIEWPORT

var Viewport = function(canvasElement, width, height, x, y)
{
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

	this.canvasElement = canvasElement;

	if (canvasElement === undefined)
	{
		this.canvasElement = document.createElement("canvas");
		document.body.appendChild(this.canvasElement);
	}

	this.resetElement();

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
	this.dead = false;
	this.zIndex = 0;
	this.id = id;
	this.collisionGroup = collisionGroup;
	if(this.collisionGroup == undefined)
	{
		this.collisionGroup = 0;
	}

	this.fixture = fixture;
	if (this.fixture == undefined)
	{
		var fixture = new b2FixtureDef();
		fixture.set_density(10)
		fixture.set_friction(5);
		fixture.set_restitution(0.2);

		this.fixture = fixture;
	}
	this.fixture.set_shape(shape);
	var fd = this.fixture.get_filter();
	fd.set_categoryBits(1 << collisionGroup);
	this.fixture.set_filter(fd);
	this.body = body;

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

Entity.prototype.setCollisionGroup = function(group)
{
	this.collisionGroup = group;

	var fd = this.fixture.GetFilterData();
	fd.set_categoryBits(1 << group);
	this.fixture.SetFilterData(fd);

	_engine.updateCollision(this);

	return this;
}

Entity.prototype.setLinearVelocity = function(vector)
{
	this.body.SetLinearVelocity(vector);

	return this;
}
