/**
 * Food Types for Recommendation Engine
 *
 * Defines the data structures for Nigerian foods,
 * nutritional information, and recommendation outputs.
 */

import type { HealthCondition } from './index';

// ============================================================================
// Food Categories
// ============================================================================

export type FoodCategory =
  | 'PROTEIN'    // Fish, chicken, eggs, beans
  | 'VEGETABLE'  // Efo riro, ugu, okra
  | 'GRAIN'      // Brown rice, oats, whole wheat
  | 'FRUIT'      // Berries, apples, citrus
  | 'DAIRY'      // Greek yogurt, low-fat milk
  | 'SOUP'       // Egusi, okra soup, efo riro
  | 'SWALLOW'    // Eba, fufu, amala, pounded yam
  | 'BEVERAGE';  // Water, zobo (no sugar)

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  PROTEIN: 'Protein',
  VEGETABLE: 'Vegetable',
  GRAIN: 'Grain',
  FRUIT: 'Fruit',
  DAIRY: 'Dairy',
  SOUP: 'Soup',
  SWALLOW: 'Swallow',
  BEVERAGE: 'Beverage',
};

export const FOOD_CATEGORY_EMOJIS: Record<FoodCategory, string> = {
  PROTEIN: '🍗',
  VEGETABLE: '🥬',
  GRAIN: '🍚',
  FRUIT: '🍎',
  DAIRY: '🥛',
  SOUP: '🥣',
  SWALLOW: '🍲',
  BEVERAGE: '🥤',
};

// ============================================================================
// Nutritional Information
// ============================================================================

export interface NutritionalInfo {
  calories: number;     // per serving
  protein: number;      // grams
  carbohydrates: number; // grams
  fat: number;          // grams
  fiber: number;        // grams
  sugar: number;        // grams
  sodium: number;       // mg
}

// ============================================================================
// Food Item
// ============================================================================

export interface Food {
  id: string;
  name: string;
  localName?: string;           // Nigerian name, e.g., "Eba" for garri
  category: FoodCategory;
  emoji: string;                // 🍗 🐟 🥦
  servingSize: string;          // "100g", "1 cup", "1 medium"
  nutrition: NutritionalInfo;
  glycemicIndex?: number;       // For diabetes (0 = negligible carbs)
  safeFor: HealthCondition[];   // Always safe for these conditions
  cautionFor: HealthCondition[]; // Use with care for these
  avoidFor: HealthCondition[];  // Never recommend for these
  description?: string;         // "Rich in omega-3 fatty acids"
}

// ============================================================================
// Recommendation Output
// ============================================================================

export interface RecommendedFood {
  food: Food;
  score: number;        // 0-100, higher is better
  reasons: string[];   // Why this food is recommended
  warnings: string[];   // Any caution flags
}

// ============================================================================
// Score Categories
// ============================================================================

export type ScoreCategory = 'excellent' | 'good' | 'moderate' | 'caution';

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'moderate';
  return 'caution';
}

export function getScoreColor(score: number): string {
  const category = getScoreCategory(score);
  switch (category) {
    case 'excellent':
      return '#1B5E20'; // Deep green
    case 'good':
      return '#2E7D32'; // Dark green
    case 'moderate':
      return '#FF9800'; // Orange
    case 'caution':
      return '#F44336'; // Red
  }
}

export function getScoreLabel(score: number): string {
  const category = getScoreCategory(score);
  switch (category) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'moderate':
      return 'Moderate';
    case 'caution':
      return 'Caution';
  }
}
