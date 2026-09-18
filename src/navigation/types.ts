import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  AIAssistant: { initialPrompt?: string } | undefined;
  Tasks: { filter?: 'All' | 'Today' | 'Upcoming' | 'Overdue' | 'Completed' } | undefined;
  Planner: undefined;
  Settings: undefined;
};

export type MainStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  TaskList: undefined;
  AddTask: undefined;
  TaskDetail: { taskId: string };
  AIAssistant: { initialPrompt?: string } | undefined;
};

export type LoginNavProps = StackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterNavProps = StackScreenProps<AuthStackParamList, 'Register'>;

export type HomeTabNavProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  StackScreenProps<MainStackParamList>
>;

export type AIAssistantTabNavProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'AIAssistant'>,
  StackScreenProps<MainStackParamList>
>;

export type TasksTabNavProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Tasks'>,
  StackScreenProps<MainStackParamList>
>;

export type PlannerTabNavProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Planner'>,
  StackScreenProps<MainStackParamList>
>;

export type SettingsTabNavProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Settings'>,
  StackScreenProps<MainStackParamList>
>;

export type TaskListNavProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Tasks'>,
  StackScreenProps<MainStackParamList>
>;

export type AddTaskNavProps = StackScreenProps<MainStackParamList, 'AddTask'>;
export type TaskDetailNavProps = StackScreenProps<MainStackParamList, 'TaskDetail'>;
export type AIAssistantNavProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'AIAssistant'>,
  StackScreenProps<MainStackParamList>
>;
