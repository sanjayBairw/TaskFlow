"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const aiController_1 = require("../controllers/aiController");
const conversationController_1 = require("../controllers/conversationController");
const router = (0, express_1.Router)();
// Protect all AI routes with JWT Authentication & Rate Limiting
router.use(authMiddleware_1.authenticateToken);
// AI Command & Task Routes (Rate Limited)
router.post('/command', rateLimiter_1.aiRateLimiter, aiController_1.AIController.processCommand);
router.post('/parse-task', rateLimiter_1.aiRateLimiter, aiController_1.AIController.parseTask);
router.post('/reschedule-overdue', rateLimiter_1.aiRateLimiter, aiController_1.AIController.rescheduleOverdue);
// AI Conversation Session History Routes
router.get('/conversations', conversationController_1.ConversationController.getConversations);
router.get('/conversations/:id', conversationController_1.ConversationController.getConversationById);
router.delete('/conversations/:id', conversationController_1.ConversationController.deleteConversation);
exports.default = router;
