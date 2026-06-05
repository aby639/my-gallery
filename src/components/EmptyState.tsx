import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '../theme/theme';
import { AppLogo } from './AppLogo';
import { PrimaryButton } from './PrimaryButton';

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  theme: AppTheme;
};

export function EmptyState({ title, body, actionLabel, onAction, theme }: EmptyStateProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          boxShadow: `0 18px 42px ${theme.colors.shadow}`,
        },
      ]}
    >
      <View style={styles.illustration}>
        <AppLogo animated size={84} theme={theme} />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.colors.muted }]}>{body}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton icon="+" label={actionLabel} onPress={onAction} theme={theme} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 420,
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    borderWidth: 1,
    gap: 14,
    justifyContent: 'center',
    minHeight: 320,
    padding: 28,
  },
  illustration: {
    alignItems: 'center',
    height: 98,
    justifyContent: 'center',
    width: 112,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
