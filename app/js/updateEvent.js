var $ = require("jquery");

var UpdateEvent = {
  fire: function(type, data) {
    data = $.extend({}, data);
    data.action = type;
    var event = new CustomEvent("update", {detail: data});
    document.dispatchEvent(event);
console.log(type, data.noState == undefined ? true : null)
    return event;
  },

  TOOL_CHANGE: "tool_change",
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
  BULLET_CHANGE: "bullet_change",
  ENTITY_ADD: "entity_add",
  ENTITY_DELETE: "entity_delete",
  STATE_CHANGE: "state_change",
  WORLD_CLEARED: "world_cleared",
  GRAVITY_CHANGE: "gravity_change",
  CAMERA_STYLE_CHANGE: "camera_style_change",
  CAMERA_MOVE: "camera_move",
  CAMERA_ENTITY_CHANGE: "camera_entity_change",
  SELECTION_CHANGE: "selection_change",
  JOINT_ADD: "joint_add",
  JOINT_REMOVE: "joint_remove",
  ENTITY_PICKED: "entity_picked",
  JOINT_REPOSITION: "joint_reposition",
  JOINT_ENTITY_CHANGE: "joint_entity_change",
  JOINT_PROPERTY_CHANGE: "joint_property_change",
};

module.exports = UpdateEvent;
