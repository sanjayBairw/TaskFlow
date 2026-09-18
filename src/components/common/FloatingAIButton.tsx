import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

export interface FloatingAIButtonProps {
  visible?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({
  visible = true,
  onPress,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const animValue = useRef(new Animated.Value(visible ? 1 : 0)).current;

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
    outputRange: [100, 0],
  });

  const bottomOffset = Math.max(insets.bottom, 16) + 40; // ~50px above safe area bottom

  return (
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 999,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
