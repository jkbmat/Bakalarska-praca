var Utils = require("./utils.js");
var Constants = require("./constants.js");
var CameraStyle = require("./cameraStyle.js");
var UpdateEvent = require("./updateEvent.js");

// VIEWPORT
// This is basically camera + projector

var Viewport = function (canvasElement, width, height, x, y) {
  this.scale = Constants.DEFAULT_SCALE;
  this.cameraStyle = CameraStyle.FIXED;
  this.cameraEntityId = "";

  // Canvas dimensions
  if (width != undefined && height != undefined) {
    this.setAutoResize(false);
    this.width = width;
    this.height = height;
  } else {
    this.setAutoResize(true);
    this.autoResize();
  }

  // Center point of the camera
  if (x !== undefined && y !== undefined) {
    this.x = x;
    this.y = y;
  } else {
    this.x = 0;
    this.y = 0;
  }

  // Canvas element
  this.canvasElement = canvasElement;

  if (canvasElement === undefined) {
    this.canvasElement = document.createElement("canvas");
    document.body.appendChild(this.canvasElement);
  }

  this.resetElement(); // Resize to new dimensions

  this.context = this.canvasElement.getContext("2d");
};

// Reloads values for the canvas element
Viewport.prototype.resetElement = function () {
  this.canvasElement.width = this.width;
  this.canvasElement.height = this.height;
};

// Automatically resizes the viewport to fill the screen
Viewport.prototype.autoResize = function () {
  this.width = Utils.getBrowserWidth();
  this.height = Utils.getBrowserHeight();
};

// Toggles viewport auto resizing
Viewport.prototype.setAutoResize = function (value) {

  this.autoResizeActive = value;

  if (this.autoResizeActive) {
    var t = this;
    window.onresize = function () {
      t.autoResize();
      t.resetElement();
    };
  } else {
    window.onresize = null;
  }
};

Viewport.prototype.zoom = function (val) {
  var a = 1.5;
  this.scale = (Constants.DEFAULT_SCALE / Math.pow(a, 6)) * Math.pow(a, 12 - val);

  if(_engine.selected.ptr)
    _engine.selected.ptr.recalculateHelpers();
};

Viewport.prototype.getOffset = function () {
  return [this.x - this.width / 2, this.y - this.height / 2];
};

Viewport.prototype.getCameraEntityId = function() {
  return this.cameraEntityId;
};

Viewport.prototype.setCameraEntityId = function(id, silent) {
  this.cameraEntityId = id;

  if (!silent)
    UpdateEvent.fire(UpdateEvent.CAMERA_ENTITY_CHANGE);
};

Viewport.prototype.getCameraStyle = function() {
  if (this.cameraStyle === CameraStyle.ENTITY && !_engine.getEntityById(this.getCameraEntityId())) {
    this.cameraStyle = CameraStyle.FIXED;
    this.cameraEntityId = "";
  }

  return this.cameraStyle;
};

Viewport.prototype.setCameraStyle = function(val, silent) {
  this.cameraStyle = val;

  if (!silent)
    UpdateEvent.fire(UpdateEvent.CAMERA_STYLE_CHANGE);
};

Viewport.prototype.toScale = function (number) {
  return number * this.scale;
};

Viewport.prototype.fromScale = function (number) {
  return number / this.scale;
};

module.exports = Viewport;