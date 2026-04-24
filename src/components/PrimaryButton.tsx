import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { AppTheme } from '../theme/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  theme: AppTheme;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
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
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const colors = theme.colors;
  const buttonStyle = {
    primary: { backgroundColor: colors.primary, borderColor: colors.primary },
    secondary: { backgroundColor: colors.surface, borderColor: colors.border },
    danger: { backgroundColor: colors.danger, borderColor: colors.danger },
    ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  }[variant];

  const textColor = variant === 'primary' || variant === 'danger' ? colors.primaryText : colors.text;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.45 : pressed ? 0.72 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        buttonStyle,
        style,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
