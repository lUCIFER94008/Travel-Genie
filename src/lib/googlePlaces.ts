const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface GooglePlaceResult {
  googlePlaceId?: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number | null;
  userRatingCount?: number | null;
  phoneNumber?: string;
  websiteUri?: string;
  googleMapsUrl?: string;
  openingHours?: string[];
  photos?: {
    url: string;
    width?: number;
    height?: number;
    source: string;
    sourceUrl?: string;
    attribution?: string;
  }[];
  primaryPhoto?: {
    url: string;
    source: string;
    sourceUrl?: string;
    attribution?: string;
  };
}

export function getPlacePhotos(photoName: string, maxHeight = 800): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || !photoName) return '';
  return `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxHeightPx=${maxHeight}`;
}

/**
 * Server-side search for places using Google Places API (New)
 */
export async function searchPlaces(query: string): Promise<GooglePlaceResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.photos',
      },
      body: JSON.stringify({ textQuery: query }),
    });

    if (!res.ok) {
      console.warn('Google Places API search status:', res.status);
      return [];
    }

    const data = await res.json();
    if (!data.places) return [];

    return data.places.map((place: any) => parseGooglePlace(place));
  } catch (error) {
    console.warn('Google Places API error:', error);
    return [];
  }
}

/**
 * Server-side search nearby places using Google Places API (New)
 */
export async function searchNearbyPlaces(
  latitude: number,
  longitude: number,
  radiusMeters: number = 10000,
  includedTypes: string[] = ['restaurant', 'lodging', 'tourist_attraction']
): Promise<GooglePlaceResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.photos',
      },
      body: JSON.stringify({
        includedTypes,
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: radiusMeters,
          },
        },
      }),
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (!data.places) return [];

    return data.places.map((place: any) => parseGooglePlace(place));
  } catch (error) {
    console.warn('Google Nearby Places error:', error);
    return [];
  }
}

/**
 * Server-side Place Details fetch using Google Places API (New)
 */
export async function getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || !placeId) return null;

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'id,displayName,formattedAddress,location,rating,userRatingCount,nationalPhoneNumber,websiteUri,googleMapsUri,photos',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return parseGooglePlace(data);
  } catch (error) {
    console.warn('Google Place Details error:', error);
    return null;
  }
}

function parseGooglePlace(place: any): GooglePlaceResult {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const photos = (place.photos || []).slice(0, 5).map((photo: any) => {
    const photoResourceName = photo.name;
    const authorAttribution = photo.authorAttributions?.[0];
    const photoUrl = apiKey && photoResourceName
      ? `https://places.googleapis.com/v1/${photoResourceName}/media?key=${apiKey}&maxHeightPx=800`
      : '';

    return {
      url: photoUrl,
      width: photo.widthPx,
      height: photo.heightPx,
      source: authorAttribution?.displayName ? `Photo by ${authorAttribution.displayName} on Google Maps` : 'Google Maps',
      sourceUrl: authorAttribution?.uri || 'https://maps.google.com',
      attribution: authorAttribution?.displayName || 'Google Maps',
    };
  }).filter((p: any) => p.url !== '');

  const primaryPhoto = photos[0] || {
    url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=1000',
    source: 'Kerala Tourism',
    sourceUrl: 'https://www.keralatourism.org/munnar/',
    attribution: 'Kerala Tourism',
  };

  return {
    googlePlaceId: place.id,
    name: place.displayName?.text || '',
    address: place.formattedAddress || '',
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
    rating: place.rating || null,
    userRatingCount: place.userRatingCount || null,
    phoneNumber: place.nationalPhoneNumber || '',
    websiteUri: place.websiteUri || '',
    googleMapsUrl: place.googleMapsUri || 'https://maps.google.com',
    photos,
    primaryPhoto,
  };
}
