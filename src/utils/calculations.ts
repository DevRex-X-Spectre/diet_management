/**
 * Health Calculation Utilities
 *
 * BMI, BMR, TDEE calculations using medically validated formulas.
 * BMR: Mifflin-St Jeor (most accurate for modern populations)
 */

import {
  ActivityLevel,
  ACTIVITY_MULTIPLIERS,
  BMICategory,
  BMI_LABELS,
  Gender,
  HealthCondition,
} from '../types';

/**
 * Calculate BMI (Body Mass Index)
 * Formula: weight (kg) / height (m)²
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Determine BMI category based on WHO standards
 */
export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return 'UNDERWEIGHT';
  if (bmi < 25) return 'NORMAL';
  if (bmi < 30) return 'OVERWEIGHT';
  if (bmi < 35) return 'OBESE_CLASS_1';
  if (bmi < 40) return 'OBESE_CLASS_2';
  return 'OBESE_CLASS_3';
}

export function getBMILabel(category: BMICategory): string {
  return BMI_LABELS[category];
}

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * Male:   (10 × weight) + (6.25 × height) - (5 × age) + 5
 * Female: (10 × weight) + (6.25 × height) - (5 × age) - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'MALE' ? base + 5 : base - 161;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × Activity Multiplier
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Get BMI color based on category
 */
export function getBMIColor(category: BMICategory): string {
  switch (category) {
    case 'UNDERWEIGHT':
      return '#2196F3'; // Blue
    case 'NORMAL':
      return '#4CAF50'; // Green
    case 'OVERWEIGHT':
      return '#FF9800'; // Orange
    case 'OBESE_CLASS_1':
    case 'OBESE_CLASS_2':
    case 'OBESE_CLASS_3':
      return '#F44336'; // Red
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Minimum 6 characters
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Get human-readable list of conditions for display
 */
export function formatConditionsList(conditions: HealthCondition[]): string {
  if (conditions.length === 0) return 'None';
  if (conditions.length === 1) return conditions[0].replace(/_/g, ' ');
  if (conditions.length === 2) {
    return conditions.map((c) => c.replace(/_/g, ' ')).join(' & ');
  }
  return `${conditions.length} conditions`;
}
