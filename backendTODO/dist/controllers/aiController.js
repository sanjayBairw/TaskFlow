"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const aiService_1 = require("../services/aiService");
const rescheduleService_1 = require("../services/rescheduleService");
class AIController {
    static async processCommand(req, res) {
        try {
            const { prompt, nowIso, timezone, conversationId } = req.body;
            const userId = req.user?.id;
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                res.status(400).json({
                    success: false,
                    message: 'Please provide a non-empty prompt for the AI assistant.',
                });
                return;
            }
            const result = await aiService_1.AIService.processCommand({
                userId,
                prompt,
                nowIso,
                timezone,
                conversationId,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error('[AIController] processCommand error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'An error occurred while processing the AI command.',
            });
        }
    }
    static async parseTask(req, res) {
        try {
            const { prompt, nowIso, timezone } = req.body;
            const userId = req.user?.id;
            if (!prompt) {
                res.status(400).json({
                    success: false,
                    message: 'Prompt is required',
                });
                return;
            }
            const result = await aiService_1.AIService.processCommand({
                userId,
                prompt,
                nowIso,
                timezone,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error('[AIController] parseTask error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to parse task',
            });
        }
    }
    static async rescheduleOverdue(req, res) {
        try {
            const userId = req.user?.id;
            const { mode } = req.body;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const selectedMode = mode || '12 HOURS';
            const result = await rescheduleService_1.RescheduleService.rescheduleOverdueTasks(userId, selectedMode);
            res.status(200).json({
                success: true,
                message: `Successfully rescheduled ${result.rescheduledCount} overdue tasks.`,
                data: result,
            });
        }
        catch (error) {
            console.error('[AIController] rescheduleOverdue error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to reschedule overdue tasks',
            });
        }
    }
}
exports.AIController = AIController;
