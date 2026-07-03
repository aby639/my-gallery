import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { MemoLensMark, memoColors } from './memolens/MemoLensKit';

type MemoLensLogoProps = {
  animated?: boolean;
  size?: number;
};

export function MemoLensLogo({ animated = false, size = 48 }: MemoLensLogoProps) {
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
      accessibilityLabel="MemoLens logo"
      accessibilityRole="image"
      style={[styles.root, { height: size, transform: [{ scale }], width: size }]}
    >
      <View pointerEvents="none" style={[styles.glow, { borderRadius: size / 2, height: size, width: size }]} />
      <MemoLensMark size={size} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  glow: {
    backgroundColor: memoColors.pink,
    opacity: 0.18,
    position: 'absolute',
    shadowColor: memoColors.pink,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.48,
    shadowRadius: 18,
  },
});
