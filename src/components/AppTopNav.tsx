import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface AppTopNavProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  profileActive?: boolean;
}

export function AppTopNav({
  title,
  subtitle,
  showBack = true,
  profileActive = false,
}: AppTopNavProps) {
  const navigation = useNavigation<NavProp>();
  const canGoBack = navigation.canGoBack();

  const handleBack = () => {
    if (canGoBack) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  return (
    <View style={styles.nav}>
      <Pressable
        style={[styles.navButton, !showBack && styles.navButtonMuted]}
        onPress={handleBack}
        disabled={!showBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={22}
          color={showBack ? colors.darkGreen : 'transparent'}
        />
      </Pressable>

      <View style={styles.titleWrap}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <Pressable
        style={[styles.navButton, profileActive && styles.profileActive]}
        onPress={() => navigation.navigate('Profile')}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        <MaterialCommunityIcons
          name="account-circle"
          size={28}
          color={profileActive ? colors.white : colors.darkGreen}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.lightGreen,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGreen,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonMuted: {
    backgroundColor: 'transparent',
  },
  titleWrap: {
    flex: 1,
  },
  subtitle: {
    ...typography.caption,
    color: colors.darkGreen,
    fontWeight: '700',
  },
  title: {
    ...typography.h3,
    color: colors.black,
  },
  profileActive: {
    backgroundColor: colors.darkGreen,
  },
});
