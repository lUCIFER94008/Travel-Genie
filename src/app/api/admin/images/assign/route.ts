import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Destination } from '@/models/Destination';
import { Place } from '@/models/Place';
import { Hotel } from '@/models/Hotel';
import { Resort } from '@/models/Resort';
import { Restaurant } from '@/models/Restaurant';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetType, targetId, photo, isPrimary = true } = body;

    if (!targetType || !targetId || !photo?.url) {
      return NextResponse.json(
        { error: 'targetType, targetId, and photo URL are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const formattedPhoto = {
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl || photo.url,
      source: photo.source || 'Pixabay',
      sourceId: photo.id?.toString() || photo.sourceId || '',
      sourceUrl: photo.sourceUrl || '',
      photographer: photo.photographer || '',
      attribution: photo.photographer ? `Photo by ${photo.photographer} on Pixabay` : 'Pixabay',
      alt: photo.alt || '',
      width: photo.width,
      height: photo.height,
    };

    if (targetType === 'destination') {
      const dest = await Destination.findByIdAndUpdate(
        targetId,
        {
          heroImage: formattedPhoto.url,
          imageSource: formattedPhoto.source,
          imageSourceUrl: formattedPhoto.sourceUrl,
        },
        { new: true }
      );
      return NextResponse.json({ success: true, data: dest });
    }

    if (targetType === 'place') {
      const place = await Place.findById(targetId);
      if (!place) {
        return NextResponse.json({ error: 'Place not found' }, { status: 404 });
      }

      if (isPrimary) {
        place.primaryPhoto = formattedPhoto;
        // Also ensure it is in photos array
        const existingIdx = place.photos.findIndex((p: any) => p.url === formattedPhoto.url);
        if (existingIdx >= 0) {
          place.photos[existingIdx] = formattedPhoto;
        } else {
          place.photos.unshift(formattedPhoto);
        }
      } else {
        place.photos.push(formattedPhoto);
      }

      await place.save();
      return NextResponse.json({ success: true, data: place });
    }

    if (targetType === 'hotel') {
      const hotel = await Hotel.findById(targetId);
      if (hotel) {
        if (isPrimary) hotel.primaryPhoto = formattedPhoto;
        hotel.photos.push(formattedPhoto);
        await hotel.save();
        return NextResponse.json({ success: true, data: hotel });
      }
    }

    if (targetType === 'resort') {
      const resort = await Resort.findById(targetId);
      if (resort) {
        if (isPrimary) resort.primaryPhoto = formattedPhoto;
        resort.photos.push(formattedPhoto);
        await resort.save();
        return NextResponse.json({ success: true, data: resort });
      }
    }

    if (targetType === 'restaurant') {
      const restaurant = await Restaurant.findById(targetId);
      if (restaurant) {
        if (isPrimary) restaurant.primaryPhoto = formattedPhoto;
        restaurant.photos.push(formattedPhoto);
        await restaurant.save();
        return NextResponse.json({ success: true, data: restaurant });
      }
    }

    return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
  } catch (error: any) {
    console.error('Assign image error:', error);
    return NextResponse.json({ error: 'Failed to assign image' }, { status: 500 });
  }
}
