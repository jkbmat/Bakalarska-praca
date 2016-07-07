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
}

module.exports = Utils;