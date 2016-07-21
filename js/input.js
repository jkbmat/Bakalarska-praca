// INPUT CAPTURING

var Tools = require("./tools.js");

window.Input = {
  tool: Tools.Selection,
  element: null,

  mouse: {
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

    updatePosition: function (event) {
      this.canvasY = event.pageY - Input.element.getBoundingClientRect().top;
      this.canvasX = event.pageX - Input.element.getBoundingClientRect().left;
      this.x = this.canvasX * _engine.viewport.scale + _engine.viewport.x - (_engine.viewport.width * _engine.viewport.scale) / 2;
      this.y = this.canvasY * _engine.viewport.scale + _engine.viewport.y - (_engine.viewport.height * _engine.viewport.scale) / 2;
      this.realX = event.pageX;
      this.realY = event.pageY;
    },

    updateButtonsDown: function (event) {
      console.log([this.x, this.y], _engine.viewport.x, (_engine.viewport.x - _engine.viewport.width / 2));
      if (event.which === 1)
        this.leftDown = true;

      if (event.which === 3)
        this.rightDown = true;

      if (event.target === Input.element) {
        Input.tool.onclick();
      }
    },

    updateButtonsUp: function (event) {
      if (event.target === Input.element)
        Input.tool.onrelease();

      if (event.which === 1) {
        this.leftDown = false;
        this.leftUp = true;
      }

      if (event.which === 3) {
        this.rightDown = false;
        this.rightUp = true;
      }
    },

    cleanUp: function () {
      this.leftUp = false;
      this.rightUp = false;
    }
  },

  keyboard: {
    down: new Set(),
    up: new Set(),

    isDown: function (keyCode) {
      return this.down.has(keyCode)
    },

    isUp: function (keyCode) {
      return this.up.has(keyCode);
    },

    updateButtonsDown: function (event) {
      this.down.add(event.which);

      if(event.which === 32)
        event.preventDefault();
    },

    updateButtonsUp: function (event) {
      this.down.delete(event.which);
      this.up.add(event.which);
    },

    cleanUp: function () {
      this.up.clear();
    }
  },

  initialize: function(element) {
    this.element = element;

    document.onmousemove = function(e) {
      Input.mouse.updatePosition(e);
    };
    document.onmousedown = function(e) {
      Input.mouse.updateButtonsDown(e);
    };
    document.onmouseup = function(e) {
      Input.mouse.updateButtonsUp(e);
    };

    document.onkeydown = function(e) {
      Input.keyboard.updateButtonsDown(e);
    };
    document.onkeyup = function(e) {
      Input.keyboard.updateButtonsUp(e);
    };
    document.onselectstart = function () {
      return false;
    }
  }
};

