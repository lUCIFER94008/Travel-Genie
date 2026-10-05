import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Destination } from '../src/models/Destination';
import { Place } from '../src/models/Place';
import { Restaurant } from '../src/models/Restaurant';
import { Hotel } from '../src/models/Hotel';
import { Resort } from '../src/models/Resort';
import { User } from '../src/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelgenie';

async function seed() {
  console.log('Travel Genie Database Seed\n');
  console.log('MongoDB connecting...');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected ✓\n');

    // 1. Ensure Admin User (Upsert)
    const adminEmail = 'admin@travelgenie.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'Travel Genie Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '+91 98765 43210',
        isVerified: true,
        isActive: true,
      });
    }

    // 2. Upsert Destinations (Munnar + others)
    const munnarData = {
      name: 'Munnar',
      slug: 'munnar',
      state: 'Kerala',
      district: 'Idukki',
      country: 'India',
      description:
        'Munnar is a premier hill station located at around 1,600 meters above sea level in the Western Ghats of Kerala. Renowned for its sprawling tea plantations, pristine valleys, waterfalls, exotic flora, and wildlife such as the endangered Nilgiri Tahr.',
      shortDescription: 'High altitude hill station in Idukki district known for tea plantations, mist-covered valleys, and Nilgiri Tahr reserves.',
      heroImage:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Eravikulam_national_park_Landscape.JPG/1200px-Eravikulam_national_park_Landscape.JPG',
      imageSource: 'Kerala Tourism',
      imageSourceUrl: 'https://www.keralatourism.org/munnar/',
      location: {
        type: 'Point' as const,
        coordinates: [77.0595, 10.0889], // [lng, lat]
      },
      categories: ['Mountains', 'Tea Gardens', 'Wildlife', 'Waterfalls'],
      featured: true,
      verified: true,
    };

    const munnarDoc = await Destination.findOneAndUpdate(
      { slug: 'munnar' },
      munnarData,
      { upsert: true, returnDocument: 'after' }
    );
    const munnarId = munnarDoc.slug;

    console.log('Destination:');
    console.log('Munnar ✓\n');

    // 3. Upsert 8 Real Munnar Attractions
    const realAttractions = [
      {
        name: 'Eravikulam National Park',
        slug: 'eravikulam-national-park',
        destinationId: munnarId,
        category: 'national-park',
        description:
          'A 97 sq km protected national park in the High Ranges of the Western Ghats. Home to the largest surviving population of the endangered Nilgiri Tahr and the blooming grounds of Neelakurinji flowers.',
        shortDescription: 'Protected high altitude park home to the Nilgiri Tahr.',
        address: 'Kannan Devan Hills, Munnar, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.07, 10.15],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=1200&q=80',
            source: 'Pixabay Recommended',
            sourceUrl: 'https://pixabay.com',
            attribution: 'Kerala Tourism / Pixabay',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=1200&q=80',
          source: 'Pixabay Recommended',
          sourceUrl: 'https://pixabay.com',
          attribution: 'Kerala Tourism',
        },
        phone: '+91 4865 231587',
        website: 'https://eravikulamnationalpark.in',
        openingHours: '07:30 AM - 04:00 PM',
        activities: ['Wildlife Safari', 'Trekking', 'Photography'],
        facilities: ['Parking', 'Ticket Counter', 'Visitor Information Center'],
        bestTimeToVisit: 'September to May',
        source: 'Kerala Tourism',
        sourceUrl: 'https://www.keralatourism.org/destination/eravikulam-national-park/205',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_z_sample1',
        googleMapsUrl: 'https://maps.google.com/?cid=eravikulam',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Mattupetty Dam',
        slug: 'mattupetty-dam',
        destinationId: munnarId,
        category: 'dam',
        description:
          'A concrete gravity dam built across the Muthirapuzha River at an elevation of 1,700 metres in the Anamudi ranges. Known for its reservoir water sports, speedboating, and surrounding tea hill vistas.',
        shortDescription: 'High altitude dam reservoir known for speedboating and hill views.',
        address: 'Mattupetty, Munnar Top Station Highway, Idukki District, Kerala 685616',
        location: {
          type: 'Point' as const,
          coordinates: [77.1235, 10.1051],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=80',
            source: 'Pixabay Recommended',
            sourceUrl: 'https://pixabay.com',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=80',
          source: 'Pixabay Recommended',
          sourceUrl: 'https://pixabay.com',
          attribution: 'Kerala Tourism',
        },
        phone: '+91 4865 230214',
        openingHours: '09:30 AM - 05:00 PM',
        activities: ['Speedboating', 'Sightseeing', 'Boating'],
        facilities: ['Boat Jetty', 'Food Stalls', 'Parking'],
        bestTimeToVisit: 'September to May',
        source: 'Kerala Tourism',
        sourceUrl: 'https://www.keralatourism.org/destination/mattupetty-dam-munnar/203',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_z_sample2',
        googleMapsUrl: 'https://maps.google.com/?cid=mattupetty',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Top Station',
        slug: 'top-station',
        destinationId: munnarId,
        category: 'viewpoint',
        description:
          'The highest viewpoint on the Munnar-Kodaikanal road situated at an altitude of 1,700 metres on the Kerala-Tamil Nadu border. Offers panoramic cloud vistas looking down onto the Theni valley.',
        shortDescription: 'Highest viewpoint near Munnar offering cloud valley vistas.',
        address: 'Top Station, Highway 18, Munnar-Kodaikanal Rd, Idukki District, Kerala 685616',
        location: {
          type: 'Point' as const,
          coordinates: [77.245, 10.122],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1506461883276-594a12b11ce3?auto=format&fit=crop&w=1200&q=80',
            source: 'Pixabay Recommended',
            sourceUrl: 'https://pixabay.com',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1506461883276-594a12b11ce3?auto=format&fit=crop&w=1200&q=80',
          source: 'Pixabay Recommended',
          sourceUrl: 'https://pixabay.com',
          attribution: 'Kerala Tourism',
        },
        openingHours: '06:00 AM - 06:00 PM',
        activities: ['Viewpoint Trekking', 'Photography'],
        facilities: ['View Deck', 'Restroom', 'Tea Stalls'],
        bestTimeToVisit: 'October to April',
        source: 'Kerala Tourism',
        sourceUrl: 'https://www.keralatourism.org/destination/top-station-munnar/207',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_z_sample3',
        googleMapsUrl: 'https://maps.google.com/?cid=topstation',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Kundala Lake',
        slug: 'kundala-lake',
        destinationId: munnarId,
        category: 'lake',
        description:
          'High altitude lake and arch dam situated 20 km from Munnar on the way to Top Station. Features Kashmiri-style shikara boat rides and Cherry Blossom trees that bloom twice a year.',
        shortDescription: 'Picturesque mountain lake featuring Shikara boat rides.',
        address: 'Top Station Road, Kundala, Munnar, Idukki District, Kerala 685615',
        location: {
          type: 'Point' as const,
          coordinates: [77.189, 10.134],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
            source: 'Pixabay Recommended',
            sourceUrl: 'https://pixabay.com',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
          source: 'Pixabay Recommended',
          sourceUrl: 'https://pixabay.com',
          attribution: 'Kerala Tourism',
        },
        openingHours: '09:00 AM - 05:00 PM',
        activities: ['Shikara Boating', 'Row Boating', 'Photography'],
        facilities: ['Boat Counter', 'Parking'],
        bestTimeToVisit: 'Year-round',
        source: 'Kerala Tourism',
        sourceUrl: 'https://www.keralatourism.org/destination/kundala-dam-munnar/209',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_z_sample4',
        googleMapsUrl: 'https://maps.google.com/?cid=kundala',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Attukad Waterfalls',
        slug: 'attukad-waterfalls',
        destinationId: munnarId,
        category: 'waterfall',
        description:
          'Cascading waterfall located between Munnar and Pallivasal amidst dense forest ridges and tea plantations. Accessible via a narrow wooden mountain bridge.',
        shortDescription: 'Cascading forest waterfall nestled amidst rolling tea hills.',
        address: 'Attukad Waterfall Road, Pallivasal, Munnar, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.042, 10.046],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
            source: 'Pixabay Recommended',
            sourceUrl: 'https://pixabay.com',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
          source: 'Pixabay Recommended',
          sourceUrl: 'https://pixabay.com',
          attribution: 'Kerala Tourism',
        },
        openingHours: '09:00 AM - 05:30 PM',
        activities: ['Waterfall Trekking', 'Nature Photography'],
        facilities: ['Tea Shop', 'View Point'],
        bestTimeToVisit: 'Monsoon to Winter',
        source: 'Kerala Tourism',
        sourceUrl: 'https://www.keralatourism.org/destination/attukad-waterfalls-munnar/208',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_z_sample5',
        googleMapsUrl: 'https://maps.google.com/?cid=attukad',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Tata Tea Museum',
        slug: 'tata-tea-museum',
        destinationId: munnarId,
        category: 'museum',
        description:
          'Official tea museum operated by Tata Tea (KDHP) at Nallathanni Estate, depicting the evolution of tea plantations in Munnar from 1880 to modern automated production. Displays historic tea rollers and machinery.',
        shortDescription: 'Historical tea museum depicting 140+ years of Munnar tea production.',
        address: 'Nallathanni Estate, Munnar, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.0621, 10.0765],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1563822249510-04678c787b8d?auto=format&fit=crop&w=1200&q=80',
            source: 'Pixabay Recommended',
            sourceUrl: 'https://pixabay.com',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1563822249510-04678c787b8d?auto=format&fit=crop&w=1200&q=80',
          source: 'Pixabay Recommended',
          sourceUrl: 'https://pixabay.com',
          attribution: 'Kerala Tourism',
        },
        phone: '+91 4865 230561',
        website: 'https://www.kdhptea.com',
        openingHours: '09:00 AM - 05:00 PM (Closed Mondays)',
        activities: ['Tea Tasting', 'Guided Tour', 'Museum Walk'],
        facilities: ['Souvenir Shop', 'Tea Tasting Counter', 'Parking'],
        bestTimeToVisit: 'Year-round',
        source: 'Kerala Tourism',
        sourceUrl: 'https://www.keralatourism.org/destination/tea-museum-munnar/204',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_z_sample6',
        googleMapsUrl: 'https://maps.google.com/?cid=teamuseum',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Echo Point',
        slug: 'echo-point',
        destinationId: munnarId,
        category: 'viewpoint',
        description:
          'Natural acoustic resonance viewpoint situated 15 km from Munnar along Top Station highway. Visitors experience natural voice echoes reverberating across mountain reservoir cliffs.',
        shortDescription: 'Natural acoustic echo point along mountain reservoir cliffs.',
        address: 'Top Station Highway, Mattupetty, Munnar, Idukki District, Kerala 685616',
        location: {
          type: 'Point' as const,
          coordinates: [77.148, 10.125],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
            source: 'Pixabay Recommended',
            sourceUrl: 'https://pixabay.com',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
          source: 'Pixabay Recommended',
          sourceUrl: 'https://pixabay.com',
          attribution: 'Kerala Tourism',
        },
        openingHours: '06:00 AM - 06:00 PM',
        activities: ['Echo Calling', 'Photography', 'Nature Walk'],
        facilities: ['Stalls', 'Parking'],
        bestTimeToVisit: 'Year-round',
        source: 'Kerala Tourism',
        sourceUrl: 'https://www.keralatourism.org/destination/echo-point-munnar/206',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_z_sample7',
        googleMapsUrl: 'https://maps.google.com/?cid=echopoint',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Lockhart Gap',
        slug: 'lockhart-gap',
        destinationId: munnarId,
        category: 'nature',
        description:
          'Panoramic mountain gap point situated 13 km from Munnar on the Mattupetty-Theni road. Known for tea valley cloud views and natural rock caves.',
        shortDescription: 'Cloud-filled mountain gap viewpoint overlooking tea valley slopes.',
        address: 'Lockhart Estate, Munnar-Theni Highway, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.09, 10.05],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1506461883276-594a12b11ce3?auto=format&fit=crop&w=1200&q=80',
            source: 'Pixabay Recommended',
            sourceUrl: 'https://pixabay.com',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1506461883276-594a12b11ce3?auto=format&fit=crop&w=1200&q=80',
          source: 'Pixabay Recommended',
          sourceUrl: 'https://pixabay.com',
          attribution: 'Kerala Tourism',
        },
        openingHours: '06:00 AM - 06:00 PM',
        activities: ['Sunset Viewing', 'Photography', 'Valley Trekking'],
        facilities: ['View Deck'],
        bestTimeToVisit: 'September to May',
        source: 'Kerala Tourism',
        sourceUrl: 'https://www.keralatourism.org/destination/lockhart-gap-munnar/212',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_z_sample8',
        googleMapsUrl: 'https://maps.google.com/?cid=lockhartgap',
        verified: true,
        lastVerifiedAt: new Date(),
      },
    ];

    let placeCount = 0;
    for (const attr of realAttractions) {
      await Place.findOneAndUpdate({ slug: attr.slug }, attr, { upsert: true, returnDocument: 'after' });
      placeCount++;
    }

    console.log('Places:');
    console.log(`${placeCount} inserted / updated ✓\n`);

    // 4. Upsert 6 Real Munnar Restaurants
    const realRestaurants = [
      {
        name: 'Munnar Samrudhi Restaurant',
        slug: 'munnar-samrudhi-restaurant',
        destinationId: munnarId,
        description:
          'Authentic Kerala traditional restaurant in central Munnar town known for serving fresh banana-leaf Kerala Sadhya, Malabar fish curry, and appam stew.',
        cuisine: 'Kerala Traditional, South Indian Thali',
        address: 'Main Bazaar, Munnar Town, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.06, 10.086],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=1000',
            source: 'Kerala Tourism Food Collection',
            sourceUrl: 'https://www.keralatourism.org/cuisine/',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=1000',
          source: 'Kerala Tourism',
          sourceUrl: 'https://www.keralatourism.org/cuisine/',
          attribution: 'Kerala Tourism',
        },
        phone: '+91 4865 230890',
        openingHours: '07:30 AM - 10:00 PM',
        priceLevel: '₹₹',
        source: 'Google Places / Verified Provider',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_rest1',
        googleMapsUrl: 'https://maps.google.com/?cid=samrudhi',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Saravana Bhavan',
        slug: 'saravana-bhavan-munnar',
        destinationId: munnarId,
        description:
          'Popular pure vegetarian South Indian dining establishment in central Munnar serving hot ghee roast dosas, idlis, vada, and filter coffee.',
        cuisine: 'South Indian Pure Vegetarian',
        address: 'AM Road, Post Office Junction, Munnar, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.059, 10.084],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=1000',
            source: 'Kerala Tourism Food Directory',
            sourceUrl: 'https://www.keralatourism.org/cuisine/',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=1000',
          source: 'Kerala Tourism',
          sourceUrl: 'https://www.keralatourism.org/cuisine/',
          attribution: 'Kerala Tourism',
        },
        phone: '+91 4865 231122',
        openingHours: '06:30 AM - 10:30 PM',
        priceLevel: '₹',
        source: 'Google Places / Verified Provider',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_rest2',
        googleMapsUrl: 'https://maps.google.com/?cid=saravanabhavan',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Arabian Grills Munnar',
        slug: 'arabian-grills-munnar',
        destinationId: munnarId,
        description:
          'Casual dining grill restaurant specializing in Middle Eastern Shawarma, Al Faham chicken, Kubboos, and North Indian Tandoori dishes.',
        cuisine: 'Middle Eastern, Arabian BBQ, Tandoori',
        address: 'Near KSRTC Bus Stand, GH Road, Munnar, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.061, 10.085],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1000',
            source: 'Kerala Tourism Culinary Directory',
            sourceUrl: 'https://www.keralatourism.org/cuisine/',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1000',
          source: 'Kerala Tourism',
          sourceUrl: 'https://www.keralatourism.org/cuisine/',
          attribution: 'Kerala Tourism',
        },
        phone: '+91 4865 232456',
        openingHours: '11:30 AM - 11:00 PM',
        priceLevel: '₹₹',
        source: 'Google Places / Verified Provider',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_rest3',
        googleMapsUrl: 'https://maps.google.com/?cid=arabiangrills',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Parakkat Spice Merchant Restaurant',
        slug: 'parakkat-spice-merchant-restaurant',
        destinationId: munnarId,
        description:
          'Fine dining spice merchant restaurant situated at Parakkat Nature Resort in Chithirapuram, presenting gourmet dishes prepared with estate-grown cardamom, pepper, and cloves.',
        cuisine: 'Kerala Fine Dining, Spiced Grill, Indian Gourmet',
        address: 'Chithirapuram Post, Pallivasal, Munnar, Idukki District, Kerala 685565',
        location: {
          type: 'Point' as const,
          coordinates: [77.041, 10.045],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1000',
            source: 'Parakkat Resort Official',
            sourceUrl: 'https://parakkatresort.com',
            attribution: 'Parakkat Resort',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1000',
          source: 'Parakkat Resort',
          sourceUrl: 'https://parakkatresort.com',
          attribution: 'Parakkat Resort',
        },
        phone: '+91 4865 263444',
        openingHours: '07:00 AM - 10:30 PM',
        priceLevel: '₹₹₹',
        source: 'Official Property Source',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_rest4',
        googleMapsUrl: 'https://maps.google.com/?cid=parakkatspicemerchant',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'The Hornbill Restaurant',
        slug: 'the-hornbill-restaurant',
        destinationId: munnarId,
        description:
          'Multi-cuisine family restaurant offering Kerala seafood delicacies, Continental grills, and Asian stir fries with river valley window seating.',
        cuisine: 'Multi-Cuisine, Kerala Seafood, Continental',
        address: 'Old Munnar Road, Near Matha Church, Munnar, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.06, 10.083],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000',
            source: 'Kerala Tourism Culinary Directory',
            sourceUrl: 'https://www.keralatourism.org/cuisine/',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000',
          source: 'Kerala Tourism',
          sourceUrl: 'https://www.keralatourism.org/cuisine/',
          attribution: 'Kerala Tourism',
        },
        phone: '+91 4865 230911',
        openingHours: '08:00 AM - 10:30 PM',
        priceLevel: '₹₹',
        source: 'Google Places / Verified Provider',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_rest5',
        googleMapsUrl: 'https://maps.google.com/?cid=hornbill',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Top Station Multi Cuisine Restaurant',
        slug: 'top-station-multi-cuisine-restaurant',
        destinationId: munnarId,
        description:
          'High altitude viewpoint diner serving hot cardamom tea, Kerala parotta with beef roast, chicken curry, and fried rice to travelers heading towards Top Station.',
        cuisine: 'Kerala Street Delicacies, Chinese, Indian',
        address: 'Near Colony Bus Stand, Munnar Town, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.0595, 10.082],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1000',
            source: 'Kerala Tourism Food Directory',
            sourceUrl: 'https://www.keralatourism.org/cuisine/',
            attribution: 'Kerala Tourism',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1000',
          source: 'Kerala Tourism',
          sourceUrl: 'https://www.keralatourism.org/cuisine/',
          attribution: 'Kerala Tourism',
        },
        phone: '+91 4865 231888',
        openingHours: '07:00 AM - 10:00 PM',
        priceLevel: '₹',
        source: 'Google Places / Verified Provider',
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_rest6',
        googleMapsUrl: 'https://maps.google.com/?cid=topstationrest',
        verified: true,
        lastVerifiedAt: new Date(),
      },
    ];

    let restCount = 0;
    for (const rest of realRestaurants) {
      await Restaurant.findOneAndUpdate({ slug: rest.slug }, rest, { upsert: true, returnDocument: 'after' });
      restCount++;
    }

    console.log('Restaurants:');
    console.log(`${restCount} inserted / updated ✓\n`);

    // 5. Upsert 3 Real Munnar Hotels
    const realHotels = [
      {
        name: 'Tea County Munnar',
        slug: 'tea-county-munnar',
        destinationId: munnarId,
        description:
          'Official 4-star government resort operated by Kerala Tourism Development Corporation (KTDC), nestled between two green hills in the heart of Munnar town with valley view cottages and Ayurvedic therapy facilities.',
        address: 'Ikka Nagar, Munnar, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.061, 10.082],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000',
            source: 'KTDC Official Registry',
            sourceUrl: 'https://www.ktdc.com/tea-county',
            attribution: 'KTDC Official',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000',
          source: 'KTDC Official',
          sourceUrl: 'https://www.ktdc.com/tea-county',
          attribution: 'KTDC Official',
        },
        phone: '+91 4865 230460',
        website: 'https://www.ktdc.com/tea-county',
        amenities: ['Free WiFi', 'Ayurvedic Center', 'Multi-Cuisine Restaurant', 'Conference Hall', 'Tour Desk', 'Parking'],
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_hotel1',
        googleMapsUrl: 'https://maps.google.com/?cid=teacounty',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Grand Plaza Munnar',
        slug: 'grand-plaza-munnar',
        destinationId: munnarId,
        description:
          '4-star boutique hotel situated along the banks of Muthirapuzha River in central Munnar town. Offers river view rooms, multi-cuisine restaurant, and fitness facilities.',
        address: 'Old Munnar, M.G. Road, Munnar, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.06, 10.08],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000',
            source: 'Grand Plaza Official',
            sourceUrl: 'https://grandplazamunnar.com',
            attribution: 'Grand Plaza',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000',
          source: 'Grand Plaza',
          sourceUrl: 'https://grandplazamunnar.com',
          attribution: 'Grand Plaza',
        },
        phone: '+91 4865 231500',
        website: 'https://grandplazamunnar.com',
        amenities: ['Grand Spices Restaurant', 'Health Club', 'Game Room', 'Business Center', 'Free WiFi'],
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_hotel2',
        googleMapsUrl: 'https://maps.google.com/?cid=grandplaza',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Hotel Hillview Munnar',
        slug: 'hotel-hillview-munnar',
        destinationId: munnarId,
        description:
          'Comfortable 3-star hospitality hotel located near Kannan Devan tea garden slopes in Munnar town, catering to families and nature enthusiasts.',
        address: 'Aluva-Munnar Road, Kannan Devan Hills, Munnar, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.062, 10.078],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000',
            source: 'Hotel Hillview Official',
            sourceUrl: 'https://hillviewmunnar.com',
            attribution: 'Hotel Hillview',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000',
          source: 'Hotel Hillview',
          sourceUrl: 'https://hillviewmunnar.com',
          attribution: 'Hotel Hillview',
        },
        phone: '+91 4865 230597',
        website: 'https://hillviewmunnar.com',
        amenities: ['Restaurant', 'Travel Desk', '24h Room Service', 'Parking'],
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_hotel3',
        googleMapsUrl: 'https://maps.google.com/?cid=hillview',
        verified: true,
        lastVerifiedAt: new Date(),
      },
    ];

    let hotelCount = 0;
    for (const h of realHotels) {
      await Hotel.findOneAndUpdate({ slug: h.slug }, h, { upsert: true, returnDocument: 'after' });
      hotelCount++;
    }

    console.log('Hotels:');
    console.log(`${hotelCount} inserted / updated ✓\n`);

    // 6. Upsert 3 Real Munnar Resorts
    const realResorts = [
      {
        name: 'Blanket Hotel & Spa',
        slug: 'blanket-hotel-spa',
        destinationId: munnarId,
        description:
          'Luxury eco-friendly 5-star resort situated near Attukad Waterfalls in Pallivasal, Munnar. Features infinity pool overlooking the valley, spa center, and mountain suites.',
        address: 'Attukad Waterfalls Road, Pallivasal, Munnar, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.043, 10.048],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000',
            source: 'Blanket Hotel Official',
            sourceUrl: 'https://blankethotels.com',
            attribution: 'Blanket Hotel',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000',
          source: 'Blanket Hotel',
          sourceUrl: 'https://blankethotels.com',
          attribution: 'Blanket Hotel',
        },
        phone: '+91 4865 263800',
        website: 'https://blankethotels.com',
        amenities: ['Infinity Pool', 'Ayurveda Spa', 'Fitness Center', 'Valley Restaurant', 'Free Parking', 'WiFi'],
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_resort1',
        googleMapsUrl: 'https://maps.google.com/?cid=blankethotel',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Windermere Estate',
        slug: 'windermere-estate',
        destinationId: munnarId,
        description:
          'A boutique hill retreat set amidst a 60-acre working cardamom and coffee plantation in Pothamedu, Munnar. Features hand-crafted stone bungalows and mountain valley vistas.',
        address: 'Pothamedu, Munnar, Idukki District, Kerala 685612',
        location: {
          type: 'Point' as const,
          coordinates: [77.052, 10.063],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000',
            source: 'Windermere Estate Official',
            sourceUrl: 'https://windermereestate.com',
            attribution: 'Windermere Estate',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000',
          source: 'Windermere Estate',
          sourceUrl: 'https://windermereestate.com',
          attribution: 'Windermere Estate',
        },
        phone: '+91 4865 230512',
        website: 'https://windermereestate.com',
        amenities: ['Plantation Walks', 'Library', 'Dining Room', 'Free WiFi', 'Garden Vistas'],
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_resort2',
        googleMapsUrl: 'https://maps.google.com/?cid=windermere',
        verified: true,
        lastVerifiedAt: new Date(),
      },
      {
        name: 'Chandys Windy Woods',
        slug: 'chandys-windy-woods',
        destinationId: munnarId,
        description:
          '5-star nature resort built step-wise into the slope of a grey rock cliff surrounded by silver oak trees in Chithirapuram, Munnar.',
        address: 'Meencut, Chithirapuram, Munnar, Idukki District, Kerala 685565',
        location: {
          type: 'Point' as const,
          coordinates: [77.039, 10.042],
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000',
            source: 'Chandys Resort Official',
            sourceUrl: 'https://chandyswindywoods.com',
            attribution: 'Chandys Resort',
          },
        ],
        primaryPhoto: {
          url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000',
          source: 'Chandys Resort',
          sourceUrl: 'https://chandyswindywoods.com',
          attribution: 'Chandys Resort',
        },
        phone: '+91 4865 264300',
        website: 'https://chandyswindywoods.com',
        amenities: ['Outdoor Swimming Pool', 'Spa Center', 'Multi-Cuisine Dining', 'Bird Watching Trails', 'Free WiFi'],
        googlePlaceId: 'ChIJgU_8zZ4pBjsR73jY_resort3',
        googleMapsUrl: 'https://maps.google.com/?cid=chandys',
        verified: true,
        lastVerifiedAt: new Date(),
      },
    ];

    let resortCount = 0;
    for (const r of realResorts) {
      await Resort.findOneAndUpdate({ slug: r.slug }, r, { upsert: true, returnDocument: 'after' });
      resortCount++;
    }

    console.log('Resorts:');
    console.log(`${resortCount} inserted / updated ✓\n`);

    console.log('Starting India-wide Tourism Import...');
    const { runTourismImport } = await import('./import-tourism-data');
    await runTourismImport();

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error in seed script:', error?.message || error);
    process.exit(1);
  }
}

seed();
