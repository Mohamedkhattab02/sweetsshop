import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { MarketLightTheme, NavLightTheme } from '@/constants/theme';
import { AppStatusBar } from '@/components/ui/app-status-bar';
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
  const [fontsLoaded, fontError] = useFonts({
    DMSerifDisplay_400Regular,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const paperTheme = MarketLightTheme;
  const navigationTheme = NavLightTheme;

  useEffect(() => {
    configureNotifications();
    void requestNotificationPermissions();
  }, []);

  if (!fontsLoaded && !fontError) return null;

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
