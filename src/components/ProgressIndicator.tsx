import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * Step indicator shown at top of onboarding screens.
 * Shows numbered dots and progress label.
 */
export function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Step {currentStep} of {totalSteps}
      </Text>
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < currentStep && styles.completedDot,
              index === currentStep - 1 && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.darkGreen,
    marginBottom: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mediumGreen,
  },
  completedDot: {
    backgroundColor: colors.darkGreen,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.darkGreen,
  },
});
