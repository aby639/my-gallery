import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

export const memoColors = {
  accent: '#A855F7',
  background: '#090A10',
  backgroundDeep: '#05060B',
  border: '#1A1D29',
  borderSoft: 'rgba(255, 255, 255, 0.12)',
  card: '#171827',
  cyan: '#22D3EE',
  glass: 'rgba(18, 20, 29, 0.82)',
  muted: '#A1A1AA',
  orange: '#FB923C',
  pink: '#FB7185',
  quiet: '#71717A',
  text: '#F8FAFC',
};

export const memoFont = {
  bold: 'Poppins_700Bold',
  medium: 'Poppins_500Medium',
  regular: 'Poppins_400Regular',
  semiBold: 'Poppins_600SemiBold',
};

export const gradients = {
  brand: [memoColors.accent, memoColors.pink, memoColors.orange] as const,
  brandSoft: ['rgba(168, 85, 247, 0.18)', 'rgba(251, 113, 133, 0.08)', 'rgba(251, 146, 60, 0)'] as const,
  cardBottom: ['rgba(9, 10, 16, 0)', 'rgba(9, 10, 16, 0.76)', 'rgba(9, 10, 16, 0.98)'] as const,
  cardTop: ['rgba(9, 10, 16, 0.66)', 'rgba(9, 10, 16, 0.06)'] as const,
};

export type MemoIconName =
  | 'arrow-left'
  | 'bell'
  | 'camera'
  | 'edit'
  | 'grid'
  | 'heart'
  | 'home'
  | 'image'
  | 'mic'
  | 'pause'
  | 'play'
  | 'plus'
  | 'search'
  | 'settings'
  | 'share'
  | 'stop'
  | 'trash'
  | 'user';

type IconProps = {
  color?: string;
  name: MemoIconName;
  size?: number;
  strokeWidth?: number;
};

export function MemoIcon({ color = memoColors.text, name, size = 24, strokeWidth = 2 }: IconProps) {
  const common = {
    fill: 'none',
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth,
  };

  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      {name === 'home' ? (
        <>
          <Path {...common} d="M3 10.8 12 3l9 7.8" />
          <Path {...common} d="M5.5 9.5V21h13V9.5" />
          <Path {...common} d="M9.5 21v-6h5v6" />
        </>
      ) : null}
      {name === 'grid' ? (
        <>
          <Rect {...common} height="6" rx="1.6" width="6" x="4" y="4" />
          <Rect {...common} height="6" rx="1.6" width="6" x="14" y="4" />
          <Rect {...common} height="6" rx="1.6" width="6" x="4" y="14" />
          <Rect {...common} height="6" rx="1.6" width="6" x="14" y="14" />
        </>
      ) : null}
      {name === 'plus' ? (
        <>
          <Path {...common} d="M12 5v14" />
          <Path {...common} d="M5 12h14" />
        </>
      ) : null}
      {name === 'search' ? (
        <>
          <Circle {...common} cx="10.8" cy="10.8" r="6.8" />
          <Path {...common} d="m16 16 4.2 4.2" />
        </>
      ) : null}
      {name === 'user' ? (
        <>
          <Circle {...common} cx="12" cy="8" r="4" />
          <Path {...common} d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </>
      ) : null}
      {name === 'camera' ? (
        <>
          <Path {...common} d="M5 7h3l1.4-2h5.2L16 7h3a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
          <Circle {...common} cx="12" cy="13" r="4" />
        </>
      ) : null}
      {name === 'image' ? (
        <>
          <Rect {...common} height="15" rx="2.5" width="18" x="3" y="4.5" />
          <Circle {...common} cx="8.2" cy="9.4" r="1.4" />
          <Path {...common} d="m4.7 17 4.8-4.8 3.2 3.2 2.2-2.2 4.4 4.4" />
        </>
      ) : null}
      {name === 'mic' ? (
        <>
          <Rect {...common} height="11" rx="3.5" width="7" x="8.5" y="3.5" />
          <Path {...common} d="M5.8 11a6.2 6.2 0 0 0 12.4 0" />
          <Path {...common} d="M12 17.2V21" />
          <Path {...common} d="M8.5 21h7" />
        </>
      ) : null}
      {name === 'bell' ? (
        <>
          <Path {...common} d="M18 9.8A6 6 0 0 0 6 9.8c0 6-2 6.7-2 6.7h16s-2-.7-2-6.7Z" />
          <Path {...common} d="M10 20a2.5 2.5 0 0 0 4 0" />
        </>
      ) : null}
      {name === 'settings' ? (
        <>
          <Circle {...common} cx="12" cy="12" r="3.2" />
          <Path {...common} d="M19.4 14.4a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7.1 3l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 20 6.1l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.8 1.3Z" />
        </>
      ) : null}
      {name === 'arrow-left' ? (
        <>
          <Path {...common} d="M19 12H5" />
          <Path {...common} d="m12 19-7-7 7-7" />
        </>
      ) : null}
      {name === 'heart' ? (
        <Path
          {...common}
          d="M20.5 8.8c0 5.1-8.5 10-8.5 10s-8.5-4.9-8.5-10A4.7 4.7 0 0 1 12 5.9a4.7 4.7 0 0 1 8.5 2.9Z"
        />
      ) : null}
      {name === 'share' ? (
        <>
          <Path {...common} d="M12 4v11" />
          <Path {...common} d="m7.5 8.5 4.5-4.5 4.5 4.5" />
          <Path {...common} d="M5 13.5V20h14v-6.5" />
        </>
      ) : null}
      {name === 'edit' ? (
        <>
          <Path {...common} d="m15.5 4.5 4 4L8.7 19.3 4 20l.7-4.7L15.5 4.5Z" />
          <Path {...common} d="m14.4 5.6 4 4" />
        </>
      ) : null}
      {name === 'trash' ? (
        <>
          <Path {...common} d="M4 7h16" />
          <Path {...common} d="M9 7V4h6v3" />
          <Path {...common} d="M18 7l-1 13H7L6 7" />
          <Path {...common} d="M10 11v5" />
          <Path {...common} d="M14 11v5" />
        </>
      ) : null}
      {name === 'play' ? <Path fill={color} d="M8 5.5v13l10-6.5-10-6.5Z" /> : null}
      {name === 'pause' ? (
        <>
          <Rect fill={color} height="13" rx="1.4" width="4" x="7" y="5.5" />
          <Rect fill={color} height="13" rx="1.4" width="4" x="13" y="5.5" />
        </>
      ) : null}
      {name === 'stop' ? <Rect fill={color} height="11" rx="2" width="11" x="6.5" y="6.5" /> : null}
    </Svg>
  );
}

