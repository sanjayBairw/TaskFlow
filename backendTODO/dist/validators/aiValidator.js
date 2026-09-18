"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIValidator = void 0;
const Task_1 = require("../models/Task");
class AIValidator {
    static validateTask(raw, defaultNow = new Date()) {
        const title = (raw.title || '').trim() || 'Untitled Task';
        const description = (raw.description || '').trim();
        // Priority validation
        let priority = Task_1.TaskPriority.MEDIUM;
        if (raw.priority && Object.values(Task_1.TaskPriority).includes(raw.priority.toUpperCase())) {
            priority = raw.priority.toUpperCase();
        }
        // Status validation
        let status = Task_1.TaskStatus.PENDING;
        if (raw.status && Object.values(Task_1.TaskStatus).includes(raw.status.toUpperCase())) {
            status = raw.status.toUpperCase();
        }
        // Category validation
        let category = Task_1.TaskCategory.OTHER;
        if (raw.category && Object.values(Task_1.TaskCategory).includes(raw.category.toUpperCase())) {
            category = raw.category.toUpperCase();
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
    static validateTaskList(rawTasks, defaultNow = new Date()) {
        if (!Array.isArray(rawTasks)) {
            return [];
        }
        return rawTasks.map((t) => AIValidator.validateTask(t, defaultNow));
    }
}
exports.AIValidator = AIValidator;
