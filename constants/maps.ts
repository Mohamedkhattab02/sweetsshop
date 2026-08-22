export type MapPoint = {
  latitude: number;
  longitude: number;
};

export function buildGoogleMapsUrl(point?: MapPoint, query?: string) {
  if (point) {
    return `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}&travelmode=driving`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query ?? '')}`;
}
