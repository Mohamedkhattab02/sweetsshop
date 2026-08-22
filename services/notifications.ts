import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let configured = false;

export function configureNotifications() {
  if (configured || Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    void Notifications.setNotificationChannelAsync('order-updates', {
      name: 'Order updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EF7D61',
    });
  }
  configured = true;
}

export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;

  configureNotifications();
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

export async function notifyLocal(title: string, body: string, data?: Record<string, string>) {
  if (Platform.OS === 'web') return;

  configureNotifications();
  try {
    const permissions = await Notifications.getPermissionsAsync();
    if (!permissions.granted) return;

    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: false, ...(Platform.OS === 'android' ? { channelId: 'order-updates' } : {}) },
      trigger: null,
    });
  } catch {
    // Notifications are an enhancement. An unavailable permission must not
    // interrupt ordering or delivery status updates.
  }
}
