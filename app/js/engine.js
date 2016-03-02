const AUTO_ID_PREFIX = "ENTITY_NUMBER_";

/*/ Myslienky

lockovanie kamery na objekt
 * prechody
ako funguje cela kamera?

PREMENIT RESIZE A PODOBNE DO VIEWPORTU
/*/



// ENGINE

// constructor
var Engine = function(viewport, gravity)
{
	this.viewport = viewport;
	this.entities = [];

	this.lifetimeEntities = 0;

	this.world = new b2World(gravity, true);

}

Engine.prototype.addEntity = function(entity)
{
	if (entity.id == undefined)
	{
		entity.id = AUTO_ID_PREFIX + this.lifetimeEntities;
	}

	this.lifetimeEntities ++;

	entity.body = this.world.CreateBody(entity.body);
	entity.fixture = entity.body.CreateFixture(entity.fixture);
	this.entities.push(entity);

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
		ctx.translate(this.viewport.x - this.viewport.width / 2, this.viewport.y - this.viewport.height / 2)

		this.entities[i].draw(ctx);

		ctx.restore();
	}

	this.world.Step(1/60, 3, 2)


	if (_keyboard.isDown(40)) {
		this.viewport.y --;
	}if (_keyboard.isDown(39)) {
		this.viewport.x ++;
	}if (_keyboard.isDown(38)) {
		this.viewport.y ++;
	}if (_keyboard.isDown(37)) {
		this.viewport.x --;
	}
	//this.world.ClearForces();

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

var Entity = function(shape, fixture, body, id, type)
{
	this.dead = false;
	this.zIndex = 0;
	this.id = id;
	this.type = type;

	this.fixture = fixture;
	if (this.fixture == undefined)
	{
		var fixture = new b2FixtureDef();
		fixture.set_density(30)
		fixture.set_friction(5);
		fixture.set_restitution(0.2);

		this.fixture = fixture;
	}
	this.fixture.set_shape(shape);
	this.body = body;

}

Entity.prototype.die = function()
{
	this.dead = true;
}

Entity.prototype.draw = function()
{
	alert("Cannot draw Entity: Use derived classes.");
}
