/**
 * Recommendation Engine
 *
 * Core engine that takes patient profiles and returns
 * personalized food recommendations based on health conditions.
 */

import type { Food, RecommendedFood } from '../../types/food';
import { nigerianFoods } from '../../data/nigerianFoods';
import type { HealthCondition, PatientProfile } from '../../types';
import {
  HEALTH_CONDITION_LABELS,
} from '../../types';

// ============================================================================
// Core Recommendation Functions
// ============================================================================

/**
 * Check if a food is safe for all of the patient's conditions.
 * This is the INTERSECTION logic - a food must be safe for ALL conditions.
 */
export function isSafeForPatient(
  food: Food,
  conditions: HealthCondition[]
): boolean {
  // If patient has no conditions, all foods are safe
  if (conditions.length === 0) return true;

  // A food is safe if it's NOT in any of the avoidFor list
  // AND it's in the safeFor list for ALL patient conditions
  return conditions.every((condition) => {
    // If the food is marked to avoid for this condition, return false
    if (food.avoidFor.includes(condition)) return false;
    // If the food is only in cautionFor, it's still technically safe
    return true;
  });
}

/**
 * Filter foods to only those safe for the patient's conditions
 */
export function filterByConditions(
  foods: Food[],
  conditions: HealthCondition[]
): Food[] {
  if (conditions.length === 0) return foods;

  return foods.filter((food) => isSafeForPatient(food, conditions));
}

/**
 * Calculate the recommendation score for a food item (0-100)
 */
