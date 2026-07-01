import React, { useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, borderRadius } from '../theme';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

/**
 * Custom slider for height/weight selection.
 * Shows current value prominently with draggable thumb.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: SliderProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const updateValue = (locationX: number) => {
    if (width === 0) return;
    const ratio = Math.max(0, Math.min(1, locationX / width));
    let newValue = min + ratio * (max - min);
    newValue = Math.round(newValue / step) * step;
    newValue = Math.max(min, Math.min(max, newValue));
    onChange(newValue);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e: GestureResponderEvent) => {
      updateValue(e.nativeEvent.locationX);
    },
    onPanResponderMove: (e: GestureResponderEvent) => {
      updateValue(e.nativeEvent.locationX);
    },
  });

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value}
          {unit}
        </Text>
      </View>
      <View
        style={styles.trackContainer}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percentage}%` }]} />
        </View>
        <View style={[styles.thumb, { left: `${percentage}%` }]} />
      </View>
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeText}>
          {min}
          {unit}
        </Text>
        <Text style={styles.rangeText}>
          {max}
          {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.darkGreen,
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 8,
    backgroundColor: colors.mediumGreen,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.darkGreen,
    borderRadius: borderRadius.full,
  },
  thumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.darkGreen,
    marginLeft: -14,
    top: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeText: {
    fontSize: 12,
    color: colors.gray,
  },
});
