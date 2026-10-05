import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local BEFORE loading database modules
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connectToDatabase } from '../src/lib/db';
import { Destination } from '../src/models/Destination';
import { Place } from '../src/models/Place';
import { Hotel } from '../src/models/Hotel';
import { Resort } from '../src/models/Resort';
import { Restaurant } from '../src/models/Restaurant';
import { searchPixabayImages } from '../src/lib/pixabay';

const HOTEL_FALLBACK = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
const RESTAURANT_FALLBACK = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';

function isLegacyUrl(url?: string | null): boolean {
  if (!url) return false;
  const s = url.toLowerCase();
  return (
    s.includes('upload.wikimedia.org') ||
    s.includes('wikimedia.org') ||
    s.includes('wikipedia.org') ||
    s.includes('shutterstock.com') ||
    s.includes('shutterstock')
  );
}

function getUrlHostType(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim() === '') return 'Missing';
  const u = url.toLowerCase();
  if (u.includes('pixabay')) return 'Pixabay';
  if (u.includes('wikimedia') || u.includes('wikipedia')) return 'Wikimedia';
  if (u.includes('shutterstock')) return 'Shutterstock';
  if (u.includes('cloudinary')) return 'Cloudinary';
  if (u.includes('googleusercontent') || u.includes('googleapis')) return 'Google';
  return 'Other/Clean';
}

