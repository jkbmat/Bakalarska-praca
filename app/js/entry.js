require("./translations.js");
require("./input.js");

var Engine = require("./engine.js");
var Viewport = require("./viewport.js");
var UI = require("./UI.js");

var Saver = require("./saver.js");

var BodyType = require("./bodyType.js");
var Behavior = require("./behavior.js");
var Firebase = require("./firebase.js");

var Circle = require("./shapes.js").Circle;
var Rectangle = require("./shapes.js").Rectangle;

UI.initialize();

window._engine = new Engine(new Viewport($("#mainCanvas")[0]), new b2Vec2(0, 10));


/*_engine.addEntity(new Circle(new b2Vec2(0, 0), 0.5), BodyType.DYNAMIC_BODY)
// _engine.addEntity(new Rectangle(new b2Vec2(0, 0), new b2Vec2(0.5, 0.5)), BodyType.DYNAMIC_BODY)
  .setCollisionGroup(2)
  .setId("kruh")
  .disableRotation(false)
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("(( getVelocityX( filterById( text( \"kruh\" ) ) ) ) > (number( \"-3\" ))) AND (isButtonDown( number( 37 ) ) )"),
      _engine.tokenManager.parser.parse("applyLinearImpulse( filterById( text( \"kruh\" ) ), number( -0.3 ), number( 0 ) )")
    )
  )
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("((getVelocityY( filterById( text( \"kruh\" ) ) )) > (number( -5 ))) AND (isButtonDown( number( 38 ) ))"),
      _engine.tokenManager.parser.parse("applyLinearImpulse( filterById( text( \"kruh\" ) ), number( 0 ), number( -0.5 ) )")
    )
  )
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("((getVelocityX( filterById( text( \"kruh\" ) ) )) < (number( 3 ))) AND (isButtonDown( number( 39 ) ))"),
      _engine.tokenManager.parser.parse("applyLinearImpulse( filterById( text( \"kruh\" ) ), number( 0.3 ), number( 0 ) )")
    )
  )
  .addBehavior(
    new Behavior(
      _engine.tokenManager.parser.parse("true()"),
      _engine.tokenManager.parser.parse("centerCameraOn( filterById( text( \"kruh\") ) )")
    )
  );

_engine.addEntity(new Rectangle(new b2Vec2(0, 3), new b2Vec2(2, 0.25)), BodyType.KINEMATIC_BODY)
  .setId("platform")
  .setCollisionGroup(1);
*/

Saver.loadCurrent();

window.requestAnimationFrame(function () {
  _engine.step();
});