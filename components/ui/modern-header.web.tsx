import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii, shadow } from '@/constants/design';

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

  return (
    <View style={styles.container}>
      <View style={[styles.row, desktop && styles.rowDesktop]}>
        <Pressable
          onPress={showBack ? () => router.back() : onSwitchRole}
          accessibilityRole="button"
          accessibilityLabel={showBack ? 'Go back' : 'Switch role'}
          style={({ hovered, pressed }) => [styles.logoButton, hovered && styles.buttonHovered, pressed && styles.buttonPressed]}>
          <View style={[styles.logoMark, showBack && styles.backMark]}>
            {showBack ? <AppIcon name="back" size={19} color={colors.ink} /> : <Text style={styles.logoLetter}>N</Text>}
          </View>
        </Pressable>

        <View style={styles.heading}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text numberOfLines={1} style={[styles.title, desktop && styles.titleDesktop]}>{title}</Text>
          {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.actions}>
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
              style={({ hovered, pressed }) => [styles.switchButton, hovered && styles.switchButtonHovered, pressed && styles.buttonPressed]}>
              <AppIcon name="person" size={15} color={colors.coralDark} />
              <Text style={styles.switchText}>{desktop ? 'Switch workspace' : 'Switch'}</Text>
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
    backgroundColor: 'rgba(251,250,247,0.97)',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: 32,
    paddingVertical: 12,
    zIndex: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56, gap: 12, width: '100%', maxWidth: 1240, alignSelf: 'center' },
  rowDesktop: { minHeight: 66 },
  logoButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  logoMark: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  backMark: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  logoLetter: { color: colors.gold, fontFamily: 'Georgia', fontSize: 26, lineHeight: 29, fontWeight: '700' },
  heading: { flex: 1, gap: 1, minWidth: 0 },
  eyebrow: { color: colors.coralDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.7, textTransform: 'uppercase' },
  title: { color: colors.ink, fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
  titleDesktop: { fontSize: 24, letterSpacing: -0.7 },
  subtitle: { color: colors.inkSoft, fontSize: 11, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', position: 'relative', ...shadow.card },
  buttonHovered: { backgroundColor: colors.cream, borderColor: '#E8C7BB' },
  buttonPressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  count: { position: 'absolute', top: -4, right: -4, minWidth: 19, height: 19, paddingHorizontal: 4, borderRadius: 10, backgroundColor: colors.coral, borderWidth: 2, borderColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  countText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  switchButton: { minHeight: 43, borderRadius: radii.pill, backgroundColor: colors.cream, borderWidth: 1, borderColor: '#F1D9D0', paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7 },
  switchButtonHovered: { backgroundColor: '#FBE8E1', borderColor: '#E8B8A8' },
  switchText: { color: colors.coralDark, fontSize: 10, fontWeight: '900' },
});
