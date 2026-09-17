import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../../models';
import { theme } from '../../theme';
import { formatDate, getDeadlineInfo } from '../../utils';
import { Card } from '../common/Card';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';

export interface TaskCardProps {
  task: Task;
  onToggleComplete?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onPress?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onPress,
}) => {
  const deadlineInfo = getDeadlineInfo(task.deadline, task.isCompleted);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(task)}
    >
      <Card style={[styles.container, task.isCompleted && styles.completedContainer]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.checkbox, task.isCompleted && styles.checkboxChecked]}
            onPress={() => onToggleComplete?.(task)}
          >
            {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            style={[styles.title, task.isCompleted && styles.completedText]}
          >
            {task.title}
          </Text>

          <View style={styles.badgeGroup}>
            {task.category && <CategoryBadge category={task.category} />}
            <PriorityBadge priority={task.priority} />
          </View>
        </View>

        {task.description ? (
          <Text
            numberOfLines={2}
            style={[styles.description, task.isCompleted && styles.completedText]}
          >
            {task.description}
          </Text>
        ) : null}

        {task.tags && task.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {task.tags.map((tag, idx) => (
              <View key={`${tag}-${idx}`} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footerRow}>
          <View style={styles.dateContainer}>
            {task.deadline ? (
              <Text
                style={[
                  styles.deadlineText,
                  deadlineInfo.isOverdue && styles.overdueText,
                  task.isCompleted && styles.completedMetaText,
                ]}
              >
                {deadlineInfo.label} ({formatDate(task.deadline)})
              </Text>
            ) : (
              <Text style={styles.dateText}>Created: {formatDate(task.createdAt)}</Text>
            )}
          </View>

          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(task)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  completedContainer: {
    opacity: 0.75,
    backgroundColor: theme.colors.surfaceVariant,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.textInverse,
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.xs,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    marginLeft: 28,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginLeft: 28,
    marginBottom: theme.spacing.xs,
  },
  tagChip: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: theme.spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    marginLeft: 28,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  deadlineText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  completedMetaText: {
    color: theme.colors.textMuted,
    textDecorationLine: 'none',
  },
  overdueText: {
    color: theme.colors.error,
    fontWeight: theme.typography.weights.bold,
  },
  deleteButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
  },
  deleteText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.error,
    fontWeight: theme.typography.weights.medium,
  },
});
