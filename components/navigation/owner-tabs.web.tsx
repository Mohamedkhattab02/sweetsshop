import { Tabs } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { WebNavigation } from '@/components/navigation/web-navigation';
import { colors } from '@/constants/design';
import { useCart } from '@/store/cart';

export function OwnerTabs() {
  const { width } = useWindowDimensions();
  const { pendingOrderCount } = useCart();
  const desktop = width >= 980;

  return (
    <Tabs
      tabBar={desktop ? (props) => <WebNavigation {...props} mode="owner" badges={{ orders: pendingOrderCount }} /> : undefined}
      screenOptions={{
        headerShown: false,
        tabBarPosition: desktop ? 'left' : 'bottom',
        tabBarActiveTintColor: colors.coralDark,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarActiveBackgroundColor: colors.cream,
        tabBarLabelStyle: styles.mobileLabel,
        tabBarItemStyle: styles.mobileItem,
        tabBarStyle: styles.mobileBar,
        sceneStyle: styles.scene,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: ({ color }) => <AppIcon name="store" size={22} color={color} /> }} />
      <Tabs.Screen name="catalog" options={{ title: 'Catalog', tabBarIcon: ({ color }) => <AppIcon name="tag" size={22} color={color} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarBadge: pendingOrderCount > 0 ? pendingOrderCount : undefined, tabBarBadgeStyle: styles.badge, tabBarIcon: ({ color }) => <AppIcon name="checkout" size={22} color={color} /> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Insights', tabBarIcon: ({ color }) => <AppIcon name="sparkle" size={22} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.paper },
  mobileBar: { height: 68, paddingTop: 7, paddingBottom: 7, backgroundColor: colors.white, borderTopColor: colors.line },
  mobileItem: { paddingVertical: 2 },
  mobileLabel: { fontSize: 10, fontWeight: '700' },
  badge: { backgroundColor: colors.coral, color: colors.white },
});
