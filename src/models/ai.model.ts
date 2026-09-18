import { TaskPriority, TaskStatus, TaskCategory } from './task.model';

export interface AISearchSource {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

export interface AIPlanSection {
  name: string;
  description: string;
  taskCount?: number;
}

export interface AIPlanSummary {
  title: string;
  durationDays?: number;
  overview?: string;
  sections?: AIPlanSection[];
}

export interface ParsedAITask {
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

export interface AICommandResponseData {
  conversationId?: string;
  intent: string;
  message: string;
  requiresConfirmation: boolean;
  tasks: ParsedAITask[];
  plan?: AIPlanSummary;
  sources?: AISearchSource[];
}

export interface AICommandRequestPayload {
  prompt: string;
  nowIso?: string;
  timezone?: string;
  conversationId?: string;
}
