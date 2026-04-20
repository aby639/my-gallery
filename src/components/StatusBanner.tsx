import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '../theme/theme';

type StatusBannerProps = {
  message?: string;
  tone?: 'info' | 'error' | 'success';
  theme: AppTheme;
};

export function StatusBanner({ message, tone = 'info', theme }: StatusBannerProps) {
  if (!message) {
    return null;
  }

  const toneColor =
    tone === 'error' ? theme.colors.danger : tone === 'success' ? theme.colors.success : theme.colors.accent;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.surface,
          borderColor: toneColor,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <Text style={[styles.text, { color: theme.colors.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderLeftWidth: 3,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
});
