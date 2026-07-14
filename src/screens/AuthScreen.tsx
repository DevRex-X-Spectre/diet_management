import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ProgressIndicator } from '../components/ProgressIndicator';
import {
  loadProfile,
  loginLocalAccount,
  registerLocalAccount,
  saveAuthToken,
  saveOnboardingProgress,
} from '../services/storage';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../types';
import { isValidEmail, isValidPassword } from '../utils/calculations';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;
type AuthRouteProp = RouteProp<RootStackParamList, 'Auth'>;

export function AuthScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<AuthRouteProp>();

  const initialMode = route.params?.mode ?? 'register';
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const validate = (): boolean => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setFormError('');

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email');
      valid = false;
    }

    if (!isValidPassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    if (isRegister && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (isRegister) {
        const result = await registerLocalAccount(normalizedEmail, password);
        if (!result.ok) {
          setEmailError(result.error);
          return;
        }

        await saveAuthToken(`local-token-${normalizedEmail}-${Date.now()}`);
        await saveOnboardingProgress({
          currentStep: 'personalInfo',
          email: normalizedEmail,
        });
        navigation.navigate('PersonalInfo');
        return;
      }

      const result = await loginLocalAccount(normalizedEmail, password);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      await saveAuthToken(`local-token-${normalizedEmail}-${Date.now()}`);
      const savedProfile = await loadProfile();

      if (savedProfile?.email === normalizedEmail) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return;
      }

      navigation.navigate('PersonalInfo');
    } catch (error) {
      console.error('Auth error:', error);
      setFormError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'register' ? 'login' : 'register');
    setConfirmPassword('');
    setEmailError('');
    setPasswordError('');
    setFormError('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressIndicator currentStep={1} totalSteps={4} />

          <View style={styles.header}>
            <Text style={styles.title}>
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isRegister
                ? 'Start your healthy eating journey'
                : 'Sign in to continue'}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
              iconName="mail"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              error={passwordError}
              iconName="lock"
            />

            {isRegister && (
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                secureTextEntry
                iconName="lock"
              />
            )}

            <Button
              title={isRegister ? 'Create Account' : 'Sign In'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />

            {formError && <Text style={styles.formError}>{formError}</Text>}

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isRegister
                  ? 'Already have an account?'
                  : "Don't have an account?"}
              </Text>
              <Text style={styles.toggleLink} onPress={toggleMode}>
                {isRegister ? 'Sign In' : 'Register'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGreen,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.black,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  form: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  formError: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  toggleText: {
    ...typography.body,
    color: colors.gray,
  },
  toggleLink: {
    ...typography.body,
    color: colors.darkGreen,
    fontWeight: '700',
  },
});
