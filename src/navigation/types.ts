import { StackScreenProps } from '@react-navigation/stack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
  TaskDetail: { taskId: string };
  AIAssistant: undefined;
};

export type LoginNavProps = StackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterNavProps = StackScreenProps<AuthStackParamList, 'Register'>;

export type TaskListNavProps = StackScreenProps<MainStackParamList, 'TaskList'>;
export type AddTaskNavProps = StackScreenProps<MainStackParamList, 'AddTask'>;
export type TaskDetailNavProps = StackScreenProps<MainStackParamList, 'TaskDetail'>;
export type AIAssistantNavProps = StackScreenProps<MainStackParamList, 'AIAssistant'>;

