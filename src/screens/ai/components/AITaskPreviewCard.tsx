import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { ParsedAITask, TaskPriority, TaskCategory } from '../../../models';
import { theme } from '../../../theme';

interface AITaskPreviewCardProps {
  task: ParsedAITask;
  onConfirm: (taskToCreate: ParsedAITask) => void;
  onCancel: () => void;
}

export const AITaskPreviewCard: React.FC<AITaskPreviewCardProps> = ({
  task,
  onConfirm,
  onCancel,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority || TaskPriority.MEDIUM);
  const [category, setCategory] = useState<TaskCategory>(task.category || TaskCategory.OTHER);

  const formattedStart = new Date(task.dateTime).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDeadline = new Date(task.deadline).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleConfirm = () => {
    onConfirm({
      ...task,
      title,
      description,
      priority,
      category,
    });
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.URGENT:
        return theme.colors.priority.urgent;
      case TaskPriority.HIGH:
        return theme.colors.priority.high;
      case TaskPriority.MEDIUM:
        return theme.colors.priority.medium;
      case TaskPriority.LOW:
        return theme.colors.priority.low;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.badgeText}>✨ AI Task Confirmation</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.editToggleText}>{isEditing ? 'Done Editing' : '✏️ Edit'}</Text>
        </TouchableOpacity>
      </View>

      {isEditing ? (
        <View style={styles.editForm}>
          <Text style={styles.label}>Task Title:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Task Title"
          />

          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Task Description"
            multiline
          />

          <Text style={styles.label}>Priority:</Text>
          <View style={styles.chipRow}>
            {[TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.chip,
                  priority === p && { backgroundColor: getPriorityColor(p), borderColor: getPriorityColor(p) },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.chipText, priority === p && { color: '#FFF' }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {[TaskCategory.PERSONAL, TaskCategory.WORK, TaskCategory.STUDY, TaskCategory.SHOPPING, TaskCategory.OTHER].map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.chip,
                  category === c && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                ]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.chipText, category === c && { color: '#FFF' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.detailView}>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🗓 Start:</Text>
              <Text style={styles.infoValue}>{formattedStart}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>⌛ Deadline:</Text>
              <Text style={styles.infoValue}>{formattedDeadline}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🏷 Priority:</Text>
              <View style={[styles.tagBadge, { backgroundColor: getPriorityColor(priority) }]}>
                <Text style={styles.tagBadgeText}>{priority}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📂 Category:</Text>
              <Text style={styles.infoValue}>{category}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🔔 Reminder:</Text>
              <Text style={styles.infoValue}>
                {task.reminderMinutesBefore === 0 ? 'At task start time' : `${task.reminderMinutesBefore} mins before`}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Create Task</Text>
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
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  editToggleText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  detailView: {
    marginVertical: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  infoGrid: {
    gap: 6,
    marginTop: theme.spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    width: 90,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  editForm: {
    marginVertical: theme.spacing.xs,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 6,
    marginBottom: 2,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 4,
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 4,
  },
  chipScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceVariant,
    marginRight: 4,
  },
  chipText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
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
