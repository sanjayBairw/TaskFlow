"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = exports.TaskCategory = exports.TaskStatus = exports.TaskPriority = void 0;
const mongoose_1 = require("mongoose");
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "LOW";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["URGENT"] = "URGENT";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskCategory;
(function (TaskCategory) {
    TaskCategory["PERSONAL"] = "PERSONAL";
    TaskCategory["WORK"] = "WORK";
    TaskCategory["STUDY"] = "STUDY";
    TaskCategory["SHOPPING"] = "SHOPPING";
    TaskCategory["OTHER"] = "OTHER";
})(TaskCategory || (exports.TaskCategory = TaskCategory = {}));
const taskSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
exports.Task = (0, mongoose_1.model)('Task', taskSchema);
