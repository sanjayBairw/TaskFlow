import { Schema, model, Document, Types } from 'mongoose';

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskCategory {
  PERSONAL = 'PERSONAL',
  WORK = 'WORK',
  STUDY = 'STUDY',
  SHOPPING = 'SHOPPING',
  OTHER = 'OTHER',
}

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  dateTime: Date;
  deadline: Date;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  tags: string[];
  aiGenerated?: boolean;
  sourceUrl?: string;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  autoReschedule?: string;
  rescheduleCount?: number;
  originalDateTime?: Date;
  lastRescheduledAt?: Date;
  parentTaskId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    dateTime: {
      type: Date,
      required: [true, 'Task date/time is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Task deadline is required'],
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
    },
    category: {
      type: String,
      enum: Object.values(TaskCategory),
      default: TaskCategory.OTHER,
    },
    tags: {
      type: [String],
      default: [],
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    reminderEnabled: {
      type: Boolean,
      default: true,
    },
    reminderMinutesBefore: {
      type: Number,
      default: 0,
    },
    autoReschedule: {
      type: String,
      default: '12 HOURS',
    },
    rescheduleCount: {
      type: Number,
      default: 0,
    },
    originalDateTime: {
      type: Date,
    },
    lastRescheduledAt: {
      type: Date,
    },
    parentTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
  },
  {
    timestamps: true,
  }
);

export const Task = model<ITask>('Task', taskSchema);
