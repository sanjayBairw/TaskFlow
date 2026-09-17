import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CustomButton, CustomInput, Header } from '../../components';
import { theme } from '../../theme';
import { useAuth } from '../../store';
import { LoginNavProps } from '../../navigation/types';

export interface LoginScreenProps extends Partial<LoginNavProps> {
  onNavigateRegister?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  navigation,
  onNavigateRegister,
}) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError('Email address is required');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await login(email.trim(), password);
      if (!success) {
        setGeneralError('Invalid email or password');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during login';
      setGeneralError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    } else if (onNavigateRegister) {
      onNavigateRegister();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="TaskFlow" subtitle="Sign in to manage your tasks" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subheading}>Enter your credentials to continue</Text>

          {Boolean(generalError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          )}

          <CustomInput
            label="Email Address"
            placeholder="user@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
          />

          <CustomInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            showPasswordToggle
            error={passwordError}
          />

          <CustomButton
            title="Sign In"
            variant="primary"
            loading={isLoading || isSubmitting}
            style={styles.button}
            onPress={handleLogin}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <CustomButton
            title="Don't have an account? Register"
            variant="outline"
            style={styles.secondaryButton}
            onPress={handleNavigateToRegister}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heading: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subheading: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '15',
    borderColor: theme.colors.error,
    borderWidth: 1,
    borderRadius: theme.spacing.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  generalErrorText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginHorizontal: theme.spacing.sm,
    fontWeight: theme.typography.weights.medium,
  },
  secondaryButton: {
    marginTop: theme.spacing.xs,
  },
});
