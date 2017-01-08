var Engine = require("./engine.js");
var Viewport = require("./viewport.js");
var UI = require("./UI.js");
var Translations = require("./translations.js");

var Saver = require("./saver.js");


UI.initialize();

window._engine = new Engine(new Viewport($("#mainCanvas")[0]), new b2Vec2(0, 10));


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
  try {
    Saver.loadCurrent();
  }
  catch (Error) {

  }
}

UI.buildSidebarWorld();

window.requestAnimationFrame(function () {
  _engine.step();
});