export function scoreFood(food: Food, profile: PatientProfile): number {
  let score = 0;
  const conditions = profile.healthConditions;

  // 1. Condition Match (30 pts)
  // Bonus for being safe for all conditions
  if (conditions.length > 0) {
    const safeCount = conditions.filter((c) => food.safeFor.includes(c)).length;
    score += (safeCount / conditions.length) * 30;
  } else {
    // No conditions = general healthy eating, full points
    score += 30;
  }

  // 2. Nutritional Balance (25 pts)
  // Fiber: high is good
  if (food.nutrition.fiber >= 5) score += 10;
  else if (food.nutrition.fiber >= 3) score += 6;
  else if (food.nutrition.fiber >= 1) score += 3;

  // Low sugar is good
  if (food.nutrition.sugar <= 5) score += 8;
  else if (food.nutrition.sugar <= 10) score += 5;
  else if (food.nutrition.sugar <= 20) score += 2;

  // Adequate protein is good
  if (food.nutrition.protein >= 15) score += 7;
  else if (food.nutrition.protein >= 10) score += 5;
  else if (food.nutrition.protein >= 5) score += 3;

  // 3. Sodium Control (20 pts) - Critical for Hypertension
  const hasHypertension = conditions.includes('HYPERTENSION');
  if (hasHypertension) {
    if (food.nutrition.sodium <= 140) score += 20; // Very low sodium
    else if (food.nutrition.sodium <= 300) score += 12; // Low sodium
    else if (food.nutrition.sodium <= 500) score += 5; // Moderate
    else score -= 10; // Penalty for high sodium
  } else {
    // For non-hypertension, still prefer lower sodium
    if (food.nutrition.sodium <= 400) score += 15;
    else if (food.nutrition.sodium <= 600) score += 8;
  }

  // 4. Glycemic Control (15 pts) - Critical for Diabetes
  const hasDiabetes = conditions.includes('TYPE_1_DIABETES') ||
                      conditions.includes('TYPE_2_DIABETES');
  if (hasDiabetes) {
    if (food.glycemicIndex !== undefined) {
      if (food.glycemicIndex <= 55) score += 15; // Low GI
      else if (food.glycemicIndex <= 69) score += 10; // Medium GI
      else if (food.glycemicIndex <= 79) score += 3; // High GI
      else score -= 5; // Very high GI penalty
    } else {
      // No GI data - assume it's protein/veg based (good)
      if (food.nutrition.carbohydrates <= 10) score += 10;
      else score += 5;
    }
  } else {
    // No diabetes - give partial credit for low GI if available
    if (food.glycemicIndex !== undefined && food.glycemicIndex <= 55) {
      score += 10;
    } else {
      score += 8;
    }
  }

  // 5. Calorie Control (10 pts) - For Obesity
  const hasObesity = conditions.includes('OBESITY');
  if (hasObesity) {
    if (food.nutrition.calories <= 150) score += 10;
    else if (food.nutrition.calories <= 250) score += 7;
    else if (food.nutrition.calories <= 350) score += 3;
    else score -= 5;
  } else {
    score += 8; // No obesity concern
  }

  // 6. Penalty for caution
  const cautionCount = conditions.filter((c) =>
    food.cautionFor.includes(c)
  ).length;
  score -= cautionCount * 5;

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate human-readable reasons why a food is recommended
 */
export function generateReasons(food: Food, profile: PatientProfile): string[] {
  const reasons: string[] = [];

  // Check each of the patient's conditions
  for (const condition of profile.healthConditions) {
    if (food.safeFor.includes(condition)) {
      switch (condition) {
        case 'TYPE_1_DIABETES':
        case 'TYPE_2_DIABETES':
          if (food.glycemicIndex !== undefined) {
            if (food.glycemicIndex <= 55) {
              reasons.push('Low glycemic index - good for blood sugar');
            } else if (food.glycemicIndex <= 69) {
              reasons.push('Moderate glycemic index');
            }
          } else if (food.nutrition.carbohydrates <= 10) {
            reasons.push('Very low carbohydrates');
          }
          break;
        case 'HYPERTENSION':
          if (food.nutrition.sodium <= 140) {
            reasons.push(`Very low sodium (${food.nutrition.sodium}mg) - heart healthy`);
          } else if (food.nutrition.sodium <= 300) {
            reasons.push(`Low sodium (${food.nutrition.sodium}mg)`);
          }
          break;
        case 'OBESITY':
          if (food.nutrition.calories <= 150) {
            reasons.push(`Low calorie (${food.nutrition.calories} cal) - great for weight management`);
          } else if (food.nutrition.fiber >= 3) {
            reasons.push('High fiber - keeps you full longer');
          }
          break;
      }
    }
  }

  // Add nutritional highlights
  if (food.nutrition.fiber >= 5) {
    reasons.push('Excellent fiber source');
  }
  if (food.nutrition.protein >= 15) {
    reasons.push('High in protein');
  }
  if (food.nutrition.sodium <= 100) {
    reasons.push('Very low sodium');
  }

  // Add the food's own description if available
  if (food.description && reasons.length < 3) {
    reasons.push(food.description);
  }

  // If no specific reasons, give a general one
  if (reasons.length === 0) {
    reasons.push('Good nutritional profile');
  }

  return [...new Set(reasons)]; // Remove duplicates
}

/**
 * Generate warnings for foods that need caution
 */
export function generateWarnings(food: Food, profile: PatientProfile): string[] {
  const warnings: string[] = [];

  for (const condition of profile.healthConditions) {
    if (food.cautionFor.includes(condition)) {
      switch (condition) {
        case 'TYPE_1_DIABETES':
        case 'TYPE_2_DIABETES':
          if (food.glycemicIndex !== undefined && food.glycemicIndex > 69) {
            warnings.push('Higher glycemic index - eat in moderation');
          }
          if (food.nutrition.carbohydrates > 30) {
            warnings.push('Higher in carbs - watch portions');
          }
          break;
        case 'HYPERTENSION':
          if (food.nutrition.sodium > 300) {
            warnings.push(`Contains ${food.nutrition.sodium}mg sodium - limit intake`);
          }
          break;
        case 'OBESITY':
          if (food.nutrition.calories > 200) {
            warnings.push(`Higher calorie count (${food.nutrition.calories} cal) - small portions`);
          }
          break;
      }
    }
  }

  // Check avoidFor
  for (const condition of profile.healthConditions) {
    if (food.avoidFor.includes(condition)) {
      warnings.push(`Not recommended for ${HEALTH_CONDITION_LABELS[condition]}`);
    }
  }

  return warnings;
}

/**
 * Create a full recommendation object
 */
export function createRecommendation(
  food: Food,
  profile: PatientProfile
): RecommendedFood {
  return {
    food,
    score: scoreFood(food, profile),
    reasons: generateReasons(food, profile),
    warnings: generateWarnings(food, profile),
  };
}

// ============================================================================
// Main Engine Function
// ============================================================================

/**
 * Get personalized food recommendations for a patient
 */
export function getRecommendations(profile: PatientProfile): RecommendedFood[] {
  // 1. Filter foods by conditions (intersection logic)
  const safeFoods = filterByConditions(nigerianFoods, profile.healthConditions);

  // 2. Score and generate recommendations
  const recommendations = safeFoods.map((food) =>
    createRecommendation(food, profile)
  );

  // 3. Sort by score (highest first)
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}

/**
 * Get recommendations limited to a specific category
 */
export function getRecommendationsByCategory(
  profile: PatientProfile,
  category: string
): RecommendedFood[] {
  const safeFoods = filterByConditions(nigerianFoods, profile.healthConditions);
  const categoryFoods = safeFoods.filter((food) => food.category === category);

  return categoryFoods.map((food) => createRecommendation(food, profile))
    .sort((a, b) => b.score - a.score);
}

/**
 * Get the top N recommendations
 */
export function getTopRecommendations(
  profile: PatientProfile,
  limit: number = 10
): RecommendedFood[] {
  return getRecommendations(profile).slice(0, limit);
}

/**
 * Get a single food's recommendation details
 */
export function getRecommendationForFood(
  foodId: string,
  profile: PatientProfile
): RecommendedFood | null {
  const food = nigerianFoods.find((f) => f.id === foodId);
  if (!food) return null;

  return createRecommendation(food, profile);
}
