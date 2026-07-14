import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
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
  const { food } = recommendation;

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
      </View>

      <View style={styles.body}>
        {mealNote && (
          <Text style={styles.mealNote} numberOfLines={3}>
            {mealNote}
          </Text>
        )}

        <Text style={styles.whyText} numberOfLines={1}>
          Tap for health details
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    minHeight: 252,
  },
  image: {
    width: '100%',
    height: 116,
    backgroundColor: colors.lightGray,
  },
  header: {
    paddingHorizontal: spacing.sm,
    paddingTop: 10,
    paddingBottom: 4,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '800',
    lineHeight: 17,
    marginBottom: 3,
  },
  localName: {
    fontSize: 11,
    color: colors.black,
    opacity: 0.58,
    fontStyle: 'normal',
    lineHeight: 14,
    marginBottom: 3,
  },
  serving: {
    fontSize: 12,
    color: colors.gray,
    lineHeight: 15,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  whyText: {
    fontSize: 12,
    color: colors.darkGreen,
    fontWeight: '800',
    lineHeight: 15,
  },
  mealNote: {
    ...typography.caption,
    fontSize: 12,
    color: colors.gray,
    lineHeight: 16,
  },
});
