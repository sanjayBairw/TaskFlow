export const colors = {
  primary: '#4F46E5', // Indigo
  primaryDark: '#4338CA',
  primaryLight: '#818CF8',

  secondary: '#06B6D4', // Cyan
  secondaryDark: '#0891B2',

  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9', // Slate 100

  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  textMuted: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  border: '#E2E8F0', // Slate 200
  borderFocused: '#4F46E5',

  // Status Colors
  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  error: '#EF4444', // Red 500
  info: '#3B82F6', // Blue 500

  // Task Priority Colors
  priority: {
    low: '#10B981', // Green
    medium: '#3B82F6', // Blue
    high: '#F59E0B', // Amber
    urgent: '#EF4444', // Red
  },

  // Task Status Colors
  status: {
    pending: '#64748B',
    inProgress: '#3B82F6',
    completed: '#10B981',
  },
};

export type Colors = typeof colors;
