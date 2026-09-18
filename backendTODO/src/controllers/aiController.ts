import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AIService } from '../services/aiService';
import { RescheduleService, RescheduleMode } from '../services/rescheduleService';

export class AIController {
  public static async processCommand(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const result = await AIService.processCommand({
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
    } catch (error: any) {
      console.error('[AIController] processCommand error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while processing the AI command.',
      });
    }
  }

  public static async parseTask(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const result = await AIService.processCommand({
        userId,
        prompt,
        nowIso,
        timezone,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('[AIController] parseTask error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to parse task',
      });
    }
  }

  public static async rescheduleOverdue(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { mode } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const selectedMode: RescheduleMode = mode || '12 HOURS';
      const result = await RescheduleService.rescheduleOverdueTasks(userId, selectedMode);

      res.status(200).json({
        success: true,
        message: `Successfully rescheduled ${result.rescheduledCount} overdue tasks.`,
        data: result,
      });
    } catch (error: any) {
      console.error('[AIController] rescheduleOverdue error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to reschedule overdue tasks',
      });
    }
  }
}
