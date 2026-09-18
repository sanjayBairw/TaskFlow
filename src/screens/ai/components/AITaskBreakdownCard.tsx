import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ParsedAITask } from '../../../models';
import { theme } from '../../../theme';

interface AITaskBreakdownCardProps {
  tasks: ParsedAITask[];
  onConfirm: (selectedTasks: ParsedAITask[]) => void;
  onCancel: () => void;
}

export const AITaskBreakdownCard: React.FC<AITaskBreakdownCardProps> = ({
  tasks,
  onConfirm,
  onCancel,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    tasks.map((_, i) => i)
  );

  const toggleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === tasks.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(tasks.map((_, i) => i));
    }
  };

  const handleConfirm = () => {
    const selected = selectedIndices.map((i) => tasks[i]);
    onConfirm(selected);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>⚡ Project Task Breakdown</Text>
        <TouchableOpacity onPress={toggleSelectAll}>
          <Text style={styles.selectAllText}>
            {selectedIndices.length === tasks.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Decomposed into {tasks.length} actionable subtasks ({selectedIndices.length} selected):
      </Text>

      <ScrollView style={styles.tasksScroll} nestedScrollEnabled>
        {tasks.map((task, index) => {
          const isSelected = selectedIndices.includes(index);
          return (
            <TouchableOpacity
              key={`breakdown-${index}`}
              style={[styles.taskCard, isSelected && styles.taskCardSelected]}
              onPress={() => toggleSelect(index)}
              activeOpacity={0.8}
            >
              <Text style={styles.checkbox}>{isSelected ? '☑' : '☐'}</Text>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>
                  Subtask #{index + 1}: {task.title}
                </Text>
                {task.description ? (
                  <Text style={styles.taskDesc} numberOfLines={2}>
                    {task.description}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.confirmBtn, selectedIndices.length === 0 && styles.disabledBtn]}
          onPress={handleConfirm}
          disabled={selectedIndices.length === 0}
        >
          <Text style={styles.confirmBtnText}>Create Subtasks ({selectedIndices.length})</Text>
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
    maxHeight: 420,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  selectAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  tasksScroll: {
    maxHeight: 240,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    padding: theme.spacing.xs + 2,
    borderRadius: theme.spacing.borderRadius.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  taskCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F7FF',
  },
  checkbox: {
    fontSize: 16,
    color: theme.colors.primary,
    marginRight: 8,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  taskDesc: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
  disabledBtn: {
    backgroundColor: theme.colors.border,
  },
  confirmBtnText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
});
