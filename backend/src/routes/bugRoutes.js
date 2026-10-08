const express = require('express');
const router = express.Router();
const {
  getBugs,
  getBug,
  createBug,
  updateBug,
  deleteBug,
} = require('../controllers/bugController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  createBugValidator,
  updateBugValidator,
} = require('../validators/bugValidators');

router.use(protect);

router
  .route('/')
  .get(getBugs)
  .post(createBugValidator, validate, createBug);

router
  .route('/:id')
  .get(getBug)
  .put(updateBugValidator, validate, updateBug)
  .delete(authorize('admin', 'project_manager'), deleteBug);

module.exports = router;
