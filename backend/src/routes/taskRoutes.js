const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
} = require('../validators/taskValidators');

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(authorize('admin', 'project_manager'), createTaskValidator, validate, createTask);

router
  .route('/:id')
  .get(getTask)
  .put(updateTaskValidator, validate, updateTask)
  .delete(authorize('admin', 'project_manager'), deleteTask);

router
  .route('/:id/status')
  .patch(updateTaskStatusValidator, validate, updateTaskStatus);

module.exports = router;
