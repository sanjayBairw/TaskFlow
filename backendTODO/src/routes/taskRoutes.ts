import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from '../controllers/taskController';

const router = Router();

// Protect all task endpoints with authentication middleware
router.use(authenticateToken);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateTaskStatus);

export default router;
