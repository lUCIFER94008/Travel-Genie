import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connectToDatabase } from '../src/lib/db';
import { Destination } from '../src/models/Destination';
import { Place } from '../src/models/Place';
import { searchPixabayImages } from '../src/lib/pixabay';

export async function migrateImagesToPixabay() {
  console.log('Connecting to MongoDB...');
  await connectToDatabase();

  const apiKey = process.env.PIXABAY_API_KEY;
  console.log(`PIXABAY_API_KEY status: ${apiKey ? 'Configured ✓' : 'Not configured (Will preserve existing verified images)'}`);

  console.log('\n--- Auditing Destinations ---');
  const destinations = await Destination.find({});
  for (const dest of destinations) {
    if (apiKey) {
      console.log(`Searching Pixabay for Destination: ${dest.name}...`);
      const searchRes = await searchPixabayImages(`${dest.name} ${dest.state} India`, { perPage: 3 });
      if (searchRes.success && searchRes.images.length > 0) {
        const topImg = searchRes.images[0];
        dest.heroImage = topImg.url;
        dest.imageSource = 'Pixabay';
        dest.imageSourceUrl = topImg.sourceUrl;
        await dest.save();
        console.log(`  ✓ Updated ${dest.name} Hero Image with Pixabay #${topImg.id} (Photographer: ${topImg.photographer})`);
        continue;
      }
    }
    console.log(`  - Preserved verified hero image for ${dest.name}`);
  }

  console.log('\n--- Auditing Places / Attractions ---');
  const places = await Place.find({});
  for (const place of places) {
    if (apiKey) {
      console.log(`Searching Pixabay for Place: ${place.name}...`);
      const searchRes = await searchPixabayImages(`${place.name} India`, { perPage: 4 });
      if (searchRes.success && searchRes.images.length > 0) {
        const pixabayPhotos = searchRes.images.map((img) => ({
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          source: 'Pixabay',
          sourceId: img.id,
          sourceUrl: img.sourceUrl,
          photographer: img.photographer,
          attribution: `Photo by ${img.photographer} on Pixabay`,
          alt: img.alt,
          width: img.width,
          height: img.height,
        }));

        place.primaryPhoto = pixabayPhotos[0];
        place.photos = pixabayPhotos;
        place.source = 'Pixabay';
        place.sourceUrl = pixabayPhotos[0].sourceUrl;
        await place.save();
        console.log(`  ✓ Updated ${place.name} with ${pixabayPhotos.length} Pixabay photos (Primary #${pixabayPhotos[0].sourceId})`);
        continue;
      }
    }

    // Ensure photo metadata structure is clean
    if (place.primaryPhoto && !place.primaryPhoto.source) {
      place.primaryPhoto.source = 'Wikimedia Commons';
    }
    if (place.photos && place.photos.length > 0) {
      place.photos = place.photos.map((p: any) => ({
        ...p,
        source: p.source || 'Wikimedia Commons',
      }));
    }
    await place.save();
    console.log(`  - Preserved existing verified photo metadata for ${place.name}`);
  }

  console.log('\n========================================');
  console.log('🎉 PIXABAY IMAGE MIGRATION COMPLETE!');
  console.log('========================================\n');
}

if (require.main === module) {
  migrateImagesToPixabay()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration Failed:', err);
      process.exit(1);
    });
}
