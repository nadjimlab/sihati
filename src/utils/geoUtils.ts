/**
 * Geographic utility functions for In-App calculation of distances, routes, and travel times.
 */

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} متر`;
  }
  return `${distanceKm.toFixed(1)} كم`;
}

export function estimateTravelTimes(distanceKm: number): {
  drivingMinutes: number;
  walkingMinutes: number;
  directionLabel: string;
} {
  // Average city driving speed in El Oued ~ 30 km/h with traffic
  const drivingMinutes = Math.max(1, Math.round((distanceKm / 30) * 60));
  // Average walking speed ~ 4.5 km/h
  const walkingMinutes = Math.max(1, Math.round((distanceKm / 4.5) * 60));

  return {
    drivingMinutes,
    walkingMinutes,
    directionLabel: drivingMinutes <= 5 ? 'قريب جداً' : drivingMinutes <= 15 ? 'مسافة متوسطة' : 'في أطراف الولاية',
  };
}

export function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const y = Math.sin((lon2 - lon1) * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.cos((lon2 - lon1) * (Math.PI / 180));
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

  if (brng >= 337.5 || brng < 22.5) return 'شمالاً';
  if (brng >= 22.5 && brng < 67.5) return 'شمال شرق';
  if (brng >= 67.5 && brng < 112.5) return 'شرقاً';
  if (brng >= 112.5 && brng < 157.5) return 'جنوب شرق';
  if (brng >= 157.5 && brng < 202.5) return 'جنوباً';
  if (brng >= 202.5 && brng < 247.5) return 'جنوب غرب';
  if (brng >= 247.5 && brng < 292.5) return 'غرباً';
  return 'شمال غرب';
}
