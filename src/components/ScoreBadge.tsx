import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getScoreColor, getScoreCategory, getScoreLabel } from '../types/food';
import { colors, borderRadius, shadows } from '../theme';

interface ScoreBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Visual score indicator with color coding.
 * - Green (90+): Excellent
 * - Medium green (70-89): Good
 * - Orange (50-69): Moderate
 * - Red (<50): Caution
 */
export function ScoreBadge({ score, size = 'medium' }: ScoreBadgeProps) {
  const scoreColor = getScoreColor(score);
  const scoreCategory = getScoreCategory(score);
  const label = getScoreLabel(score);

  const dimensions = {
    small: { width: 40, height: 40, fontSize: 12, labelSize: 8 },
    medium: { width: 56, height: 56, fontSize: 16, labelSize: 9 },
    large: { width: 72, height: 72, fontSize: 20, labelSize: 10 },
  };

  const { width, height, fontSize, labelSize } = dimensions[size];

  return (
    <View
      style={[
        styles.badge,
        {
          width,
          height,
          borderColor: scoreColor,
          backgroundColor: `${scoreColor}15`,
        },
      ]}
    >
      <Text style={[styles.score, { fontSize, color: scoreColor }]}>
        {score}
      </Text>
      <Text style={[styles.label, { fontSize: labelSize, color: scoreColor }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  score: {
    fontWeight: '700',
    lineHeight: 24,
  },
  label: {
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});