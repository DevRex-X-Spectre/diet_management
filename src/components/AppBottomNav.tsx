import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing } from '../theme';
import type { RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type BottomRoute = 'Home' | 'MealPlanner' | 'Recommendations';

interface AppBottomNavProps {
  activeRoute?: BottomRoute;
}

const NAV_ITEMS: {
  route: BottomRoute;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}[] = [
  { route: 'Home', label: 'Dashboard', icon: 'view-dashboard-outline' },
  { route: 'MealPlanner', label: 'Schedule', icon: 'calendar-edit' },
  { route: 'Recommendations', label: 'Explore', icon: 'food-apple-outline' },
];

export function AppBottomNav({ activeRoute }: AppBottomNavProps) {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = activeRoute === item.route;
          return (
            <Pressable
              key={item.route}
              style={[styles.item, active && styles.itemActive]}
              onPress={() => navigation.navigate(item.route)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color={active ? colors.white : colors.darkGreen}
              />
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.lightGreen,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGreen,
  },
  nav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    minHeight: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  itemActive: {
    backgroundColor: colors.darkGreen,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.darkGreen,
  },
  labelActive: {
    color: colors.white,
  },
});
