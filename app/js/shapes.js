var Entity = require("./entity.js");

// Circle entity
var Circle = function(center, radius, fixture, id, collisionGroup) {
  var shape = new b2CircleShape();
  shape.set_m_radius(radius);

  var body = new b2BodyDef();
  body.set_position(center);

  Entity.call(this, shape, fixture, body, id, collisionGroup);

  this.radius = radius;

  this.nameString = 19;

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

  this.nameString = 18;

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