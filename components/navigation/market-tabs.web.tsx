import { Tabs } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { WebNavigation } from '@/components/navigation/web-navigation';
import { colors, fonts } from '@/constants/design';
import { useCart } from '@/store/cart';

export function MarketTabs() {
  const { width } = useWindowDimensions();
  const { itemCount } = useCart();
  const desktop = width >= 980;
  const compact = width < 360;

  return (
    <Tabs
      tabBar={desktop ? (props) => <WebNavigation {...props} mode="customer" badges={{ cart: itemCount }} /> : undefined}
      screenOptions={{
        headerShown: false,
        tabBarPosition: desktop ? 'left' : 'bottom',
        tabBarActiveTintColor: colors.coralDark,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarActiveBackgroundColor: colors.cream,
        tabBarLabelStyle: [styles.mobileLabel, compact && styles.compactLabel],
        tabBarItemStyle: styles.mobileItem,
        tabBarStyle: [styles.mobileBar, compact && styles.compactBar],
        sceneStyle: styles.scene,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon name={focused ? 'storeOpen' : 'store'} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <AppIcon name="checkout" size={23} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color, focused }) => (
            <AppIcon name={focused ? 'cartFilled' : 'cart'} size={23} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.paper },
  mobileBar: {
    height: 68,
    paddingTop: 7,
    paddingBottom: 7,
    backgroundColor: colors.white,
    borderTopColor: colors.line,
  },
  mobileItem: { paddingVertical: 2 },
  mobileLabel: { fontFamily: fonts.bold, fontSize: 10 },
  compactLabel: { fontSize: 9 },
  compactBar: { height: 64, paddingTop: 5, paddingBottom: 5 },
  badge: { backgroundColor: colors.coral, color: colors.white },
});
