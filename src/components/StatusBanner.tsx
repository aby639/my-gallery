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
  const toneMark = tone === 'error' ? '!' : tone === 'success' ? 'OK' : 'i';
  const toneBackground =
    tone === 'error' ? `${theme.colors.danger}1A` : tone === 'success' ? `${theme.colors.success}1A` : theme.colors.accentSoft;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: toneBackground,
          borderColor: toneColor,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <View style={[styles.mark, { backgroundColor: toneColor, borderRadius: theme.radius.sm }]}>
        <Text style={[styles.markText, { color: tone === 'error' ? theme.colors.dangerText : theme.colors.primaryText }]}>
          {toneMark}
        </Text>
      </View>
      <Text style={[styles.text, { color: theme.colors.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'flex-start',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mark: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    marginTop: 1,
    minWidth: 22,
    paddingHorizontal: 4,
  },
  markText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
