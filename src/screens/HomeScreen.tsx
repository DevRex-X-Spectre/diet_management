import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { FoodCard } from '../components/FoodCard';
import { colors, spacing, typography } from '../theme';
import { loadProfile, StoredProfile } from '../services/storage';
import { getTopRecommendations } from '../services/recommendation/RecommendationEngine';
import type { RecommendedFood } from '../types/food';
import { HEALTH_CONDITION_LABELS } from '../types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

/**
 * Home screen showing personalized food recommendations.
 * Loads patient profile and displays recommended foods in a grid.
 */
export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedFood[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleSignOut = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
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

        {/* Recommendations Grid */}
        <View style={styles.gridHeader}>
          <Text style={styles.gridTitle}>🍽️ Foods You Can Eat</Text>
          <Text style={styles.gridSubtitle}>
            Tap any food to see why it's recommended for you
          </Text>
        </View>

        {recommendations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>😔</Text>
            <Text style={styles.emptyTitle}>No recommendations found</Text>
            <Text style={styles.emptyText}>
              We couldn't find foods that match all your conditions.
              Try adjusting your health conditions in your profile.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {recommendations.map((rec) => (
              <View key={rec.food.id} style={styles.gridItem}>
                <FoodCard recommendation={rec} />
              </View>
            ))}
          </View>
        )}

        {/* Food Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoryGrid}>
            <CategoryCard emoji="🐟" label="Proteins" count={12} />
            <CategoryCard emoji="🥬" label="Vegetables" count={10} />
            <CategoryCard emoji="🍚" label="Grains" count={10} />
            <CategoryCard emoji="🍎" label="Fruits" count={6} />
            <CategoryCard emoji="🥣" label="Soups" count={8} />
            <CategoryCard emoji="🥛" label="Dairy" count={3} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryCard({
  emoji,
  label,
  count,
}: {
  emoji: string;
  label: string;
  count: number;
}) {
  return (
    <View style={styles.categoryCard}>
      <Text style={styles.categoryEmoji}>{emoji}</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: CARD_WIDTH,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
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
    width: (width - spacing.lg * 2 - spacing.sm * 2) / 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 4,
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
});