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

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="MemoLens app logo"
      style={[
        styles.logo,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
          borderRadius: Math.min(8, size * 0.16),
          height: size,
          transform: [{ scale }],
          width: size,
        },
      ]}
    >
      <View style={[styles.glow, { backgroundColor: theme.colors.secondary, borderRadius: Math.min(8, size * 0.14) }]} />
      <View
        style={[
          styles.camera,
          {
            borderColor: theme.colors.accent,
            borderRadius: Math.min(8, size * 0.15),
            height: size * 0.38,
            width: size * 0.5,
          },
        ]}
      >
        <View
          style={[
            styles.lens,
            {
              borderColor: theme.colors.secondary,
              borderRadius: size * 0.13,
              height: size * 0.27,
              width: size * 0.27,
            },
          ]}
        />
        <View style={[styles.lensDot, { backgroundColor: theme.colors.cyan, borderRadius: size * 0.03 }]} />
      </View>
      <View
        style={[
          styles.flash,
          {
            backgroundColor: theme.colors.warm,
            borderRadius: Math.min(6, size * 0.08),
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
  camera: {
    alignItems: 'center',
    borderWidth: 4,
    justifyContent: 'center',
  },
  flash: {
    position: 'absolute',
    right: '23%',
    top: '26%',
  },
  glow: {
    bottom: 9,
    left: 9,
    opacity: 0.18,
    position: 'absolute',
    right: 9,
    top: 9,
  },
  lens: {
    borderWidth: 4,
  },
  lensDot: {
    height: 6,
    position: 'absolute',
    right: '22%',
    top: '32%',
    width: 6,
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
    right: '16%',
    top: '10%',
  },
});
