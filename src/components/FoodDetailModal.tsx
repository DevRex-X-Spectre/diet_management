import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { foodImages } from '../data/foodImages';
import {
  getMealNote,
  MealSlot,
} from '../services/recommendation/RecommendationEngine';
import { borderRadius, colors, spacing, typography } from '../theme';
import type { RecommendedFood } from '../types/food';

const MEAL_ICONS: Record<MealSlot, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  breakfast: 'coffee-outline',
  lunch: 'silverware-fork-knife',
  dinner: 'bowl-mix-outline',
};

interface FoodDetailModalProps {
  recommendation: RecommendedFood | null;
  meal: MealSlot;
  onClose: () => void;
}

export function FoodDetailModal({ recommendation, meal, onClose }: FoodDetailModalProps) {
  if (!recommendation) return null;

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
              <MaterialCommunityIcons name={MEAL_ICONS[meal]} size={18} color={colors.darkGreen} />
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

const styles = StyleSheet.create({
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
