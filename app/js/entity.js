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