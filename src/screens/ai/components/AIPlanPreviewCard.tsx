import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { AIPlanSummary, ParsedAITask, AISearchSource } from '../../../models';
import { theme } from '../../../theme';

interface AIPlanPreviewCardProps {
  plan?: AIPlanSummary;
  tasks: ParsedAITask[];
  sources?: AISearchSource[];
  onConfirmAll: (tasksToCreate: ParsedAITask[]) => void;
  onCancel: () => void;
}

export const AIPlanPreviewCard: React.FC<AIPlanPreviewCardProps> = ({
  plan,
  tasks,
  sources,
  onConfirmAll,
  onCancel,
}) => {
  const planTitle = plan?.title || 'AI Roadmap Plan';
  const totalTasks = tasks.length;
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    tasks.map((_, i) => i)
  );

  const toggleSelect = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === totalTasks) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(tasks.map((_, i) => i));
    }
  };

  const handleConfirm = () => {
    const selected = selectedIndices.map((i) => tasks[i]);
    onConfirmAll(selected);
  };

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>🗺️ {planTitle}</Text>
      <Text style={styles.headerSubtitle}>
        {totalTasks} tasks generated {plan?.durationDays ? `• ${plan.durationDays} days duration` : ''} ({selectedIndices.length} selected)
      </Text>

      {plan?.overview ? <Text style={styles.overviewText}>{plan.overview}</Text> : null}

      {/* Grounded Web Sources */}
      {sources && sources.length > 0 && (
        <View style={styles.sourcesSection}>
          <Text style={styles.sourcesHeader}>📚 Grounded Web Sources & Recommendations:</Text>
          {sources.slice(0, 4).map((source, index) => (
            <TouchableOpacity
              key={`src-${index}`}
              style={styles.sourceCard}
              onPress={() => handleOpenUrl(source.url)}
            >
              <Text style={styles.sourceTitle} numberOfLines={1}>
                🔗 {source.title}
              </Text>
              <Text style={styles.sourceDomain}>{source.domain}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Task Selection Header */}
      <View style={styles.taskListHeaderRow}>
        <Text style={styles.taskListHeader}>Schedule Tasks ({selectedIndices.length}/{totalTasks}):</Text>
        <TouchableOpacity onPress={toggleSelectAll}>
          <Text style={styles.selectAllText}>
            {selectedIndices.length === totalTasks ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task List Scroll View */}
      <ScrollView style={styles.tasksScroll} nestedScrollEnabled>
        {tasks.map((task, idx) => {
          const isSelected = selectedIndices.includes(idx);
          return (
            <TouchableOpacity
              key={`task-${idx}`}
              style={[styles.taskItem, isSelected && styles.taskItemSelected]}
              onPress={() => toggleSelect(idx)}
              activeOpacity={0.8}
            >
              <Text style={styles.checkbox}>{isSelected ? '☑' : '☐'}</Text>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskMeta}>
                  📅 {new Date(task.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {task.priority}
                </Text>
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
          <Text style={styles.confirmBtnText}>Create Selected ({selectedIndices.length})</Text>
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
    maxHeight: 480,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  overviewText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  sourcesSection: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.spacing.borderRadius.sm,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  sourcesHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  sourceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  sourceTitle: {
    fontSize: 11,
    color: theme.colors.primary,
    flex: 1,
  },
  sourceDomain: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginLeft: 6,
  },
  taskListHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  taskListHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  selectAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  tasksScroll: {
    maxHeight: 180,
    marginBottom: theme.spacing.xs,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  taskItemSelected: {
    backgroundColor: '#F0F7FF',
  },
  checkbox: {
    fontSize: 15,
    color: theme.colors.primary,
    marginRight: 8,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  taskMeta: {
    fontSize: 10,
    color: theme.colors.textSecondary,
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
