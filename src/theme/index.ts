import { Platform } from 'react-native';

/**
 * MealWise Theme & Design System
 *
 * Color palette inspired by fresh, healthy foods:
 * - Light green for backgrounds (calm, natural)
 * - Dark green for buttons (action, confidence)
 * - Black for text (readability, contrast)
 */

export const colors = {
  // Primary greens
  lightGreen: '#E8F5E9',     // Main background
  mediumGreen: '#A5D6A7',    // Accents, decorative
  darkGreen: '#2E7D32',      // Primary buttons
  deepGreen: '#1B5E20',      // Button pressed state

  // Neutrals
  black: '#212121',          // Primary text
  gray: '#757575',           // Secondary text
  lightGray: '#F5F5F5',      // Disabled backgrounds
  white: '#FFFFFF',          // Cards, inputs

  // Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  // Overlays
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(46, 125, 50, 0.05)',
} as const;

export const appFontFamily = Platform.select({
  android: 'sans-serif',
  ios: 'System',
  default: undefined,
});

const appTextBase = {
  fontFamily: appFontFamily,
  fontStyle: 'normal' as const,
  letterSpacing: 0,
};

export const typography = {
  h1: {
    ...appTextBase,
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.black,
  },
  h2: {
    ...appTextBase,
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.black,
  },
  h3: {
    ...appTextBase,
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.black,
  },
  body: {
    ...appTextBase,
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.black,
    lineHeight: 22,
  },
  caption: {
    ...appTextBase,
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.gray,
  },
  button: {
    ...appTextBase,
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;
