import { Linking } from 'react-native';

import { buildGoogleMapsUrl, type MapPoint } from '@/constants/maps';

export async function openGoogleMaps(point?: MapPoint, query?: string) {
  const url = buildGoogleMapsUrl(point, query);
  try {
    await Linking.openURL(url);
  } catch {
    // The browser fallback is handled by the operating system when Maps is
    // not installed.
  }
}
