var Engine = require("./engine.js");
var Viewport = require("./viewport.js");
var UI = require("./UI.js");
var Translations = require("./translations.js");
var $ = require("jquery");

var Saver = require("./saver.js");


UI.initialize();

window._engine = new Engine(new Viewport($("#mainCanvas")[0]), new b2Vec2(0, 10));

/*
var BodyType = require("./bodyType.js");
var Behavior = require("./behavior.js");
var Firebase = require("./firebase.js");

var Circle = require("./shapes.js").Circle;
var Rectangle = require("./shapes.js").Rectangle;*/
/*_engine.entityManager.addEntity(new Circle(new b2Vec2(0, 0), 0.5), BodyType.DYNAMIC_BODY)
 // _engine.entityManager.addEntity(new Rectangle(new b2Vec2(0, 0), new b2Vec2(0.5, 0.5)), BodyType.DYNAMIC_BODY)
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
 );
 _engine.entityManager.addEntity(new Rectangle(new b2Vec2(0, 3), new b2Vec2(2, 0.25)), BodyType.KINEMATIC_BODY)
 .setId("platform")
 .setCollisionGroup(1);*/

if (window.location.hash !== "") {
  $(document.body).addClass("loading");
  Saver.loadRemote(window.location.hash.substr(1)).then(function (result) {
    $(document.body).removeClass("loading");

    if (!result) {
      alert(Translations.getTranslated("LOADUI.INVALID_CODE"));
      Saver.loadCurrent();
    }
  });
}
else {
  Saver.loadCurrent();
}

UI.buildSidebarWorld();

window.requestAnimationFrame(function () {
  _engine.step();
});