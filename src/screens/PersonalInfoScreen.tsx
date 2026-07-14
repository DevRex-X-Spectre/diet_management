import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Pill } from '../components/Pill';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { Slider } from '../components/Slider';
import {
  saveOnboardingProgress,
} from '../services/storage';
import {
  ACTIVITY_DESCRIPTIONS,
  ACTIVITY_LABELS,
  ActivityLevel,
} from '../types';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../types';
import {
  formatDateOfBirthInput,
  validateDateOfBirth,
} from '../utils/calculations';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'PersonalInfo'>;

const ACTIVITY_OPTIONS: ActivityLevel[] = [
  'SEDENTARY',
  'LIGHT',
  'MODERATE',
  'ACTIVE',
];

export function PersonalInfoScreen() {
  const navigation = useNavigation<NavProp>();

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(null);
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [dateOfBirthError, setDateOfBirthError] = useState('');

  const getCalculatedAge = (): number | null => {
    const result = validateDateOfBirth(dateOfBirth);
    setDateOfBirthError(result.error);
    return result.age;
  };

  const validate = (): boolean => {
    const age = getCalculatedAge();
    if (age === null) return false;
    if (!gender) return false;
    if (!activityLevel) return false;
    return true;
  };

  const handleContinue = async () => {
    if (!validate()) {
      if (!gender || !activityLevel) return;
    }
    if (!gender || !activityLevel) return;
    const age = getCalculatedAge();
    if (age === null) return;

    // Save progress for resume capability
    await saveOnboardingProgress({
      currentStep: 'conditions',
      dateOfBirth,
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
    });

    navigation.navigate('HealthConditions', {
      dateOfBirth,
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
    });
  };

  const isValid =
    dateOfBirth.length === 10 &&
    gender !== null &&
    activityLevel !== null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressIndicator currentStep={2} totalSteps={4} />

          <View style={styles.header}>
            <Text style={styles.title}>Tell Us About Yourself</Text>
            <Text style={styles.subtitle}>
              This helps us personalize your diet
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Date of Birth"
              value={dateOfBirth}
              onChangeText={(text) => {
                setDateOfBirth(formatDateOfBirthInput(text));
                setDateOfBirthError('');
              }}
              placeholder="YYYY-MM-DD"
              keyboardType="number-pad"
              maxLength={10}
              error={dateOfBirthError}
              iconName="calendar"
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Gender</Text>
              <View style={styles.pillRow}>
                <Pill
                  label="Male"
                  icon="👨"
                  selected={gender === 'MALE'}
                  onPress={() => setGender('MALE')}
                />
                <Pill
                  label="Female"
                  icon="👩"
                  selected={gender === 'FEMALE'}
                  onPress={() => setGender('FEMALE')}
                />
              </View>
            </View>

            <Slider
              label="Height"
              value={heightCm}
              min={120}
              max={220}
              unit=" cm"
              onChange={setHeightCm}
            />

            <Slider
              label="Weight"
              value={weightKg}
              min={30}
              max={200}
              unit=" kg"
              onChange={setWeightKg}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Activity Level</Text>
              <View style={styles.activityList}>
                {ACTIVITY_OPTIONS.map((level) => (
                  <Pressable
                    key={level}
                    onPress={() => setActivityLevel(level)}
                    style={({ pressed }) => [
                      styles.activityOption,
                      activityLevel === level && styles.activityOptionSelected,
                      pressed && styles.activityOptionPressed,
                    ]}
                  >
                    <Text style={styles.activityTitle}>
                      {ACTIVITY_LABELS[level]}
                    </Text>
                    <Text style={styles.activityDescription}>
                      {ACTIVITY_DESCRIPTIONS[level]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Button
              title="Continue"
              onPress={handleContinue}
              disabled={!isValid}
              style={styles.continueButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGreen,
  },
  flex: {
    flex: 1,
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
  form: {
    flex: 1,
  },
  section: {
    marginVertical: spacing.md,
  },
  sectionLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.black,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  activityList: {
    gap: spacing.sm,
  },
  activityOption: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityOptionSelected: {
    borderColor: colors.darkGreen,
    backgroundColor: colors.lightGreen,
  },
  activityOptionPressed: {
    opacity: 0.8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
    color: colors.gray,
  },
  continueButton: {
    marginTop: spacing.xl,
  },
});
