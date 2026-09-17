import { Task, User } from '../models';

export interface RootState {
  user: User | null;
  isAuthenticated: boolean;
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export const initialRootState: RootState = {
  user: null,
  isAuthenticated: false,
  tasks: [],
  loading: false,
  error: null,
};

export * from './AuthContext';

