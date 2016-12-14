// INPUT CAPTURING

var Input = function(viewport) {
  "use strict";

  this.viewport = viewport;

  this.mouse = {
    x: 0,
    y: 0,
    canvasX: 0,
    canvasY: 0,
    realX: 0,
    realY: 0,
    leftDown: false,
    rightDown: false,
    leftUp: false,
    rightUp: false,
  };

  this.keyboard = {
    down: new Set(),
    up: new Set(),

    isDown: function (keyCode) {
      return this.down.has(keyCode);
    },

    isUp: function (keyCode) {
      return this.up.has(keyCode);
    },
  };

  document.addEventListener('mousemove', this.updateMousePosition.bind(this));
  document.addEventListener('mousedown', this.updateMouseButtonsDown.bind(this));
  document.addEventListener('mouseup', this.updateMouseButtonsUp.bind(this));
  document.addEventListener('keydown', this.updateKeyboardButtonsDown.bind(this));
  document.addEventListener('keyup', this.updateKeyboardButtonsUp.bind(this));

  this.viewport.onselectstart = function () {
    return false;
  };

  $(".ui.toolbar").on("selectstart", function () {
    return false;
  });
};

Input.prototype.cleanUp = function () {
  this.mouse.leftUp = false;
  this.mouse.rightUp = false;

  this.keyboard.up.clear();
};

Input.prototype.updateMousePosition = function (event) {
  this.mouse.canvasX = event.pageX - this.viewport.canvasElement.getBoundingClientRect().left;
  this.mouse.canvasY = event.pageY - this.viewport.canvasElement.getBoundingClientRect().top;
  this.mouse.x = this.viewport.toScale(this.mouse.canvasX) + this.viewport.x - this.viewport.toScale(this.viewport.width) / 2;
  this.mouse.y = this.viewport.toScale(this.mouse.canvasY) + this.viewport.y - this.viewport.toScale(this.viewport.height) / 2;
  this.mouse.realX = event.pageX;
  this.mouse.realY = event.pageY;
};

Input.prototype.updateMouseButtonsDown = function (event) {
  if (event.which === 1)
    this.mouse.leftDown = true;

  if (event.which === 3)
    this.mouse.rightDown = true;
};

Input.prototype.updateMouseButtonsUp = function (event) {
  if (event.which === 1) {
    this.mouse.leftDown = false;
    this.mouse.leftUp = true;
  }

  if (event.which === 3) {
    this.mouse.rightDown = false;
    this.mouse.rightUp = true;
  }
};

Input.prototype.updateKeyboardButtonsDown = function (event) {
  this.keyboard.down.add(event.which);

  /*if(event.which === 32)
    event.preventDefault();*/
};

Input.prototype.updateKeyboardButtonsUp = function (event) {
  this.keyboard.down.delete(event.which);
  this.keyboard.up.add(event.which);
};

module.exports = Input;