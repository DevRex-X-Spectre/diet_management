import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { ScoreBadge } from './ScoreBadge';
import { colors, spacing, typography } from '../theme';
import type { RecommendedFood } from '../types/food';

interface FoodCardProps {
  recommendation: RecommendedFood;
  onPress?: () => void;
}

/**
 * Food card for the recommendation grid.
 * Shows emoji, name, score badge, and expandable "Why?" explanation.
 */
export function FoodCard({ recommendation, onPress }: FoodCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { food, score, reasons, warnings } = recommendation;

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <Card onPress={onPress} style={styles.card}>
      {/* Header Row: Emoji + Info */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{food.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {food.name}
          </Text>
          {food.localName && (
            <Text style={styles.localName} numberOfLines={1}>
              {food.localName}
            </Text>
          )}
          <Text style={styles.serving}>{food.servingSize}</Text>
        </View>
        <ScoreBadge score={score} size="medium" />
      </View>

      {/* Why Button */}
      <Pressable onPress={toggleExpanded} style={styles.whyButton}>
        <Text style={styles.whyText}>
          {expanded ? '▲ Hide details' : '▼ Why recommended?'}
        </Text>
      </Pressable>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.details}>
          {/* Reasons */}
          {reasons.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>✓ Good for you because:</Text>
              {reasons.map((reason, index) => (
                <Text key={index} style={styles.reasonText}>
                  • {reason}
                </Text>
              ))}
            </View>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <View style={styles.warningSection}>
              <Text style={styles.sectionTitle}>⚠️ Notes:</Text>
              {warnings.map((warning, index) => (
                <Text key={index} style={styles.warningText}>
                  • {warning}
                </Text>
              ))}
            </View>
          )}

          {/* Nutritional Quick Facts */}
          <View style={styles.nutritionRow}>
            <NutritionPill label="Cal" value={food.nutrition.calories} />
            <NutritionPill label="Protein" value={`${food.nutrition.protein}g`} />
            <NutritionPill label="Fiber" value={`${food.nutrition.fiber}g`} />
            <NutritionPill label="Sodium" value={`${food.nutrition.sodium}mg`} />
          </View>
        </View>
      )}
    </Card>
  );
}

function NutritionPill({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.nutritionPill}>
      <Text style={styles.nutritionValue}>{value}</Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  localName: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  serving: {
    fontSize: 12,
    color: colors.gray,
  },
  whyButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  whyText: {
    fontSize: 13,
    color: colors.darkGreen,
    fontWeight: '600',
    textAlign: 'center',
  },
  details: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  detailSection: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.darkGreen,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: colors.black,
    lineHeight: 18,
    marginLeft: spacing.xs,
  },
  warningSection: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.warning + '15',
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 18,
    marginLeft: spacing.xs,
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  nutritionPill: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkGreen,
  },
  nutritionLabel: {
    fontSize: 9,
    color: colors.gray,
  },
});