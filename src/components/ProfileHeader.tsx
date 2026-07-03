import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ThemePreference } from '../storage/galleryStorage';
import { AppTheme } from '../theme/theme';
import { GalleryUser } from '../types/gallery';
import { AppLogo } from './AppLogo';

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
          backgroundColor: theme.colors.surfaceGlass,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <View style={styles.brandRow}>
        <View style={styles.brandLockup}>
          <AppLogo size={36} theme={theme} />
          <View style={styles.brandCopy}>
            <Text style={[styles.brand, { color: theme.colors.text }]}>MemoLens</Text>
            <Text numberOfLines={1} style={[styles.eyebrow, { color: theme.colors.muted }]}>
              Good evening, {firstName}
            </Text>
          </View>
        </View>

        <View style={[styles.profileSide, isCompact ? styles.profileSideCompact : undefined]}>
          {user.photoUrl ? (
            <Image
              source={{ uri: user.photoUrl }}
              style={[styles.avatar, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
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
          <View style={styles.actions}>
            <HeaderAction
              label={themePreference === 'dark' ? 'Light' : 'Dark'}
              onPress={onToggleTheme}
              theme={theme}
            />
            <HeaderAction label="Settings" onPress={onOpenSettings} theme={theme} />
          </View>
        </View>
      </View>
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
    minHeight: 40,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  avatar: {
    borderWidth: 1,
    height: 40,
    width: 40,
  },
  avatarFallback: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarInitial: {
    fontSize: 17,
    fontWeight: '900',
  },
  brand: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  brandCopy: {
    gap: 1,
    minWidth: 0,
  },
  brandLockup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  container: {
    borderWidth: 1,
    padding: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  profileSide: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  profileSideCompact: {
    justifyContent: 'space-between',
    width: '100%',
  },
});
