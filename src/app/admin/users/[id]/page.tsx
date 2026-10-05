'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Building2,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [allResorts, setAllResorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState('user');
  const [isActive, setIsActive] = useState(true);
  const [selectedResorts, setSelectedResorts] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/users/${resolvedParams.id}`).then((r) => r.json()),
      fetch('/api/resorts').then((r) => r.json()),
    ])
      .then(([uData, rData]) => {
        if (uData.success) {
          setUserData(uData.data);
          setRole(uData.data.role || 'user');
          setIsActive(uData.data.isActive !== false);
          setSelectedResorts(uData.data.managedResortIds || []);
        }
        if (rData.success) {
          setAllResorts(rData.data || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          isActive,
          managedResortIds: role === 'resort_manager' ? selectedResorts : [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('User roles and permissions updated successfully!');
      } else {
        setMessage(data.error || 'Failed to update user');
      }
    } catch (err) {
      setMessage('Error updating user permissions');
    } finally {
      setSaving(false);
    }
  };

  const toggleResortSelection = (resortId: string) => {
    setSelectedResorts((prev) =>
      prev.includes(resortId) ? prev.filter((id) => id !== resortId) : [...prev, resortId]
    );
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading user profile...</div>;
  }

  if (!userData) {
    return <div className="p-12 text-center text-xs text-red-500">User not found</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/admin/users"
        className="inline-flex items-center text-xs font-bold text-gray-600 hover:text-[#FF6A00]"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Users Directory
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* User Identity Banner */}
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#FF6A00] font-black text-2xl flex items-center justify-center">
            {userData.name ? userData.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#171717]">{userData.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> {userData.email}
              </span>
              {userData.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {userData.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-bold ${
              message.includes('successfully') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* Role & Access Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-900 block">User Role</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'user', title: 'Normal User', icon: User, desc: 'Bookings & itineraries' },
                { id: 'resort_manager', title: 'Resort Manager', icon: Building2, desc: 'Assigned resort management' },
                { id: 'admin', title: 'Administrator', icon: Shield, desc: 'Full system control' },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-[#FF6A00] bg-orange-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-[#FF6A00]' : 'text-gray-400'}`} />
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-gray-900 block">{r.title}</span>
                      <span className="text-[10px] text-gray-500">{r.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Managed Resorts Selection if Resort Manager */}
          {role === 'resort_manager' && (
            <div className="space-y-3 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
              <div>
                <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" /> Assigned Resorts
                </h3>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Select which resort properties this manager is authorized to manage:
                </p>
              </div>

              {allResorts.length === 0 ? (
                <div className="text-xs text-gray-400 italic py-2">No resorts found in catalog.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {allResorts.map((resort) => {
                    const checked = selectedResorts.includes(resort._id);
                    return (
                      <label
                        key={resort._id}
                        className={`flex items-center space-x-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          checked ? 'bg-blue-100/70 border-blue-300 font-bold text-blue-900' : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleResortSelection(resort._id)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span className="truncate">{resort.name} ({resort.destinationId})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Account Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Account Status</span>
              <span className="text-[10px] text-gray-500">Allow or block user from logging into Travel Genie</span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isActive ? 'Active' : 'Disabled'}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#FF6A00] text-white text-xs font-bold shadow-md shadow-orange-200 hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save User Access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
