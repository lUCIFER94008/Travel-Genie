import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  title: 'Travel Genie | Real Destinations & Verified Travel Platform',
  description:
    'Explore real destinations in India, plan custom itineraries, discover authentic places, restaurants, hotels & resorts with accurate maps and real photos.',
  openGraph: {
    title: 'Travel Genie | Real Destinations & Verified Travel Platform',
    description:
      'Discover authentic travel experiences in Kerala & India. Real photos, verified coordinates, accurate distances.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#171717] pb-16 md:pb-0">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
