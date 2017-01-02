GLOBAL.path = require("./utils").path;
GLOBAL._ = require("lodash");
GLOBAL.$ = require("jquery");
_.merge(GLOBAL, require(path.lib("Box2D_v2.3.1_debug")));