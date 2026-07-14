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

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

const MEAL_TARGETS: Record<MealSlot, {
  calorieShare: number;
  preferredCategories: Food['category'][];
  cautionCategories: Food['category'][];
  maxCalories: number;
  maxSodium: number;
  maxCarbs?: number;
}> = {
  breakfast: {
    calorieShare: 0.25,
    preferredCategories: ['PROTEIN', 'GRAIN', 'FRUIT', 'DAIRY', 'BEVERAGE'],
    cautionCategories: ['SOUP', 'SWALLOW'],
    maxCalories: 380,
    maxSodium: 420,
  },
  lunch: {
    calorieShare: 0.4,
    preferredCategories: ['PROTEIN', 'GRAIN', 'SOUP', 'SWALLOW', 'VEGETABLE'],
    cautionCategories: ['BEVERAGE'],
    maxCalories: 620,
    maxSodium: 650,
  },
  dinner: {
    calorieShare: 0.3,
    preferredCategories: ['PROTEIN', 'SOUP', 'VEGETABLE', 'FRUIT', 'BEVERAGE'],
    cautionCategories: ['SWALLOW', 'GRAIN'],
    maxCalories: 360,
    maxSodium: 420,
    maxCarbs: 30,
  },
};

const MEAL_FOOD_FIT: Record<MealSlot, {
  primary: string[];
  secondary: string[];
  avoid: string[];
}> = {
  breakfast: {
    primary: [
      'oats',
      'boiled-eggs',
      'moi-moi',
      'boiled-beans',
      'egg-sauce',
      'greek-yogurt',
      'plain-yogurt',
      'low-fat-milk',
      'whole-wheat-bread',
      'apple',
      'orange',
      'avocado',
      'unsweetened-tea',
      'okpa',
    ],
    secondary: ['akara', 'banana', 'pawpaw', 'groundnuts', 'mixed-nuts', 'tiger-nuts'],
    avoid: [
      'amala',
      'eba',
      'pounded-yam',
      'plantain-swallow',
      'oat-swallow',
      'egusi-soup',
      'ogbono-soup',
      'banga-soup',
      'groundnut-soup',
      'edikang-ikong',
    ],
  },
  lunch: {
    primary: [
      'grilled-tilapia',
      'grilled-chicken',
      'grilled-turkey',
      'fish-stew',
      'brown-rice',
      'ofada-rice',
      'boiled-beans',
      'water-yam',
      'unripe-plantain',
      'oat-swallow',
      'plantain-swallow',
      'amala',
      'okra-soup',
      'vegetable-soup',
      'edikang-ikong',
      'efo-riro',
      'ugu-leaves',
    ],
    secondary: [
      'moi-moi',
      'catfish-pepper-soup',
      'egusi-soup',
      'ogbono-soup',
      'garden-eggs',
      'cucumber',
      'carrots',
    ],
    avoid: ['low-fat-milk', 'greek-yogurt', 'plain-yogurt', 'unsweetened-tea', 'apple', 'orange', 'banana'],
  },
  dinner: {
    primary: [
      'catfish-pepper-soup',
      'pepper-soup-light',
      'fish-stew',
      'okra-soup',
      'vegetable-soup',
      'efo-riro',
      'okra',
      'cucumber',
      'garden-eggs',
      'waterleaf',
      'soko',
      'grilled-tilapia',
      'grilled-chicken',
      'plain-yogurt',
      'avocado',
    ],
    secondary: ['boiled-eggs', 'moi-moi', 'boiled-beans', 'orange', 'unsweetened-tea'],
    avoid: [
      'brown-rice',
      'ofada-rice',
      'agege-bread',
      'whole-wheat-bread',
      'semovita',
      'amala',
      'eba',
      'pounded-yam',
      'plantain-swallow',
      'oat-swallow',
      'akara',
      'okpa',
      'groundnuts',
      'mixed-nuts',
    ],
  },
};

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
export function scoreFood(food: Food, profile: PatientProfile, meal?: MealSlot): number {
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

  if (meal) {
    score += scoreMealFit(food, profile, meal);
  }

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreMealFit(food: Food, profile: PatientProfile, meal: MealSlot): number {
  const target = MEAL_TARGETS[meal];
  const mealFit = MEAL_FOOD_FIT[meal];
  const mealCalories = Math.max(180, profile.tdee * target.calorieShare);
  const conditions = profile.healthConditions;
  let score = 0;

  if (mealFit.primary.includes(food.id)) score += 24;
  else if (mealFit.secondary.includes(food.id)) score += 12;
  else if (mealFit.avoid.includes(food.id)) score -= 36;

  if (target.preferredCategories.includes(food.category)) score += 12;
  if (target.cautionCategories.includes(food.category)) score -= 12;

  const calorieGap = Math.abs(food.nutrition.calories - mealCalories);
  if (food.nutrition.calories <= target.maxCalories && calorieGap <= mealCalories * 0.55) {
    score += 10;
  } else if (food.nutrition.calories > target.maxCalories) {
    score -= meal === 'lunch' ? 4 : 10;
  }

  if (food.nutrition.sodium <= target.maxSodium) score += 6;
  else score -= 8;

  if (meal === 'breakfast') {
    if (food.nutrition.protein >= 7) score += 6;
    if (food.nutrition.fiber >= 3) score += 5;
    if (food.nutrition.sugar > 12) score -= 8;
  }

  if (meal === 'lunch') {
    if (food.nutrition.protein >= 10) score += 6;
    if (food.nutrition.fiber >= 3) score += 5;
    if (['PROTEIN', 'SOUP', 'VEGETABLE'].includes(food.category)) score += 4;
  }

  if (meal === 'dinner') {
    if (food.nutrition.calories <= 230) score += 7;
    if (food.nutrition.carbohydrates <= (target.maxCarbs ?? 30)) score += 6;
    else score -= 10;
    if (food.nutrition.sodium <= 300) score += 4;
  }

  const hasDiabetes = conditions.includes('TYPE_1_DIABETES') ||
    conditions.includes('TYPE_2_DIABETES');
  if (hasDiabetes && food.nutrition.carbohydrates > 30 && meal !== 'lunch') {
    score -= 8;
  }

  const hasHypertension = conditions.includes('HYPERTENSION');
  if (hasHypertension && food.nutrition.sodium > target.maxSodium) {
    score -= 8;
  }

  const hasObesity = conditions.includes('OBESITY');
  if (hasObesity && food.nutrition.calories > target.maxCalories) {
    score -= 8;
  }

  return score;
}

function fitsMealSlot(food: Food, meal: MealSlot): boolean {
  const target = MEAL_TARGETS[meal];
  const fit = MEAL_FOOD_FIT[meal];

  if (fit.avoid.includes(food.id)) return false;
  if (fit.primary.includes(food.id) || fit.secondary.includes(food.id)) return true;
  if (target.cautionCategories.includes(food.category)) return false;

  if (meal === 'breakfast') {
    return ['PROTEIN', 'GRAIN', 'FRUIT', 'DAIRY', 'BEVERAGE'].includes(food.category) &&
      food.nutrition.calories <= target.maxCalories;
  }

  if (meal === 'lunch') {
    return ['PROTEIN', 'GRAIN', 'SOUP', 'SWALLOW', 'VEGETABLE'].includes(food.category);
  }

  return ['PROTEIN', 'SOUP', 'VEGETABLE', 'FRUIT', 'DAIRY', 'BEVERAGE'].includes(food.category) &&
    food.nutrition.calories <= target.maxCalories &&
    food.nutrition.carbohydrates <= (target.maxCarbs ?? 30);
}

function getMealFitRank(food: Food, meal: MealSlot): number {
  const fit = MEAL_FOOD_FIT[meal];
  if (fit.primary.includes(food.id)) return 0;
  if (fit.secondary.includes(food.id)) return 1;
  return 2;
}

function getMealFitOrder(food: Food, meal: MealSlot): number {
  const fit = MEAL_FOOD_FIT[meal];
  const primaryIndex = fit.primary.indexOf(food.id);
  if (primaryIndex >= 0) return primaryIndex;

  const secondaryIndex = fit.secondary.indexOf(food.id);
  if (secondaryIndex >= 0) return fit.primary.length + secondaryIndex;

  return fit.primary.length + fit.secondary.length + 1;
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
  profile: PatientProfile,
  meal?: MealSlot
): RecommendedFood {
  return {
    food,
    score: scoreFood(food, profile, meal),
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

export function getRecommendationsForMeal(
  profile: PatientProfile,
  meal: MealSlot,
  limit: number = 12
): RecommendedFood[] {
  const target = MEAL_TARGETS[meal];
  const safeFoods = filterByConditions(nigerianFoods, profile.healthConditions);
  const mealFoods = safeFoods.filter((food) => {
    if (food.nutrition.calories > target.maxCalories + 180) return false;
    if (food.nutrition.sodium > target.maxSodium + 350) return false;
    if (meal === 'dinner' && food.nutrition.carbohydrates > 45) return false;
    return fitsMealSlot(food, meal);
  });

  return mealFoods
    .map((food) => createRecommendation(food, profile, meal))
    .sort((a, b) => {
      const rankDiff = getMealFitRank(a.food, meal) - getMealFitRank(b.food, meal);
      if (rankDiff !== 0) return rankDiff;

      const orderDiff = getMealFitOrder(a.food, meal) - getMealFitOrder(b.food, meal);
      if (orderDiff !== 0) return orderDiff;

      return b.score - a.score;
    })
    .slice(0, limit);
}

export function getMealNote(recommendation: RecommendedFood, meal: MealSlot): string {
  const { food } = recommendation;
  const hasCarbs = food.nutrition.carbohydrates >= 20;

  if (meal === 'breakfast') {
    if (food.category === 'FRUIT') return 'Pair with protein or yogurt to slow blood sugar rise.';
    if (food.category === 'GRAIN') return 'Use a modest bowl and add protein where possible.';
    return 'Strong morning choice. Keep added sugar and salt low.';
  }

  if (meal === 'lunch') {
    if (food.category === 'SWALLOW' || hasCarbs) {
      return 'Use a controlled portion and balance the plate with vegetables and lean protein.';
    }
    return 'Works well as a lunch protein, soup, or vegetable side.';
  }

  if (hasCarbs) return 'Keep dinner portion small and pair with vegetables.';
  return 'Light dinner fit. Prefer low salt preparation.';
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
