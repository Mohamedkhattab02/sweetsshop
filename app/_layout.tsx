import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { MarketDarkTheme, MarketLightTheme, NavDarkTheme, NavLightTheme } from '@/constants/theme';
import { AppStatusBar } from '@/components/ui/app-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartProvider } from '@/store/cart';
import { configureNotifications, requestNotificationPermissions } from '@/services/notifications';
import { ProductsProvider } from '@/store/products';
import '@/global.css';
import { useEffect } from 'react';

/**
 * Paper renders icons through `react-native-vector-icons` by default, which is
 * not part of an Expo project. Pointing it at `@expo/vector-icons` keeps every
 * built-in icon (chips, text fields, app bar, FAB) working.
 */
type PaperIconProps = {
  name: string;
  color?: string;
  size: number;
  direction?: 'rtl' | 'ltr';
  allowFontScaling?: boolean;
  testID?: string;
};

const paperSettings = {
  icon: ({ name, color, size, allowFontScaling, testID }: PaperIconProps) => (
    <MaterialCommunityIcons
      name={name as never}
      color={color}
      size={size}
      allowFontScaling={allowFontScaling}
      testID={testID}
    />
  ),
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const paperTheme = isDark ? MarketDarkTheme : MarketLightTheme;
  const navigationTheme = isDark ? NavDarkTheme : NavLightTheme;

  useEffect(() => {
    configureNotifications();
    void requestNotificationPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme} settings={paperSettings}>
        <ThemeProvider value={navigationTheme}>
          <ProductsProvider>
            <CartProvider>
              {/* Every screen draws its own Material 3 top app bar. */}
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="owner" />
                <Stack.Screen name="courier" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="product/[id]" />
                <Stack.Screen name="checkout" />
                {/* The confirmation replaces checkout in the stack, so Back
                    from here returns to the market rather than the form. */}
                <Stack.Screen name="order/[id]" options={{ gestureEnabled: false }} />
              </Stack>
            </CartProvider>
          </ProductsProvider>
          <AppStatusBar />
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
