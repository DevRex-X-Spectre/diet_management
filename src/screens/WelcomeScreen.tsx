import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
const AnimatedView = Animated.createAnimatedComponent(View);

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const FOOD_ICONS = [
  { icon: 'leaf', delay: 0, x: width * 0.15 },
  { icon: 'food-apple-outline', delay: 300, x: width * 0.45 },
  { icon: 'sprout-outline', delay: 600, x: width * 0.75 },
  { icon: 'fish', delay: 900, x: width * 0.25 },
  { icon: 'food-variant', delay: 1200, x: width * 0.55 },
  { icon: 'egg-outline', delay: 1500, x: width * 0.85 },
] as const;

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
          <AnimatedView
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
            <MaterialCommunityIcons
              name={item.icon}
              size={34}
              color={colors.darkGreen}
            />
          </AnimatedView>
        ))}
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>MealWise</Text>
          <View style={styles.logoUnderline} />
        </View>
        <Text style={styles.tagline}>Your smart meal companion</Text>
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
    paddingHorizontal: spacing.md,
  },
  iconContainer: {
    flex: 1,
    position: 'relative',
  },
  floatingIcon: {
    position: 'absolute',
    top: '40%',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    opacity: 0.86,
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
    letterSpacing: 0,
  },
  logoUnderline: {
    width: 132,
    height: 5,
    backgroundColor: colors.darkGreen,
    borderRadius: 999,
    marginTop: spacing.xs,
    transform: [{ skewX: '-22deg' }, { rotate: '-2deg' }],
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
    paddingHorizontal: spacing.md,
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
