module.exports = {
  LANGUAGE_NAME: "English",
  LANGUAGE_TOOLTIP: "Changes the language",
  COLLISION_GROUPS: "Collision groups",
  COLLISION_GROUPS_TOOLTIP: "Sets which entity groups should collide with each other",
  START: "Start",
  STOP: "Stop",
  START_TOOLTIP: "Starts the simulation",
  STOP_TOOLTIP: "Stops the simulation",
  CLEAR_WORLD_TOOLTIP: "Removes all entities from the scene",
  SAVE: "Save",
  LOAD: "Load",
  SAVE_TOOLTIP: "Saves the scene and provides a sharing code",
  LOAD_TOOLTIP: "Loads a scene from the computer or a sharing code",
  UNDO: "Undo",
  REDO: "Redo",
  LAYER: "Layer ",
  ZOOM: "Zoom: ",

  WORLD: "World",

  TOOL: "Tool: ",
  SHAPE: {
    RECTANGLE: "Rectangle",
    CIRCLE: "Circle",
  },

  CREATE_JOINT: "Joint:",
  JOINT: {
    NEW: "New ",
    REMOVE: "Remove",
    REVOLUTE: "Revolute joint",
    ROPE: "Rope joint",
    WELD: "Weld joint"
  },
  REVOLUTE_TOOLTIP: "Revolute joint<br><br>Connected entities rotate around a common point",
  ROPE_TOOLTIP: "Rope joint<br><br>Constrains maximal distance between two entities",
  WELD_TOOLTIP: "Weld joint<br><br>Connected entities maintain constant distance and angle to each other.",

  RECTANGLE_TOOL: "Rectangle tool",
  CIRCLE_TOOL: "Circle tool",
  SELECTION_TOOL: "Selection tool",

  NO_ENTITY_WITH_ID: "No entity exists with this ID.",

  SAVEUI: {
    TITLE: "Scene saving",
    SAVE_BUTTON: "Save",
    NAME: "Name of the scene: ",
    SHARE_CODE: "Sharing code: ",
    GENERATE: "Generate",
    SAVE_LOCAL: "Save to this computer",
    SAVE_REMOTE: "Save to the internet",
    SHARE_LINK: "Sharing link: ",
  },

  LOADUI: {
    TITLE: "Scene loading",
    LOAD_BUTTON: "Load",
    REMOVE_BUTTON: "Remove",
    SHARE_CODE: "Sharing code: ",
    INVALID_CODE: "This sharing code doesn't exist.",
    CONFIRM_DELETE: "Are you sure you want to delete the saved state ",
    LOAD_LOCAL: "Load from this computer",
    LOAD_REMOTE: "Load from the internet",
    NO_LOCAL: "There are no scenes saved to this computer",
  },

  BEHAVIORS: {
    TITLE: "Behavior editor",
    CONDITION: "When the following conditon is met:",
    INPUT_DIALOG: "Insert a correct value for ",
    ACTION: "Do this:",
    ANOTHER_ACTION: "And this:",
    NEW_ACTION: "Add new action",
    NEW_BEHAVIOR: "Add new behavior",
    REMOVE_ACTION: "Remove action",
    REMOVE_BEHAVIOR: "Remove behavior",
    DONE_BUTTON: "Done",
    CANCEL_BUTTON: "Cancel",
  },

  SIDEBAR: {
    ID: "ID:",
    COLLISION_GROUP: "Collision group:",
    X: "X-axis position:",
    Y: "Y-axis position:",
    WIDTH: "Width:",
    HEIGHT: "Height:",
    ROTATION: "Rotation:",
    FIXED_ROTATION: "Fixed rotation:",
    RESTITUTION: "Restitution:",
    FRICTION: "Friction:",
    DENSITY: "Density:",
    COLOR: "Color:",
    LAYER: "Layer:",
    DELETE_BUTTON: "Delete entity",
    DELETE_CONFIRM: "Are you sure you want to delete this entity?",
    SET_BEHAVIORS: "Set behavior",

    BODY_TYPE: "Body type:",
    BODY_TYPES: {
      DYNAMIC: "Dynamic",
      STATIC: "Static",
      KINEMATIC: "Kinematic",
    },

    GRAVITY_X: "X-axis gravity strength:",
    GRAVITY_Y: "Y-axis gravity strength:",

    CAMERA_STYLE: "Camera style:",
    CAMERA_STYLES: {
      FIXED: "Locked on point",
      ENTITY: "Locked on entity",
    },
    CAMERA_X: "X-axis camera position",
    CAMERA_Y: "Y-axis camera position",
    CAMERA_ENTITY: "Entity ID for camera lock:",

    ADD: "Create",
    COLLIDE_CONNECTED: "Connected entities should collide:",
    MAX_LENGTH: "Maximum rope length: ",
    ENTITY_A: "ID of entity A:",
    ENTITY_B: "ID of entity B:",
    X_A: "X-axis position relative to entity A:",
    Y_A: "Y-axis position relative to entity A:",
    X_B: "X-axis position relative to entity B:",
    Y_B: "Y-axis position relative to entity B:",

  }
};