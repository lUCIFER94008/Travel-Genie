import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connectToDatabase } from '../src/lib/db';
import { Destination } from '../src/models/Destination';
import { Place } from '../src/models/Place';
import { Restaurant } from '../src/models/Restaurant';

export interface AuditReport {
  totalDestinations: number;
  totalPlaces: number;
  totalRestaurants: number;
  placesWithoutDestinationId: number;
  placesWithInvalidDestinationId: number;
  duplicatePlacesCount: number;
  globalDuplicateImageCount: number;
  missingImageCount: number;
  legacyWikimediaCount: number;
  legacyShutterstockCount: number;
  restaurantsWithoutCoords: number;
  destinationReports: {
    name: string;
    slug: string;
    placeCount: number;
    validImages: number;
    duplicateImages: number;
    missingImages: number;
    legacyImages: number;
    restaurantCount: number;
    status: string;
  }[];
  warnings: string[];
}

export async function auditDestinationData(): Promise<AuditReport> {
  await connectToDatabase();

  const destinations = await Destination.find({}).lean();
  const validDestIds = new Set(destinations.map((d: any) => d._id.toString()));
  const validDestSlugs = new Set(destinations.map((d: any) => d.slug.toLowerCase()));

  const allPlaces = await Place.find({}).lean();
  const allRestaurants = await Restaurant.find({}).lean();

  const warnings: string[] = [];

  let placesWithoutDestinationId = 0;
  let placesWithInvalidDestinationId = 0;

  // Track global image duplicates
  const globalSeenImageUrls = new Map<string, string[]>(); // imgUrl -> place names
  let missingImageCount = 0;
  let legacyWikimediaCount = 0;
  let legacyShutterstockCount = 0;

  const placeNameMap = new Map<string, string[]>(); // placeName -> destIds

  for (const place of allPlaces as any[]) {
    // 1. Check destinationId
    if (!place.destinationId) {
      placesWithoutDestinationId++;
      warnings.push(`Place "${place.name}" (${place._id}) is missing destinationId`);
    } else if (!validDestIds.has(place.destinationId) && !validDestSlugs.has(place.destinationId.toLowerCase())) {
      placesWithInvalidDestinationId++;
      warnings.push(`Place "${place.name}" (${place._id}) has invalid destinationId: "${place.destinationId}"`);
    }

    // 2. Track duplicate places
    const lowerName = place.name.trim().toLowerCase();
    if (!placeNameMap.has(lowerName)) {
      placeNameMap.set(lowerName, []);
    }
    placeNameMap.get(lowerName)!.push(place.destinationId || 'none');

    // 3. Image check
    const imgUrl = typeof place.primaryPhoto === 'string' ? place.primaryPhoto : place.primaryPhoto?.url;

    if (!imgUrl || imgUrl.trim() === '' || place.imageStatus === 'missing') {
      missingImageCount++;
      warnings.push(`Place "${place.name}" has missing primary image`);
    } else {
      if (imgUrl.includes('wikimedia.org')) {
        legacyWikimediaCount++;
        warnings.push(`Place "${place.name}" uses legacy Wikimedia URL: ${imgUrl}`);
      }
      if (imgUrl.includes('shutterstock.com')) {
        legacyShutterstockCount++;
        warnings.push(`Place "${place.name}" uses legacy Shutterstock URL: ${imgUrl}`);
      }

      if (!globalSeenImageUrls.has(imgUrl)) {
        globalSeenImageUrls.set(imgUrl, []);
      }
      globalSeenImageUrls.get(imgUrl)!.push(place.name);
    }
  }

  // Count duplicate place names assigned to multiple destinations
  let duplicatePlacesCount = 0;
  for (const [name, dests] of Array.from(placeNameMap.entries())) {
    if (dests.length > 1) {
      duplicatePlacesCount++;
      warnings.push(`Place name "${name}" appears ${dests.length} times across destinations: ${dests.join(', ')}`);
    }
  }

  // Count global duplicate images
  let globalDuplicateImageCount = 0;
  for (const [imgUrl, places] of Array.from(globalSeenImageUrls.entries())) {
    if (places.length > 1) {
      globalDuplicateImageCount += (places.length - 1);
      warnings.push(`Image "${imgUrl.substring(0, 60)}..." is shared by multiple places: ${places.join(', ')}`);
    }
  }

  // 4. Restaurant audit
  let restaurantsWithoutCoords = 0;
  for (const r of allRestaurants as any[]) {
    if (!r.location?.coordinates || r.location.coordinates.length < 2 || (r.location.coordinates[0] === 0 && r.location.coordinates[1] === 0)) {
      restaurantsWithoutCoords++;
      warnings.push(`Restaurant "${r.name}" (${r._id}) has missing or invalid coordinates`);
    }
  }

  // Breakdown per destination
  const destinationReports = [];

  for (const dest of destinations as any[]) {
    const destIdStr = dest._id.toString();
    const destSlug = dest.slug.toLowerCase();

    const destPlaces = (allPlaces as any[]).filter(
      (p) => p.destinationId === destIdStr || p.destinationId === destSlug
    );

    const destRestaurants = (allRestaurants as any[]).filter(
      (r) => r.destinationId === destIdStr || r.destinationId === destSlug
    );

    const localSeenImages = new Set<string>();
    let validImages = 0;
    let duplicateImages = 0;
    let missingImages = 0;
    let legacyImages = 0;

    for (const p of destPlaces) {
      const imgUrl = typeof p.primaryPhoto === 'string' ? p.primaryPhoto : p.primaryPhoto?.url;
      if (!imgUrl || p.imageStatus === 'missing') {
        missingImages++;
      } else {
        if (imgUrl.includes('wikimedia.org') || imgUrl.includes('shutterstock.com')) {
          legacyImages++;
        }
        if (localSeenImages.has(imgUrl)) {
          duplicateImages++;
        } else {
          localSeenImages.add(imgUrl);
          validImages++;
        }
      }
    }

    const isIsolated =
      destPlaces.length >= 5 &&
      duplicateImages === 0 &&
      legacyImages === 0 &&
      missingImages === 0;

    const status = isIsolated ? '✓ Valid & Isolated' : '⚠️ Warning';

    destinationReports.push({
      name: dest.name,
      slug: dest.slug,
      placeCount: destPlaces.length,
      validImages,
      duplicateImages,
      missingImages,
      legacyImages,
      restaurantCount: destRestaurants.length,
      status,
    });
  }

  const report: AuditReport = {
    totalDestinations: destinations.length,
    totalPlaces: allPlaces.length,
    totalRestaurants: allRestaurants.length,
    placesWithoutDestinationId,
    placesWithInvalidDestinationId,
    duplicatePlacesCount,
    globalDuplicateImageCount,
    missingImageCount,
    legacyWikimediaCount,
    legacyShutterstockCount,
    restaurantsWithoutCoords,
    destinationReports,
    warnings,
  };

  return report;
}

