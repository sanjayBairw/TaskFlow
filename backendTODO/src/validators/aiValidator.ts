import { TaskPriority, TaskStatus, TaskCategory } from '../models/Task';

export interface RawAITaskInput {
  title?: string;
  description?: string;
  dateTime?: string | Date;
  deadline?: string | Date;
  priority?: string;
  status?: string;
  category?: string;
  tags?: string[];
  reminderMinutesBefore?: number;
  sourceUrl?: string;
}

export interface ValidatedAITask {
  title: string;
  description: string;
  dateTime: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  tags: string[];
  reminderMinutesBefore: number;
  sourceUrl?: string;
}

export class AIValidator {
  public static validateTask(raw: RawAITaskInput, defaultNow: Date = new Date()): ValidatedAITask {
    const title = (raw.title || '').trim() || 'Untitled Task';
    const description = (raw.description || '').trim();

    // Priority validation
    let priority = TaskPriority.MEDIUM;
    if (raw.priority && Object.values(TaskPriority).includes(raw.priority.toUpperCase() as TaskPriority)) {
      priority = raw.priority.toUpperCase() as TaskPriority;
    }

    // Status validation
    let status = TaskStatus.PENDING;
    if (raw.status && Object.values(TaskStatus).includes(raw.status.toUpperCase() as TaskStatus)) {
      status = raw.status.toUpperCase() as TaskStatus;
    }

    // Category validation
    let category = TaskCategory.OTHER;
    if (raw.category && Object.values(TaskCategory).includes(raw.category.toUpperCase() as TaskCategory)) {
      category = raw.category.toUpperCase() as TaskCategory;
    }

    // Date validation
    let parsedStart = raw.dateTime ? new Date(raw.dateTime) : new Date(defaultNow);
    if (isNaN(parsedStart.getTime())) {
      parsedStart = new Date(defaultNow);
    }

    let parsedDeadline = raw.deadline ? new Date(raw.deadline) : new Date(parsedStart.getTime() + 60 * 60 * 1000);
    if (isNaN(parsedDeadline.getTime()) || parsedDeadline.getTime() < parsedStart.getTime()) {
      parsedDeadline = new Date(parsedStart.getTime() + 60 * 60 * 1000); // 1 hour after start
    }

    // Tags validation
    const tags = Array.isArray(raw.tags) ? raw.tags.map((t) => String(t).trim()).filter(Boolean) : [];

    const reminderMinutesBefore = typeof raw.reminderMinutesBefore === 'number' ? raw.reminderMinutesBefore : 0;

    return {
      title,
      description,
      dateTime: parsedStart.toISOString(),
      deadline: parsedDeadline.toISOString(),
      priority,
      status,
      category,
      tags,
      reminderMinutesBefore,
      sourceUrl: raw.sourceUrl || '',
    };
  }

  public static validateTaskList(rawTasks: RawAITaskInput[], defaultNow: Date = new Date()): ValidatedAITask[] {
    if (!Array.isArray(rawTasks)) {
      return [];
    }
    return rawTasks.map((t) => AIValidator.validateTask(t, defaultNow));
  }
}
