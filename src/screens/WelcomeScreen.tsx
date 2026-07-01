import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

// Floating food icons that gently animate up and down
const FOOD_ICONS = [
  { emoji: '🥗', delay: 0, x: width * 0.15 },
  { emoji: '🍎', delay: 300, x: width * 0.45 },
  { emoji: '🥦', delay: 600, x: width * 0.75 },
  { emoji: '🐟', delay: 900, x: width * 0.25 },
  { emoji: '🥑', delay: 1200, x: width * 0.55 },
  { emoji: '🥚', delay: 1500, x: width * 0.85 },
];

/**
 * Welcome / Hero screen - first impression for the app.
 * Animated food icons create visual interest and convey "diet" theme.
 */
export function WelcomeScreen() {
  const navigation = useNavigation<NavProp>();

  // Stagger animation for each food icon
  const floatAnims = useRef(
    FOOD_ICONS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = floatAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(FOOD_ICONS[index].delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.parallel(animations).start();
  }, [floatAnims]);

  const navigateToRegister = () => {
    navigation.navigate('Auth', { mode: 'register' });
  };

  const navigateToLogin = () => {
    navigation.navigate('Auth', { mode: 'login' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.iconContainer}>
        {FOOD_ICONS.map((item, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.floatingIcon,
              {
                left: item.x,
                transform: [
                  {
                    translateY: floatAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                ],
              },
            ]}
          >
            {item.emoji}
          </Animated.Text>
        ))}
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>BigBen</Text>
          <View style={styles.logoUnderline} />
        </View>
        <Text style={styles.tagline}>Your Diet Companion</Text>
        <Text style={styles.description}>
          Healthy eating for a better life.{'\n'}
          Personalized for your health needs.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={navigateToRegister}
          icon="✨"
        />
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <Text style={styles.signInLink} onPress={navigateToLogin}>
            Sign In
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGreen,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    flex: 1,
    position: 'relative',
  },
  floatingIcon: {
    position: 'absolute',
    fontSize: 42,
    top: '40%',
  },
  content: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.darkGreen,
    letterSpacing: -1,
  },
  logoUnderline: {
    width: 60,
    height: 4,
    backgroundColor: colors.darkGreen,
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  tagline: {
    fontSize: 18,
    color: colors.darkGreen,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signInText: {
    ...typography.body,
    color: colors.gray,
  },
  signInLink: {
    ...typography.body,
    color: colors.darkGreen,
    fontWeight: '700',
  },
});
