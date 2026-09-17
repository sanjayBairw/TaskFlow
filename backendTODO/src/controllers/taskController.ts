import { Response } from 'express';
import { Types } from 'mongoose';
import { Task, TaskPriority, TaskStatus, TaskCategory } from '../models/Task';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const sanitizeTags = (rawTags: any): string[] => {
  if (!Array.isArray(rawTags)) return [];
  const cleaned = rawTags
    .filter((t) => typeof t === 'string')
    .map((t: string) => t.trim().replace(/^#+/, '').toLowerCase())
    .filter((t: string) => t.length > 0 && t.length <= 30);
  return Array.from(new Set(cleaned)).slice(0, 10);
};

/**
 * CREATE TASK
 * POST /api/tasks
 */
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { title, description, dateTime, deadline, priority, category, tags } = req.body;

    // Title validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    // Date validation
    if (!dateTime || isNaN(Date.parse(dateTime))) {
      return res.status(400).json({
        success: false,
        message: 'Valid dateTime is required',
      });
    }

    if (!deadline || isNaN(Date.parse(deadline))) {
      return res.status(400).json({
        success: false,
        message: 'Valid deadline is required',
      });
    }

    const parsedDateTime = new Date(dateTime);
    const parsedDeadline = new Date(deadline);

    if (parsedDeadline < parsedDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Deadline cannot be before task date/time',
      });
    }

    // Priority validation
    let taskPriority = TaskPriority.MEDIUM;
    if (priority !== undefined) {
      if (!Object.values(TaskPriority).includes(priority as TaskPriority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority. Allowed values: LOW, MEDIUM, HIGH, URGENT',
        });
      }
      taskPriority = priority as TaskPriority;
    }

    // Category validation
    let taskCategory = TaskCategory.OTHER;
    if (category !== undefined) {
      if (!Object.values(TaskCategory).includes(category as TaskCategory)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Allowed values: PERSONAL, WORK, STUDY, SHOPPING, OTHER',
        });
      }
      taskCategory = category as TaskCategory;
    }

    const taskTags = sanitizeTags(tags);

    const newTask = new Task({
      userId: new Types.ObjectId(userId),
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      dateTime: parsedDateTime,
      deadline: parsedDeadline,
      priority: taskPriority,
      status: TaskStatus.PENDING,
      category: taskCategory,
      tags: taskTags,
    });

    await newTask.save();

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task: newTask,
      },
    });
  } catch (error) {
    console.error('[Task Controller] Create Task Error:', error instanceof Error ? error.message : error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating task',
    });
  }
};

/**
 * GET ALL USER TASKS
 * GET /api/tasks
 */
export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const tasks = await Task.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        tasks,
      },
    });
  } catch (error) {
    console.error('[Task Controller] Get Tasks Error:', error instanceof Error ? error.message : error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving tasks',
    });
  }
};

/**
 * GET SINGLE TASK
 * GET /api/tasks/:id
 */
export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const task = await Task.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    console.error('[Task Controller] Get Task By ID Error:', error instanceof Error ? error.message : error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving task',
    });
  }
};

/**
 * UPDATE TASK
 * PUT /api/tasks/:id
 */
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const existingTask = await Task.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const { title, description, dateTime, deadline, priority, status, category, tags } = req.body;

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Task title cannot be empty',
        });
      }
      existingTask.title = title.trim();
    }

    // Validate description if provided
    if (description !== undefined) {
      existingTask.description = typeof description === 'string' ? description.trim() : '';
    }

    // Validate dates if provided
    if (dateTime !== undefined) {
      if (isNaN(Date.parse(dateTime))) {
        return res.status(400).json({
          success: false,
          message: 'Valid dateTime is required',
        });
      }
      existingTask.dateTime = new Date(dateTime);
    }

    if (deadline !== undefined) {
      if (isNaN(Date.parse(deadline))) {
        return res.status(400).json({
          success: false,
          message: 'Valid deadline is required',
        });
      }
      existingTask.deadline = new Date(deadline);
    }

    if (existingTask.deadline < existingTask.dateTime) {
      return res.status(400).json({
        success: false,
        message: 'Deadline cannot be before task date/time',
      });
    }

    // Validate priority if provided
    if (priority !== undefined) {
      if (!Object.values(TaskPriority).includes(priority as TaskPriority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority. Allowed values: LOW, MEDIUM, HIGH, URGENT',
        });
      }
      existingTask.priority = priority as TaskPriority;
    }

    // Validate status if provided
    if (status !== undefined) {
      if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Allowed values: PENDING, IN_PROGRESS, COMPLETED',
        });
      }
      existingTask.status = status as TaskStatus;
    }

    // Validate category if provided
    if (category !== undefined) {
      if (!Object.values(TaskCategory).includes(category as TaskCategory)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Allowed values: PERSONAL, WORK, STUDY, SHOPPING, OTHER',
        });
      }
      existingTask.category = category as TaskCategory;
    }

    // Validate tags if provided
    if (tags !== undefined) {
      existingTask.tags = sanitizeTags(tags);
    }

    await existingTask.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task: existingTask,
      },
    });
  } catch (error) {
    console.error('[Task Controller] Update Task Error:', error instanceof Error ? error.message : error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating task',
    });
  }
};

/**
 * DELETE TASK
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const deletedTask = await Task.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('[Task Controller] Delete Task Error:', error instanceof Error ? error.message : error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting task',
    });
  }
};

/**
 * UPDATE TASK STATUS
 * PATCH /api/tasks/:id/status
 */
export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const { status } = req.body;

    if (!status || !Object.values(TaskStatus).includes(status as TaskStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: PENDING, IN_PROGRESS, COMPLETED',
      });
    }

    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      },
      { status: status as TaskStatus },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: {
        task: updatedTask,
      },
    });
  } catch (error) {
    console.error('[Task Controller] Update Status Error:', error instanceof Error ? error.message : error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating task status',
    });
  }
};