type MemoLensMarkProps = {
  size?: number;
};

export function MemoLensMark({ size = 24 }: MemoLensMarkProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Defs>
        <SvgLinearGradient id="memoLensGradNative" x1="0%" x2="100%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor={memoColors.accent} />
          <Stop offset="50%" stopColor={memoColors.pink} />
          <Stop offset="100%" stopColor={memoColors.orange} />
        </SvgLinearGradient>
      </Defs>
      <Rect
        height="14"
        rx="3.5"
        stroke="url(#memoLensGradNative)"
        strokeLinejoin="round"
        strokeWidth="2.5"
        width="18"
        x="3"
        y="5"
      />
      <Path
        d="M16 5V3.5C16 3.22386 16.2239 3 16.5 3H17.5C17.7761 3 18 3.22386 18 3.5V5"
        stroke="url(#memoLensGradNative)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <Path
        d="M7.5 5V4C7.5 3.72386 7.27614 3.5 7 3.5H6C5.72386 3.5 5.5 3.72386 5.5 4V5"
        stroke="url(#memoLensGradNative)"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <Circle cx="12" cy="12" r="4.5" stroke="url(#memoLensGradNative)" strokeWidth="2" />
      <Path
        d="M12 13.5l-.35-.32C10.4 12.04 9.5 11.23 9.5 10.25c0-.8.63-1.42 1.44-1.42.45 0 .89.21 1.06.53h0c.17-.32.61-.53 1.06-.53.81 0 1.44.62 1.44 1.42 0 .98-.9 1.79-2.15 2.93L12 13.5z"
        fill="url(#memoLensGradNative)"
      />
    </Svg>
  );
}

type ScreenBackgroundProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ScreenBackground({ children, style }: ScreenBackgroundProps) {
  return (
    <View style={[kitStyles.screen, style]}>
      <LinearGradient colors={[...gradients.brandSoft]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={kitStyles.topGradient} />
      <View pointerEvents="none" style={[kitStyles.glowOrb, kitStyles.purpleOrb]} />
      <View pointerEvents="none" style={[kitStyles.glowOrb, kitStyles.pinkOrb]} />
      <View pointerEvents="none" style={[kitStyles.glowOrb, kitStyles.orangeOrb]} />
      {children}
    </View>
  );
}

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GlassCard({ children, style }: GlassCardProps) {
  return <View style={[kitStyles.glassCard, style]}>{children}</View>;
}

type GradientButtonProps = {
  disabled?: boolean;
  icon?: MemoIconName;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function GradientButton({ disabled = false, icon, label, onPress, style }: GradientButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [kitStyles.gradientButtonPressable, pressed && !disabled && kitStyles.pressed, disabled && kitStyles.disabled, style]}
    >
      <LinearGradient colors={[...gradients.brand]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={kitStyles.gradientButton}>
        {icon ? <MemoIcon color={memoColors.text} name={icon} size={19} strokeWidth={2.4} /> : null}
        <Text style={kitStyles.gradientButtonText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

type FeatureChipProps = {
  active?: boolean;
  label: string;
  onPress?: () => void;
};

export function FeatureChip({ active = false, label, onPress }: FeatureChipProps) {
  const content = (
    <View style={[kitStyles.featureChip, active && kitStyles.featureChipActive]}>
      <Text style={[kitStyles.featureChipText, active && kitStyles.featureChipTextActive]}>{label}</Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && kitStyles.pressed}>
      {content}
    </Pressable>
  );
}

type RoundIconButtonProps = {
  icon: MemoIconName;
  label: string;
  onPress: () => void;
  tone?: 'default' | 'danger' | 'pink';
};

export function RoundIconButton({ icon, label, onPress, tone = 'default' }: RoundIconButtonProps) {
  const color = tone === 'danger' || tone === 'pink' ? memoColors.pink : memoColors.text;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        kitStyles.roundIconButton,
        tone === 'danger' && kitStyles.roundIconDanger,
        pressed && kitStyles.pressed,
      ]}
    >
      <MemoIcon color={color} name={icon} size={20} strokeWidth={2.3} />
    </Pressable>
  );
}

