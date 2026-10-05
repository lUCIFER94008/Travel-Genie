import React from 'react';
import { notFound } from 'next/navigation';
import { getDestinationBySlug, getPlaces, getRestaurants, getHotels } from '@/lib/dataStore';
import MunnarClientPage from './MunnarClientPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);

  if (!destination) {
    return { title: 'Destination Not Found | Travel Genie' };
  }

  return {
    title: `${destination.name} Travel Guide | Verified Attractions & Stays | Travel Genie`,
    description: destination.description,
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  const places = await getPlaces(slug);
  const restaurants = await getRestaurants(slug);
  const hotels = await getHotels(slug);

  // Fetch reviews for destination
  let reviews: any[] = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/reviews?targetId=${destination._id || slug}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      reviews = data.data || [];
    }
  } catch (err) {
    reviews = [];
  }

  return (
    <MunnarClientPage
      destination={destination}
      places={places}
      restaurants={restaurants}
      hotels={hotels}
      reviews={reviews}
    />
  );
}
