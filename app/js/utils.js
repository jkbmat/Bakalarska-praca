// Object containing useful methods

var $ = require("jquery");

var Utils = {
  getBrowserWidth: function () {
    return $(".ui.content").outerWidth();
  },

  getBrowserHeight: function () {
    return $(".ui.content").outerHeight();
  },

  randomRange: function (min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
  },

  generateUUID: function () {
    var d = new Date().getTime();

    if (window.performance && typeof window.performance.now === "function") {
      d += performance.now(); //use high-precision timer if available
    }

    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid;
  }

};

Array.prototype.equalTo = function (b) {
  if (this.length != b.length)
    return false;

  for (var i = 0; i < b.length; i++) {
    if (this[i].equalTo) {
      if (!this[i].equalTo(b[i]))
        return false;
    }

    else if (this[i] !== b[i])
      return false;
  }

  return true;
};

Array.prototype.equalIndexOf = function (needle) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === needle)
      return i;

    if (Array.isArray(needle) && Array.isArray(this[i]) && this[i].equalTo(needle))
      return i;
  }

  return -1;
};

module.exports = Utils;