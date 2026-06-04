import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '../theme/theme';
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
        <View
          style={[
            styles.photoBack,
            {
              backgroundColor: theme.colors.primarySoft,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
            },
          ]}
        />
        <View
          style={[
            styles.photoFront,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <View style={[styles.sun, { backgroundColor: theme.colors.warning, borderRadius: 8 }]} />
          <View style={[styles.hill, { backgroundColor: theme.colors.accentSoft, borderRadius: theme.radius.sm }]} />
          <Text style={[styles.markText, { color: theme.colors.accent }]}>+</Text>
        </View>
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
  hill: {
    bottom: 13,
    height: 12,
    left: 12,
    position: 'absolute',
    right: 12,
  },
  illustration: {
    alignItems: 'center',
    height: 92,
    justifyContent: 'center',
    width: 112,
  },
  markText: {
    bottom: 4,
    fontSize: 20,
    fontWeight: '900',
    position: 'absolute',
    right: 12,
  },
  photoBack: {
    borderWidth: 1,
    height: 58,
    left: 12,
    position: 'absolute',
    top: 8,
    transform: [{ rotate: '-8deg' }],
    width: 76,
  },
  photoFront: {
    borderWidth: 1,
    height: 64,
    overflow: 'hidden',
    position: 'absolute',
    right: 8,
    top: 18,
    width: 82,
  },
  sun: {
    height: 16,
    left: 14,
    position: 'absolute',
    top: 12,
    width: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
