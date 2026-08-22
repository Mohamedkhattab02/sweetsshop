/**
 * iOS navigation with a version-aware split:
 *
 * - iOS 26+: native tabs with the system minimize behavior.
 * - iOS 17-25: React Navigation tabs with a stable, safe-area-aware bar.
 *
 * The minimizeBehavior prop is intentionally never passed to older iOS
 * versions because UIKit only introduced that API in iOS 26.
 */

import { Badge, Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { supportsLiquidGlass } from '@/components/ui/glass-surface';
import { colors } from '@/constants/design';
import { IOSColors } from '@/constants/ios-colors';
import { useCart } from '@/store/cart';

// NativeTabs and GlassView are separate native capabilities. An iOS 26
// runtime may expose the tab host while the compiled client cannot expose
// Liquid Glass (for example, an older Expo Go binary or a non-iOS-26 build).
const supportsModernNativeTabs = Number(Platform.Version) >= 26;

export function MarketTabs() {
  const { itemCount } = useCart();

  return supportsModernNativeTabs ? (
    <ModernNativeTabs itemCount={itemCount} enableMinimize={supportsLiquidGlass} />
  ) : (
    <LegacyIOSMarketTabs itemCount={itemCount} />
  );
}

function ModernNativeTabs({ itemCount, enableMinimize }: { itemCount: number; enableMinimize: boolean }) {
  const modernNativeTabProps = enableMinimize ? { minimizeBehavior: 'onScrollDown' as const } : {};

  return (
    <NativeTabs
      tintColor={IOSColors.accent}
      {...modernNativeTabProps}>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'storefront', selected: 'storefront.fill' }} />
        <Label>Menu</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="orders">
        <Icon sf={{ default: 'clock', selected: 'clock.fill' }} />
        <Label>Orders</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cart">
        <Icon sf={{ default: 'cart', selected: 'cart.fill' }} />
        <Label>Cart</Label>
        <Badge hidden={itemCount === 0}>{String(itemCount)}</Badge>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function LegacyIOSMarketTabs({ itemCount }: { itemCount: number }) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 6);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.coralDark,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: [
          styles.legacyBar,
          {
            height: 55 + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon name={focused ? 'storeOpen' : 'store'} size={24} color={color} />
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
            <AppIcon name={focused ? 'cartFilled' : 'cart'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  legacyBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 5,
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  item: { paddingVertical: 1 },
  label: { fontSize: 10, fontWeight: '700' },
  badge: { backgroundColor: colors.coral, color: colors.white },
});