export async function printAuditReport() {
  console.log('================================================================================================');
  console.log('TRAVEL GENIE DATA AUDIT');
  console.log('================================================================================================\n');

  const report = await auditDestinationData();

  console.log(`Total Destinations: ${report.totalDestinations}`);
  console.log(`Total Places:       ${report.totalPlaces}`);
  console.log(`Total Restaurants:  ${report.totalRestaurants}\n`);

  console.log('Destination     | Places | Valid Img | Dup Img | Missing Img | Restaurants | Status');
  console.log('----------------+--------+-----------+---------+-------------+-------------+-------------------');

  const pad = (s: string | number, len: number) => String(s).padEnd(len);

  for (const r of report.destinationReports) {
    console.log(
      `${pad(r.name, 16)}| ${pad(r.placeCount, 7)}| ${pad(r.validImages, 10)}| ${pad(r.duplicateImages, 8)}| ${pad(r.missingImages, 12)}| ${pad(r.restaurantCount, 12)}| ${r.status}`
    );
  }

  console.log('\n================================================================================================');
  console.log('AUDIT ISSUES SUMMARY');
  console.log('================================================================================================');
  console.log(`Places without destinationId:       ${report.placesWithoutDestinationId}`);
  console.log(`Places with invalid destinationId:   ${report.placesWithInvalidDestinationId}`);
  console.log(`Duplicate places across dests:      ${report.duplicatePlacesCount}`);
  console.log(`Global duplicate primary images:     ${report.globalDuplicateImageCount}`);
  console.log(`Missing primary images:              ${report.missingImageCount}`);
  console.log(`Legacy Wikimedia images remaining:   ${report.legacyWikimediaCount}`);
  console.log(`Legacy Shutterstock images:          ${report.legacyShutterstockCount}`);
  console.log(`Restaurants without coordinates:    ${report.restaurantsWithoutCoords}`);
  console.log('================================================================================================\n');

  if (report.warnings.length > 0) {
    console.log(`Top Warnings (first 10 of ${report.warnings.length}):`);
    report.warnings.slice(0, 10).forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    console.log('');
  }
}

if (require.main === module) {
  printAuditReport()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Audit script error:', err);
      process.exit(1);
    });
}
