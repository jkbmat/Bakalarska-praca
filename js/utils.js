// Object containing useful methods
var Utils = {
  getBrowserWidth: function() {
    return $("#layout_editorLayout_panel_main .w2ui-panel-content").outerWidth() - 20;//window.innerWidth;
  },

  getBrowserHeight: function() {
    return $("#layout_editorLayout_panel_main .w2ui-panel-content").outerHeight() - 20;//window.innerHeight;
  },

  randomRange: function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },
}

module.exports = Utils;