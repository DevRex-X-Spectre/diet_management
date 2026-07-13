import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressIndicator } from '../components/ProgressIndicator';
import {
  clearOnboardingProgress,
  generateId,
  getCurrentUserEmail,
  saveProfile,
} from '../services/storage';
import {
  ACTIVITY_LABELS,
  HEALTH_CONDITION_LABELS,
} from '../types';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../types';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  getBMICategory,
  getBMIColor,
  getBMILabel,
} from '../utils/calculations';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ProfileSummary'>;
type SummaryRouteProp = RouteProp<RootStackParamList, 'ProfileSummary'>;

interface ProfileSummaryParams {
  dateOfBirth?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE';
  heightCm?: number;
  weightKg?: number;
  activityLevel?: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE';
  healthConditions?: string[];
}

export function ProfileSummaryScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<SummaryRouteProp>();
  const [saving, setSaving] = useState(false);

  // Read data passed through navigation
  const params = (route.params ?? {}) as ProfileSummaryParams;
  const dateOfBirth = params.dateOfBirth ?? '';
  const age = params.age ?? 0;
  const gender = params.gender ?? 'MALE';
  const heightCm = params.heightCm ?? 170;
  const weightKg = params.weightKg ?? 70;
  const activityLevel = params.activityLevel ?? 'MODERATE';
  const healthConditions = (params.healthConditions ??
    []) as ('TYPE_1_DIABETES' | 'TYPE_2_DIABETES' | 'HYPERTENSION' | 'OBESITY')[];

  // Calculate health metrics
  const metrics = useMemo(() => {
    const bmi = calculateBMI(weightKg, heightCm);
    const bmiCategory = getBMICategory(bmi);
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    return { bmi, bmiCategory, bmr, tdee };
  }, [age, gender, heightCm, weightKg, activityLevel]);

  const handleStart = async () => {
    setSaving(true);
    try {
      const currentEmail = await getCurrentUserEmail();
      await saveProfile({
        id: generateId(),
        email: currentEmail ?? 'user@mealwise.app',
        dateOfBirth,
        age,
        gender,
        heightCm,
        weightKg,
        activityLevel,
        healthConditions,
        bmi: metrics.bmi,
        bmiCategory: metrics.bmiCategory,
        bmr: metrics.bmr,
        tdee: metrics.tdee,
        createdAt: new Date().toISOString(),
      });
      await clearOnboardingProgress();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const bmiColor = getBMIColor(metrics.bmiCategory);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProgressIndicator currentStep={4} totalSteps={4} />

        <View style={styles.header}>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>
            Review your information below
          </Text>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Body Metrics</Text>
          <MetricRow label="Date of Birth" value={dateOfBirth || 'Not set'} />
          <MetricRow label="Calculated Age" value={`${age} years`} />
          <MetricRow
            label="Gender"
            value={gender === 'MALE' ? 'Male' : 'Female'}
          />
          <MetricRow label="Height" value={`${heightCm} cm`} />
          <MetricRow label="Weight" value={`${weightKg} kg`} />
          <MetricRow
            label="BMI"
            value={`${metrics.bmi} (${getBMILabel(metrics.bmiCategory)})`}
            valueColor={bmiColor}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Daily Energy</Text>
          <MetricRow
            label="Activity Level"
            value={ACTIVITY_LABELS[activityLevel]}
          />
          <MetricRow label="BMR" value={`${Math.round(metrics.bmr)} cal/day`} />
          <MetricRow
            label="TDEE"
            value={`${metrics.tdee} cal/day`}
            valueColor={colors.darkGreen}
          />
          <Text style={styles.note}>
            TDEE is your daily calorie target based on your activity level
          </Text>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🩺 Health Conditions</Text>
          {healthConditions.length === 0 ? (
            <Text style={styles.emptyText}>No conditions selected</Text>
          ) : (
            healthConditions.map((condition) => (
              <View key={condition} style={styles.conditionItem}>
                <Text style={styles.conditionCheck}>✓</Text>
                <Text style={styles.conditionName}>
                  {HEALTH_CONDITION_LABELS[condition]}
                </Text>
              </View>
            ))
          )}
        </Card>

        <Button
          title="Start Eating Well"
          onPress={handleStart}
          loading={saving}
          icon="🎉"
          style={styles.startButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGreen,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginVertical: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.black,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  metricLabel: {
    fontSize: 15,
    color: colors.gray,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  note: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'normal',
    marginTop: spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: colors.gray,
    fontStyle: 'normal',
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  conditionCheck: {
    fontSize: 18,
    color: colors.success,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  conditionName: {
    fontSize: 15,
    color: colors.black,
    fontWeight: '500',
  },
  startButton: {
    marginTop: spacing.md,
  },
});
