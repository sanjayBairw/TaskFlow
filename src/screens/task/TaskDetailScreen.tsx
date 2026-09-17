import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Task, TaskPriority, TaskStatus, TaskCategory } from '../../models';
import {
  CustomButton,
  Header,
  PriorityBadge,
  CategoryBadge,
  Badge,
  CustomInput,
} from '../../components';
import { theme } from '../../theme';
import { formatDate, formatDateTime, getDeadlineInfo, PRIORITY_OPTIONS, CATEGORY_OPTIONS } from '../../utils';
import { TaskService } from '../../services/taskService';
import { TaskDetailNavProps } from '../../navigation/types';

export interface TaskDetailScreenProps extends Partial<TaskDetailNavProps> {
  taskId?: string;
  onNavigateBack?: () => void;
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  navigation,
  route,
  taskId: propTaskId,
  onNavigateBack,
}) => {
  const activeTaskId = route?.params?.taskId || propTaskId || '';

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDateTime, setEditDateTime] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [editStatus, setEditStatus] = useState<TaskStatus>(TaskStatus.PENDING);
  const [editCategory, setEditCategory] = useState<TaskCategory>(TaskCategory.OTHER);
  const [editTagsInput, setEditTagsInput] = useState('');

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const populateEditForm = useCallback((t: Task) => {
    setEditTitle(t.title);
    setEditDescription(t.description || '');
    setEditDateTime(t.dateTime ? t.dateTime.slice(0, 16).replace('T', ' ') : '');
    setEditDeadline(t.deadline ? t.deadline.slice(0, 10) : '');
    setEditPriority(t.priority);
    setEditStatus(t.status);
    setEditCategory(t.category || TaskCategory.OTHER);
    setEditTagsInput(t.tags ? t.tags.join(', ') : '');
  }, []);

  const fetchTask = useCallback(async () => {
    if (!activeTaskId) {
      setErrorMsg('No task ID provided.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const fetchedTask = await TaskService.getTaskById(activeTaskId);
      setTask(fetchedTask);
      populateEditForm(fetchedTask);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Task not found');
    } finally {
      setIsLoading(false);
    }
  }, [activeTaskId, populateEditForm]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleToggleStatus = async () => {
    if (!task) return;
    const nextStatus =
      task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;

    setIsUpdating(true);
    try {
      const updated = await TaskService.updateTaskStatus(task.id, nextStatus);
      setTask(updated);
      populateEditForm(updated);
    } catch (err) {
      Alert.alert('Status Update Failed', err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const parseTags = (raw: string): string[] => {
    return raw
      .split(/[, ]+/)
      .map((t) => t.trim().replace(/^#+/, '').toLowerCase())
      .filter((t) => t.length > 0 && t.length <= 30)
      .slice(0, 10);
  };

  const handleSaveEdit = async () => {
    if (!task) return;

    if (!editTitle.trim()) {
      Alert.alert('Validation Error', 'Task title cannot be empty');
      return;
    }

    if (!editDateTime.trim()) {
      Alert.alert('Validation Error', 'Date / Time is required');
      return;
    }

    if (!editDeadline.trim()) {
      Alert.alert('Validation Error', 'Deadline date is required');
      return;
    }

    const parsedDateTime = new Date(editDateTime.includes('T') ? editDateTime : editDateTime.replace(' ', 'T'));
    const parsedDeadline = new Date(editDeadline.includes('T') ? editDeadline : `${editDeadline}T23:59:59`);

    if (isNaN(parsedDateTime.getTime())) {
      Alert.alert('Validation Error', 'Invalid Date / Time format');
      return;
    }

    if (isNaN(parsedDeadline.getTime())) {
      Alert.alert('Validation Error', 'Invalid Deadline format');
      return;
    }

    if (parsedDeadline < parsedDateTime) {
      Alert.alert('Validation Error', 'Deadline cannot be before task Date / Time');
      return;
    }

    const tags = parseTags(editTagsInput);

    setIsUpdating(true);
    try {
      const updated = await TaskService.updateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        dateTime: parsedDateTime.toISOString(),
        deadline: parsedDeadline.toISOString(),
        priority: editPriority,
        status: editStatus,
        category: editCategory,
        tags,
      });

      setTask(updated);
      setIsEditing(false);
      Alert.alert('Success', 'Task updated successfully');
    } catch (err) {
      Alert.alert('Update Failed', err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    if (!task) return;

    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await TaskService.deleteTask(task.id);
            Alert.alert('Success', 'Task deleted successfully', [
              {
                text: 'OK',
                onPress: handleBack,
              },
            ]);
          } catch (err) {
            Alert.alert('Delete Failed', err instanceof Error ? err.message : 'Failed to delete task');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return theme.colors.status.completed;
      case TaskStatus.IN_PROGRESS:
        return theme.colors.status.inProgress;
      default:
        return theme.colors.status.pending;
    }
  };

  const deadlineInfo = task ? getDeadlineInfo(task.deadline, task.isCompleted) : null;

  return (
    <View style={styles.container}>
      <Header
        title="Task Details"
        subtitle={task ? `ID: ${task.id.slice(-6)}` : 'Task Info'}
        rightAction={
          <CustomButton
            title="Back"
            variant="outline"
            size="sm"
            onPress={handleBack}
          />
        }
      />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.metaLabel}>Loading task details...</Text>
        </View>
      ) : errorMsg || !task ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Task Not Found</Text>
          <Text style={styles.errorSubtitle}>{errorMsg || 'The requested task does not exist.'}</Text>
          <CustomButton
            title="Back to Tasks"
            size="sm"
            onPress={handleBack}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            {!isEditing ? (
              <>
                <View style={styles.badgeRow}>
                  <CategoryBadge category={task.category} />
                  <PriorityBadge priority={task.priority} />
                  <Badge
                    label={task.status}
                    backgroundColor={getStatusColor(task.status) + '20'}
                    textColor={getStatusColor(task.status)}
                  />
                </View>

                <Text style={styles.title}>{task.title}</Text>
                <Text style={styles.description}>
                  {task.description ? task.description : 'No description provided.'}
                </Text>

                {task.tags && task.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    <Text style={styles.metaLabel}>Tags: </Text>
                    <View style={styles.tagsRow}>
                      {task.tags.map((tag, idx) => (
                        <View key={`${tag}-${idx}`} style={styles.tagChip}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.metaDivider} />

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Deadline State:</Text>
                  <Text style={[styles.metaValue, deadlineInfo?.isOverdue && styles.overdueText]}>
                    {deadlineInfo?.label}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Task Date / Time:</Text>
                  <Text style={styles.metaValue}>{formatDateTime(task.dateTime)}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Deadline Date:</Text>
                  <Text style={styles.metaValue}>{formatDate(task.deadline)}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Created Date:</Text>
                  <Text style={styles.metaValue}>{formatDate(task.createdAt)}</Text>
                </View>

                <View style={styles.actionsRow}>
                  <CustomButton
                    title={task.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                    variant={task.isCompleted ? 'outline' : 'primary'}
                    style={styles.actionButton}
                    disabled={isUpdating}
                    onPress={handleToggleStatus}
                  />
                  <CustomButton
                    title="Edit Task"
                    variant="outline"
                    style={styles.actionButton}
                    onPress={() => setIsEditing(true)}
                  />
                  <CustomButton
                    title="Delete"
                    variant="danger"
                    style={styles.actionButton}
                    onPress={handleDelete}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.editHeader}>Edit Task Details</Text>

                <CustomInput
                  label="Task Title *"
                  value={editTitle}
                  onChangeText={setEditTitle}
                />

                <CustomInput
                  label="Description"
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                />

                <CustomInput
                  label="Date / Time *"
                  value={editDateTime}
                  onChangeText={setEditDateTime}
                />

                <CustomInput
                  label="Deadline *"
                  value={editDeadline}
                  onChangeText={setEditDeadline}
                />

                <View style={styles.chipSection}>
                  <Text style={styles.sectionLabel}>Category</Text>
                  <View style={styles.chipRow}>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.chip,
                          editCategory === opt.value && styles.chipSelected,
                        ]}
                        onPress={() => setEditCategory(opt.value)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            editCategory === opt.value && styles.chipTextSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.chipSection}>
                  <Text style={styles.sectionLabel}>Priority</Text>
                  <View style={styles.chipRow}>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.chip,
                          editPriority === opt.value && styles.chipSelected,
                        ]}
                        onPress={() => setEditPriority(opt.value)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            editPriority === opt.value && styles.chipTextSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.chipSection}>
                  <Text style={styles.sectionLabel}>Status</Text>
                  <View style={styles.chipRow}>
                    {[TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED].map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[
                          styles.chip,
                          editStatus === st && styles.chipSelected,
                        ]}
                        onPress={() => setEditStatus(st)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            editStatus === st && styles.chipTextSelected,
                          ]}
                        >
                          {st}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <CustomInput
                  label="Tags (Optional)"
                  placeholder="e.g. college, assignment"
                  value={editTagsInput}
                  onChangeText={setEditTagsInput}
                />

                <View style={styles.actionsRow}>
                  <CustomButton
                    title={isUpdating ? 'Saving...' : 'Save Changes'}
                    variant="primary"
                    style={styles.actionButton}
                    disabled={isUpdating}
                    onPress={handleSaveEdit}
                  />
                  <CustomButton
                    title="Cancel"
                    variant="outline"
                    style={styles.actionButton}
                    onPress={() => {
                      setIsEditing(false);
                      populateEditForm(task);
                    }}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.md,
    marginBottom: theme.spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
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
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  metaDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  metaLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  metaValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  overdueText: {
    color: theme.colors.error,
    fontWeight: theme.typography.weights.bold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  errorTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  errorSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  editHeader: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  chipSection: {
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.spacing.borderRadius.full,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
  },
  chipTextSelected: {
    color: theme.colors.textInverse,
    fontWeight: theme.typography.weights.bold,
  },
});
