import React, { useEffect, useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { FoodCard } from '../components/FoodCard';
import { borderRadius, colors, spacing, typography } from '../theme';
import { clearAuthSession, loadProfile, StoredProfile } from '../services/storage';
import { getTopRecommendations } from '../services/recommendation/RecommendationEngine';
import type { RecommendedFood } from '../types/food';
import { HEALTH_CONDITION_LABELS } from '../types';
import { foodImages } from '../data/foodImages';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type MealSlot = 'breakfast' | 'lunch' | 'dinner';

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

function getMealRecommendations(
  recommendations: RecommendedFood[],
  meal: MealSlot
): RecommendedFood[] {
  return recommendations.filter((rec) => {
    const { category, id, nutrition } = rec.food;

    if (meal === 'breakfast') {
      return (
        ['boiled-eggs', 'oats', 'greek-yogurt', 'low-fat-milk', 'whole-wheat-bread', 'boiled-beans', 'moi-moi', 'apple', 'orange', 'banana', 'avocado', 'tiger-nuts'].includes(id) ||
        (category === 'FRUIT' && nutrition.calories <= 170)
      );
    }

    if (meal === 'lunch') {
      return (
        ['PROTEIN', 'GRAIN', 'SOUP', 'SWALLOW', 'VEGETABLE'].includes(category) &&
        !['agege-bread'].includes(id)
      );
    }

    return (
      ['PROTEIN', 'SOUP', 'VEGETABLE', 'BEVERAGE', 'FRUIT'].includes(category) &&
      nutrition.calories <= 230 &&
      nutrition.sodium <= 400
    );
  }).slice(0, meal === 'lunch' ? 12 : 10);
}

function getMealNote(recommendation: RecommendedFood, meal: MealSlot): string {
  const { food } = recommendation;
  const hasCarbs = food.nutrition.carbohydrates >= 20;

  if (meal === 'breakfast') {
    if (food.category === 'FRUIT') return 'Take with protein or yogurt to slow blood sugar rise.';
    if (food.category === 'GRAIN') return 'Use a small bowl and add protein such as egg or yogurt.';
    return 'Good morning protein/fiber choice. Keep added sugar low.';
  }

  if (meal === 'lunch') {
    if (food.category === 'SWALLOW' || hasCarbs) {
      return 'Use a controlled portion and fill the rest of the plate with vegetables and lean protein.';
    }
    return 'Works well as the main lunch protein or vegetable side.';
  }

  if (hasCarbs) return 'Keep the dinner portion small and pair with vegetables.';
  return 'Light dinner option. Prefer low salt preparation.';
}

/**
 * Home screen showing personalized food recommendations.
 * Loads patient profile and displays recommended foods in a grid.
 */
export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { width } = useWindowDimensions();
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedFood[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<MealSlot>('breakfast');
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendedFood | null>(null);
  const [loading, setLoading] = useState(true);
  const cardWidth = width >= 720
    ? (width - spacing.lg * 2 - spacing.md * 2) / 3
    : (width - spacing.lg * 2 - spacing.md) / 2;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedProfile = await loadProfile();
      setProfile(savedProfile);

      if (savedProfile) {
        // Convert StoredProfile to PatientProfile for the engine
        const patientProfile = {
          id: savedProfile.id,
          email: savedProfile.email,
          age: savedProfile.age,
          gender: savedProfile.gender,
          heightCm: savedProfile.heightCm,
          weightKg: savedProfile.weightKg,
          activityLevel: savedProfile.activityLevel,
          healthConditions: savedProfile.healthConditions,
          bmi: savedProfile.bmi,
          bmiCategory: savedProfile.bmiCategory as any,
          bmr: savedProfile.bmr,
          tdee: savedProfile.tdee,
        };

        const recs = getTopRecommendations(patientProfile, 20);
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await clearAuthSession();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.darkGreen} />
          <Text style={styles.loadingText}>Loading your recommendations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const conditionsSummary = profile?.healthConditions
    .map((c) => HEALTH_CONDITION_LABELS[c as keyof typeof HEALTH_CONDITION_LABELS])
    .join(', ') || 'No conditions set';
  const mealRecommendations = getMealRecommendations(recommendations, selectedMeal);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello</Text>
            <Text style={styles.title}>Recommended for You</Text>
          </View>
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            style={styles.signOutButton}
          />
        </View>

        {/* Conditions Summary */}
        <View style={styles.conditionsBanner}>
          <Text style={styles.conditionsLabel}>Based on your conditions:</Text>
          <Text style={styles.conditionsText}>{conditionsSummary}</Text>
        </View>

        {/* Stats Row */}
        {profile && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.tdee}</Text>
              <Text style={styles.statLabel}>Daily Target (cal)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.bmi}</Text>
              <Text style={styles.statLabel}>BMI</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{recommendations.length}</Text>
              <Text style={styles.statLabel}>Foods Found</Text>
            </View>
          </View>
        )}

        {/* Meal Plan */}
        <View style={styles.gridHeader}>
          <Text style={styles.gridTitle}>Meal plan suggestions</Text>
          <Text style={styles.gridSubtitle}>
            Choose a meal, then tap a food to see why it fits your health profile.
          </Text>
        </View>

        <View style={styles.mealTabs}>
          {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map((meal) => {
            const selected = selectedMeal === meal;
            return (
              <Pressable
                key={meal}
                onPress={() => setSelectedMeal(meal)}
                style={[styles.mealTab, selected && styles.mealTabSelected]}
              >
                <MaterialCommunityIcons
                  name={MEAL_ICONS[meal]}
                  size={20}
                  color={selected ? colors.white : colors.darkGreen}
                />
                <Text style={[styles.mealTabText, selected && styles.mealTabTextSelected]}>
                  {MEAL_LABELS[meal]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mealRecommendations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No recommendations found</Text>
            <Text style={styles.emptyText}>
              We couldn't find foods that match all your conditions.
              Try adjusting your health conditions in your profile.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {mealRecommendations.map((rec) => (
              <View key={rec.food.id} style={[styles.gridItem, { width: cardWidth }]}>
                <FoodCard
                  recommendation={rec}
                  mealNote={getMealNote(rec, selectedMeal)}
                  onPress={() => setSelectedRecommendation(rec)}
                />
              </View>
            ))}
          </View>
        )}

        {/* Food Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoryGrid}>
            <CategoryCard icon="food-drumstick-outline" label="Proteins" count={12} />
            <CategoryCard icon="leaf" label="Vegetables" count={10} />
            <CategoryCard icon="rice" label="Grains" count={10} />
            <CategoryCard icon="food-apple-outline" label="Fruits" count={6} />
            <CategoryCard icon="bowl-mix-outline" label="Soups" count={8} />
            <CategoryCard icon="cup-water" label="Dairy" count={3} />
          </View>
        </View>
      </ScrollView>

      <FoodDetailModal
        recommendation={selectedRecommendation}
        meal={selectedMeal}
        onClose={() => setSelectedRecommendation(null)}
      />
    </SafeAreaView>
  );
}

function FoodDetailModal({
  recommendation,
  meal,
  onClose,
}: {
  recommendation: RecommendedFood | null;
  meal: MealSlot;
  onClose: () => void;
}) {
  if (!recommendation) {
    return null;
  }

  const { food, score, reasons, warnings } = recommendation;
  const mealNote = getMealNote(recommendation, meal);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />

        <View style={styles.modalSheet}>
          <Image source={foodImages[food.id]} style={styles.modalImage} resizeMode="cover" />

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalTitleRow}>
              <View style={styles.modalTitleText}>
                <Text style={styles.modalName}>{food.name}</Text>
                {food.localName && <Text style={styles.modalLocalName}>{food.localName}</Text>}
                <Text style={styles.modalServing}>{food.servingSize}</Text>
              </View>
              <View style={styles.modalScore}>
                <Text style={styles.modalScoreValue}>{score}</Text>
                <Text style={styles.modalScoreLabel}>score</Text>
              </View>
            </View>

            <View style={styles.modalMealNote}>
              <MaterialCommunityIcons
                name={MEAL_ICONS[meal]}
                size={18}
                color={colors.darkGreen}
              />
              <Text style={styles.modalMealNoteText}>{mealNote}</Text>
            </View>

            {reasons.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Why this is recommended</Text>
                {reasons.map((reason, index) => (
                  <View key={index} style={styles.modalReasonRow}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={colors.darkGreen} />
                    <Text style={styles.modalReasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {warnings.length > 0 && (
              <View style={styles.modalWarningSection}>
                <Text style={styles.modalSectionTitle}>Notes</Text>
                {warnings.map((warning, index) => (
                  <Text key={index} style={styles.modalWarningText}>
                    {warning}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Nutrition snapshot</Text>
              <View style={styles.modalNutritionRow}>
                <NutritionPill label="Cal" value={food.nutrition.calories} />
                <NutritionPill label="Protein" value={`${food.nutrition.protein}g`} />
                <NutritionPill label="Fiber" value={`${food.nutrition.fiber}g`} />
                <NutritionPill label="Sodium" value={`${food.nutrition.sodium}mg`} />
              </View>
            </View>
          </ScrollView>

          <Pressable style={styles.modalCloseButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={22} color={colors.black} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function NutritionPill({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.modalNutritionPill}>
      <Text style={styles.modalNutritionValue}>{value}</Text>
      <Text style={styles.modalNutritionLabel}>{label}</Text>
    </View>
  );
}

function CategoryCard({
  icon,
  label,
  count,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  count: number;
}) {
  return (
    <View style={styles.categoryCard}>
      <MaterialCommunityIcons name={icon} size={28} color={colors.darkGreen} />
      <Text style={styles.categoryLabel}>{label}</Text>
      <Text style={styles.categoryCount}>{count} items</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGreen,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
  },
  greeting: {
    fontSize: 16,
    color: colors.darkGreen,
    fontWeight: '500',
  },
  title: {
    ...typography.h1,
    color: colors.black,
  },
  signOutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  conditionsBanner: {
    backgroundColor: colors.mediumGreen,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  conditionsLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
  },
  conditionsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.darkGreen,
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  gridHeader: {
    marginBottom: spacing.md,
  },
  gridTitle: {
    ...typography.h2,
    color: colors.black,
    marginBottom: 4,
  },
  gridSubtitle: {
    ...typography.caption,
    color: colors.gray,
  },
  mealTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mealTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.white,
  },
  mealTabSelected: {
    backgroundColor: colors.darkGreen,
  },
  mealTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkGreen,
  },
  mealTabTextSelected: {
    color: colors.white,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  gridItem: {
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
  },
  categoriesSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.black,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    flexBasis: '31%',
    flexGrow: 1,
    minHeight: 92,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  categoryCount: {
    fontSize: 10,
    color: colors.gray,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalSheet: {
    maxHeight: '86%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 176,
    backgroundColor: colors.lightGray,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  modalTitleText: {
    flex: 1,
  },
  modalName: {
    ...typography.h2,
    color: colors.black,
  },
  modalLocalName: {
    ...typography.caption,
    color: colors.gray,
    fontStyle: 'normal',
    marginTop: 2,
  },
  modalServing: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 4,
  },
  modalScore: {
    width: 58,
    height: 58,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.darkGreen,
    backgroundColor: colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkGreen,
  },
  modalScoreLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.darkGreen,
    textTransform: 'uppercase',
  },
  modalMealNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: spacing.md,
  },
  modalMealNoteText: {
    flex: 1,
    ...typography.caption,
    color: colors.black,
  },
  modalSection: {
    gap: spacing.sm,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkGreen,
  },
  modalReasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  modalReasonText: {
    flex: 1,
    ...typography.caption,
    color: colors.black,
    lineHeight: 19,
  },
  modalWarningSection: {
    gap: spacing.xs,
    backgroundColor: `${colors.warning}18`,
    borderRadius: 12,
    padding: spacing.md,
  },
  modalWarningText: {
    ...typography.caption,
    color: '#E65100',
    lineHeight: 19,
  },
  modalNutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modalNutritionPill: {
    minWidth: 68,
    backgroundColor: colors.lightGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalNutritionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkGreen,
  },
  modalNutritionLabel: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 2,
  },
  modalCloseButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
