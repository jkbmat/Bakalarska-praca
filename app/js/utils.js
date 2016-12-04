// Object containing useful methods
var Utils = {
  getBrowserWidth: function() {
    return $(".ui.content").outerWidth();
  },

  getBrowserHeight: function() {
    return $(".ui.content").outerHeight() - $(".ui.toolbar").outerHeight();
  },

  randomRange: function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },

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