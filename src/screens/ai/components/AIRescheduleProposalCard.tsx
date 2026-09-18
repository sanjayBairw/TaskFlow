import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ParsedAITask } from '../../../models';
import { theme } from '../../../theme';

interface AIRescheduleProposalCardProps {
  tasks: ParsedAITask[];
  onApply: (proposedTasks: ParsedAITask[]) => void;
  onCancel: () => void;
}

export const AIRescheduleProposalCard: React.FC<AIRescheduleProposalCardProps> = ({
  tasks,
  onApply,
  onCancel,
}) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>🔄 Proposed Reschedule Updates</Text>
      <Text style={styles.subtitle}>
        {tasks.length} unfinished tasks proposed to be moved:
      </Text>

      <ScrollView style={styles.scrollList} nestedScrollEnabled>
        {tasks.map((task, idx) => (
          <View key={`resched-${idx}`} style={styles.taskCard}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.timeText}>
              📅 New Time: {new Date(task.dateTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.priorityText}>Priority: {task.priority}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={() => onApply(tasks)}>
          <Text style={styles.confirmBtnText}>Apply New Schedule ({tasks.length})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    maxHeight: 380,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  scrollList: {
    maxHeight: 200,
  },
  taskCard: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.spacing.borderRadius.sm,
    padding: theme.spacing.xs + 2,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  timeText: {
    fontSize: 11,
    color: theme.colors.primary,
    marginTop: 2,
  },
  priorityText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.spacing.borderRadius.sm,
  },
  cancelBtn: {
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelBtnText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: theme.colors.primary,
  },
  confirmBtnText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
});
