import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

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
  const { width } = useWindowDimensions();
  const isCompact = width < 520;
  const initial = user.name.trim().charAt(0).toUpperCase() || 'M';
  const firstName = user.name.trim().split(/\s+/)[0] || 'there';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          boxShadow: `0 18px 40px ${theme.colors.shadow}`,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.profile, isCompact ? styles.profileCompact : undefined]}>
          {user.photoUrl ? (
            <Image
              source={{ uri: user.photoUrl }}
              style={[
                styles.avatar,
                {
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                },
              ]}
            />
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
            <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>Good to see you, {firstName}</Text>
            <Text numberOfLines={1} style={[styles.name, { color: theme.colors.text }]}>
              MemoLens
            </Text>
            {user.email ? (
              <Text numberOfLines={1} style={[styles.email, { color: theme.colors.muted }]}>
                {user.email}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={[styles.actions, isCompact ? styles.actionsCompact : undefined]}>
          <HeaderAction
            label={themePreference === 'dark' ? 'Light' : 'Dark'}
            onPress={onToggleTheme}
            theme={theme}
          />
          <HeaderAction label="Settings" onPress={onOpenSettings} theme={theme} />
        </View>
      </View>

      <Text style={[styles.welcomeCopy, { color: theme.colors.textSoft }]}>
        Keep the photo, mood, caption, and tags together so the useful memories stay easy to find.
      </Text>
    </View>
  );
}

type HeaderActionProps = {
  label: string;
  onPress: () => void;
  theme: AppTheme;
};

function HeaderAction({ label, onPress, theme }: HeaderActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.actionText, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  actionsCompact: {
    justifyContent: 'flex-start',
    width: '100%',
  },
  avatar: {
    borderWidth: 1,
    height: 60,
    width: 60,
  },
  avatarFallback: {
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '900',
  },
  container: {
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  email: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 0,
  },
  profile: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  profileCompact: {
    flexBasis: '100%',
  },
  profileText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  welcomeCopy: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    maxWidth: 660,
  },
});
