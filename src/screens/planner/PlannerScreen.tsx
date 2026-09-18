import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, FloatingAIButton } from '../../components';
import { theme } from '../../theme';
import { TaskService } from '../../services/taskService';
import { Task } from '../../models';
import { PlannerTabNavProps } from '../../navigation/types';
import { useScrollFAB } from '../../hooks/useScrollFAB';

type PlannerViewMode = 'Day' | 'Week' | 'AI Plans';

export const PlannerScreen: React.FC<PlannerTabNavProps> = ({ navigation }) => {
  const { isFabVisible, handleScroll } = useScrollFAB();
  const [viewMode, setViewMode] = useState<PlannerViewMode>('Day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlannerData = async () => {
    try {
      setIsLoading(true);
      const allTasks = await TaskService.getTasks();
      setTasks(allTasks);
    } catch (err) {
      console.warn('[PlannerScreen] Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlannerData();
    }, [])
  );

  // Generate 7 days starting from today for Week view
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  const dayTasks = tasks.filter((t) => {
    if (!t.dateTime) return false;
    return t.dateTime.split('T')[0] === selectedDateStr;
  });

  const aiGeneratedTasks = tasks.filter((t) => t.aiGenerated);

  return (
    <View style={styles.container}>
      <Header
        title="Schedule Planner"
        subtitle="Day, Week & AI Multi-Day Roadmaps"
        rightAction={
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navChip} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.navChipText}>🏠 Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navChip} onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.navChipText}>📋 Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navChip} onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.navChipText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Mode Selector Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, viewMode === 'Day' && styles.activeTabButton]}
          onPress={() => setViewMode('Day')}
        >
          <Text style={[styles.tabText, viewMode === 'Day' && styles.activeTabText]}>☀️ Day View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, viewMode === 'Week' && styles.activeTabButton]}
          onPress={() => setViewMode('Week')}
        >
          <Text style={[styles.tabText, viewMode === 'Week' && styles.activeTabText]}>📅 Week View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, viewMode === 'AI Plans' && styles.activeTabButton]}
          onPress={() => setViewMode('AI Plans')}
        >
          <Text style={[styles.tabText, viewMode === 'AI Plans' && styles.activeTabText]}>✨ AI Plans</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* DAY VIEW */}
        {viewMode === 'Day' && (
          <View>
            {/* Horizontal Date Picker */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePickerScroll}>
              {weekDays.map((d) => {
                const dateStr = d.toISOString().split('T')[0];
                const isSelected = dateStr === selectedDateStr;
                const taskCount = tasks.filter((t) => t.dateTime && t.dateTime.split('T')[0] === dateStr).length;

                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                    onPress={() => setSelectedDate(d)}
                  >
                    <Text style={[styles.dateDayText, isSelected && styles.dateTextSelected]}>
                      {d.toLocaleDateString([], { weekday: 'short' })}
                    </Text>
                    <Text style={[styles.dateNumText, isSelected && styles.dateTextSelected]}>
                      {d.getDate()}
                    </Text>
                    {taskCount > 0 && (
                      <View style={[styles.countBadge, isSelected && styles.countBadgeSelected]}>
                        <Text style={[styles.countBadgeText, isSelected && styles.countTextSelected]}>
                          {taskCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.dayHeaderRow}>
              <Text style={styles.dayTitle}>
                {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.dayCountText}>{dayTasks.length} tasks</Text>
            </View>

            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : dayTasks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>☕</Text>
                <Text style={styles.emptyTitle}>No Tasks Scheduled</Text>
                <Text style={styles.emptySubtext}>You have no tasks scheduled for this day.</Text>
                <TouchableOpacity
                  style={styles.aiPlanPromptButton}
                  onPress={() => navigation.navigate('AIAssistant', { initialPrompt: `Schedule tasks for ${selectedDateStr}` })}
                >
                  <Text style={styles.aiPlanPromptText}>✨ Ask AI to Plan Day</Text>
                </TouchableOpacity>
              </View>
            ) : (
              dayTasks.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.taskTimelineRow}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: t.id })}
                >
                  <View style={styles.timelineTimeColumn}>
                    <Text style={styles.timelineTimeText}>
                      {t.dateTime ? new Date(t.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                    </Text>
                  </View>
                  <View style={styles.timelineCard}>
                    <Text style={styles.timelineTitle}>{t.title}</Text>
                    {t.description ? <Text style={styles.timelineDesc}>{t.description}</Text> : null}
                    <View style={styles.timelineFooter}>
                      <Text style={styles.timelineCategory}>{t.category || 'GENERAL'}</Text>
                      {t.aiGenerated && <Text style={styles.aiTag}>✨ AI</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* WEEK VIEW */}
        {viewMode === 'Week' && (
          <View>
            <Text style={styles.sectionTitle}>7-Day Workload Overview</Text>
            {weekDays.map((d) => {
              const dateStr = d.toISOString().split('T')[0];
              const dayTasksList = tasks.filter((t) => t.dateTime && t.dateTime.split('T')[0] === dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <View key={dateStr} style={[styles.weekDayCard, isToday && styles.weekDayCardToday]}>
                  <View style={styles.weekDayHeader}>
                    <View>
                      <Text style={styles.weekDayName}>
                        {d.toLocaleDateString([], { weekday: 'long' })} {isToday ? '(Today)' : ''}
                      </Text>
                      <Text style={styles.weekDayDate}>
                        {d.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <View style={styles.weekBadge}>
                      <Text style={styles.weekBadgeText}>{dayTasksList.length} Tasks</Text>
                    </View>
                  </View>

                  {dayTasksList.length === 0 ? (
                    <Text style={styles.noTasksText}>No tasks planned</Text>
                  ) : (
                    dayTasksList.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={styles.miniTaskItem}
                        onPress={() => navigation.navigate('TaskDetail', { taskId: t.id })}
                      >
                        <Text style={styles.miniTaskBullet}>•</Text>
                        <Text style={styles.miniTaskTitle}>{t.title}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* AI PLANS VIEW */}
        {viewMode === 'AI Plans' && (
          <View>
            <View style={styles.aiPlanHeroCard}>
              <Text style={styles.aiPlanHeroTitle}>✨ AI Roadmap & Timetable Generator</Text>
              <Text style={styles.aiPlanHeroDesc}>
                Generate structured multi-day study roadmaps, exam revision plans, or project timetables with AI.
              </Text>
              <TouchableOpacity
                style={styles.generatePlanButton}
                onPress={() => navigation.navigate('AIAssistant', { initialPrompt: 'Create a 30 day learning roadmap' })}
              >
                <Text style={styles.generatePlanButtonText}>🚀 Generate New AI Roadmap</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>AI Generated Tasks ({aiGeneratedTasks.length})</Text>

            {aiGeneratedTasks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🤖</Text>
                <Text style={styles.emptyTitle}>No AI Plans Yet</Text>
                <Text style={styles.emptySubtext}>
                  Use the AI Assistant to generate custom roadmaps for Flutter, DSA, exams, or project milestones.
                </Text>
              </View>
            ) : (
              aiGeneratedTasks.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.aiTaskCard}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: t.id })}
                >
                  <View style={styles.aiTaskHeader}>
                    <Text style={styles.aiTaskTitle}>{t.title}</Text>
                    <Text style={styles.aiBadge}>✨ AI Scheduled</Text>
                  </View>
                  {t.description ? <Text style={styles.aiTaskDesc}>{t.description}</Text> : null}
                  <Text style={styles.aiTaskTime}>
                    📅 {new Date(t.dateTime || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating AI Button */}
      <FloatingAIButton
        visible={isFabVisible}
        onPress={() => navigation.navigate('AIAssistant')}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#EEF2FF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  datePickerScroll: {
    marginBottom: theme.spacing.md,
  },
  dateChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 64,
  },
  dateChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateDayText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dateNumText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  countTextSelected: {
    color: '#FFFFFF',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  dayCountText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 10,
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
  aiPlanPromptButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  aiPlanPromptText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  taskTimelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineTimeColumn: {
    width: 70,
    paddingTop: 4,
  },
  timelineTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  timelineDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  timelineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timelineCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiTag: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  weekDayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  weekDayCardToday: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F8FAFC',
  },
  weekDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekDayName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  weekDayDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  weekBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weekBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  noTasksText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  miniTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  miniTaskBullet: {
    color: theme.colors.primary,
    fontSize: 14,
    marginRight: 6,
  },
  miniTaskTitle: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  aiPlanHeroCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  aiPlanHeroTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aiPlanHeroDesc: {
    fontSize: 13,
    color: '#C7D2FE',
    marginBottom: theme.spacing.md,
  },
  generatePlanButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  generatePlanButtonText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 14,
  },
  aiTaskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiTaskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  aiBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  aiTaskDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  aiTaskTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
});
