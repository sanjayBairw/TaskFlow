export const formatDate = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
};

export const formatDateTime = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export const isOverdue = (deadlineIsoString?: string): boolean => {
  if (!deadlineIsoString) return false;
  try {
    const deadline = new Date(deadlineIsoString);
    return deadline.getTime() < Date.now();
  } catch {
    return false;
  }
};

export interface DeadlineInfo {
  label: string;
  isOverdue: boolean;
  formattedDate: string;
}

export const getDeadlineInfo = (deadlineIsoString?: string, isCompleted = false): DeadlineInfo => {
  if (!deadlineIsoString) {
    return { label: '', isOverdue: false, formattedDate: '' };
  }

  const formattedDate = formatDate(deadlineIsoString);

  if (isCompleted) {
    return { label: 'Completed', isOverdue: false, formattedDate };
  }

  try {
    const deadline = new Date(deadlineIsoString);
    const now = new Date();

    const deadlineDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = deadlineDay.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (deadline.getTime() < now.getTime() && diffDays <= 0) {
      return { label: diffDays === 0 ? 'Overdue today' : 'Overdue', isOverdue: true, formattedDate };
    }

    if (diffDays < 0) {
      return { label: 'Overdue', isOverdue: true, formattedDate };
    }

    if (diffDays === 0) {
      return { label: 'Due today', isOverdue: false, formattedDate };
    }

    if (diffDays === 1) {
      return { label: 'Due tomorrow', isOverdue: false, formattedDate };
    }

    return { label: `Due in ${diffDays} days`, isOverdue: false, formattedDate };
  } catch {
    return { label: formattedDate, isOverdue: false, formattedDate };
  }
};
