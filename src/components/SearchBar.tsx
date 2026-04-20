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
      <Text style={[styles.icon, { color: theme.colors.muted }]}>Search</Text>
      <TextInput
        accessibilityLabel="Search captions"
        onChangeText={onChangeText}
        placeholder="Search captions"
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, { color: theme.colors.text }]}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable accessibilityRole="button" onPress={() => onChangeText('')} style={styles.clearButton}>
          <Text style={[styles.clearText, { color: theme.colors.muted }]}>Clear</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  icon: {
    fontSize: 12,
    fontWeight: '800',
  },
  input: {
    flex: 1,
    fontSize: 15,
    minHeight: 42,
  },
});
