const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const {
  createTaskSchema,
  updateTaskSchema,
  getTasksSchema,
  getTaskSchema,
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// All task routes require authentication
router.use(authenticate);

router.post('/', validate(createTaskSchema), createTask);
router.get('/', validate(getTasksSchema), getTasks);
router.get('/:id', validate(getTaskSchema), getTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', validate(getTaskSchema), deleteTask);

module.exports = router;
