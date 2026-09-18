import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { theme } from '../../theme';

export interface VoiceCommandModalProps {
  visible: boolean;
  onClose: () => void;
  onSendPrompt: (prompt: string) => void;
}

const VOICE_SUGGESTIONS = [
  'Remind me to study DSA tomorrow at 7 PM',
  'Create a 7 day Flutter learning roadmap',
  'Search best resources to learn React Native',
  'Break down building an e-commerce app into tasks',
  'Move unfinished tasks to tomorrow',
];

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({
  visible,
  onClose,
  onSendPrompt,
}) => {
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setIsListening(true);
      setTranscript('');

      // Pulse ring animation for mic
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    }
  }, [visible, pulseAnim]);

  const handleSelectSuggestion = (promptText: string) => {
    setTranscript(promptText);
    setIsListening(false);
  };

  const handleSend = () => {
    const textToSend = transcript.trim() || 'Tomorrow at 7 PM remind me to study DSA for 2 hours';
    onClose();
    onSendPrompt(textToSend);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎙️ AI Voice Dictation</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Animated Mic Listening Visualizer */}
          <View style={styles.visualizerContainer}>
            <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
            <TouchableOpacity
              style={[styles.micCircle, isListening ? styles.micCircleActive : null]}
              onPress={() => setIsListening(!isListening)}
            >
              <Text style={styles.micIcon}>🎙️</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.listeningStatus}>
            {isListening ? '⚡ Listening for your task prompt...' : '✅ Voice prompt captured'}
          </Text>

          {/* Transcript Box */}
          <View style={styles.transcriptCard}>
            <Text style={styles.transcriptLabel}>Transcribed Voice Prompt:</Text>
            <TextInput
              style={styles.transcriptInput}
              value={transcript}
              onChangeText={setTranscript}
              placeholder='e.g. "Remind me to study DSA tomorrow at 7 PM"'
              placeholderTextColor={theme.colors.textMuted}
              multiline
            />
          </View>

          {/* Voice Prompt Chips */}
          <Text style={styles.suggestionsLabel}>Tap Quick Voice Prompts:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {VOICE_SUGGESTIONS.map((sug, idx) => (
              <TouchableOpacity
                key={`sug-${idx}`}
                style={styles.suggestionChip}
                onPress={() => handleSelectSuggestion(sug)}
              >
                <Text style={styles.suggestionText}>🗣️ {sug}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sendButton, !transcript.trim() && !isListening ? null : null]}
              onPress={handleSend}
            >
              <Text style={styles.sendButtonText}>🚀 Send to AI Assistant</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing.lg,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  visualizerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
    height: 100,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
  },
  micCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  micCircleActive: {
    backgroundColor: '#4338CA',
  },
  micIcon: {
    fontSize: 28,
  },
  listeningStatus: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  transcriptCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.md,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  transcriptInput: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  chipsScroll: {
    marginBottom: theme.spacing.lg,
  },
  suggestionChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  suggestionText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  sendButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
