import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { colors } from '@/constants/design';
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
          <Text style={styles.brandName}>USER SWEETS</Text>
          <Text style={styles.brandTagline}>Made to share</Text>
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
                <AppIcon name={icons[route.name] ?? 'store'} size={20} color={focused ? colors.ink : '#AFC1B8'} />
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
          <AppIcon name="chevronDown" size={15} color="#AFC1B8" style={styles.arrow} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 252,
    height: '100%',
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 20,
    borderRightWidth: 1,
    borderRightColor: '#29423B',
  },
  brandBlock: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 6 },
  brandMark: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  brandLetter: { color: colors.coralDark, fontFamily: 'Georgia', fontSize: 27, fontWeight: '700' },
  brandName: { color: colors.white, fontSize: 12, fontWeight: '900', letterSpacing: 1.7 },
  brandTagline: { color: '#91A69C', fontSize: 9, marginTop: 3, letterSpacing: 0.4 },
  contextCard: { backgroundColor: '#213B34', borderRadius: 20, padding: 15, marginTop: 26, gap: 5, borderWidth: 1, borderColor: '#315047' },
  contextLabel: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1.4 },
  contextTitle: { color: colors.white, fontSize: 15, fontWeight: '800' },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#7BD495' },
  openText: { color: '#B9D2C6', fontSize: 10, fontWeight: '700' },
  navigation: { gap: 7, marginTop: 30 },
  navigationLabel: { color: '#71887D', fontSize: 8, fontWeight: '900', letterSpacing: 1.5, marginLeft: 11, marginBottom: 3 },
  navItem: { minHeight: 54, borderRadius: 17, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 11 },
  navItemActive: { backgroundColor: colors.white },
  navItemHovered: { backgroundColor: '#213B34' },
  navItemPressed: { opacity: 0.75 },
  navIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#244139', alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: colors.sage },
  navText: { flex: 1, color: '#C4D2CB', fontSize: 12, fontWeight: '700' },
  navTextActive: { color: colors.ink, fontWeight: '900' },
  badge: { minWidth: 21, height: 21, borderRadius: 11, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.coral },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  sidebarFooter: { marginTop: 'auto', gap: 12 },
  footerNote: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  footerNoteText: { color: '#8FA49A', fontSize: 10 },
  switchButton: { minHeight: 62, borderRadius: 18, backgroundColor: '#213B34', borderWidth: 1, borderColor: '#315047', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 9 },
  switchButtonHovered: { backgroundColor: '#29483F', borderColor: '#3D6055' },
  switchIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  switchCopy: { flex: 1, gap: 2 },
  switchLabel: { color: colors.white, fontSize: 11, fontWeight: '800' },
  switchHint: { color: '#91A69C', fontSize: 8 },
  arrow: { transform: [{ rotate: '-90deg' }] },
});
