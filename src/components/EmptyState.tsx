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
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <View style={[styles.mark, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md }]}>
        <Text style={[styles.markText, { color: theme.colors.text }]}>+</Text>
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.colors.muted }]}>{body}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} theme={theme} variant="secondary" />
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
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 12,
    justifyContent: 'center',
    minHeight: 300,
    padding: 24,
  },
  mark: {
    alignItems: 'center',
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  markText: {
    fontSize: 28,
    fontWeight: '300',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
