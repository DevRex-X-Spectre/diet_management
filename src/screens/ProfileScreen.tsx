import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNav } from '../components/AppBottomNav';
import { AppTopNav } from '../components/AppTopNav';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Pill } from '../components/Pill';
import { Slider } from '../components/Slider';
import {
  clearAuthSession,
  loadProfile,
  saveProfile,
  StoredProfile,
} from '../services/storage';
import { borderRadius, colors, shadows, spacing, typography } from '../theme';
import {
  ACTIVITY_DESCRIPTIONS,
  ACTIVITY_LABELS,
  ActivityLevel,
  HEALTH_CONDITION_DESCRIPTIONS,
  HEALTH_CONDITION_LABELS,
  HealthCondition,
  RootStackParamList,
} from '../types';
import {
  calculateBMI,
  calculateAgeFromDateOfBirth,
  calculateBMR,
  calculateTDEE,
  formatDateOfBirthInput,
  getBMICategory,
  getBMILabel,
  validateDateOfBirth,
} from '../utils/calculations';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ACTIVITY_OPTIONS: ActivityLevel[] = ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE'];
const CONDITION_OPTIONS: HealthCondition[] = [
  'TYPE_1_DIABETES',
  'TYPE_2_DIABETES',
  'HYPERTENSION',
  'OBESITY',
];

export function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('MODERATE');
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>([]);
  const [dateOfBirthError, setDateOfBirthError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo(() => {
    const calculatedAge = calculateAgeFromDateOfBirth(dateOfBirth);
    const age = calculatedAge ?? profile?.age ?? 30;
    const bmi = calculateBMI(weightKg, heightCm);
    const bmiCategory = getBMICategory(bmi);
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    return { age, bmi, bmiCategory, bmr, tdee };
  }, [activityLevel, dateOfBirth, gender, heightCm, profile?.age, weightKg]);

  const loadData = async () => {
    try {
      const savedProfile = await loadProfile();
      if (savedProfile) {
        setProfile(savedProfile);
        setDateOfBirth(savedProfile.dateOfBirth ?? '');
        setGender(savedProfile.gender);
        setHeightCm(savedProfile.heightCm);
        setWeightKg(savedProfile.weightKg);
        setActivityLevel(savedProfile.activityLevel);
        setHealthConditions(savedProfile.healthConditions);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCondition = (condition: HealthCondition) => {
    setHealthConditions((current) =>
      current.includes(condition)
        ? current.filter((item) => item !== condition)
        : [...current, condition]
    );
  };

  const handleSave = async () => {
    if (!profile) return;

    const result = validateDateOfBirth(dateOfBirth);
    if (result.age === null) {
      setDateOfBirthError(result.error);
      return;
    }

    setSaving(true);
    try {
      await saveProfile({
        ...profile,
        dateOfBirth,
        age: result.age,
        gender,
        heightCm,
        weightKg,
        activityLevel,
        healthConditions,
        bmi: metrics.bmi,
        bmiCategory: metrics.bmiCategory,
        bmr: metrics.bmr,
        tdee: metrics.tdee,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
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
          <Text style={styles.loadingText}>Opening profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppTopNav title="Your Profile" subtitle="Account" profileActive />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={36} color={colors.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.email}>{profile?.email ?? 'MealWise user'}</Text>
            <Text style={styles.profileMeta}>
              Age {metrics.age} • BMI {metrics.bmi} • {metrics.tdee} cal/day
            </Text>
          </View>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Personal details</Text>
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
          <Text style={styles.calculatedAge}>Calculated age: {metrics.age} years</Text>

          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.pillRow}>
            <Pill label="Male" selected={gender === 'MALE'} onPress={() => setGender('MALE')} />
            <Pill label="Female" selected={gender === 'FEMALE'} onPress={() => setGender('FEMALE')} />
          </View>

          <Slider label="Height" value={heightCm} min={120} max={220} unit=" cm" onChange={setHeightCm} />
          <Slider label="Weight" value={weightKg} min={30} max={200} unit=" kg" onChange={setWeightKg} />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Activity level</Text>
          <View style={styles.optionList}>
            {ACTIVITY_OPTIONS.map((level) => {
              const selected = activityLevel === level;
              return (
                <Pressable
                  key={level}
                  onPress={() => setActivityLevel(level)}
                  style={[styles.optionRow, selected && styles.optionRowSelected]}
                >
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>{ACTIVITY_LABELS[level]}</Text>
                    <Text style={styles.optionDescription}>{ACTIVITY_DESCRIPTIONS[level]}</Text>
                  </View>
                  {selected && (
                    <MaterialCommunityIcons name="check-circle" size={22} color={colors.darkGreen} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Health conditions</Text>
          <View style={styles.optionList}>
            {CONDITION_OPTIONS.map((condition) => {
              const selected = healthConditions.includes(condition);
              return (
                <Pressable
                  key={condition}
                  onPress={() => toggleCondition(condition)}
                  style={[styles.optionRow, selected && styles.optionRowSelected]}
                >
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>{HEALTH_CONDITION_LABELS[condition]}</Text>
                    <Text style={styles.optionDescription}>
                      {HEALTH_CONDITION_DESCRIPTIONS[condition]}
                    </Text>
                  </View>
                  {selected && (
                    <MaterialCommunityIcons name="check-circle" size={22} color={colors.darkGreen} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Button title="Save Changes" onPress={handleSave} loading={saving} style={styles.saveButton} />

        <View style={styles.accountActions}>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [styles.signOutCard, pressed && styles.signOutCardPressed]}
          >
            <View style={styles.signOutIcon}>
              <MaterialCommunityIcons name="logout" size={22} color={colors.error} />
            </View>
            <View style={styles.signOutCopy}>
              <Text style={styles.signOutTitle}>Sign Out</Text>
              <Text style={styles.signOutSubtitle}>End this local session on this phone</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray} />
          </Pressable>
        </View>
      </ScrollView>
      <AppBottomNav />
    </SafeAreaView>
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
    color: colors.darkGreen,
    fontWeight: '600',
  },
  title: {
    ...typography.h2,
    color: colors.black,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.darkGreen,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  email: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  profileMeta: {
    ...typography.caption,
    color: colors.white,
    marginTop: 3,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.black,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  calculatedAge: {
    ...typography.caption,
    color: colors.darkGreen,
    fontWeight: '700',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    marginLeft: 4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  optionList: {
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionRowSelected: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.darkGreen,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.black,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  accountActions: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  signOutCard: {
    ...shadows.small,
    minHeight: 72,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.22)',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  signOutCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  signOutIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutCopy: {
    flex: 1,
  },
  signOutTitle: {
    ...typography.body,
    color: colors.error,
    fontWeight: '800',
  },
  signOutSubtitle: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
});
