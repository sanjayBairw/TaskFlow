import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { VoiceCommandModal } from './VoiceCommandModal';

export interface FloatingAIButtonProps {
  visible?: boolean;
  onPress: () => void;
  onSendVoicePrompt?: (prompt: string) => void;
  style?: ViewStyle;
}

export const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({
  visible = true,
  onPress,
  onSendVoicePrompt,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const animValue = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, animValue]);

  const opacity = animValue;
  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 0],
  });

  const bottomOffset = Math.max(insets.bottom, 16) + 40; // ~50px above safe area bottom

  const handleVoiceSend = (promptText: string) => {
    setIsVoiceModalVisible(false);
    if (onSendVoicePrompt) {
      onSendVoicePrompt(promptText);
    }
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            bottom: bottomOffset,
            opacity,
            transform: [{ translateX }],
          },
          style,
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <View style={styles.widgetGroup}>
          {/* Voice Mic Button */}
          <TouchableOpacity
            style={styles.micButton}
            onPress={() => setIsVoiceModalVisible(true)}
            activeOpacity={0.85}
            accessibilityLabel="Voice to text AI command"
            accessibilityRole="button"
          >
            <Text style={styles.micIcon}>🎙️</Text>
          </TouchableOpacity>

          {/* AI Task Chat Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onPress}
            activeOpacity={0.85}
            accessibilityLabel="Open AI Assistant"
            accessibilityRole="button"
          >
            <Text style={styles.icon}>✨</Text>
            <Text style={styles.label}>TaskFlow AI</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Voice Dictation Modal */}
      <VoiceCommandModal
        visible={isVoiceModalVisible}
        onClose={() => setIsVoiceModalVisible(false)}
        onSendPrompt={handleVoiceSend}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 18,
    zIndex: 999,
  },
  widgetGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: '#EEF2FF',
  },
  micIcon: {
    fontSize: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 30,
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    gap: 6,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
