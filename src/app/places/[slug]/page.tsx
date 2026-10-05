import React from 'react';
import { notFound } from 'next/navigation';
import { getPlaceBySlug } from '@/lib/dataStore';
import { connectToDatabase } from '@/lib/db';
import { Destination } from '@/models/Destination';
import PlaceClientPage from './PlaceClientPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    return { title: 'Place Not Found | Travel Genie' };
  }

  return {
    title: `${place.name} | Verified Tourist Place | Travel Genie`,
    description: place.description,
  };
}

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  let destination: any = null;
  if (place.destinationId) {
    try {
      await connectToDatabase();
      destination = await Destination.findOne({
        $or: [
          { _id: place.destinationId.match(/^[0-9a-fA-F]{24}$/) ? place.destinationId : undefined },
          { slug: place.destinationId.toLowerCase() },
        ].filter(Boolean),
      }).lean();
    } catch {
      destination = null;
    }
  }

  return <PlaceClientPage place={place} destination={destination ? JSON.parse(JSON.stringify(destination)) : null} />;
}
