import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { saveOnboardingProgress } from '../services/storage';
import {
  HEALTH_CONDITION_DESCRIPTIONS,
  HEALTH_CONDITION_ICONS,
  HEALTH_CONDITION_LABELS,
  HealthCondition,
} from '../types';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'HealthConditions'>;
type HealthConditionsRouteProp = RouteProp<RootStackParamList, 'HealthConditions'>;

const ALL_CONDITIONS: HealthCondition[] = [
  'TYPE_1_DIABETES',
  'TYPE_2_DIABETES',
  'HYPERTENSION',
  'OBESITY',
];

export function HealthConditionsScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<HealthConditionsRouteProp>();
  const [selected, setSelected] = useState<HealthCondition[]>([]);

  const toggleCondition = (condition: HealthCondition) => {
    setSelected((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const handleContinue = async () => {
    const parentParams = route.params;
    await saveOnboardingProgress({
      currentStep: 'summary',
      dateOfBirth: parentParams.dateOfBirth,
      age: parentParams.age,
      gender: parentParams.gender,
      heightCm: parentParams.heightCm,
      weightKg: parentParams.weightKg,
      activityLevel: parentParams.activityLevel,
      healthConditions: selected,
    });

    navigation.navigate('ProfileSummary', {
      dateOfBirth: parentParams.dateOfBirth,
      age: parentParams.age,
      gender: parentParams.gender,
      heightCm: parentParams.heightCm,
      weightKg: parentParams.weightKg,
      activityLevel: parentParams.activityLevel,
      healthConditions: selected,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProgressIndicator currentStep={3} totalSteps={4} />

        <View style={styles.header}>
          <Text style={styles.title}>Your Health Conditions</Text>
          <Text style={styles.subtitle}>
            Select all that apply to you
          </Text>
        </View>

        <View style={styles.list}>
          {ALL_CONDITIONS.map((condition) => (
            <Card
              key={condition}
              selected={selected.includes(condition)}
              onPress={() => toggleCondition(condition)}
            >
              <View style={styles.conditionRow}>
                <Text style={styles.conditionIcon}>
                  {HEALTH_CONDITION_ICONS[condition]}
                </Text>
                <View style={styles.conditionText}>
                  <Text style={styles.conditionTitle}>
                    {HEALTH_CONDITION_LABELS[condition]}
                  </Text>
                  <Text style={styles.conditionDescription}>
                    {HEALTH_CONDITION_DESCRIPTIONS[condition]}
                  </Text>
                </View>
                {selected.includes(condition) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            💡 Don't see your condition? You can skip this step and add it later
            from your profile.
          </Text>
        </View>

        <Button
          title={`Continue${selected.length > 0 ? ` (${selected.length} selected)` : ''}`}
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGreen,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
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
  list: {
    gap: spacing.md,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  conditionText: {
    flex: 1,
  },
  conditionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  conditionDescription: {
    fontSize: 13,
    color: colors.gray,
  },
  checkmark: {
    fontSize: 24,
    color: colors.darkGreen,
    fontWeight: '700',
  },
  helpContainer: {
    backgroundColor: colors.mediumGreen,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  helpText: {
    fontSize: 13,
    color: colors.black,
    lineHeight: 18,
  },
  continueButton: {
    marginTop: spacing.lg,
  },
});
