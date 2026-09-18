import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParamList } from './types';
import {
  HomeScreen,
  TaskListScreen,
  PlannerScreen,
  SettingsScreen,
  AddTaskScreen,
  TaskDetailScreen,
  AIAssistantScreen,
} from '../screens';

const Stack = createStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Tasks" component={TaskListScreen} />
      <Stack.Screen name="Planner" component={PlannerScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
    </Stack.Navigator>
  );
};
