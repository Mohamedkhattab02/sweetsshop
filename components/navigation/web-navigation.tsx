import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { colors, fonts, radii } from '@/constants/design';
import type { IconName } from '@/constants/icons';

type Props = BottomTabBarProps & {
  mode: 'customer' | 'owner';
  badges?: Partial<Record<string, number>>;
};

const customerIcons: Record<string, IconName> = {
  index: 'store',
  orders: 'checkout',
  cart: 'cart',
};

const ownerIcons: Record<string, IconName> = {
  index: 'store',
  catalog: 'tag',
  orders: 'checkout',
  analytics: 'sparkle',
};

export function WebNavigation({ state, descriptors, navigation, mode, badges = {} }: Props) {
  const router = useRouter();
  const icons = mode === 'owner' ? ownerIcons : customerIcons;
  const contextLabel = mode === 'owner' ? 'SHOP MANAGEMENT' : 'CUSTOMER COUNTER';
  const contextTitle = mode === 'owner' ? 'Owner workspace' : 'Your sweet shop';

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandBlock}>
        <View style={styles.brandMark}><Text style={styles.brandLetter}>N</Text></View>
        <View>
          <Text style={styles.brandName}>NOUR SWEETS</Text>
          <Text style={styles.brandTagline}>Made fresh, made to share</Text>
        </View>
      </View>

      <View style={styles.contextCard}>
        <Text style={styles.contextLabel}>{contextLabel}</Text>
        <Text style={styles.contextTitle}>{contextTitle}</Text>
        <View style={styles.openRow}><View style={styles.liveDot} /><Text style={styles.openText}>Store online</Text></View>
      </View>

      <View style={styles.navigation}>
        <Text style={styles.navigationLabel}>NAVIGATION</Text>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const options = descriptors[route.key].options;
          const label = typeof options.title === 'string' ? options.title : route.name;
          const badge = badges[route.name] ?? 0;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="link"
              accessibilityState={focused ? { selected: true } : {}}
              style={({ hovered, pressed }) => [
                styles.navItem,
                focused && styles.navItemActive,
                hovered && !focused && styles.navItemHovered,
                pressed && styles.navItemPressed,
              ]}>
              <View style={[styles.navIcon, focused && styles.navIconActive]}>
                <AppIcon name={icons[route.name] ?? 'store'} size={20} color={focused ? colors.white : colors.inkSoft} />
              </View>
              <Text style={[styles.navText, focused && styles.navTextActive]}>{label}</Text>
              {badge > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sidebarFooter}>
        <View style={styles.footerNote}>
          <AppIcon name="sparkle" size={16} color={colors.gold} />
          <Text style={styles.footerNoteText}>A little joy, every day.</Text>
        </View>
        <Pressable
          onPress={() => router.replace('/role-selection' as never)}
          accessibilityRole="button"
          style={({ hovered, pressed }) => [styles.switchButton, hovered && styles.switchButtonHovered, pressed && styles.navItemPressed]}>
          <View style={styles.switchIcon}><AppIcon name="person" size={17} color={colors.ink} /></View>
          <View style={styles.switchCopy}>
            <Text style={styles.switchLabel}>Switch workspace</Text>
            <Text style={styles.switchHint}>Customer · Owner · Courier</Text>
          </View>
          <AppIcon name="chevronDown" size={15} color={colors.inkSoft} style={styles.arrow} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 264,
    height: '100%',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 18,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  brandBlock: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 6 },
  brandMark: { width: 42, height: 42, borderRadius: 11, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  brandLetter: { color: colors.white, fontFamily: fonts.display, fontSize: 28 },
  brandName: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 12, letterSpacing: 1.7 },
  brandTagline: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 8, marginTop: 3, letterSpacing: 0.2 },
  contextCard: { backgroundColor: colors.paper, borderRadius: radii.card, padding: 14, marginTop: 24, gap: 5, borderWidth: 1, borderColor: colors.line },
  contextLabel: { color: colors.coralDark, fontFamily: fonts.extraBold, fontSize: 8, letterSpacing: 1.4 },
  contextTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 15 },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#35A965' },
  openText: { color: colors.inkSoft, fontFamily: fonts.semibold, fontSize: 10 },
  navigation: { gap: 7, marginTop: 30 },
  navigationLabel: { color: colors.inkSoft, fontFamily: fonts.extraBold, fontSize: 8, letterSpacing: 1.5, marginLeft: 11, marginBottom: 3 },
  navItem: { minHeight: 52, borderRadius: 13, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 11 },
  navItemActive: { backgroundColor: colors.ink },
  navItemHovered: { backgroundColor: colors.cloud },
  navItemPressed: { opacity: 0.75 },
  navIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.cloud, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: colors.coral },
  navText: { flex: 1, color: colors.inkSoft, fontFamily: fonts.semibold, fontSize: 12 },
  navTextActive: { color: colors.white, fontFamily: fonts.bold },
  badge: { minWidth: 21, height: 21, borderRadius: 11, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.coral },
  badgeText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 9 },
  sidebarFooter: { marginTop: 'auto', gap: 12 },
  footerNote: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  footerNoteText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 9 },
  switchButton: { minHeight: 62, borderRadius: 14, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 9 },
  switchButtonHovered: { backgroundColor: colors.cream, borderColor: colors.coralSoft },
  switchIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  switchCopy: { flex: 1, gap: 2 },
  switchLabel: { color: colors.ink, fontFamily: fonts.bold, fontSize: 11 },
  switchHint: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 8 },
  arrow: { transform: [{ rotate: '-90deg' }] },
});
