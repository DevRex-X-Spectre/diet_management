import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNav } from '../components/AppBottomNav';
import { AppTopNav } from '../components/AppTopNav';
import { foodImages } from '../data/foodImages';
import { getFoodById } from '../data/nigerianFoods';
import {
  getRecommendationForFood,
  getRecommendationsForMeal,
  MealSlot,
} from '../services/recommendation/RecommendationEngine';
import {
  createEmptyWeeklyMealPlan,
  loadProfile,
  loadWeeklyMealPlan,
  saveWeeklyMealPlan,
  StoredProfile,
  WEEK_DAYS,
  WeekDayKey,
  WeeklyMealPlan,
} from '../services/storage';
import { borderRadius, colors, spacing, typography } from '../theme';
import type { RecommendedFood } from '../types/food';

const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

const MEAL_ICONS: Record<MealSlot, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  breakfast: 'coffee-outline',
  lunch: 'silverware-fork-knife',
  dinner: 'bowl-mix-outline',
};

const MEALS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];

export function MealPlannerScreen() {
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [plan, setPlan] = useState<WeeklyMealPlan>(createEmptyWeeklyMealPlan());
  const [selectedDay, setSelectedDay] = useState<WeekDayKey>('monday');
  const [editingMeal, setEditingMeal] = useState<MealSlot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const patientProfile = useMemo(() => {
    if (!profile) return null;
    return {
      id: profile.id,
      email: profile.email,
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      activityLevel: profile.activityLevel,
      healthConditions: profile.healthConditions,
      bmi: profile.bmi,
      bmiCategory: profile.bmiCategory as any,
      bmr: profile.bmr,
      tdee: profile.tdee,
    };
  }, [profile]);

  const recommendationsByMeal = useMemo(() => {
    if (!patientProfile) {
      return {
        breakfast: [],
        lunch: [],
        dinner: [],
      } as Record<MealSlot, RecommendedFood[]>;
    }

    return {
      breakfast: getRecommendationsForMeal(patientProfile, 'breakfast', 10),
      lunch: getRecommendationsForMeal(patientProfile, 'lunch', 10),
      dinner: getRecommendationsForMeal(patientProfile, 'dinner', 10),
    };
  }, [patientProfile]);

  const loadData = async () => {
    try {
      const [savedProfile, savedPlan] = await Promise.all([
        loadProfile(),
        loadWeeklyMealPlan(),
      ]);
      setProfile(savedProfile);
      setPlan(savedPlan);
    } catch (error) {
      console.error('Failed to load meal planner:', error);
    } finally {
      setLoading(false);
    }
  };

  const persistPlan = async (nextPlan: WeeklyMealPlan) => {
    setPlan(nextPlan);
    try {
      await saveWeeklyMealPlan(nextPlan);
    } catch (error) {
      console.error('Failed to save meal plan:', error);
    }
  };

  const selectFood = async (meal: MealSlot, foodId: string | null) => {
    const nextPlan: WeeklyMealPlan = {
      ...plan,
      updatedAt: new Date().toISOString(),
      days: {
        ...plan.days,
        [selectedDay]: {
          ...plan.days[selectedDay],
          [meal]: { foodId },
        },
      },
    };
    await persistPlan(nextPlan);
    setEditingMeal(null);
  };

  const getScheduledRecommendation = (meal: MealSlot): RecommendedFood | null => {
    const foodId = plan.days[selectedDay][meal].foodId;
    if (!foodId || !patientProfile) return null;
    return getRecommendationForFood(foodId, patientProfile);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.darkGreen} />
          <Text style={styles.loadingText}>Opening planner...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppTopNav title="Plan Your Meals" subtitle="Weekly schedule" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="calendar-heart" size={28} color={colors.white} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Breakfast, lunch, and dinner for the week</Text>
            <Text style={styles.heroSubtitle}>
              Choose foods manually from your best health-based matches.
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabs}
        >
          {WEEK_DAYS.map((day) => {
            const selected = selectedDay === day.key;
            return (
              <Pressable
                key={day.key}
                onPress={() => setSelectedDay(day.key)}
                style={[styles.dayTab, selected && styles.dayTabSelected]}
              >
                <Text style={[styles.dayTabText, selected && styles.dayTabTextSelected]}>
                  {day.shortLabel}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {WEEK_DAYS.find((day) => day.key === selectedDay)?.label}
          </Text>
          <Text style={styles.sectionSubtitle}>Tap any meal to edit it.</Text>
        </View>

        <View style={styles.mealList}>
          {MEALS.map((meal) => (
            <MealSlotCard
              key={meal}
              meal={meal}
              recommendation={getScheduledRecommendation(meal)}
              onPress={() => setEditingMeal(meal)}
            />
          ))}
        </View>
      </ScrollView>

      <MealSelectorModal
        meal={editingMeal}
        recommendations={editingMeal ? recommendationsByMeal[editingMeal] : []}
        onClose={() => setEditingMeal(null)}
        onSelect={(foodId) => editingMeal && selectFood(editingMeal, foodId)}
      />
      <AppBottomNav activeRoute="MealPlanner" />
    </SafeAreaView>
  );
}

function MealSlotCard({
  meal,
  recommendation,
  onPress,
}: {
  meal: MealSlot;
  recommendation: RecommendedFood | null;
  onPress: () => void;
}) {
  const food = recommendation?.food;

  return (
    <Pressable style={styles.mealCard} onPress={onPress}>
      <View style={styles.mealCardHeader}>
        <View style={styles.mealLabelRow}>
          <MaterialCommunityIcons name={MEAL_ICONS[meal]} size={20} color={colors.darkGreen} />
          <Text style={styles.mealLabel}>{MEAL_LABELS[meal]}</Text>
        </View>
        <MaterialCommunityIcons name="pencil" size={18} color={colors.gray} />
      </View>

      {food ? (
        <View style={styles.scheduledFood}>
          <Image source={foodImages[food.id]} style={styles.scheduledImage} resizeMode="cover" />
          <View style={styles.scheduledInfo}>
            <Text style={styles.scheduledName}>{food.name}</Text>
            <Text style={styles.scheduledMeta}>
              {food.servingSize} • {food.nutrition.calories} cal
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyMeal}>
          <MaterialCommunityIcons name="plus-circle-outline" size={22} color={colors.darkGreen} />
          <Text style={styles.emptyMealText}>Choose a food for this meal</Text>
        </View>
      )}
    </Pressable>
  );
}

function MealSelectorModal({
  meal,
  recommendations,
  onClose,
  onSelect,
}: {
  meal: MealSlot | null;
  recommendations: RecommendedFood[];
  onClose: () => void;
  onSelect: (foodId: string | null) => void;
}) {
  if (!meal) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.selectorRoot}>
        <Pressable style={styles.selectorBackdrop} onPress={onClose} />
        <View style={styles.selectorSheet}>
          <View style={styles.selectorHeader}>
            <View>
              <Text style={styles.selectorEyebrow}>Choose {MEAL_LABELS[meal].toLowerCase()}</Text>
              <Text style={styles.selectorTitle}>Best matches</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={colors.black} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.selectorList}>
            <Pressable style={styles.clearChoice} onPress={() => onSelect(null)}>
              <MaterialCommunityIcons name="minus-circle-outline" size={20} color={colors.gray} />
              <Text style={styles.clearChoiceText}>Leave this meal empty</Text>
            </Pressable>

            {recommendations.map((rec) => (
              <Pressable
                key={rec.food.id}
                style={styles.optionRow}
                onPress={() => onSelect(rec.food.id)}
              >
                <Image source={foodImages[rec.food.id]} style={styles.optionImage} resizeMode="cover" />
                <View style={styles.optionInfo}>
                  <Text style={styles.optionName}>{rec.food.name}</Text>
                  <Text style={styles.optionMeta}>
                    {rec.food.nutrition.calories} cal • {rec.food.nutrition.protein}g protein
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color={colors.gray} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGreen,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGreen,
  },
  title: {
    ...typography.h2,
    color: colors.black,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  heroSubtitle: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 3,
  },
  dayTabs: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  dayTab: {
    minWidth: 54,
    minHeight: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mediumGreen,
  },
  dayTabSelected: {
    backgroundColor: colors.darkGreen,
    borderColor: colors.darkGreen,
  },
  dayTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkGreen,
  },
  dayTabTextSelected: {
    color: colors.white,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.black,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.gray,
  },
  mealList: {
    gap: spacing.md,
  },
  mealCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.mediumGreen,
  },
  mealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  mealLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mealLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.black,
  },
  scheduledFood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scheduledImage: {
    width: 76,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lightGray,
  },
  scheduledInfo: {
    flex: 1,
  },
  scheduledName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  scheduledMeta: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 3,
  },
  emptyMeal: {
    minHeight: 64,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.mediumGreen,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  emptyMealText: {
    ...typography.caption,
    color: colors.darkGreen,
    fontWeight: '600',
  },
  selectorRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  selectorBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  selectorSheet: {
    maxHeight: '82%',
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  selectorEyebrow: {
    ...typography.caption,
    color: colors.darkGreen,
    fontWeight: '700',
  },
  selectorTitle: {
    ...typography.h2,
    color: colors.black,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGreen,
  },
  selectorList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  clearChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lightGray,
  },
  clearChoiceText: {
    ...typography.caption,
    color: colors.gray,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.lightGreen,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  optionImage: {
    width: 62,
    height: 54,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.lightGray,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.black,
  },
  optionMeta: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
});
