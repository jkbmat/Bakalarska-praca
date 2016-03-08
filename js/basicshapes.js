var Rectangle = function(center, extents, fixture, id, collisionGroup)
{
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

Rectangle.prototype.draw = function(ctx)
{
	var x = this.body.GetPosition().get_x();
	var y = this.body.GetPosition().get_y();
	var halfWidth = this.extents.get_x();
	var halfHeight = this.extents.get_y();

	ctx.translate(x, y);
	ctx.rotate(this.body.GetAngle());
	ctx.translate(-x, -y);
	ctx.fillRect((x - halfWidth),
							(y - halfHeight),
							(halfWidth * 2),
							(halfHeight * 2));
}

var Circle = function(center, radius, fixture, id, collisionGroup)
{
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

Circle.prototype.draw = function(ctx)
{
	var x = this.body.GetPosition().get_x();
	var y = this.body.GetPosition().get_y();

	ctx.beginPath();

	ctx.arc(x, y, this.radius, 0, 2 * Math.PI, false);

	ctx.fill();
}
