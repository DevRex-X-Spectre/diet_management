import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailModal } from '../components/FoodDetailModal';
import {
  getMealNote,
  getRecommendationsForMeal,
  getTopRecommendations,
  MealSlot,
} from '../services/recommendation/RecommendationEngine';
import { loadProfile, StoredProfile } from '../services/storage';
import { colors, spacing, typography } from '../theme';
import { HEALTH_CONDITION_LABELS, RootStackParamList } from '../types';
import type { RecommendedFood } from '../types/food';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Recommendations'>;

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

export function RecommendationsScreen() {
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
    loadData(selectedMeal);
  }, [selectedMeal]);

  const loadData = async (meal: MealSlot) => {
    try {
      const savedProfile = await loadProfile();
      setProfile(savedProfile);

      if (savedProfile) {
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

        setRecommendations(getRecommendationsForMeal(patientProfile, meal, 18));
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const conditionsSummary = profile?.healthConditions
    .map((c) => HEALTH_CONDITION_LABELS[c])
    .join(', ') || 'No conditions set';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.darkGreen} />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.darkGreen} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Explore foods</Text>
            <Text style={styles.title}>Recommended for You</Text>
          </View>
        </View>

        <View style={styles.conditionsBanner}>
          <Text style={styles.conditionsLabel}>Based on your conditions</Text>
          <Text style={styles.conditionsText}>{conditionsSummary}</Text>
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

        <View style={styles.gridHeader}>
          <Text style={styles.gridTitle}>{MEAL_LABELS[selectedMeal]} suggestions</Text>
          <Text style={styles.gridSubtitle}>
            Tap a food to see why it fits your health profile.
          </Text>
        </View>

        <View style={styles.grid}>
          {(recommendations.length > 0 ? recommendations : getTopRecommendations({
            id: profile?.id ?? 'guest',
            email: profile?.email ?? '',
            age: profile?.age ?? 30,
            gender: profile?.gender ?? 'MALE',
            heightCm: profile?.heightCm ?? 170,
            weightKg: profile?.weightKg ?? 70,
            activityLevel: profile?.activityLevel ?? 'MODERATE',
            healthConditions: profile?.healthConditions ?? [],
            bmi: profile?.bmi ?? 24,
            bmiCategory: profile?.bmiCategory as any,
            bmr: profile?.bmr ?? 1600,
            tdee: profile?.tdee ?? 2000,
          }, 10)).map((rec) => (
            <View key={rec.food.id} style={[styles.gridItem, { width: cardWidth }]}>
              <FoodCard
                recommendation={rec}
                mealNote={getMealNote(rec, selectedMeal)}
                onPress={() => setSelectedRecommendation(rec)}
              />
            </View>
          ))}
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
    color: colors.darkGreen,
    fontWeight: '600',
  },
  title: {
    ...typography.h2,
    color: colors.black,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  gridItem: {},
});
