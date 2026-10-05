import { connectToDatabase } from './db';
import { Destination } from '../models/Destination';
import { Place } from '../models/Place';
import { Restaurant } from '../models/Restaurant';
import { Hotel } from '../models/Hotel';
import { Resort } from '../models/Resort';
import { calculateDistance } from './geo';

export async function getDestinations(search?: string) {
  try {
    await connectToDatabase();
    let queryObj: any = {};
    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
      ];
    }
    const docs = await Destination.find(queryObj).lean();
    if (docs && docs.length > 0) {
      return JSON.parse(JSON.stringify(docs));
    }
  } catch (err) {
    console.warn('MongoDB query warning in getDestinations:', err);
  }
  return [];
}

export async function getDestinationBySlug(slug: string) {
  try {
    await connectToDatabase();
    const doc = await Destination.findOne({ slug: slug.toLowerCase() }).lean();
    if (doc) {
      return JSON.parse(JSON.stringify(doc));
    }
  } catch (err) {
    console.warn('MongoDB query warning in getDestinationBySlug:', err);
  }
  return null;
}

export async function getPlaces(destinationSlug?: string, category?: string, search?: string) {
  try {
    await connectToDatabase();
    let queryObj: any = {};

    if (destinationSlug && destinationSlug.toLowerCase() !== 'all') {
      const dest = await Destination.findOne({ slug: destinationSlug.toLowerCase() }).lean();
      if (dest) {
        const destIdStr = (dest._id as any).toString();
        queryObj.$or = [
          { destinationId: destIdStr },
          { destinationId: dest._id },
          { destinationId: destinationSlug.toLowerCase() },
        ];
      } else {
        // Unknown destination -> return empty array (DO NOT fallback to Munnar or other places)
        return [];
      }
    }

    if (category && category !== 'All') {
      queryObj.category = { $regex: category, $options: 'i' };
    }
    if (search) {
      queryObj.name = { $regex: search, $options: 'i' };
    }

    const docs = await Place.find(queryObj).lean();
    if (docs && docs.length > 0) {
      return JSON.parse(JSON.stringify(docs));
    }
  } catch (err) {
    console.warn('getPlaces DB warning:', err);
  }
  return [];
}

export async function getPlaceBySlug(slug: string) {
  try {
    await connectToDatabase();
    const doc = await Place.findOne({ slug: slug.toLowerCase() }).lean();
    if (doc) {
      return JSON.parse(JSON.stringify(doc));
    }
  } catch (err) {
    console.warn('getPlaceBySlug DB error:', err);
  }
  return null;
}

export async function getRestaurants(destinationSlug?: string, search?: string) {
  try {
    await connectToDatabase();
    let queryObj: any = {};
    if (destinationSlug && destinationSlug.toLowerCase() !== 'all') {
      const dest = await Destination.findOne({ slug: destinationSlug.toLowerCase() }).lean();
      if (dest) {
        const destIdStr = (dest._id as any).toString();
        queryObj.$or = [
          { destinationId: destIdStr },
          { destinationId: dest._id },
          { destinationId: destinationSlug.toLowerCase() },
        ];
      } else {
        return [];
      }
    }
    if (search) {
      queryObj.name = { $regex: search, $options: 'i' };
    }
    const docs = await Restaurant.find(queryObj).lean();
    if (docs && docs.length > 0) {
      return JSON.parse(JSON.stringify(docs));
    }
  } catch (err) {
    console.warn('getRestaurants DB warning:', err);
  }
  return [];
}

export async function getRestaurantBySlug(slug: string) {
  try {
    await connectToDatabase();
    const doc = await Restaurant.findOne({ slug: slug.toLowerCase() }).lean();
    if (doc) {
      return JSON.parse(JSON.stringify(doc));
    }
  } catch (err) {
    console.warn('getRestaurantBySlug DB warning:', err);
  }
  return null;
}

export async function getHotels(destinationSlug?: string, type?: string, search?: string) {
  try {
    await connectToDatabase();
    let queryObj: any = {};
    if (destinationSlug && destinationSlug.toLowerCase() !== 'all') {
      const dest = await Destination.findOne({ slug: destinationSlug.toLowerCase() }).lean();
      if (dest) {
        const destIdStr = (dest._id as any).toString();
        queryObj.$or = [
          { destinationId: destIdStr },
          { destinationId: dest._id },
          { destinationId: destinationSlug.toLowerCase() },
        ];
      } else {
        return [];
      }
    }
    if (type && type !== 'All') {
      queryObj.type = type;
    }
    if (search) {
      queryObj.name = { $regex: search, $options: 'i' };
    }
    const docs = await Hotel.find(queryObj).lean();
    if (docs && docs.length > 0) {
      return JSON.parse(JSON.stringify(docs));
    }
  } catch (err) {
    console.warn('getHotels DB warning:', err);
  }
  return [];
}

export async function getHotelBySlug(slug: string) {
  try {
    await connectToDatabase();
    const doc = await Hotel.findOne({ slug: slug.toLowerCase() }).lean();
    if (doc) {
      return JSON.parse(JSON.stringify(doc));
    }
  } catch (err) {
    console.warn('getHotelBySlug DB warning:', err);
  }
  return null;
}

export async function getResorts(destinationSlug?: string, search?: string) {
  try {
    await connectToDatabase();
    let queryObj: any = {};
    if (destinationSlug && destinationSlug.toLowerCase() !== 'all') {
      const dest = await Destination.findOne({ slug: destinationSlug.toLowerCase() }).lean();
      if (dest) {
        const destIdStr = (dest._id as any).toString();
        queryObj.$or = [
          { destinationId: destIdStr },
          { destinationId: dest._id },
          { destinationId: destinationSlug.toLowerCase() },
        ];
      } else {
        return [];
      }
    }
    if (search) {
      queryObj.name = { $regex: search, $options: 'i' };
    }
    const docs = await Resort.find(queryObj).lean();
    if (docs && docs.length > 0) {
      return JSON.parse(JSON.stringify(docs));
    }
  } catch (err) {
    console.warn('getResorts DB warning:', err);
  }
  return [];
}

export async function getResortBySlug(slug: string) {
  try {
    await connectToDatabase();
    const doc = await Resort.findOne({ slug: slug.toLowerCase() }).lean();
    if (doc) {
      return JSON.parse(JSON.stringify(doc));
    }
  } catch (err) {
    console.warn('getResortBySlug DB warning:', err);
  }
  return null;
}

export async function getNearbyAll(
  lat: number,
  lng: number,
  radiusKm: number = 25
) {
  const allPlaces = await getPlaces();
  const allRestaurants = await getRestaurants();
  const allHotels = await getHotels();
  const allResorts = await getResorts();

  const filterNearby = (items: any[], typeLabel: string) =>
    items
      .filter((item) => item.location?.coordinates && item.location.coordinates.length >= 2)
      .map((item) => {
        const itemLat = item.location.coordinates[1];
        const itemLng = item.location.coordinates[0];
        const dist = calculateDistance(lat, lng, itemLat, itemLng);
        return { ...item, distanceKm: dist, itemType: typeLabel };
      })
      .filter((item) => item.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    places: filterNearby(allPlaces, 'Attraction'),
    restaurants: filterNearby(allRestaurants, 'Restaurant'),
    hotels: filterNearby([...allHotels, ...allResorts], 'Hotel/Resort'),
  };
}
