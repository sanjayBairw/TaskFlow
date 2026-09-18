import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { AIController } from '../controllers/aiController';
import { ConversationController } from '../controllers/conversationController';

const router = Router();

// Protect all AI routes with JWT Authentication & Rate Limiting
router.use(authenticateToken);

// AI Command & Task Routes (Rate Limited)
router.post('/command', aiRateLimiter, AIController.processCommand);
router.post('/parse-task', aiRateLimiter, AIController.parseTask);
router.post('/reschedule-overdue', aiRateLimiter, AIController.rescheduleOverdue);

// AI Conversation Session History Routes
router.get('/conversations', ConversationController.getConversations);
router.get('/conversations/:id', ConversationController.getConversationById);
router.delete('/conversations/:id', ConversationController.deleteConversation);

export default router;
