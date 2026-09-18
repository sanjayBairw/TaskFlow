import { StackScreenProps } from '@react-navigation/stack';

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
  Home: undefined;
  Tasks: { filter?: 'All' | 'Today' | 'Upcoming' | 'Overdue' | 'Completed' } | undefined;
  Planner: undefined;
  Settings: undefined;
  TaskList: undefined;
  AddTask: undefined;
  TaskDetail: { taskId: string };
  AIAssistant: { initialPrompt?: string } | undefined;
};

export type LoginNavProps = StackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterNavProps = StackScreenProps<AuthStackParamList, 'Register'>;

export type HomeTabNavProps = StackScreenProps<MainStackParamList, 'Home'>;
export type TasksTabNavProps = StackScreenProps<MainStackParamList, 'Tasks'>;
export type PlannerTabNavProps = StackScreenProps<MainStackParamList, 'Planner'>;
export type SettingsTabNavProps = StackScreenProps<MainStackParamList, 'Settings'>;
export type TaskListNavProps = StackScreenProps<MainStackParamList, 'Tasks'>;
export type AddTaskNavProps = StackScreenProps<MainStackParamList, 'AddTask'>;
export type TaskDetailNavProps = StackScreenProps<MainStackParamList, 'TaskDetail'>;
export type AIAssistantNavProps = StackScreenProps<MainStackParamList, 'AIAssistant'>;
