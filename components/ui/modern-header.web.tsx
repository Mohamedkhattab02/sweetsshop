import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { colors, fonts, radii } from '@/constants/design';
import { getPageGutter } from '@/constants/responsive';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cartCount?: number;
  onCart?: () => void;
  notificationCount?: number;
  onNotifications?: () => void;
  onSwitchRole?: () => void;
  showBack?: boolean;
};

export function ModernHeader({
  eyebrow,
  title,
  subtitle,
  cartCount,
  onCart,
  notificationCount,
  onNotifications,
  onSwitchRole,
  showBack = false,
}: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= 980;
  const compact = width < 480;
  const tiny = width < 360;
  const showSwitchLabel = width >= 620;

  return (
    <View style={[styles.container, { paddingHorizontal: getPageGutter(width) }, compact && styles.containerCompact]}>
      <View style={[styles.row, desktop && styles.rowDesktop, compact && styles.rowCompact]}>
        <Pressable
          onPress={showBack ? () => router.back() : onSwitchRole}
          accessibilityRole="button"
          accessibilityLabel={showBack ? 'Go back' : 'Switch role'}
          style={({ hovered, pressed }) => [styles.logoButton, compact && styles.logoButtonCompact, hovered && styles.buttonHovered, pressed && styles.buttonPressed]}>
          <View style={[styles.logoMark, compact && styles.logoMarkCompact, showBack && styles.backMark]}>
            {showBack ? <AppIcon name="back" size={19} color={colors.ink} /> : <Text style={styles.logoLetter}>N</Text>}
          </View>
        </Pressable>

        <View style={styles.heading}>
          {eyebrow && !tiny ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text numberOfLines={1} style={[styles.title, desktop && styles.titleDesktop, tiny && styles.titleTiny]}>{title}</Text>
          {subtitle && !compact ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={[styles.actions, compact && styles.actionsCompact]}>
          {onNotifications ? (
            <HeaderAction
              label="Open notifications"
              icon="notifications"
              count={notificationCount}
              onPress={onNotifications}
            />
          ) : null}
          {onCart ? <HeaderAction label="Open cart" icon="cart" count={cartCount} onPress={onCart} /> : null}
          {onSwitchRole ? (
            <Pressable
              onPress={onSwitchRole}
              accessibilityRole="button"
              accessibilityLabel="Switch workspace"
              style={({ hovered, pressed }) => [styles.switchButton, !showSwitchLabel && styles.switchButtonIconOnly, hovered && styles.switchButtonHovered, pressed && styles.buttonPressed]}>
              <AppIcon name="person" size={15} color={colors.coralDark} />
              {showSwitchLabel ? <Text style={styles.switchText}>{desktop ? 'Switch workspace' : 'Switch'}</Text> : null}
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function HeaderAction({ label, icon, count, onPress }: { label: string; icon: 'notifications' | 'cart'; count?: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ hovered, pressed }) => [styles.iconButton, hovered && styles.buttonHovered, pressed && styles.buttonPressed]}>
      <AppIcon name={icon} size={20} color={colors.ink} />
      {count && count > 0 ? <View style={styles.count}><Text style={styles.countText}>{count}</Text></View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: 40,
    paddingVertical: 11,
    zIndex: 20,
  },
  containerCompact: { paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56, gap: 13, width: '100%', maxWidth: 1360, alignSelf: 'center' },
  rowDesktop: { minHeight: 64 },
  rowCompact: { minHeight: 48, gap: 8 },
  logoButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  logoButtonCompact: { width: 40, height: 40 },
  logoMark: { width: 40, height: 40, borderRadius: 11, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  logoMarkCompact: { width: 38, height: 38 },
  backMark: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  logoLetter: { color: colors.white, fontFamily: fonts.display, fontSize: 27, lineHeight: 30 },
  heading: { flex: 1, gap: 1, minWidth: 0 },
  eyebrow: { color: colors.coralDark, fontFamily: fonts.extraBold, fontSize: 9, letterSpacing: 1.8, textTransform: 'uppercase' },
  title: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 19, letterSpacing: -0.35 },
  titleDesktop: { fontSize: 24, letterSpacing: -0.65 },
  titleTiny: { fontSize: 16 },
  subtitle: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 11, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionsCompact: { gap: 5 },
  iconButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  buttonHovered: { backgroundColor: colors.cream, borderColor: colors.coralSoft },
  buttonPressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  count: { position: 'absolute', top: -4, right: -4, minWidth: 19, height: 19, paddingHorizontal: 4, borderRadius: 10, backgroundColor: colors.coral, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  countText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 9 },
  switchButton: { minHeight: 42, borderRadius: radii.button, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.coralSoft, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7 },
  switchButtonIconOnly: { width: 42, paddingHorizontal: 0, justifyContent: 'center' },
  switchButtonHovered: { backgroundColor: colors.coralSoft, borderColor: '#E9B5A7' },
  switchText: { color: colors.coralDark, fontFamily: fonts.bold, fontSize: 10 },
});