type BottomNavProps = {
  active: 'home' | 'memories' | 'search' | 'profile';
  bottomInset: number;
  onCreate: () => void;
  onHome: () => void;
  onMemories: () => void;
  onProfile: () => void;
  onSearch: () => void;
};

export function MemoBottomNav({
  active,
  bottomInset,
  onCreate,
  onHome,
  onMemories,
  onProfile,
  onSearch,
}: BottomNavProps) {
  return (
    <View style={[kitStyles.bottomNav, { height: 88 + bottomInset, paddingBottom: 10 + bottomInset }]}>
      <BottomNavItem active={active === 'home'} icon="home" label="Home" onPress={onHome} />
      <BottomNavItem active={active === 'memories'} icon="grid" label="Memories" onPress={onMemories} />
      <Pressable
        accessibilityLabel="Create memory"
        accessibilityRole="button"
        onPress={onCreate}
        style={({ pressed }) => [kitStyles.centerNavItem, pressed && kitStyles.pressed]}
      >
        <LinearGradient colors={[...gradients.brand]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={kitStyles.centerNavButton}>
          <MemoIcon color={memoColors.text} name="plus" size={28} strokeWidth={2.2} />
        </LinearGradient>
        <Text style={kitStyles.navLabel}>Create</Text>
      </Pressable>
      <BottomNavItem active={active === 'search'} icon="search" label="Search" onPress={onSearch} />
      <BottomNavItem active={active === 'profile'} icon="user" label="Profile" onPress={onProfile} />
    </View>
  );
}

type BottomNavItemProps = {
  active?: boolean;
  icon: MemoIconName;
  label: string;
  onPress: () => void;
};

function BottomNavItem({ active = false, icon, label, onPress }: BottomNavItemProps) {
  const color = active ? memoColors.text : memoColors.quiet;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [kitStyles.navItem, pressed && kitStyles.pressed]}
    >
      <MemoIcon color={color} name={icon} size={22} strokeWidth={2.15} />
      <Text style={[kitStyles.navLabel, active && kitStyles.navLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export type MemoryCardData = {
  date: string;
  hasVoice?: boolean;
  height: number;
  id: string;
  image: ImageSourcePropType;
  mood: string;
  title: string;
};

type MemoryCardProps = {
  dimmed?: boolean;
  memory: MemoryCardData;
  onPress: () => void;
};

export function MemoryCard({ dimmed = false, memory, onPress }: MemoryCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [kitStyles.memoryCard, { height: memory.height }, dimmed && kitStyles.dimmed, pressed && kitStyles.pressed]}
    >
      <Image resizeMode="cover" source={memory.image} style={kitStyles.memoryImage} />
      <View style={kitStyles.memoryTint} />
      <LinearGradient colors={[...gradients.cardBottom]} locations={[0, 0.48, 1]} style={kitStyles.memoryBottomGradient} />
      {memory.hasVoice ? (
        <View style={kitStyles.voiceBadge}>
          <MemoIcon color={memoColors.cyan} name="mic" size={13} strokeWidth={2.4} />
        </View>
      ) : null}
      <View style={kitStyles.moodBadge}>
        <Text style={kitStyles.moodBadgeText}>{memory.mood}</Text>
      </View>
      <View style={kitStyles.memoryCopy}>
        <Text numberOfLines={2} style={kitStyles.memoryTitle}>
          {memory.title}
        </Text>
        <Text style={kitStyles.memoryDate}>{memory.date}</Text>
      </View>
    </Pressable>
  );
}

type WaveformProps = {
  active?: boolean;
  color?: string;
  height?: number;
};

export function MemoWaveform({ active = false, color = memoColors.muted, height = 32 }: WaveformProps) {
  const bars = [34, 18, 26, 12, 38, 22, 31, 16, 28, 20, 40, 13, 24, 17, 35, 21, 30, 15, 37, 19, 25, 14];

  return (
    <View style={[kitStyles.waveform, { height }]}>
      {bars.map((barHeight, index) => (
        <View
          key={`${barHeight}-${index}`}
          style={[
            kitStyles.waveBar,
            {
              backgroundColor: active ? (index % 3 === 0 ? memoColors.pink : memoColors.cyan) : color,
              height: Math.max(5, (barHeight / 42) * height),
            },
          ]}
        />
      ))}
    </View>
  );
}

export function getMemoryTitle(caption: string): string {
  const title = caption.trim().split(/[.!?\n]/)[0]?.trim();
  return title || 'Untitled memory';
}

export function formatMemoryDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Saved memory';
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatMemoryDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Saved memory';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

const kitStyles = StyleSheet.create({
  bottomNav: {
    alignItems: 'flex-start',
    backgroundColor: '#11131D',
    borderColor: memoColors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 23,
    paddingTop: 8,
    zIndex: 50,
  },
  centerNavButton: {
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  centerNavItem: {
    alignItems: 'center',
    gap: 5,
    marginTop: -28,
    minHeight: 74,
    minWidth: 58,
  },
  dimmed: {
    opacity: 0.52,
  },
  disabled: {
    opacity: 0.55,
  },
  featureChip: {
    backgroundColor: 'rgba(26, 29, 41, 0.62)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 32,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  featureChipActive: {
    backgroundColor: memoColors.border,
    borderColor: memoColors.borderSoft,
  },
  featureChipText: {
    color: memoColors.muted,
    fontFamily: memoFont.medium,
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 16,
  },
  featureChipTextActive: {
    color: memoColors.text,
  },
  glassCard: {
    backgroundColor: memoColors.glass,
    borderColor: memoColors.border,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  glowOrb: {
    borderRadius: 999,
    position: 'absolute',
  },
  gradientButton: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 20,
  },
  gradientButtonPressable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientButtonText: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 16,
    letterSpacing: 0,
  },
  memoryBottomGradient: {
    bottom: 0,
    height: '62%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  memoryCard: {
    backgroundColor: memoColors.card,
    borderColor: memoColors.border,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  memoryCopy: {
    bottom: 12,
    gap: 4,
    left: 12,
    position: 'absolute',
    right: 12,
  },
  memoryDate: {
    color: 'rgba(248, 250, 252, 0.68)',
    fontFamily: memoFont.medium,
    fontSize: 10,
    letterSpacing: 0,
    lineHeight: 14,
  },
  memoryImage: {
    height: '100%',
    width: '100%',
  },
  memoryTint: {
    backgroundColor: 'rgba(9, 10, 16, 0.24)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  memoryTitle: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 18,
  },
  moodBadge: {
    backgroundColor: 'rgba(18, 20, 29, 0.76)',
    borderColor: memoColors.borderSoft,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  moodBadgeText: {
    color: memoColors.text,
    fontFamily: memoFont.medium,
    fontSize: 10,
    letterSpacing: 0,
    lineHeight: 13,
  },
  navItem: {
    alignItems: 'center',
    gap: 5,
    minHeight: 58,
    minWidth: 54,
  },
  navLabel: {
    color: memoColors.quiet,
    fontFamily: memoFont.medium,
    fontSize: 10,
    letterSpacing: 0,
    lineHeight: 14,
  },
  navLabelActive: {
    color: memoColors.text,
  },
  orangeOrb: {
    backgroundColor: memoColors.orange,
    bottom: -120,
    height: 280,
    left: -116,
    opacity: 0.07,
    width: 280,
  },
  pinkOrb: {
    backgroundColor: memoColors.pink,
    height: 240,
    opacity: 0.07,
    right: -112,
    top: '42%',
    width: 240,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
  purpleOrb: {
    backgroundColor: memoColors.accent,
    height: 230,
    left: -100,
    opacity: 0.08,
    top: 38,
    width: 230,
  },
  roundIconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 29, 0.52)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  roundIconDanger: {
    backgroundColor: 'rgba(251, 113, 133, 0.12)',
    borderColor: 'rgba(251, 113, 133, 0.28)',
  },
  screen: {
    backgroundColor: memoColors.background,
    flex: 1,
    overflow: 'hidden',
  },
  topGradient: {
    height: 260,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  voiceBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.17)',
    borderColor: 'rgba(34, 211, 238, 0.24)',
    borderRadius: 13,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    left: 10,
    position: 'absolute',
    top: 10,
    width: 26,
  },
  waveBar: {
    borderRadius: 3,
    opacity: 0.72,
    width: 4,
  },
  waveform: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 3,
    overflow: 'hidden',
  },
});
