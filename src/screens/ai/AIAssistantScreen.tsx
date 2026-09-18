import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Header } from '../../components';
import { theme } from '../../theme';
import { AIService } from '../../services/aiService';
import { TaskService } from '../../services/taskService';
import { AICommandResponseData, ParsedAITask } from '../../models';
import { AITaskPreviewCard } from './components/AITaskPreviewCard';
import { AIPlanPreviewCard } from './components/AIPlanPreviewCard';
import { AISearchResultCard } from './components/AISearchResultCard';
import { AITaskBreakdownCard } from './components/AITaskBreakdownCard';
import { AIRescheduleProposalCard } from './components/AIRescheduleProposalCard';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';

export type AIAssistantNavProps = StackScreenProps<MainStackParamList, 'AIAssistant'>;

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  data?: AICommandResponseData;
  timestamp: string;
}

const SUGGESTED_COMMANDS = [
  'Tomorrow at 7 PM remind me to study DSA for 2 hours with high priority.',
  'Create a 30 day Flutter learning roadmap.',
  'Search best Flutter resources and tutorials.',
  'Break building an e-commerce app into tasks.',
  'Move unfinished tasks to tomorrow.',
];

export const AIAssistantScreen: React.FC<AIAssistantNavProps> = ({ navigation, route }) => {
  const [inputText, setInputText] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: '✨ Hi! I am TaskFlow AI, your intelligent personal planning assistant.\n\nType or paste any request in natural language:\n• "Remind me tomorrow at 7 PM to study DSA"\n• "Create a 30 day Flutter learning roadmap"\n• "Search YouTube channels for Android development"\n• "Break my project into subtasks"\n• "Move unfinished tasks to tomorrow"',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('🧠 Understanding your request...');

  React.useEffect(() => {
    const initialPrompt = (route?.params as any)?.initialPrompt;
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [route?.params]);
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputText).trim();
    if (!promptToSend || isLoading) return;

    if (!customPrompt) {
      setInputText('');
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const isSearch = /search|youtube|resources|find|tutorials/i.test(promptToSend);
    const isPlan = /roadmap|plan|timetable|schedule|days/i.test(promptToSend);

    if (isSearch) {
      setLoadingStepText('🔎 Searching the web with Gemini...');
    } else if (isPlan) {
      setLoadingStepText('📅 Building your roadmap plan with Gemini...');
    } else {
      setLoadingStepText('🧠 Processing your request with Gemini...');
    }

    try {
      const response = await AIService.sendCommand(promptToSend, activeConversationId);

      if (response.conversationId) {
        setActiveConversationId(response.conversationId);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.message,
        data: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ ${err.message || 'Unable to process command right now.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSingleTask = async (task: ParsedAITask) => {
    try {
      await TaskService.createTask({
        title: task.title,
        description: task.description,
        dateTime: task.dateTime,
        deadline: task.deadline,
        priority: task.priority,
        category: task.category,
        tags: task.tags,
        aiGenerated: true,
        sourceUrl: task.sourceUrl,
        reminderMinutesBefore: task.reminderMinutesBefore,
        reminderEnabled: true,
      });

      Alert.alert('Task Created! ✅', `"${task.title}" has been added to your task list.`);
    } catch (err: any) {
      Alert.alert('Task Creation Error', err.message || 'Failed to create task');
    }
  };

  const handleCreateBatchTasks = async (tasksToCreate: ParsedAITask[]) => {
    try {
      let createdCount = 0;
      for (const task of tasksToCreate) {
        await TaskService.createTask({
          title: task.title,
          description: task.description,
          dateTime: task.dateTime,
          deadline: task.deadline,
          priority: task.priority,
          category: task.category,
          tags: task.tags,
          aiGenerated: true,
          sourceUrl: task.sourceUrl,
          reminderMinutesBefore: task.reminderMinutesBefore,
          reminderEnabled: true,
        });
        createdCount++;
      }
      Alert.alert('Tasks Created! 🎉', `Successfully scheduled ${createdCount} tasks in TaskFlow.`);
    } catch (err: any) {
      Alert.alert('Task Creation Error', err.message || 'Failed to create selected tasks');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    const data = item.data;
    const intent = data?.intent || '';

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>

          {/* Web Search / YouTube Recommendations Card */}
          {data?.sources && data.sources.length > 0 && (intent === 'SEARCH_RESOURCES' || intent === 'SEARCH_YOUTUBE') && (
            <AISearchResultCard sources={data.sources} />
          )}

          {/* Subtask Breakdown Card */}
          {data && intent === 'BREAKDOWN_TASK' && data.tasks && data.tasks.length > 0 && (
            <AITaskBreakdownCard
              tasks={data.tasks}
              onConfirm={handleCreateBatchTasks}
              onCancel={() => Alert.alert('Cancelled', 'Subtask breakdown discarded.')}
            />
          )}

          {/* Reschedule Proposal Card */}
          {data && (intent === 'RESCHEDULE_TASK' || intent === 'RESCHEDULE_MULTIPLE_TASKS') && data.tasks && data.tasks.length > 0 && (
            <AIRescheduleProposalCard
              tasks={data.tasks}
              onApply={handleCreateBatchTasks}
              onCancel={() => Alert.alert('Cancelled', 'Reschedule proposal discarded.')}
            />
          )}

          {/* Single Task Preview Card */}
          {data && intent === 'CREATE_TASK' && data.tasks && data.tasks.length === 1 && (
            <AITaskPreviewCard
              task={data.tasks[0]}
              onConfirm={handleCreateSingleTask}
              onCancel={() => Alert.alert('Cancelled', 'Task creation discarded.')}
            />
          )}

          {/* Multi-Task / Plan / Roadmap Preview Card */}
          {data && (intent === 'CREATE_PLAN' || intent === 'CREATE_ROADMAP' || intent === 'CREATE_TIMETABLE' || (data.tasks && data.tasks.length > 1 && intent !== 'BREAKDOWN_TASK' && intent !== 'RESCHEDULE_TASK' && intent !== 'RESCHEDULE_MULTIPLE_TASKS')) && (
            <AIPlanPreviewCard
              plan={data.plan}
              tasks={data.tasks || []}
              sources={data.sources}
              onConfirmAll={handleCreateBatchTasks}
              onCancel={() => Alert.alert('Cancelled', 'Plan creation discarded.')}
            />
          )}

          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="✨ TaskFlow AI"
        subtitle="Personal Planning Assistant"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Suggested Command Chips */}
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Suggested Prompt Commands:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SUGGESTED_COMMANDS.map((cmd, idx) => (
            <TouchableOpacity
              key={`cmd-${idx}`}
              style={styles.suggestionChip}
              onPress={() => handleSendMessage(cmd)}
            >
              <Text style={styles.suggestionText}>{cmd}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContent}
      />

      {/* Loading Step Bar */}
      {isLoading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingStepText}>{loadingStepText}</Text>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask AI to plan, remind, search, or breakdown..."
          placeholderTextColor={theme.colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  suggestionsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  suggestionChip: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.spacing.borderRadius.full,
    marginRight: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: 11,
    color: theme.colors.primary,
  },
  chatContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '92%',
    borderRadius: theme.spacing.borderRadius.md,
    padding: theme.spacing.md,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
  userText: {
    color: '#FFF',
  },
  aiText: {
    color: theme.colors.textPrimary,
  },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceVariant,
    gap: theme.spacing.xs,
  },
  loadingStepText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'right',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  aiTimestamp: {
    color: theme.colors.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    fontSize: 13,
    color: theme.colors.textPrimary,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
