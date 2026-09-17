import { TaskPriority, TaskStatus, TaskCategory } from '../models';

export const APP_NAME = 'TaskFlow';

export const PRIORITY_OPTIONS = [
  { label: 'Low', value: TaskPriority.LOW },
  { label: 'Medium', value: TaskPriority.MEDIUM },
  { label: 'High', value: TaskPriority.HIGH },
  { label: 'Urgent', value: TaskPriority.URGENT },
];

export const STATUS_OPTIONS = [
  { label: 'Pending', value: TaskStatus.PENDING },
  { label: 'In Progress', value: TaskStatus.IN_PROGRESS },
  { label: 'Completed', value: TaskStatus.COMPLETED },
];

export const CATEGORY_OPTIONS = [
  { label: 'Personal', value: TaskCategory.PERSONAL },
  { label: 'Work', value: TaskCategory.WORK },
  { label: 'Study', value: TaskCategory.STUDY },
  { label: 'Shopping', value: TaskCategory.SHOPPING },
  { label: 'Other', value: TaskCategory.OTHER },
];

export const SORT_OPTIONS = [
  { label: 'Newest Created', value: 'NEWEST' },
  { label: 'Oldest Created', value: 'OLDEST' },
  { label: 'Deadline — Soonest', value: 'DEADLINE_SOONEST' },
  { label: 'Deadline — Latest', value: 'DEADLINE_LATEST' },
  { label: 'Priority — Highest first', value: 'PRIORITY_HIGHEST' },
  { label: 'Priority — Lowest first', value: 'PRIORITY_LOWEST' },
];

export const API_CONFIG = {
  BASE_URL: 'https://backendtodo-z3gb.onrender.com/api', // Centralized backend API URL
  TIMEOUT: 10000,
};
