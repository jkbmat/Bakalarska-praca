require(path.app("input"));

var Engine = require(path.app("engine"));
var Viewport = require(path.app("viewport"));

_engine = new Engine(new Viewport(document.createElement("canvas")), new b2Vec2(0, 10));