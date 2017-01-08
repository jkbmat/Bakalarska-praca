require('jsdom-global')();
GLOBAL.path = require("./utils").path;
GLOBAL._ = require("lodash");
GLOBAL.$ = require("jquery");
_.merge(GLOBAL, require(path.lib("Box2D_v2.3.1_debug")));

var Engine = require(path.app("engine"));
var Viewport = require(path.app("viewport"));

GLOBAL._engine = new Engine(new Viewport(document.createElement("canvas")), new b2Vec2(0, 10));
