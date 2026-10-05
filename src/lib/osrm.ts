const OSRM_BASE_URL = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org';

export interface RouteResult {
  coordinates: [number, number][]; // Array of [lat, lng] for Leaflet polyline
  distanceKm: number;
  durationMinutes: number;
  success: boolean;
  error?: string;
}

export async function fetchOSRMRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<RouteResult> {
  try {
    const url = `${OSRM_BASE_URL}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error(`OSRM API responded with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    // OSRM GeoJSON gives coordinates as [lng, lat]. Leaflet Polyline needs [lat, lng].
    const rawCoords: [number, number][] = route.geometry.coordinates;
    const leafletCoords: [number, number][] = rawCoords.map(([lng, lat]) => [lat, lng]);

    const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
    const durationMinutes = Math.round(route.duration / 60);

    return {
      coordinates: leafletCoords,
      distanceKm,
      durationMinutes,
      success: true,
    };
  } catch (error: any) {
    console.warn('OSRM routing fetch warning:', error?.message || error);
    // Straight-line fallback if OSRM endpoint is temporarily unreachable
    return {
      coordinates: [
        [startLat, startLng],
        [endLat, endLng],
      ],
      distanceKm: 0,
      durationMinutes: 0,
      success: false,
      error: error?.message || 'Route calculation unavailable',
    };
  }
}
