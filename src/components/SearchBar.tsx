import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppTheme } from '../theme/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  theme: AppTheme;
};

export function SearchBar({ value, onChangeText, theme }: SearchBarProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <View style={[styles.iconPill, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.sm }]}>
        <Text style={[styles.icon, { color: theme.colors.text }]}>S</Text>
      </View>
      <TextInput
        accessibilityLabel="Search captions"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder="Search captions, tags, source"
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, { color: theme.colors.text }]}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onChangeText('')}
          style={({ pressed }) => [
            styles.clearButton,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radius.sm,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.clearText, { color: theme.colors.text }]}>Clear</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '800',
  },
  container: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 10,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
  },
  icon: {
    fontSize: 13,
    fontWeight: '900',
  },
  iconPill: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    minHeight: 42,
  },
});
