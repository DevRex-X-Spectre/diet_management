/**
 * Profile Storage Service
 *
 * Handles persistence of patient profile to AsyncStorage.
 * Used for onboarding progress and final profile storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityLevel,
  Gender,
  HealthCondition,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: '@bigben/profile',
  ONBOARDING_PROGRESS: '@bigben/onboarding_progress',
  AUTH_TOKEN: '@bigben/auth_token',
} as const;

export interface StoredProfile {
  id: string;
  email: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  healthConditions: HealthCondition[];
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  createdAt: string;
}

export interface OnboardingProgress {
  currentStep: 'welcome' | 'auth' | 'personalInfo' | 'conditions' | 'summary';
  email?: string;
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: ActivityLevel;
  healthConditions?: HealthCondition[];
}

/**
 * Save complete patient profile
 */
export async function saveProfile(profile: StoredProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save profile:', error);
    throw error;
  }
}

/**
 * Load saved patient profile
 */
export async function loadProfile(): Promise<StoredProfile | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load profile:', error);
    return null;
  }
}

/**
 * Save onboarding progress (resume if app closes)
 */
export async function saveOnboardingProgress(
  progress: OnboardingProgress
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.ONBOARDING_PROGRESS,
      JSON.stringify(progress)
    );
  } catch (error) {
    console.error('Failed to save onboarding progress:', error);
  }
}

/**
 * Load onboarding progress
 */
export async function loadOnboardingProgress(): Promise<OnboardingProgress | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load onboarding progress:', error);
    return null;
  }
}

/**
 * Clear onboarding progress (after completion)
 */
export async function clearOnboardingProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
  } catch (error) {
    console.error('Failed to clear onboarding progress:', error);
  }
}

/**
 * Save auth token (for cloud sync later)
 */
export async function saveAuthToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
}

/**
 * Get auth token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Generate a unique ID for the patient
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
