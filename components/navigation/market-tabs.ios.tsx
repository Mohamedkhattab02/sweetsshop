/**
 * iOS: a real UITabBar via expo-router's native tabs.
 *
 * This is what buys the Liquid Glass tab bar for free on iOS 26 — the system
 * draws it, so it refracts the content behind it, minimises as you scroll down
 * and picks up every accessibility setting without us reimplementing any of it.
 * Icons are SF Symbols with proper filled selected states.
 *
 * `unstable-native-tabs` is alpha in SDK 54; Android deliberately stays on the
 * JS Material 3 tab bar in `market-tabs.tsx`.
 */

import { Badge, Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { IOSColors } from '@/constants/ios-colors';
import { useCart } from '@/store/cart';

export function MarketTabs() {
  const { itemCount } = useCart();

  return (
    <NativeTabs tintColor={IOSColors.accent} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'storefront', selected: 'storefront.fill' }} />
        <Label>Market</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="add">
        <Icon sf={{ default: 'plus.app', selected: 'plus.app.fill' }} />
        <Label>Add</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cart">
        <Icon sf={{ default: 'cart', selected: 'cart.fill' }} />
        <Label>Cart</Label>
        {/* Native tab badges take a string; hidden when the cart is empty. */}
        <Badge hidden={itemCount === 0}>{String(itemCount)}</Badge>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
