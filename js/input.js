// INPUT CAPTURING

var _mouse = {
  x: 0,
  y: 0,
  leftDown: false,
  rightDown: false,
  leftUp: false,
  rightUp: false,
  dragOrigin: [0, 0],

  updatePosition: function(event) {
    this.x = event.pageX;
    this.y = event.pageY;
  },

  updateButtonsDown: function(event) {
    if (event.target != _engine.viewport.canvasElement)
      return true;

    if (event.which === 1) {
      this.leftDown = true;
      this.dragOrigin = [this.x, this.y];
    }

    if (event.which === 3)
      this.rightDown = true;
  },

  updateButtonsUp: function(event) {
    if (event.target != _engine.viewport.canvasElement)
      return true;

    if (event.which === 1) {
      this.leftDown = false;
      this.leftUp = true;
    }

    if (event.which === 3) {
      this.rightDown = false;
      this.rightUp = true;
    }
  },

  cleanUp: function() {
    this.leftUp = false;
    this.rightUp = false;
  }
}

var _keyboard = {
  down: new Set(),
  up: new Set(),

  isDown: function(keyCode) {
    return this.down.has(keyCode)
  },

  isUp: function(keyCode) {
    return this.up.has(keyCode);
  },

  updateButtonsDown: function(event) {
    this.down.add(event.which);
  },

  updateButtonsUp: function(event) {
    this.down.delete(event.which);
    this.up.add(event.which);
  },

  cleanUp: function() {
    this.up.clear();
  }
}


document.onmousemove = function(e) {
  _mouse.updatePosition(e)
};
document.onmousedown = function(e) {
  _mouse.updateButtonsDown(e)
};
document.onmouseup = function(e) {
  _mouse.updateButtonsUp(e)
};

document.onkeydown = function(e) {
  _keyboard.updateButtonsDown(e)
};
document.onkeyup = function(e) {
  _keyboard.updateButtonsUp(e)
};