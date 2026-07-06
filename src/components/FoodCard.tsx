import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { ScoreBadge } from './ScoreBadge';
import { colors, spacing, typography } from '../theme';
import { foodImages } from '../data/foodImages';
import type { RecommendedFood } from '../types/food';

interface FoodCardProps {
  recommendation: RecommendedFood;
  onPress?: () => void;
  mealNote?: string;
}

/**
 * Compact food card for the recommendation grid.
 */
export function FoodCard({ recommendation, onPress, mealNote }: FoodCardProps) {
  const { food, score } = recommendation;

  return (
    <Card onPress={onPress} style={styles.card}>
      <Image source={foodImages[food.id]} style={styles.image} resizeMode="cover" />

      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {food.name}
          </Text>
          {food.localName && (
            <Text style={styles.localName} numberOfLines={1}>
              {food.localName}
            </Text>
          )}
          <Text style={styles.serving} numberOfLines={1}>
            {food.servingSize}
          </Text>
        </View>
        <ScoreBadge score={score} size="small" />
      </View>

      {mealNote && (
        <Text style={styles.mealNote} numberOfLines={3}>
          {mealNote}
        </Text>
      )}

      <Text style={styles.whyText} numberOfLines={1}>
        Tap for health details
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 108,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  info: {
    flex: 1,
    marginRight: spacing.xs,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  localName: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'normal',
    marginBottom: 2,
  },
  serving: {
    fontSize: 12,
    color: colors.gray,
  },
  whyText: {
    fontSize: 12,
    color: colors.darkGreen,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  mealNote: {
    ...typography.caption,
    color: colors.gray,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
});
