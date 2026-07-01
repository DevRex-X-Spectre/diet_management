import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { colors } from '../theme';
import type { RootStackParamList } from '../types';
import { AuthScreen } from '../screens/AuthScreen';
import { HealthConditionsScreen } from '../screens/HealthConditionsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PersonalInfoScreen } from '../screens/PersonalInfoScreen';
import { ProfileSummaryScreen } from '../screens/ProfileSummaryScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root stack navigator for the onboarding flow.
 * Light green background throughout, no header (custom navigation).
 */
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
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
        />
        <Stack.Screen name="ProfileSummary" component={ProfileSummaryScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
