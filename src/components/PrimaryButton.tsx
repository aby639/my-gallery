import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { AppTheme } from '../theme/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  theme: AppTheme;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: ViewStyle;
};

export function PrimaryButton({
  accessibilityHint,
  accessibilityLabel,
  label,
  onPress,
  theme,
  disabled = false,
  fullWidth = false,
  icon,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const colors = theme.colors;
  const buttonStyle = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      boxShadow: `0 12px 28px ${colors.shadow}`,
    },
    secondary: { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
    danger: { backgroundColor: colors.danger, borderColor: colors.danger },
    ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  }[variant];

  const textColor =
    variant === 'primary' ? colors.primaryText : variant === 'danger' ? colors.dangerText : colors.text;

  const pressTo = (value: number) => {
    Animated.spring(scale, {
      damping: 18,
      mass: 0.5,
      stiffness: 260,
      toValue: value,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale }],
          width: fullWidth ? '100%' : undefined,
        },
      ]}
    >
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => pressTo(0.98)}
        onPressOut={() => pressTo(1)}
        style={[
          styles.button,
          {
            borderRadius: theme.radius.md,
            opacity: disabled ? 0.7 : 1,
          },
          buttonStyle,
          style,
        ]}
      >
        {icon ? (
          <Text style={[styles.icon, { color: textColor }]} numberOfLines={1}>
            {icon}
          </Text>
        ) : null}
        <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  icon: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
