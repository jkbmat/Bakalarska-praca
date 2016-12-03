var Constants = require("./constants.js");


var ClickableHelper = function (entity, width, height, position, image, move, click, release) {
  this.width = width;
  this.height = height;
  this.image = new Image();
  this.image.src = image;
  this.position = position;
  this.entity = entity;

  this.collisionGroup = Constants.COLLISION_GROUPS_NUMBER - 1;

  this.recalculatePosition();

  if (move == undefined) {
    move = function(){};
  }

  if (click == undefined) {
    click = function(){};
  }

  if (release == undefined) {
    release = function(){};
  }

  this.move = move.bind(this);
  this.click = function() {
    click.apply(this, arguments);
    $(document).one('mouseup', this.release);
    $(_engine.viewport.canvasElement).on('mousemove', this.move);
  };

  this.release = function () {
    release.apply(this, arguments);
    $(_engine.viewport.canvasElement).off('mousemove', this.move);
  };

  return this;
};

ClickableHelper.prototype.recalculatePosition = function () {
  var w = this.entity.getWidth();
  var h = this.entity.getHeight();

  this.x = (w / 2) * this.position[0];
  this.y = (h / 2) * this.position[1];

  if(this.fixture)
    this.entity.body.DestroyFixture(this.fixture);

  this.shape = new b2PolygonShape();
  this.shape.SetAsBox(
    _engine.viewport.toScale(this.width / 2),
    _engine.viewport.toScale(this.height / 2),
    new b2Vec2(this.x, this.y),
    0
  );

  this.fixture = new b2FixtureDef();
  this.fixture.set_shape(this.shape);

  var filterData = this.fixture.get_filter();
  filterData.set_categoryBits(1 << this.collisionGroup);
  filterData.set_maskBits(_engine.collisionGroups[this.collisionGroup].mask);
  this.fixture.set_filter(filterData);

  this.fixture = this.entity.body.CreateFixture(this.fixture);

};

ClickableHelper.prototype.testPoint = function (x, y) {
  return this.fixture.TestPoint(new b2Vec2(x, y));
};

ClickableHelper.prototype.draw = function (ctx) {
  ctx.drawImage(
    this.image,
    -this.width / 2,
    -this.height / 2,
    this.width,
    this.height
  );
};


module.exports = ClickableHelper;