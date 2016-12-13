var Utils = require("./utils.js");
var Firebase = require("./firebase.js");
var UpdateEvent = require("./updateEvent.js");
var LSManager = require("./LSManager.js");

var Saver = {
  saveCurrent: function () {
    if (typeof(_engine) === "undefined")
      return;

    LSManager.set("data", JSON.stringify(_engine.stateManager.getCurrentState()), "currentState");
  },

  saveRemote: function () {
    var id = Utils.generateUUID();
    var data = JSON.stringify(_engine.stateManager.getCurrentState());

    return Firebase.ref('saved/' + id).set({
      data: data,
      created: Date.now(),
      accessed: Date.now()
    }).then(function () {
      return id;
    });
  },

  saveLocal: function (name) {
    name = (name == undefined || name === "") ? Utils.generateUUID() : name;

    var w = 150;
    var h = 100;
    var img = new Image();
    img.src = _engine.viewport.canvasElement.toDataURL();
    img.onload = function () {
      var canvas = el("canvas", {width: w, height: h});
      var ctx = canvas.getContext("2d");

      var sh = img.width * (h / w);
      var sy = (img.height - sh) / 2;

      ctx.drawImage(img, 0, sy, img.width, sh, 0, 0, w, h);

      LSManager.set(name, canvas.toDataURL(), "savedScreenshots");
    };

    LSManager.set(name, JSON.stringify(_engine.stateManager.getCurrentState()));
  },

  loadCurrent: function () {
    var data = LSManager.get("data", "currentState");

    if(data) {
      this.load(data);
    }
    else {
      _engine.stateManager.addState();
    }
  },

  loadRemote: function (id) {
    return Firebase.ref('/saved/' + id).once('value').then(function(snapshot) {
      var success = id !== "" && snapshot.val() !== null;

      if (success) {
        this.load(snapshot.val().data);

        Firebase.ref('saved/' + id).update({
          accessed: Date.now()
        });
      }

      return success;
    }.bind(this));
  },

  loadLocal: function (name) {
    this.load(LSManager.get(name));
  },

  getLocalSaves: function () {
    return LSManager.getObj();
  },

  getLocalSaveScreenshot: function (name) {
    return LSManager.get(name, "savedScreenshots");
  },

  load: function (data) {
    data = typeof(data) === "string" ? JSON.parse(data) : data;

    _engine.stateManager.addState(data);
    _engine.stateManager.buildState(_engine.stateManager.getCurrentState());
  },

  removeLocal: function (name) {
    LSManager.remove(name);
    LSManager.remove(name, "savedScreenshots");
  }
};

$(document).on("update", (function (e) {
  if(e.detail.action === UpdateEvent.STATE_CHANGE)
    Saver.saveCurrent();
}));

module.exports = Saver;