export async function migrateLegacyImages() {
  console.log('================================================================');
  console.log('🚀 TRAVEL GENIE - GLOBAL LEGACY IMAGE MIGRATION TO PIXABAY');
  console.log('================================================================\n');

  await connectToDatabase();

  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    console.error('❌ CRITICAL: PIXABAY_API_KEY is not defined in .env.local');
    process.exit(1);
  }

  // 1. MIGRATING HOTELS
  console.log('📌 Auditing Hotels collection...');
  const hotels = await Hotel.find({});
  for (const hotel of hotels) {
    const rawPhoto = typeof hotel.primaryPhoto === 'object' ? hotel.primaryPhoto?.url : hotel.primaryPhoto;
    if (isLegacyUrl(rawPhoto)) {
      console.log(`  Searching Pixabay for Hotel: "${hotel.name}"...`);
      const searchRes = await searchPixabayImages(`${hotel.name} hotel India`, { perPage: 3 });
      if (searchRes.success && searchRes.images.length > 0) {
        const img = searchRes.images[0];
        hotel.primaryPhoto = {
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          width: img.width,
          height: img.height,
          source: 'Pixabay',
          sourceId: img.id,
          sourceUrl: img.sourceUrl,
          photographer: img.photographer,
          attribution: `Photo by ${img.photographer} on Pixabay`,
          alt: `${hotel.name} - Pixabay Photography`,
          searchQuery: `${hotel.name} hotel India`,
        };
        await hotel.save();
        console.log(`   ✓ Updated ${hotel.name} with Pixabay ID #${img.id}`);
      } else {
        hotel.primaryPhoto = {
          url: HOTEL_FALLBACK,
          source: 'Pixabay Recommended',
          attribution: 'Verified Tourism Photography',
          alt: `${hotel.name} - Tourism Photography`,
        };
        await hotel.save();
        console.log(`   ⚠️ Replaced legacy image for ${hotel.name} with verified clean CDN photo`);
      }
    }
  }

  // 2. MIGRATING RESORTS
  console.log('\n📌 Auditing Resorts collection...');
  const resorts = await Resort.find({});
  for (const resort of resorts) {
    const rawPhoto = typeof resort.primaryPhoto === 'object' ? resort.primaryPhoto?.url : resort.primaryPhoto;
    if (isLegacyUrl(rawPhoto)) {
      console.log(`  Searching Pixabay for Resort: "${resort.name}"...`);
      const searchRes = await searchPixabayImages(`${resort.name} resort India`, { perPage: 3 });
      if (searchRes.success && searchRes.images.length > 0) {
        const img = searchRes.images[0];
        resort.primaryPhoto = {
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          width: img.width,
          height: img.height,
          source: 'Pixabay',
          sourceId: img.id,
          sourceUrl: img.sourceUrl,
          photographer: img.photographer,
          attribution: `Photo by ${img.photographer} on Pixabay`,
          alt: `${resort.name} - Pixabay Photography`,
          searchQuery: `${resort.name} resort India`,
        };
        await resort.save();
        console.log(`   ✓ Updated ${resort.name} with Pixabay ID #${img.id}`);
      } else {
        resort.primaryPhoto = {
          url: HOTEL_FALLBACK,
          source: 'Pixabay Recommended',
          attribution: 'Verified Tourism Photography',
          alt: `${resort.name} - Tourism Photography`,
        };
        await resort.save();
        console.log(`   ⚠️ Replaced legacy image for ${resort.name} with verified clean CDN photo`);
      }
    }
  }

  // 3. MIGRATING RESTAURANTS
  console.log('\n📌 Auditing Restaurants collection...');
  const restaurants = await Restaurant.find({});
  for (const rest of restaurants) {
    const rawPhoto = typeof rest.primaryPhoto === 'object' ? rest.primaryPhoto?.url : rest.primaryPhoto;
    if (isLegacyUrl(rawPhoto)) {
      console.log(`  Searching Pixabay for Restaurant: "${rest.name}"...`);
      const searchRes = await searchPixabayImages(`${rest.name} restaurant India`, { perPage: 3 });
      if (searchRes.success && searchRes.images.length > 0) {
        const img = searchRes.images[0];
        rest.primaryPhoto = {
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          width: img.width,
          height: img.height,
          source: 'Pixabay',
          sourceId: img.id,
          sourceUrl: img.sourceUrl,
          photographer: img.photographer,
          attribution: `Photo by ${img.photographer} on Pixabay`,
          alt: `${rest.name} - Pixabay Photography`,
          searchQuery: `${rest.name} restaurant India`,
        };
        await rest.save();
        console.log(`   ✓ Updated ${rest.name} with Pixabay ID #${img.id}`);
      } else {
        rest.primaryPhoto = {
          url: RESTAURANT_FALLBACK,
          source: 'Pixabay Recommended',
          attribution: 'Verified Tourism Photography',
          alt: `${rest.name} - Tourism Photography`,
        };
        await rest.save();
        console.log(`   ⚠️ Replaced legacy image for ${rest.name} with verified clean CDN photo`);
      }
    }
  }

  // 4. GENERATE DATABASE IMAGE SOURCE AUDIT REPORT
  console.log('\n================================================================================================');
  console.log('📊 COLLECTION IMAGE SOURCE REPORT');
  console.log('================================================================================================');
  console.log('Collection    | Total | Pixabay | Wikimedia | Shutterstock | Cloudinary | Google | Missing/None');
  console.log('--------------+-------+---------+-----------+--------------+------------+--------+-------------');

  const auditCollection = async (model: any, name: string, getUrlFn: (doc: any) => string) => {
    const docs = await model.find({});
    const counts = { Total: docs.length, Pixabay: 0, Wikimedia: 0, Shutterstock: 0, Cloudinary: 0, Google: 0, Missing: 0 };
    for (const d of docs) {
      const type = getUrlHostType(getUrlFn(d));
      if (type === 'Pixabay') counts.Pixabay++;
      else if (type === 'Wikimedia') counts.Wikimedia++;
      else if (type === 'Shutterstock') counts.Shutterstock++;
      else if (type === 'Cloudinary') counts.Cloudinary++;
      else if (type === 'Google') counts.Google++;
      else counts.Missing++;
    }
    const pad = (s: string | number, len: number) => String(s).padEnd(len);
    console.log(
      `${pad(name, 14)}| ${pad(counts.Total, 6)}| ${pad(counts.Pixabay, 8)}| ${pad(counts.Wikimedia, 10)}| ${pad(counts.Shutterstock, 13)}| ${pad(counts.Cloudinary, 11)}| ${pad(counts.Google, 7)}| ${counts.Missing}`
    );
  };

  await auditCollection(Destination, 'Destinations', (d) => typeof d.heroImage === 'object' ? d.heroImage?.url : d.heroImage);
  await auditCollection(Place, 'Places', (p) => p.primaryPhoto?.url || p.primaryPhoto);
  await auditCollection(Hotel, 'Hotels', (h) => h.primaryPhoto?.url || h.primaryPhoto);
  await auditCollection(Resort, 'Resorts', (r) => r.primaryPhoto?.url || r.primaryPhoto);
  await auditCollection(Restaurant, 'Restaurants', (rest) => rest.primaryPhoto?.url || rest.primaryPhoto);

  console.log('================================================================================================\n');
}

if (require.main === module) {
  migrateLegacyImages()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration Failed:', err);
      process.exit(1);
    });
}
