import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, FloatingAIButton } from '../../components';
import { theme } from '../../theme';
import { TaskService } from '../../services/taskService';
import { Task, TaskStatus } from '../../models';
import { HomeTabNavProps } from '../../navigation/types';
import { useScrollFAB } from '../../hooks/useScrollFAB';

export const HomeScreen: React.FC<HomeTabNavProps> = ({ navigation }) => {
  const { isFabVisible, handleScroll } = useScrollFAB();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const allTasks = await TaskService.getTasks();
      setTasks(allTasks);
    } catch (err: any) {
      console.warn('[HomeScreen] Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => {
    if (!t.dateTime) return false;
    return t.dateTime.split('T')[0] === todayStr;
  });

  const completedTodayCount = todayTasks.filter((t) => t.status === TaskStatus.COMPLETED || t.isCompleted).length;
  const totalTodayCount = todayTasks.length;
  const completionPercentage = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = (task.status === TaskStatus.COMPLETED || task.isCompleted) ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus, isCompleted: newStatus === TaskStatus.COMPLETED } : t))
      );
      await TaskService.updateTask(task.id, { status: newStatus });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update task status');
      loadDashboardData();
    }
  };

  const handleSendAiPrompt = () => {
    const prompt = aiPrompt.trim();
    if (!prompt) {
      navigation.navigate('AIAssistant');
      return;
    }
    setAiPrompt('');
    navigation.navigate('AIAssistant', { initialPrompt: prompt });
  };

  return (
    <View style={styles.container}>
      <Header
        title="TaskFlow Home"
        subtitle="Personal AI Planning Assistant"
        rightAction={
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navChip} onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.navChipText}>📋 Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navChip} onPress={() => navigation.navigate('Planner')}>
              <Text style={styles.navChipText}>📅 Planner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navChip} onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.navChipText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Progress Overview Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.greetingText}>Welcome Back! 👋</Text>
              <Text style={styles.progressSubtext}>
                {totalTodayCount === 0
                  ? 'No tasks scheduled for today.'
                  : `${completedTodayCount} of ${totalTodayCount} today's tasks completed`}
              </Text>
            </View>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{completionPercentage}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tasks.filter((t) => t.status === 'PENDING').length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedTodayCount}</Text>
              <Text style={styles.statLabel}>Completed Today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
          </View>
        </View>

        {/* Quick AI Input Bar */}
        <View style={styles.aiInputCard}>
          <View style={styles.aiHeaderRow}>
            <Text style={styles.aiHeaderIcon}>✨</Text>
            <Text style={styles.aiHeaderTitle}>Quick AI Planner</Text>
          </View>
          <Text style={styles.aiHeaderSubtitle}>Ask AI to schedule, plan roadmaps, or look up resources:</Text>
          <View style={styles.aiInputRow}>
            <TextInput
              style={styles.aiTextInput}
              placeholder='e.g. "Remind me to study DSA tomorrow at 7 PM"'
              placeholderTextColor={theme.colors.textSecondary}
              value={aiPrompt}
              onChangeText={setAiPrompt}
              onSubmitEditing={handleSendAiPrompt}
            />
            <TouchableOpacity style={styles.aiSendButton} onPress={handleSendAiPrompt}>
              <Text style={styles.aiSendButtonText}>Ask AI 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Tasks Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📅 Today's Tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks', { filter: 'Today' })}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
        ) : todayTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>All Clear for Today!</Text>
            <Text style={styles.emptySubtext}>No tasks due today. Use AI Assistant to plan your study schedule or work tasks.</Text>
            <TouchableOpacity style={styles.addTodayButton} onPress={() => navigation.navigate('AddTask')}>
              <Text style={styles.addTodayButtonText}>+ Create Task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          todayTasks.slice(0, 5).map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
                onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              >
                <TouchableOpacity
                  style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
                  onPress={() => handleToggleTaskStatus(task)}
                >
                  {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>

                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                    {task.title}
                  </Text>
                  {task.dateTime && (
                    <Text style={styles.taskTime}>
                      ⏰ {new Date(task.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </View>

                {task.priority && (
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          task.priority === 'HIGH' || task.priority === 'URGENT'
                            ? '#FEE2E2'
                            : '#E0E7FF',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityBadgeText,
                        {
                          color:
                            task.priority === 'HIGH' || task.priority === 'URGENT'
                              ? '#DC2626'
                              : '#4F46E5',
                        },
                      ]}
                    >
                      {task.priority}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating AI Button */}
      <FloatingAIButton
        visible={isFabVisible}
        onPress={() => navigation.navigate('AIAssistant')}
        onSendVoicePrompt={(promptText) => navigation.navigate('AIAssistant', { initialPrompt: promptText })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  progressSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  badgeContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: theme.spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  aiInputCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiHeaderIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  aiHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiHeaderSubtitle: {
    fontSize: 12,
    color: '#C7D2FE',
    marginBottom: theme.spacing.md,
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiTextInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.textPrimary,
    marginRight: 8,
  },
  aiSendButton: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  aiSendButtonText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  addTodayButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addTodayButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  taskTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
