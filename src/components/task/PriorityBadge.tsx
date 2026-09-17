import React from 'react';
import { TaskPriority } from '../../models';
import { theme } from '../../theme';
import { Badge } from '../common/Badge';

export interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getColors = () => {
    switch (priority) {
      case TaskPriority.URGENT:
        return {
          bg: '#FEE2E2', // Light red
          text: theme.colors.priority.urgent,
        };
      case TaskPriority.HIGH:
        return {
          bg: '#FEF3C7', // Light amber
          text: theme.colors.priority.high,
        };
      case TaskPriority.MEDIUM:
        return {
          bg: '#DBEAFE', // Light blue
          text: theme.colors.priority.medium,
        };
      case TaskPriority.LOW:
      default:
        return {
          bg: '#D1FAE5', // Light green
          text: theme.colors.priority.low,
        };
    }
  };

  const { bg, text } = getColors();

  return <Badge label={priority} backgroundColor={bg} textColor={text} />;
};
