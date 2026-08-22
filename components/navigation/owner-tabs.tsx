import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { colors } from '@/constants/design';
import { useCart } from '@/store/cart';

export function OwnerTabs() {
  const { pendingOrderCount } = useCart();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabelStyle: styles.label,
        tabBarStyle: [
          styles.bar,
          {
            height: Platform.OS === 'ios' ? 58 + bottomInset : 66,
            paddingBottom: Platform.OS === 'ios' ? Math.max(bottomInset, 6) : 6,
          },
        ],
        tabBarItemStyle: styles.item,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: ({ color }) => <AppIcon name="store" size={22} color={color} /> }} />
      <Tabs.Screen name="catalog" options={{ title: 'Catalog', tabBarIcon: ({ color }) => <AppIcon name="tag" size={22} color={color} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarBadge: pendingOrderCount > 0 ? pendingOrderCount : undefined, tabBarIcon: ({ color }) => <AppIcon name="checkout" size={22} color={color} /> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Insights', tabBarIcon: ({ color }) => <AppIcon name="sparkle" size={22} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.white, borderTopColor: colors.line, paddingTop: 6 },
  item: { paddingVertical: 2 },
  label: { fontSize: 10, fontWeight: '700' },
});
