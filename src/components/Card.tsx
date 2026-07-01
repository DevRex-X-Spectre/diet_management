import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows } from '../theme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  style?: ViewStyle;
}

/**
 * White card with subtle shadow. Used for selectable items
 * like health conditions. Shows selected state with green border.
 */
export function Card({ children, onPress, selected, style }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          selected && styles.selected,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, selected && styles.selected, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.small,
  },
  selected: {
    borderColor: colors.darkGreen,
    backgroundColor: colors.lightGreen,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
