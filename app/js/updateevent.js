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
  FRICTION_CHANGE: "friction_change",
  RESTITUTION_CHANGE: "restitution_change",
  DENSITY_CHANGE: "density_change",
  COLOR_CHANGE: "color_change",
  BODY_TYPE_CHANGE: "body_type_change",
  BEHAVIOR_CHANGE: "behavior_change",
  ENTITY_DELETE: "entity_delete",
};

module.exports = UpdateEvent;
