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


_engine.addEntity(new Circle(new b2Vec2(0, 0), 2), BodyType.DYNAMIC_BODY)
  .setCollisionGroup(2)
  .setId("kruh")
  .disableRotation(false)
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("(( getVelocityX( filterById( text( \"kruh\" ) ) ) ) > (number( \"-10\" ))) AND (isButtonDown( number( 37 ) ) )"),
      _engine.tokenManager.parser.parse("applyLinearImpulse( filterById( text( \"kruh\" ) ), number( -1 ), number( 0 ) )")
    )
  )
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("((getVelocityY( filterById( text( \"kruh\" ) ) )) > (number( -15 ))) AND (isButtonDown( number( 38 ) ))"),
      _engine.tokenManager.parser.parse("applyLinearImpulse( filterById( text( \"kruh\" ) ), number( 0 ), number( -2 ) )")
    )
  )
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("((getVelocityX( filterById( text( \"kruh\" ) ) )) < (number( 10 ))) AND (isButtonDown( number( 39 ) ))"),
      _engine.tokenManager.parser.parse("applyLinearImpulse( filterById( text( \"kruh\" ) ), number( 1 ), number( 0 ) )")
    )
  );

_engine.addEntity(new Rectangle(new b2Vec2(0, 15), new b2Vec2(20, 0.2)), BodyType.KINEMATIC_BODY)
  .setId("platform")
  .setCollisionGroup(1);

window.requestAnimationFrame(function() {
  _engine.step();
});