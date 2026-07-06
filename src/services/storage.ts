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
  LOCAL_AUTH_ACCOUNTS: '@bigben/local_auth_accounts',
  CURRENT_USER_EMAIL: '@bigben/current_user_email',
} as const;

export interface LocalAuthAccount {
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function loadLocalAuthAccounts(): Promise<LocalAuthAccount[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_AUTH_ACCOUNTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load local auth accounts:', error);
    return [];
  }
}

async function saveLocalAuthAccounts(accounts: LocalAuthAccount[]): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.LOCAL_AUTH_ACCOUNTS,
    JSON.stringify(accounts)
  );
}

/**
 * Save a temporary local-only auth account on this phone.
 * This is intentionally simple until real backend auth is added.
 */
export async function registerLocalAccount(
  email: string,
  password: string
): Promise<{ ok: true; account: LocalAuthAccount } | { ok: false; error: string }> {
  const normalizedEmail = normalizeEmail(email);
  const accounts = await loadLocalAuthAccounts();
  const existingAccount = accounts.find((account) => account.email === normalizedEmail);

  if (existingAccount) {
    return { ok: false, error: 'An account already exists on this phone. Please sign in.' };
  }

  const now = new Date().toISOString();
  const account: LocalAuthAccount = {
    email: normalizedEmail,
    password,
    createdAt: now,
    updatedAt: now,
  };

  await saveLocalAuthAccounts([...accounts, account]);
  await setCurrentUserEmail(normalizedEmail);
  return { ok: true, account };
}

/**
 * Check a temporary local-only auth account saved on this phone.
 */
export async function loginLocalAccount(
  email: string,
  password: string
): Promise<{ ok: true; account: LocalAuthAccount } | { ok: false; error: string }> {
  const normalizedEmail = normalizeEmail(email);
  const accounts = await loadLocalAuthAccounts();
  const account = accounts.find((item) => item.email === normalizedEmail);

  if (!account || account.password !== password) {
    return { ok: false, error: 'Invalid email or password for this phone.' };
  }

  await setCurrentUserEmail(normalizedEmail);
  return { ok: true, account };
}

export async function setCurrentUserEmail(email: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_EMAIL, normalizeEmail(email));
}

export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
  } catch (error) {
    console.error('Failed to get current user email:', error);
    return null;
  }
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

export async function clearAuthSession(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.CURRENT_USER_EMAIL,
    ]);
  } catch (error) {
    console.error('Failed to clear auth session:', error);
  }
}

/**
 * Generate a unique ID for the patient
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
