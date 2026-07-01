import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, borderRadius } from '../theme';

interface PillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
}

/**
 * Selectable pill/chip used for options like gender and activity level.
 */
export function Pill({ label, selected, onPress, icon }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.mediumGreen,
    minWidth: 100,
  },
  selected: {
    backgroundColor: colors.darkGreen,
    borderColor: colors.darkGreen,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  icon: {
    fontSize: 18,
    marginRight: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  selectedLabel: {
    color: colors.white,
  },
});
