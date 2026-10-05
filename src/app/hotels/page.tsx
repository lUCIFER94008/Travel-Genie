import React from 'react';
import { getHotels } from '@/lib/dataStore';
import HotelsClientPage from './HotelsClientPage';

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string }>;
}) {
  const { type, search } = await searchParams;
  const hotels = await getHotels(undefined, type, search);

  return <HotelsClientPage hotels={hotels} search={search} type={type} />;
}
