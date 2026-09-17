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

export interface Task {
  id: string;
  _id?: string;
  userId: string;
  title: string;
  description?: string;
  dateTime: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  tags: string[];
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dateTime: string;
  deadline: string;
  priority: TaskPriority;
  category?: TaskCategory;
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dateTime?: string;
  deadline?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: TaskCategory;
  tags?: string[];
  isCompleted?: boolean;
}
