"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const task_controller_1 = require("../controllers/task.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/', task_controller_1.createTask);
router.get('/my-tasks', task_controller_1.getMyTasks); // Must be before /:id to avoid conflict
router.get('/project/:projectId', task_controller_1.getTasks);
router.get('/:id', task_controller_1.getTask);
router.put('/:id', task_controller_1.updateTask);
router.delete('/:id', task_controller_1.deleteTask);
exports.default = router;
