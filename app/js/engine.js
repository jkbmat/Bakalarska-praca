const AUTO_ID_PREFIX = "AUTO_ID_";

/*/ Myslienky

Viewport
--------------
Objekt, ktory udrziava kameru a obrazovku

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

Engine.prototype.step = function(timestamp)
{
	ctx = this.viewport.context;

	ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
	

	for (var i = this.entities.length - 1; i >= 0; i--)
	{
		ctx.save();

		var shape = this.entities[i].fixture.GetShape();
		var center = this.entities[i].body.GetPosition();

		if(shape.get_m_type() === 0) // Circle
		{
			ctx.beginPath();

			ctx.arc(center.get_x(), center.get_y(), shape.get_m_radius(), 0, 2 * Math.PI, false);
			ctx.fillStyle = "red";

			ctx.fill();
		}

		if(shape.get_m_type() === 2) // Polygon
		{
			this.entities[i].draw(ctx);

		}


		//console.log(this.entities[i])
		ctx.restore();
	}

	this.world.Step(1/60, 3, 2)

	//this.world.ClearForces();

	_mouse.cleanUp();
	_keyboard.cleanUp();

	window.requestAnimationFrame(function(){_engine.step()});

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
		this.x = Math.floor(this.width / 2)
		this.y = Math.floor(this.height / 2)
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

var Entity = function(fixture, body, id, type)
{
	this.dead = false;
	this.zIndex = 0;
	this.id = id;
	this.type = type;

	this.fixture = fixture;
	this.body = body;

}

Entity.prototype.die = function()
{
	this.dead = true;
}


var Rectangle = function(center, extents, fixture, body, id, type)
{
	Entity.call(this, fixture, body, id, type);
	this.extents = extents;
}
Rectangle.prototype = new Entity();
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.draw = function(ctx)
{
	var x = this.body.GetPosition().get_x();
	var y = this.body.GetPosition().get_y();
	var halfWidth = this.extents.get_x();
	var halfHeight = this.extents.get_y();
	ctx.translate(x, y);
	ctx.rotate(this.body.GetAngle());
	ctx.translate(-(x), -(y));
	ctx.fillStyle = 'blue';
	ctx.fillRect((x-halfWidth),
				(y-halfHeight),
				(halfWidth*2),
				(halfHeight*2));
}