'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trash2, Edit2, MessageSquare } from 'lucide-react';

export default function UserReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success) {
          setReviews(json.data?.reviews || []);
        }
      })
      .catch((err) => console.warn('Fetch reviews error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-extrabold text-[#171717]">My Community Reviews</h2>
        <p className="text-xs text-gray-500">Manage reviews you submitted for destinations and attractions</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading your reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev._id} className="p-5 bg-white border border-gray-200 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{rev.rating} / 5</span>
                  <span className="text-gray-400 font-normal text-[11px] ml-2">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(rev._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">You haven't written any reviews yet.</p>
          <p className="text-xs text-gray-500">Visit any destination page and click "Write a Review" to share your travel feedback.</p>
        </div>
      )}
    </div>
  );
}
