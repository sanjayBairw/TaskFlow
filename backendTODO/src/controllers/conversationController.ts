import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AIConversation } from '../models/AIConversation';

export class ConversationController {
  public static async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversations = await AIConversation.find({ userId })
        .select('title createdAt updatedAt messages')
        .sort({ updatedAt: -1 });

      const formatted = conversations.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        messageCount: c.messages.length,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      res.status(200).json({
        success: true,
        data: { conversations: formatted },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch conversations' });
    }
  }

  public static async getConversationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversation = await AIConversation.findOne({ _id: id, userId });
      if (!conversation) {
        res.status(404).json({ success: false, message: 'Conversation session not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: { conversation },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch conversation' });
    }
  }

  public static async deleteConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await AIConversation.deleteOne({ _id: id, userId });
      if (result.deletedCount === 0) {
        res.status(404).json({ success: false, message: 'Conversation session not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to delete conversation' });
    }
  }
}
