import { Task, TaskStatus, TaskCategory, CreateTaskDto, UpdateTaskDto } from '../models';
import { ApiService } from './api';
import { NotificationService } from './notificationService';

function normalizeTask(rawTask: any): Task {
  if (!rawTask) {
    throw new Error('Task payload is empty');
  }
  const id = rawTask.id || rawTask._id || '';
  const status = rawTask.status || TaskStatus.PENDING;
  const category = rawTask.category || TaskCategory.OTHER;
  const tags = Array.isArray(rawTask.tags) ? rawTask.tags : [];
  return {
    ...rawTask,
    id,
    _id: rawTask._id || id,
    status,
    category,
    tags,
    isCompleted: status === TaskStatus.COMPLETED,
  };
}

export class TaskService {
  public static async getTasks(): Promise<Task[]> {
    const res = await ApiService.get<{ tasks: any[] }>('/tasks');
    const rawList = res && Array.isArray(res.tasks) ? res.tasks : [];
    return rawList.map(normalizeTask);
  }

  public static async getTaskById(id: string): Promise<Task> {
    const res = await ApiService.get<{ task: any }>(`/tasks/${id}`);
    const rawTask = res?.task || res;
    return normalizeTask(rawTask);
  }

  public static async createTask(taskData: CreateTaskDto): Promise<Task> {
    const res = await ApiService.post<{ task: any }>('/tasks', taskData);
    const rawTask = res?.task || res;
    const task = normalizeTask(rawTask);
    await NotificationService.scheduleTaskReminder(task);
    return task;
  }

  public static async updateTask(id: string, updates: UpdateTaskDto): Promise<Task> {
    const res = await ApiService.put<{ task: any }>(`/tasks/${id}`, updates);
    const rawTask = res?.task || res;
    const task = normalizeTask(rawTask);
    if (task.isCompleted) {
      await NotificationService.cancelTaskReminder(task.id);
    } else {
      await NotificationService.scheduleTaskReminder(task);
    }
    return task;
  }

  public static async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const res = await ApiService.patch<{ task: any }>(`/tasks/${id}/status`, { status });
    const rawTask = res?.task || res;
    const task = normalizeTask(rawTask);
    if (status === TaskStatus.COMPLETED) {
      await NotificationService.cancelTaskReminder(task.id);
    } else {
      await NotificationService.scheduleTaskReminder(task);
    }
    return task;
  }

  public static async deleteTask(id: string): Promise<void> {
    await ApiService.delete<{ message: string }>(`/tasks/${id}`);
    await NotificationService.cancelTaskReminder(id);
  }
}
