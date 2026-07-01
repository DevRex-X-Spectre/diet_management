/**
 * BigBen Type Definitions
 *
 * Central type definitions for the patient profile,
 * recommendation engine, and onboarding flow.
 */

// ============================================================================
// Health Conditions
// ============================================================================

export type HealthCondition =
  | 'TYPE_1_DIABETES'
  | 'TYPE_2_DIABETES'
  | 'HYPERTENSION'
  | 'OBESITY';

export const HEALTH_CONDITION_LABELS: Record<HealthCondition, string> = {
  TYPE_1_DIABETES: 'Type 1 Diabetes',
  TYPE_2_DIABETES: 'Type 2 Diabetes',
  HYPERTENSION: 'Hypertension',
  OBESITY: 'Obesity',
};

export const HEALTH_CONDITION_DESCRIPTIONS: Record<HealthCondition, string> = {
  TYPE_1_DIABETES: 'Insulin-dependent - requires carb monitoring',
  TYPE_2_DIABETES: 'Insulin resistance - diet-managed',
  HYPERTENSION: 'High blood pressure - low sodium needed',
  OBESITY: 'Eat appropriately for your condition',
};

export const HEALTH_CONDITION_ICONS: Record<HealthCondition, string> = {
  TYPE_1_DIABETES: '💉',
  TYPE_2_DIABETES: '🩺',
  HYPERTENSION: '❤️',
  OBESITY: '⚖️',
};

// ============================================================================
// Gender
// ============================================================================

export type Gender = 'MALE' | 'FEMALE';

// ============================================================================
// Activity Level
// ============================================================================

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHT'
  | 'MODERATE'
  | 'ACTIVE';

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: 'Sedentary',
  LIGHT: 'Light',
  MODERATE: 'Moderate',
  ACTIVE: 'Active',
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  SEDENTARY: 'Little or no exercise, desk job',
  LIGHT: 'Light exercise 1-3 days/week',
  MODERATE: 'Moderate exercise 3-5 days/week',
  ACTIVE: 'Hard exercise 6-7 days/week',
};

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
};

// ============================================================================
// Patient Profile
// ============================================================================

export interface PatientProfile {
  id: string;
  email: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  healthConditions: HealthCondition[];

  // Calculated fields
  bmi: number;
  bmiCategory: BMICategory;
  bmr: number;
  tdee: number;
}

// ============================================================================
// BMI Categories
// ============================================================================

export type BMICategory =
  | 'UNDERWEIGHT'
  | 'NORMAL'
  | 'OVERWEIGHT'
  | 'OBESE_CLASS_1'
  | 'OBESE_CLASS_2'
  | 'OBESE_CLASS_3';

export const BMI_LABELS: Record<BMICategory, string> = {
  UNDERWEIGHT: 'Underweight',
  NORMAL: 'Normal',
  OVERWEIGHT: 'Overweight',
  OBESE_CLASS_1: 'Obese (Class I)',
  OBESE_CLASS_2: 'Obese (Class II)',
  OBESE_CLASS_3: 'Obese (Class III)',
};

// ============================================================================
// Navigation
// ============================================================================

export type RootStackParamList = {
  Welcome: undefined;
  Auth: { mode: 'register' | 'login' } | undefined;
  PersonalInfo: undefined;
  HealthConditions: {
    age: number;
    gender: Gender;
    heightCm: number;
    weightKg: number;
    activityLevel: ActivityLevel;
  };
  ProfileSummary: {
    age: number;
    gender: Gender;
    heightCm: number;
    weightKg: number;
    activityLevel: ActivityLevel;
    healthConditions: HealthCondition[];
  };
  Home: undefined;
};
