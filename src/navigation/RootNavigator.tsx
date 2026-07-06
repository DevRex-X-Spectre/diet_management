import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  getAuthToken,
  getCurrentUserEmail,
  loadOnboardingProgress,
  loadProfile,
} from '../services/storage';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../types';
import { AuthScreen } from '../screens/AuthScreen';
import { HealthConditionsScreen } from '../screens/HealthConditionsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PersonalInfoScreen } from '../screens/PersonalInfoScreen';
import { ProfileSummaryScreen } from '../screens/ProfileSummaryScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

type BootstrapRoute =
  | { name: 'Welcome' }
  | { name: 'PersonalInfo' }
  | { name: 'HealthConditions'; params: RootStackParamList['HealthConditions'] }
  | { name: 'ProfileSummary'; params: RootStackParamList['ProfileSummary'] }
  | { name: 'Home' };

function hasHealthConditionsParams(
  progress: Awaited<ReturnType<typeof loadOnboardingProgress>>
): progress is NonNullable<typeof progress> & RootStackParamList['HealthConditions'] {
  return Boolean(
    progress?.age &&
    progress.gender &&
    progress.heightCm &&
    progress.weightKg &&
    progress.activityLevel
  );
}

function hasProfileSummaryParams(
  progress: Awaited<ReturnType<typeof loadOnboardingProgress>>
): progress is NonNullable<typeof progress> & RootStackParamList['ProfileSummary'] {
  return hasHealthConditionsParams(progress) && Array.isArray(progress.healthConditions);
}

async function getBootstrapRoute(): Promise<BootstrapRoute> {
  const [token, currentEmail, profile, progress] = await Promise.all([
    getAuthToken(),
    getCurrentUserEmail(),
    loadProfile(),
    loadOnboardingProgress(),
  ]);

  if (!token) {
    return { name: 'Welcome' };
  }

  const sessionEmail = currentEmail ?? profile?.email;

  if (profile && (!sessionEmail || profile.email === sessionEmail)) {
    return { name: 'Home' };
  }

  if (progress?.currentStep === 'summary' && hasProfileSummaryParams(progress)) {
    return {
      name: 'ProfileSummary',
      params: {
        age: progress.age,
        gender: progress.gender,
        heightCm: progress.heightCm,
        weightKg: progress.weightKg,
        activityLevel: progress.activityLevel,
        healthConditions: progress.healthConditions,
      },
    };
  }

  if (progress?.currentStep === 'conditions' && hasHealthConditionsParams(progress)) {
    return {
      name: 'HealthConditions',
      params: {
        age: progress.age,
        gender: progress.gender,
        heightCm: progress.heightCm,
        weightKg: progress.weightKg,
        activityLevel: progress.activityLevel,
      },
    };
  }

  return { name: 'PersonalInfo' };
}

/**
 * Root stack navigator for the onboarding flow.
 * Light green background throughout, no header (custom navigation).
 */
export function RootNavigator() {
  const [bootstrapRoute, setBootstrapRoute] = useState<BootstrapRoute | null>(null);

  useEffect(() => {
    let mounted = true;

    getBootstrapRoute()
      .then((route) => {
        if (mounted) {
          setBootstrapRoute(route);
        }
      })
      .catch((error) => {
        console.error('Failed to restore session:', error);
        if (mounted) {
          setBootstrapRoute({ name: 'Welcome' });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!bootstrapRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.darkGreen} />
        <Text style={styles.loadingText}>Opening MealWise...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={bootstrapRoute.name}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.lightGreen },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen
          name="HealthConditions"
          component={HealthConditionsScreen}
          initialParams={
            bootstrapRoute.name === 'HealthConditions' ? bootstrapRoute.params : undefined
          }
        />
        <Stack.Screen
          name="ProfileSummary"
          component={ProfileSummaryScreen}
          initialParams={
            bootstrapRoute.name === 'ProfileSummary' ? bootstrapRoute.params : undefined
          }
        />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.lightGreen,
  },
  loadingText: {
    ...typography.body,
    color: colors.gray,
  },
});
