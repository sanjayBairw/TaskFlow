"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationController = void 0;
const AIConversation_1 = require("../models/AIConversation");
class ConversationController {
    static async getConversations(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const conversations = await AIConversation_1.AIConversation.find({ userId })
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
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to fetch conversations' });
        }
    }
    static async getConversationById(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const conversation = await AIConversation_1.AIConversation.findOne({ _id: id, userId });
            if (!conversation) {
                res.status(404).json({ success: false, message: 'Conversation session not found' });
                return;
            }
            res.status(200).json({
                success: true,
                data: { conversation },
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to fetch conversation' });
        }
    }
    static async deleteConversation(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const result = await AIConversation_1.AIConversation.deleteOne({ _id: id, userId });
            if (result.deletedCount === 0) {
                res.status(404).json({ success: false, message: 'Conversation session not found' });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Conversation deleted successfully',
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to delete conversation' });
        }
    }
}
exports.ConversationController = ConversationController;
