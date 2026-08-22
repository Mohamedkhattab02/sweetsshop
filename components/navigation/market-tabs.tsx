/**
 * Android / web: a Material 3 navigation bar, drawn in JS by React Navigation
 * and tinted from the Paper theme.
 *
 * iOS resolves `market-tabs.ios.tsx`, which hands the job to a real UITabBar.
 */

import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';

import { AppIcon } from '@/components/ui/app-icon';
import { useCart } from '@/store/cart';

export function MarketTabs() {
  const theme = useTheme();
  const { itemCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        // Material 3 navigation bars sit on a slightly raised surface tone.
        tabBarStyle: {
          backgroundColor: theme.colors.elevation.level2,
          borderTopColor: theme.colors.surfaceVariant,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon name={focused ? 'storeOpen' : 'store'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon name={focused ? 'checkout' : 'checkout'} size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.error,
            color: theme.colors.onError,
          },
          tabBarIcon: ({ color, focused }) => (
            <AppIcon name={focused ? 'cartFilled' : 'cart'} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
