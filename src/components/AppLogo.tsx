import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '../theme/theme';

type AppLogoProps = {
  theme: AppTheme;
  size?: number;
  animated?: boolean;
};

export function AppLogo({ animated = false, size = 72, theme }: AppLogoProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });

  useEffect(() => {
    if (!animated) {
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { duration: 1300, toValue: 1, useNativeDriver: true }),
        Animated.timing(pulse, { duration: 1300, toValue: 0, useNativeDriver: true }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [animated, pulse]);

  const cameraSize = size * 0.52;
  const lensSize = size * 0.26;

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="MemoLens app logo"
      style={[
        styles.logo,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
          borderRadius: Math.min(24, size * 0.24),
          height: size,
          transform: [{ scale }],
          width: size,
          boxShadow: `0 18px 48px ${theme.colors.shadow}`,
        },
      ]}
    >
      <View style={[styles.glow, { backgroundColor: theme.colors.primary, borderRadius: Math.min(18, size * 0.18) }]} />
      <View
        style={[
          styles.cameraBack,
          {
            borderColor: theme.colors.warm,
            borderRadius: Math.min(18, size * 0.18),
            height: cameraSize,
            width: cameraSize * 1.12,
          },
        ]}
      />
      <View
        style={[
          styles.cameraFront,
          {
            borderColor: theme.colors.secondary,
            borderRadius: Math.min(18, size * 0.17),
            height: cameraSize * 0.88,
            width: cameraSize,
          },
        ]}
      >
        <View
          style={[
            styles.lens,
            {
              borderColor: theme.colors.primary,
              borderRadius: lensSize,
              height: lensSize,
              width: lensSize,
            },
          ]}
        />
        <View style={[styles.lensDot, { backgroundColor: theme.colors.cyan, borderRadius: size * 0.04 }]} />
      </View>
      <View
        style={[
          styles.flash,
          {
            backgroundColor: theme.colors.warm,
            borderRadius: Math.min(8, size * 0.08),
            height: size * 0.1,
            width: size * 0.1,
          },
        ]}
      />
      <Text style={[styles.spark, { color: theme.colors.warm, fontSize: size * 0.2 }]}>+</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cameraBack: {
    borderWidth: 5,
    position: 'absolute',
    transform: [{ rotate: '-2deg' }],
  },
  cameraFront: {
    alignItems: 'center',
    borderWidth: 5,
    justifyContent: 'center',
    transform: [{ rotate: '3deg' }],
  },
  flash: {
    position: 'absolute',
    right: '23%',
    top: '25%',
  },
  glow: {
    bottom: 10,
    left: 10,
    opacity: 0.24,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  lens: {
    borderWidth: 5,
  },
  lensDot: {
    height: 7,
    position: 'absolute',
    width: 7,
  },
  logo: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  spark: {
    fontWeight: '900',
    position: 'absolute',
    right: '14%',
    top: '9%',
  },
});
