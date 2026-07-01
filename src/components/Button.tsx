import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: string;
}

/**
 * Primary green button used for CTAs throughout the app.
 * Pressable for haptic feedback and visual pressed state.
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text
            style={[
              styles.text,
              variant === 'outline' && styles.outlineText,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.lg,
    minHeight: 56,
    ...shadows.small,
  },
  primary: {
    backgroundColor: colors.darkGreen,
  },
  secondary: {
    backgroundColor: colors.mediumGreen,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.darkGreen,
  },
  pressed: {
    backgroundColor: colors.deepGreen,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.6,
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
  outlineText: {
    color: colors.darkGreen,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
});
