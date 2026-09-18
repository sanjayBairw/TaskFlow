import { Schema, model, Document, Types } from 'mongoose';

export interface IAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  payload?: any;
  createdAt: Date;
}

export interface IAIConversation extends Document {
  userId: Types.ObjectId;
  title: string;
  messages: IAIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const aiMessageSchema = new Schema<IAIMessage>(
  {
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
      type: Schema.Types.Mixed,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const aiConversationSchema = new Schema<IAIConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

export const AIConversation = model<IAIConversation>('AIConversation', aiConversationSchema);
