"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
// Protect all task endpoints with authentication middleware
router.use(authMiddleware_1.authenticateToken);
router.post('/', taskController_1.createTask);
router.get('/', taskController_1.getTasks);
router.get('/:id', taskController_1.getTaskById);
router.put('/:id', taskController_1.updateTask);
router.delete('/:id', taskController_1.deleteTask);
router.patch('/:id/status', taskController_1.updateTaskStatus);
exports.default = router;
