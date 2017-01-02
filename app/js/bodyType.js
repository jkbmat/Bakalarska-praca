var BodyType = {
  DYNAMIC_BODY: typeof b2_dynamicBody === "undefined" ? Module.b2_dynamicBody : b2_dynamicBody,
  STATIC_BODY: typeof b2_staticBody === "undefined" ? Module.b2_staticBody : b2_staticBody,
  KINEMATIC_BODY: typeof b2_kinematicBody === "undefined" ? Module.b2_kinematicBody : b2_kinematicBody
};

module.exports = BodyType;