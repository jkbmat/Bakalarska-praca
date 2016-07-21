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




