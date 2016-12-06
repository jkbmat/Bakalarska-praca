var UpdateEvent = {
  fire: function(type, data) {
    data.action = type;
    var event = new CustomEvent("update", {detail: data});
    document.dispatchEvent(event);

    return event;
  },

  RESIZE: "resize",
  ROTATE: "rotate",
  ROTATION_LOCKED: "rotation_locked",
  REPOSITION: "reposition",
  ID_CHANGE: "id_change",
  COL_GROUP_CHANGE: "col_group_change",
  LAYER_CHANGE: "layer_change",
};

module.exports = UpdateEvent;