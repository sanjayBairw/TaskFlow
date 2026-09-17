import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TaskPriority, TaskCategory } from '../../models';
import { CustomButton, CustomInput, Header } from '../../components';
import { theme } from '../../theme';
import { PRIORITY_OPTIONS, CATEGORY_OPTIONS } from '../../utils';
import { TaskService } from '../../services/taskService';
import { AddTaskNavProps } from '../../navigation/types';

export interface AddTaskScreenProps extends Partial<AddTaskNavProps> {
  onNavigateBack?: () => void;
}

export const AddTaskScreen: React.FC<AddTaskScreenProps> = ({
  navigation,
  onNavigateBack,
}) => {
  const now = new Date();
  const defaultDateTime = now.toISOString().slice(0, 16).replace('T', ' ');
  const tomorrow = new Date(now.getTime() + 86400000 * 2);
  const defaultDeadline = tomorrow.toISOString().slice(0, 10);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(defaultDateTime);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.PERSONAL);
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const parseTags = (raw: string): string[] => {
    return raw
      .split(/[, ]+/)
      .map((t) => t.trim().replace(/^#+/, '').toLowerCase())
      .filter((t) => t.length > 0 && t.length <= 30)
      .slice(0, 10);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Task title is required');
      return;
    }

    if (!dateTime.trim()) {
      Alert.alert('Validation Error', 'Date / Time is required');
      return;
    }

    if (!deadline.trim()) {
      Alert.alert('Validation Error', 'Deadline date is required');
      return;
    }

    const parsedDateTime = new Date(dateTime.includes('T') ? dateTime : dateTime.replace(' ', 'T'));
    const parsedDeadline = new Date(deadline.includes('T') ? deadline : `${deadline}T23:59:59`);

    if (isNaN(parsedDateTime.getTime())) {
      Alert.alert('Validation Error', 'Invalid Date / Time format (Use YYYY-MM-DD HH:mm)');
      return;
    }

    if (isNaN(parsedDeadline.getTime())) {
      Alert.alert('Validation Error', 'Invalid Deadline format (Use YYYY-MM-DD)');
      return;
    }

    if (parsedDeadline < parsedDateTime) {
      Alert.alert('Validation Error', 'Deadline cannot be before task Date / Time');
      return;
    }

    const tags = parseTags(tagsInput);

    setIsSubmitting(true);
    try {
      await TaskService.createTask({
        title: title.trim(),
        description: description.trim(),
        dateTime: parsedDateTime.toISOString(),
        deadline: parsedDeadline.toISOString(),
        priority,
        category,
        tags,
      });

      Alert.alert('Success', 'Task created successfully', [
        {
          text: 'OK',
          onPress: handleBack,
        },
      ]);
    } catch (err) {
      Alert.alert(
        'Create Failed',
        err instanceof Error ? err.message : 'Unable to create task. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Add New Task"
        subtitle="Fill in task details"
        rightAction={
          <CustomButton
            title="Cancel"
            variant="outline"
            size="sm"
            onPress={handleBack}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <CustomInput
            label="Task Title *"
            placeholder="e.g. Complete mobile UI layout"
            value={title}
            onChangeText={setTitle}
          />

          <CustomInput
            label="Description"
            placeholder="Enter detailed task instructions..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <CustomInput
            label="Date / Time *"
            placeholder="YYYY-MM-DD HH:mm"
            value={dateTime}
            onChangeText={setDateTime}
          />

          <CustomInput
            label="Deadline *"
            placeholder="YYYY-MM-DD"
            value={deadline}
            onChangeText={setDeadline}
          />

          <View style={styles.chipSection}>
            <Text style={styles.sectionLabel}>Category *</Text>
            <View style={styles.chipRow}>
              {CATEGORY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    category === option.value && styles.chipSelected,
                  ]}
                  onPress={() => setCategory(option.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === option.value && styles.chipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.chipSection}>
            <Text style={styles.sectionLabel}>Priority Level *</Text>
            <View style={styles.chipRow}>
              {PRIORITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    priority === option.value && styles.chipSelected,
                  ]}
                  onPress={() => setPriority(option.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      priority === option.value && styles.chipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <CustomInput
            label="Tags (Optional)"
            placeholder="e.g. college, assignment, urgent"
            value={tagsInput}
            onChangeText={setTagsInput}
          />

          <CustomButton
            title={isSubmitting ? 'Creating...' : 'Create Task'}
            variant="primary"
            style={styles.submitButton}
            disabled={isSubmitting}
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>
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
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 100,
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
  submitButton: {
    marginTop: theme.spacing.md,
  },
});
