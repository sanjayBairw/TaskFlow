import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '../../models';
import { CustomButton, Header, TaskCard } from '../../components';
import { theme } from '../../theme';
import { useAuth } from '../../store';
import { TaskService } from '../../services/taskService';
import { TaskListNavProps } from '../../navigation/types';

export interface TaskListScreenProps extends Partial<TaskListNavProps> {
  onNavigateAddTask?: () => void;
  onNavigateTaskDetail?: (taskId: string) => void;
  onNavigateAIAssistant?: () => void;
}

type SortOption =
  | 'NEWEST'
  | 'OLDEST'
  | 'DEADLINE_SOONEST'
  | 'DEADLINE_LATEST'
  | 'PRIORITY_HIGHEST'
  | 'PRIORITY_LOWEST';

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  [TaskPriority.URGENT]: 4,
  [TaskPriority.HIGH]: 3,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.LOW]: 1,
};

export const TaskListScreen: React.FC<TaskListScreenProps> = ({
  navigation,
  onNavigateAddTask,
  onNavigateTaskDetail,
  onNavigateAIAssistant,
}) => {
  const { logout, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search, Filter, Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const fetchTasks = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setErrorMsg(null);
    try {
      const data = await TaskService.getTasks();
      setTasks(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to connect to server. Please make sure the TaskFlow backend is running.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks(true);
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTasks(false);
  };

  const handleToggleComplete = async (targetTask: Task) => {
    const nextStatus = targetTask.isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === targetTask.id
          ? {
              ...t,
              isCompleted: nextStatus === TaskStatus.COMPLETED,
              status: nextStatus,
            }
          : t
      )
    );

    try {
      await TaskService.updateTaskStatus(targetTask.id, nextStatus);
    } catch (err) {
      Alert.alert('Update Failed', err instanceof Error ? err.message : 'Failed to update task status');
      fetchTasks(false);
    }
  };

  const handleDeleteTask = (targetTask: Task) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TaskService.deleteTask(targetTask.id);
              setTasks((prev) => prev.filter((t) => t.id !== targetTask.id));
            } catch (err) {
              Alert.alert('Delete Failed', err instanceof Error ? err.message : 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handlePressAddTask = () => {
    if (navigation) {
      navigation.navigate('AddTask');
    } else if (onNavigateAddTask) {
      onNavigateAddTask();
    }
  };

  const handlePressTaskDetail = (id: string) => {
    if (navigation) {
      navigation.navigate('TaskDetail', { taskId: id });
    } else if (onNavigateTaskDetail) {
      onNavigateTaskDetail(id);
    }
  };

  const handlePressAIAssistant = () => {
    if (navigation) {
      navigation.navigate('AIAssistant');
    } else if (onNavigateAIAssistant) {
      onNavigateAIAssistant();
    }
  };

  const isFilterActive =
    searchQuery.trim() !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    sortBy !== 'NEWEST';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
    setSortBy('NEWEST');
  };

  // Local Statistics calculation
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === TaskStatus.PENDING).length;
    const inProgress = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
    const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    return { total, pending, inProgress, completed };
  }, [tasks]);

  // Derived filtered & sorted task list
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const descMatch = t.description ? t.description.toLowerCase().includes(q) : false;
        const catMatch = t.category ? t.category.toLowerCase().includes(q) : false;
        const tagMatch = t.tags ? t.tags.some((tag) => tag.toLowerCase().includes(q)) : false;
        return titleMatch || descMatch || catMatch || tagMatch;
      });
    }

    // 2. Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // 3. Priority filter
    if (priorityFilter !== 'ALL') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // 4. Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'OLDEST':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'DEADLINE_SOONEST':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'DEADLINE_LATEST':
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        case 'PRIORITY_HIGHEST':
          return (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0);
        case 'PRIORITY_LOWEST':
          return (PRIORITY_WEIGHTS[a.priority] || 0) - (PRIORITY_WEIGHTS[b.priority] || 0);
        case 'NEWEST':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  const greetingSubtitle = user?.name
    ? `Welcome ${user.name} • ${stats.pending} pending`
    : `${stats.pending} pending tasks`;

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'NEWEST':
        return 'Newest Created';
      case 'OLDEST':
        return 'Oldest Created';
      case 'DEADLINE_SOONEST':
        return 'Deadline Soonest';
      case 'DEADLINE_LATEST':
        return 'Deadline Latest';
      case 'PRIORITY_HIGHEST':
        return 'Priority Highest';
      case 'PRIORITY_LOWEST':
        return 'Priority Lowest';
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="TaskFlow"
        subtitle={greetingSubtitle}
        rightAction={
          <View style={styles.headerActions}>
            <CustomButton
              title="✨ AI"
              size="sm"
              onPress={handlePressAIAssistant}
            />
            <CustomButton
              title="+ New"
              size="sm"
              onPress={handlePressAddTask}
            />
            <CustomButton
              title="Logout"
              variant="outline"
              size="sm"
              onPress={logout}
            />
          </View>
        }
      />

      {/* Task Statistics Summary Bar */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: theme.colors.status.pending }]}>
            {stats.pending}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: theme.colors.status.inProgress }]}>
            {stats.inProgress}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: theme.colors.status.completed }]}>
            {stats.completed}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Search & Filter Controls */}
      <View style={styles.filterSection}>
        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks by title, desc, tag, category..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips Scroll View */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Status:</Text>
            {['ALL', TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED].map((st) => (
              <TouchableOpacity
                key={`st-${st}`}
                style={[styles.filterChip, statusFilter === st && styles.filterChipActive]}
                onPress={() => setStatusFilter(st)}
              >
                <Text style={[styles.filterChipText, statusFilter === st && styles.filterChipTextActive]}>
                  {st === 'ALL' ? 'All Status' : st === 'IN_PROGRESS' ? 'In Progress' : st.charAt(0) + st.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Priority:</Text>
            {['ALL', TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT].map((pr) => (
              <TouchableOpacity
                key={`pr-${pr}`}
                style={[styles.filterChip, priorityFilter === pr && styles.filterChipActive]}
                onPress={() => setPriorityFilter(pr)}
              >
                <Text style={[styles.filterChipText, priorityFilter === pr && styles.filterChipTextActive]}>
                  {pr === 'ALL' ? 'All Priority' : pr.charAt(0) + pr.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Category:</Text>
            {['ALL', TaskCategory.PERSONAL, TaskCategory.WORK, TaskCategory.STUDY, TaskCategory.SHOPPING, TaskCategory.OTHER].map((cat) => (
              <TouchableOpacity
                key={`cat-${cat}`}
                style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
                onPress={() => setCategoryFilter(cat)}
              >
                <Text style={[styles.filterChipText, categoryFilter === cat && styles.filterChipTextActive]}>
                  {cat === 'ALL' ? 'All Category' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Sort Controls Bar & Reset Filters */}
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortDropdown(!showSortDropdown)}
          >
            <Text style={styles.sortButtonText}>Sort: {getSortLabel(sortBy)} ▾</Text>
          </TouchableOpacity>

          {isFilterActive && (
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Options Modal / Options List */}
        {showSortDropdown && (
          <View style={styles.sortMenu}>
            {(
              [
                'NEWEST',
                'OLDEST',
                'DEADLINE_SOONEST',
                'DEADLINE_LATEST',
                'PRIORITY_HIGHEST',
                'PRIORITY_LOWEST',
              ] as SortOption[]
            ).map((opt) => (
              <TouchableOpacity
                key={`sort-${opt}`}
                style={[styles.sortMenuItem, sortBy === opt && styles.sortMenuItemSelected]}
                onPress={() => {
                  setSortBy(opt);
                  setShowSortDropdown(false);
                }}
              >
                <Text style={[styles.sortMenuText, sortBy === opt && styles.sortMenuTextSelected]}>
                  {getSortLabel(opt)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Main Task List / States */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Failed to load tasks</Text>
          <Text style={styles.errorSubtitle}>{errorMsg}</Text>
          <CustomButton
            title="Retry"
            size="sm"
            style={styles.retryButton}
            onPress={() => fetchTasks(true)}
          />
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {tasks.length === 0 ? (
                <>
                  <Text style={styles.emptyTitle}>No tasks yet</Text>
                  <Text style={styles.emptySubtitle}>Create your first task to get started.</Text>
                </>
              ) : (
                <>
                  <Text style={styles.emptyTitle}>No matching tasks</Text>
                  <Text style={styles.emptySubtitle}>Try changing your search or filters.</Text>
                  <CustomButton
                    title="Clear Filters"
                    variant="outline"
                    size="sm"
                    style={{ marginTop: theme.spacing.md }}
                    onPress={resetFilters}
                  />
                </>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              onPress={() => handlePressTaskDetail(item.id)}
            />
          )}
        />
      )}

      {/* Floating AI Assistant Action Button */}
      <TouchableOpacity
        style={styles.floatingAiButton}
        onPress={handlePressAIAssistant}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingAiButtonText}>✨ TaskFlow AI</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  floatingAiButton: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.spacing.borderRadius.full,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  floatingAiButtonText: {
    color: '#FFF',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: theme.colors.border,
  },
  filterSection: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    height: 40,
    marginBottom: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  filterScrollView: {
    marginBottom: theme.spacing.xs,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    gap: 4,
  },
  filterGroupLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginRight: 4,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.spacing.borderRadius.full,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
  },
  filterChipTextActive: {
    color: theme.colors.textInverse,
    fontWeight: 'bold',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  sortButton: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.xs,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  resetButton: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.xs,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.error,
  },
  sortMenu: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  sortMenuItem: {
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.spacing.borderRadius.sm,
  },
  sortMenuItemSelected: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  sortMenuText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  sortMenuTextSelected: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
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
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    minWidth: 100,
  },
  emptyContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
