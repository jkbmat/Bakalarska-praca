var Constants = require("./constants");
var UpdateEvent = require("./updateEvent");
var _ = require("lodash");

var JointManager = function (engine) {
  this.engine = engine;
  this.lifetimeJoints = 0;
  this.joints = [];
};

JointManager.prototype.addJoint = function (joint, silent) {
  joint.id = joint.id == undefined ? Constants.AUTO_ID_PREFIX_JOINT + this.lifetimeJoints++ : joint.id;
  joint.jointObject = this.engine.world.CreateJoint(joint.getDefinition());
  this.joints.push(joint);

  if (!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_ADD);
};

JointManager.prototype.removeJoint = function (joint, silent) {
  this.engine.world.DestroyJoint(joint.jointObject);
  this.joints.splice(this.joints.indexOf(joint), 1);

  if (!silent)
    UpdateEvent.fire(UpdateEvent.JOINT_REMOVE);
};

JointManager.prototype.getJointsByEntity = function (entity) {
  return _.filter(this.joints, function (joint) {
    return joint.entityA === entity || joint.entityB === entity;
  });
};

module.exports = JointManager;