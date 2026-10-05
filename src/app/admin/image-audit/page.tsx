'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { Camera, CheckCircle, AlertTriangle, RefreshCw, ExternalLink, Filter, Search, Loader2 } from 'lucide-react';
import TravelImage from '@/components/TravelImage';

export default function AdminImageAuditPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const [destRes, placeRes] = await Promise.all([
        fetch('/api/destinations').then((r) => r.json()),
        fetch('/api/places').then((r) => r.json()),
      ]);

      const destList = (Array.isArray(destRes) ? destRes : []).map((d: any) => {
        const isWiki = d.heroImage?.includes('wikimedia') || d.imageSource?.toLowerCase().includes('wikimedia');
        return {
          id: d._id,
          name: d.name,
          slug: d.slug,
          type: 'Destination',
          image: typeof d.heroImage === 'object' ? d.heroImage?.url : d.heroImage,
          source: d.imageSource || 'Pixabay',
          sourceId: d.imageSourceId || 'Pixabay',
          sourceUrl: d.imageSourceUrl || d.heroImage,
          photographer: d.photographer || 'Pixabay Contributor',
          searchQuery: d.searchQuery || `${d.name} ${d.state || ''} India`,
          status: !d.heroImage ? 'Missing' : isWiki ? 'Needs replacement' : 'Valid',
        };
      });

      const placeList = (Array.isArray(placeRes) ? placeRes : []).map((p: any) => {
        const url = p.primaryPhoto?.url || p.primaryPhoto;
        const source = p.primaryPhoto?.source || p.source || 'Pixabay';
        const isWiki = url?.includes('wikimedia') || source?.toLowerCase().includes('wikimedia');
        return {
          id: p._id,
          name: p.name,
          slug: p.slug,
          type: 'Attraction / Place',
          image: url,
          source: source,
          sourceId: p.primaryPhoto?.sourceId || 'Pixabay',
          sourceUrl: p.primaryPhoto?.sourceUrl || p.sourceUrl || url,
          photographer: p.primaryPhoto?.photographer || p.primaryPhoto?.attribution || 'Pixabay Contributor',
          searchQuery: p.primaryPhoto?.searchQuery || `${p.name} India`,
          status: !url ? 'Missing' : isWiki ? 'Needs replacement' : 'Valid',
        };
      });

      setItems([...destList, ...placeList]);
    } catch (err) {
      console.error('Failed to load image audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateImages = async () => {
    setValidating(true);
    const updated = await Promise.all(
      items.map(async (item) => {
        if (!item.image) return { ...item, status: 'Missing' };
        return new Promise<any>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve({ ...item, status: item.status === 'Needs replacement' ? 'Needs replacement' : 'Valid' });
          img.onerror = () => resolve({ ...item, status: 'Broken' });
          img.src = item.image;
        });
      })
    );
    setItems(updated);
    setValidating(false);
  };

  const filteredItems = items.filter((item) => {
    if (filterStatus !== 'All' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.searchQuery?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    total: items.length,
    valid: items.filter((i) => i.status === 'Valid').length,
    needsReplacement: items.filter((i) => i.status === 'Needs replacement').length,
    broken: items.filter((i) => i.status === 'Broken').length,
    missing: items.filter((i) => i.status === 'Missing').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Admin Dashboard', href: '/admin' },
          { label: 'Image Audit' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#FF6A00] font-bold text-xs uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>Pixabay Tourism Image Audit</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717]">Image Audit & Licensing Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">
            Audit place image sources, inspect Pixabay IDs, search queries, and status (Valid, Missing, Broken, Needs replacement).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleValidateImages}
            disabled={validating}
            className="px-4 py-2 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Validate Images
          </button>
          <Link
            href="/admin/images"
            className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shrink-0"
          >
            Pixabay Search →
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Total Tracked</span>
          <p className="text-2xl font-extrabold text-gray-900">{counts.total}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
          <span className="text-xs text-emerald-700 font-medium">Valid</span>
          <p className="text-2xl font-extrabold text-emerald-800">{counts.valid}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
          <span className="text-xs text-amber-700 font-medium">Needs Replacement</span>
          <p className="text-2xl font-extrabold text-amber-800">{counts.needsReplacement}</p>
        </div>
        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
          <span className="text-xs text-rose-700 font-medium">Broken</span>
          <p className="text-2xl font-extrabold text-rose-800">{counts.broken}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-2xl border border-gray-300">
          <span className="text-xs text-gray-600 font-medium">Missing</span>
          <p className="text-2xl font-extrabold text-gray-800">{counts.missing}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {['All', 'Valid', 'Needs replacement', 'Broken', 'Missing'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                filterStatus === status
                  ? 'bg-[#FF6A00] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search place or query..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Audit Table */}
      {loading ? (
        <div className="py-16 text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FF6A00] mb-2" />
          <p className="text-xs font-semibold">Loading audit items from MongoDB...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500">
          <p className="text-sm font-bold">No matching records found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="p-4">Place Name & Type</th>
                  <th className="p-4">Current Image</th>
                  <th className="p-4">Source & ID</th>
                  <th className="p-4">Photographer & Search Query</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                      <div className="text-gray-500 text-[11px]">{item.type}</div>
                    </td>
                    <td className="p-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden relative bg-gray-100 border border-gray-200">
                        <TravelImage src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{item.source}</div>
                      <div className="text-[10px] text-gray-500 font-mono">ID: #{item.sourceId}</div>
                    </td>
                    <td className="p-4 text-gray-600 max-w-[200px] truncate">
                      <div className="font-medium text-gray-800">{item.photographer}</div>
                      <div className="text-[10px] text-gray-400 italic truncate">"{item.searchQuery}"</div>
                    </td>
                    <td className="p-4">
                      {item.status === 'Valid' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Valid
                        </span>
                      )}
                      {item.status === 'Needs replacement' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Needs replacement
                        </span>
                      )}
                      {item.status === 'Broken' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Broken
                        </span>
                      )}
                      {item.status === 'Missing' && (
                        <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full font-bold">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/images?q=${encodeURIComponent(item.name)}`}
                        className="px-3 py-1.5 bg-[#FF6A00] text-white font-bold rounded-lg hover:bg-[#e05d00] transition-colors inline-block"
                      >
                        Replace Image
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
