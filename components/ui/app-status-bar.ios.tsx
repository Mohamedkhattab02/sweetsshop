import { StatusBar } from 'expo-status-bar';

/**
 * Nour's surfaces stay light even when the device is in system dark mode, so
 * iOS must always use dark status-bar content for readable time and battery
 * indicators on every supported iOS version.
 */
export function AppStatusBar() {
  return <StatusBar style="dark" animated />;
}
