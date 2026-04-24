import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemePreference } from '../storage/galleryStorage';
import { AppTheme } from '../theme/theme';
import { GalleryUser } from '../types/gallery';

type ProfileHeaderProps = {
  user: GalleryUser;
  theme: AppTheme;
  themePreference: ThemePreference;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
};

export function ProfileHeader({ user, theme, themePreference, onOpenSettings, onToggleTheme }: ProfileHeaderProps) {
  const initial = user.name.trim().charAt(0).toUpperCase() || 'G';

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        {user.photoUrl ? (
          <Image source={{ uri: user.photoUrl }} style={[styles.avatar, { borderRadius: theme.radius.md }]} />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Text style={[styles.avatarInitial, { color: theme.colors.primaryText }]}>{initial}</Text>
          </View>
        )}
        <View style={styles.profileText}>
          <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Signed in</Text>
          <Text numberOfLines={1} style={[styles.name, { color: theme.colors.text }]}>
            {user.name}
          </Text>
          {user.email ? (
            <Text numberOfLines={1} style={[styles.email, { color: theme.colors.muted }]}>
              {user.email}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onToggleTheme}
          style={({ pressed }) => [
            styles.action,
            {
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            {themePreference === 'dark' ? 'Light' : 'Dark'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenSettings}
          style={({ pressed }) => [
            styles.action,
            {
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  avatar: {
    height: 48,
    width: 48,
  },
  avatarFallback: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '800',
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  email: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
  },
  profile: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  profileText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
});
