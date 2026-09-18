"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIConversation = void 0;
const mongoose_1 = require("mongoose");
const aiMessageSchema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    intent: {
        type: String,
    },
    payload: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });
const aiConversationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        default: 'New AI Assistant Session',
        trim: true,
    },
    messages: [aiMessageSchema],
}, {
    timestamps: true,
});
exports.AIConversation = (0, mongoose_1.model)('AIConversation', aiConversationSchema);
