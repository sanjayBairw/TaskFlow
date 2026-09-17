import React from 'react';
import { TaskCategory } from '../../models';
import { Badge } from '../common/Badge';

export interface CategoryBadgeProps {
  category?: TaskCategory;
}

const CATEGORY_COLORS: Record<TaskCategory, { bg: string; text: string }> = {
  [TaskCategory.PERSONAL]: { bg: '#8B5CF620', text: '#8B5CF6' },
  [TaskCategory.WORK]: { bg: '#3B82F620', text: '#3B82F6' },
  [TaskCategory.STUDY]: { bg: '#10B98120', text: '#10B981' },
  [TaskCategory.SHOPPING]: { bg: '#F59E0B20', text: '#F59E0B' },
  [TaskCategory.OTHER]: { bg: '#6B728020', text: '#6B7280' },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category = TaskCategory.OTHER }) => {
  const config = CATEGORY_COLORS[category] || CATEGORY_COLORS[TaskCategory.OTHER];

  return (
    <Badge
      label={category}
      backgroundColor={config.bg}
      textColor={config.text}
    />
  );
};
