import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
  MealSlot,
} from '../services/recommendation/RecommendationEngine';
import {
  loadProfile,
  loadWeeklyMealPlan,
  StoredProfile,
  WEEK_DAYS,
  WeekDayKey,
  WeeklyMealPlan,
} from '../services/storage';
import { borderRadius, colors, spacing, typography } from '../theme';
import { HEALTH_CONDITION_LABELS, RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const MEALS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];

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

function getTodayKey(): WeekDayKey {
  const index = new Date().getDay();
  const day = WEEK_DAYS[index === 0 ? 6 : index - 1];
  return day.key;
}

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [plan, setPlan] = useState<WeeklyMealPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<WeekDayKey>(getTodayKey());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    loadData();
    return unsubscribe;
  }, [navigation]);

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

  const loadData = async () => {
    try {
      const [savedProfile, savedPlan] = await Promise.all([
        loadProfile(),
        loadWeeklyMealPlan(),
      ]);
      setProfile(savedProfile);
      setPlan(savedPlan);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !plan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.darkGreen} />
          <Text style={styles.loadingText}>Loading your meal week...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const conditionsSummary = profile?.healthConditions
    .map((c) => HEALTH_CONDITION_LABELS[c])
    .join(', ') || 'No conditions set';

  const scheduledCount = WEEK_DAYS.reduce((count, day) => (
    count + MEALS.filter((meal) => plan.days[day.key][meal].foodId).length
  ), 0);

  const dayLabel = WEEK_DAYS.find((day) => day.key === selectedDay)?.label ?? 'Today';

  return (
    <SafeAreaView style={styles.container}>
      <AppTopNav title="Your Meal Week" subtitle="Dashboard" showBack={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroEyebrow}>This week</Text>
              <Text style={styles.heroTitle}>{scheduledCount}/21 meals scheduled</Text>
            </View>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="calendar-check" size={28} color={colors.white} />
            </View>
          </View>
          <Text style={styles.heroSubtitle}>
            Your dashboard now follows your weekly plan. Edit anytime as your week changes.
          </Text>
        </View>

        {profile && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.tdee}</Text>
              <Text style={styles.statLabel}>Daily cal</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.bmi}</Text>
              <Text style={styles.statLabel}>BMI</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.healthConditions.length}</Text>
              <Text style={styles.statLabel}>Conditions</Text>
            </View>
          </View>
        )}

        <View style={styles.conditionsBanner}>
          <Text style={styles.conditionsLabel}>Health focus</Text>
          <Text style={styles.conditionsText}>{conditionsSummary}</Text>
        </View>

        <View style={styles.actionGrid}>
          <DashboardAction
            icon="calendar-edit"
            title="Edit Plan"
            subtitle="Schedule week"
            onPress={() => navigation.navigate('MealPlanner')}
          />
          <DashboardAction
            icon="food-apple-outline"
            title="Explore"
            subtitle="Find foods"
            onPress={() => navigation.navigate('Recommendations')}
          />
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
          <Text style={styles.sectionTitle}>{dayLabel}</Text>
          <Text style={styles.sectionSubtitle}>Your scheduled foods for the day.</Text>
        </View>

        <View style={styles.mealList}>
          {MEALS.map((meal) => {
            const foodId = plan.days[selectedDay][meal].foodId;
            const food = foodId ? getFoodById(foodId) : undefined;
            const recommendation = foodId && patientProfile
              ? getRecommendationForFood(foodId, patientProfile)
              : null;

            return (
              <Pressable
                key={meal}
                style={styles.mealCard}
                onPress={() => navigation.navigate('MealPlanner')}
              >
                <View style={styles.mealHeader}>
                  <View style={styles.mealLabelRow}>
                    <MaterialCommunityIcons name={MEAL_ICONS[meal]} size={20} color={colors.darkGreen} />
                    <Text style={styles.mealLabel}>{MEAL_LABELS[meal]}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={colors.gray} />
                </View>

                {food ? (
                  <View style={styles.foodRow}>
                    <Image source={foodImages[food.id]} style={styles.foodImage} resizeMode="cover" />
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodMeta}>
                        {food.servingSize} • {food.nutrition.calories} cal
                        {recommendation ? ` • Score ${recommendation.score}` : ''}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyMeal}>
                    <MaterialCommunityIcons name="plus-circle-outline" size={20} color={colors.darkGreen} />
                    <Text style={styles.emptyMealText}>No food scheduled yet</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <AppBottomNav activeRoute="Home" />
    </SafeAreaView>
  );
}

function DashboardAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.darkGreen} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </Pressable>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  greeting: {
    fontSize: 16,
    color: colors.darkGreen,
    fontWeight: '600',
  },
  title: {
    ...typography.h1,
    color: colors.black,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: colors.darkGreen,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroEyebrow: {
    fontSize: 13,
    color: colors.mediumGreen,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    color: colors.white,
    fontWeight: '800',
    marginTop: 2,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSubtitle: {
    ...typography.caption,
    color: colors.white,
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.darkGreen,
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  conditionsBanner: {
    backgroundColor: colors.mediumGreen,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  conditionsLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
  },
  conditionsText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 116,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.black,
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
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
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mealLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mealLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.black,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  foodImage: {
    width: 78,
    height: 66,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lightGray,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.black,
  },
  foodMeta: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyMealText: {
    ...typography.caption,
    color: colors.darkGreen,
    fontWeight: '700',
  },
});
