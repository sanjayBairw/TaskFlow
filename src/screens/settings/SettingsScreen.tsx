import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Header } from '../../components';
import { theme } from '../../theme';
import { AuthService } from '../../services/authService';
import { ApiService } from '../../services/api';
import { SettingsTabNavProps } from '../../navigation/types';

export const SettingsScreen: React.FC<SettingsTabNavProps> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultReminderTime, setDefaultReminderTime] = useState(15);
  const [autoRescheduleEnabled, setAutoRescheduleEnabled] = useState(true);
  const [rescheduleStrategy, setRescheduleStrategy] = useState<'NEXT DAY' | '12 HOURS' | '24 HOURS'>('NEXT DAY');
  const [isRescheduling, setIsRescheduling] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out of TaskFlow?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AuthService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' as any }],
            });
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Logout failed');
          }
        },
      },
    ]);
  };

  const handleTriggerAutoReschedule = async () => {
    try {
      setIsRescheduling(true);
      const data = await ApiService.post<{ message?: string }>('/ai/reschedule-overdue', { mode: rescheduleStrategy });
      Alert.alert('Auto-Reschedule Complete 🎉', data.message || 'Overdue tasks rescheduled!');
    } catch (err: any) {
      Alert.alert('Reschedule Notice', err.message || 'Unable to connect to backend server.');
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Settings"
        subtitle="Notifications, Reschedule & Preferences"
        rightAction={
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textPrimary }}>🏠 Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
              onPress={() => navigation.navigate('Tasks')}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textPrimary }}>📋 Tasks</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Notifications */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>🔔 Notifications & Alarms</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Task Alarms & Reminders</Text>
              <Text style={styles.settingSubtitle}>Offline local notifications scheduled on device</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#CBD5E1', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Text style={styles.subLabel}>Default Reminder Timing:</Text>
          <View style={styles.chipRow}>
            {[0, 5, 15, 30, 60].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[styles.chip, defaultReminderTime === mins && styles.chipActive]}
                onPress={() => setDefaultReminderTime(mins)}
              >
                <Text style={[styles.chipText, defaultReminderTime === mins && styles.chipTextActive]}>
                  {mins === 0 ? 'At task time' : `${mins}m before`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 2: Auto-Reschedule Engine */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>🔄 Auto-Reschedule Engine</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Auto-Reschedule Overdue Tasks</Text>
              <Text style={styles.settingSubtitle}>Automatically suggest new times for unfinished past tasks</Text>
            </View>
            <Switch
              value={autoRescheduleEnabled}
              onValueChange={setAutoRescheduleEnabled}
              trackColor={{ false: '#CBD5E1', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Text style={styles.subLabel}>Default Reschedule Strategy:</Text>
          <View style={styles.chipRow}>
            {(['NEXT DAY', '12 HOURS', '24 HOURS'] as const).map((strategy) => (
              <TouchableOpacity
                key={strategy}
                style={[styles.chip, rescheduleStrategy === strategy && styles.chipActive]}
                onPress={() => setRescheduleStrategy(strategy)}
              >
                <Text style={[styles.chipText, rescheduleStrategy === strategy && styles.chipTextActive]}>
                  {strategy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.rescheduleNowButton}
            onPress={handleTriggerAutoReschedule}
            disabled={isRescheduling}
          >
            <Text style={styles.rescheduleNowText}>
              {isRescheduling ? 'Rescheduling...' : '⚡ Reschedule Overdue Tasks Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 3: AI Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>✨ AI Engine Preferences</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AI Assistant Engine</Text>
            <Text style={styles.infoValue}>Google Gemini 3.6-Flash</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Search Pipeline Provider</Text>
            <Text style={styles.infoValue}>Grounded Search & Web Lookup</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Default Task Priority</Text>
            <Text style={styles.infoValue}>MEDIUM</Text>
          </View>
        </View>

        {/* Section 4: Account & Logout */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>👤 Account & Security</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out of TaskFlow</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionFooter}>TaskFlow AI v1.0.0 • Mobile Production Ready</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  rescheduleNowButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  rescheduleNowText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginVertical: theme.spacing.md,
  },
});
