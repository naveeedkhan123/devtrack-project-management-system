const Project = require('../models/Project');

const getAccessibleProjectIds = async (user) => {
  if (user.role !== 'developer') return null;
  return Project.find({
    $or: [{ members: user._id }, { manager: user._id }],
  }).distinct('_id');
};

const canAccessProject = (project, user) => {
  if (!project) return false;
  if (user.role !== 'developer') return true;
  const userId = user._id.toString();
  return project.manager?.toString() === userId ||
    project.members?.some((member) => member._id
      ? member._id.toString() === userId
      : member.toString() === userId);
};

module.exports = { getAccessibleProjectIds, canAccessProject };
