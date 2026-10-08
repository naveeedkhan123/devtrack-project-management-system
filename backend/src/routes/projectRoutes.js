const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  createProjectValidator,
  updateProjectValidator,
} = require('../validators/projectValidators');

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorize('admin', 'project_manager'), createProjectValidator, validate, createProject);

router
  .route('/:id')
  .get(getProject)
  .put(authorize('admin', 'project_manager'), updateProjectValidator, validate, updateProject)
  .delete(authorize('admin'), deleteProject);

router
  .route('/:id/members')
  .post(authorize('admin', 'project_manager'), addMember);

router
  .route('/:id/members/:userId')
  .delete(authorize('admin', 'project_manager'), removeMember);

module.exports = router;
