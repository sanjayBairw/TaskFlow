"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RescheduleService = void 0;
const Task_1 = require("../models/Task");
class RescheduleService {
    static async rescheduleOverdueTasks(userId, mode = '12 HOURS', maxRetries = 10) {
        const now = new Date();
        // Find overdue incomplete tasks belonging to the user
        const overdueTasks = await Task_1.Task.find({
            userId,
            status: { $ne: Task_1.TaskStatus.COMPLETED },
            deadline: { $lt: now },
            $or: [
                { rescheduleCount: { $lt: maxRetries } },
                { rescheduleCount: { $exists: false } },
            ],
        });
        if (overdueTasks.length === 0) {
            return { rescheduledCount: 0, tasks: [] };
        }
        const updatedTasks = [];
        for (let i = 0; i < overdueTasks.length; i++) {
            const task = overdueTasks[i];
            if (!task.originalDateTime) {
                task.originalDateTime = task.dateTime;
            }
            let newStart = new Date(task.dateTime);
            let durationMs = new Date(task.deadline).getTime() - new Date(task.dateTime).getTime();
            if (durationMs <= 0 || isNaN(durationMs)) {
                durationMs = 60 * 60 * 1000; // default 1 hour
            }
            switch (mode) {
                case '24 HOURS': {
                    newStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    break;
                }
                case 'NEXT DAY': {
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
                    newStart = tomorrow;
                    break;
                }
                case 'AI RECOMMENDED': {
                    // Stagger each task by 1 hour starting tomorrow 9 AM
                    const nextSlot = new Date(now);
                    nextSlot.setDate(nextSlot.getDate() + 1);
                    nextSlot.setHours(9 + i, 0, 0, 0);
                    newStart = nextSlot;
                    break;
                }
                case '12 HOURS':
                default: {
                    newStart = new Date(now.getTime() + 12 * 60 * 60 * 1000);
                    break;
                }
            }
            task.dateTime = newStart;
            task.deadline = new Date(newStart.getTime() + durationMs);
            task.rescheduleCount = (task.rescheduleCount || 0) + 1;
            task.lastRescheduledAt = new Date();
            await task.save();
            updatedTasks.push(task);
        }
        return {
            rescheduledCount: updatedTasks.length,
            tasks: updatedTasks,
        };
    }
}
exports.RescheduleService = RescheduleService;
