'use client';

import React, { useState } from 'react';
import { Settings, Shield, Key, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setMessage('System configuration saved successfully!');
      setSaving(false);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">System Settings</span>
          <h1 className="text-2xl font-black text-[#171717] mt-1">Admin Settings</h1>
          <p className="text-xs text-gray-500 mt-1">Configure global application parameters and API credentials.</p>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-gray-700 block">Application Name</label>
            <input
              type="text"
              defaultValue="Travel Genie"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6A00] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700 block">System Admin Contact Email</label>
            <input
              type="email"
              defaultValue="admin@travelgenie.local"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6A00] outline-none"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#FF6A00] text-white font-bold shadow-md shadow-orange-200 hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
