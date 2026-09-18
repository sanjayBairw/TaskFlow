import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../models';

const NOTIF_STORAGE_KEY = '@taskflow_scheduled_notifications';

export interface ScheduledReminder {
  taskId: string;
  title: string;
  reminderTime: string;
  scheduledAt: string;
}

export class NotificationService {
  /**
   * Schedule a local notification/alarm for a task
   */
  public static async scheduleTaskReminder(task: Task): Promise<void> {
    if (!task.reminderEnabled && task.reminderEnabled !== undefined) {
      return;
    }

    try {
      const taskDate = new Date(task.dateTime);
      const minutesBefore = task.reminderMinutesBefore || 0;
      const reminderTime = new Date(taskDate.getTime() - minutesBefore * 60 * 1000);

      // Skip if reminder time is in the past
      if (reminderTime.getTime() <= Date.now()) {
        return;
      }

      const reminderData: ScheduledReminder = {
        taskId: task.id,
        title: task.title,
        reminderTime: reminderTime.toISOString(),
        scheduledAt: new Date().toISOString(),
      };

      const existingReminders = await NotificationService.getScheduledReminders();
      const updated = existingReminders.filter((r) => r.taskId !== task.id);
      updated.push(reminderData);

      await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));

      console.log(
        `[NotificationService] Local reminder scheduled for "${task.title}" at ${reminderTime.toLocaleString()}`
      );
    } catch (error) {
      console.error('[NotificationService] Error scheduling task reminder:', error);
    }
  }

  /**
   * Cancel scheduled notification for a task (on delete or completion)
   */
  public static async cancelTaskReminder(taskId: string): Promise<void> {
    try {
      const existingReminders = await NotificationService.getScheduledReminders();
      const updated = existingReminders.filter((r) => r.taskId !== taskId);
      await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
      console.log(`[NotificationService] Local reminder cancelled for taskId: ${taskId}`);
    } catch (error) {
      console.error('[NotificationService] Error cancelling task reminder:', error);
    }
  }

  /**
   * Get all currently scheduled local task reminders
   */
  public static async getScheduledReminders(): Promise<ScheduledReminder[]> {
    try {
      const data = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}
