'use client';

import React, { useState } from 'react';

const ALERT_OPTIONS = [
  { value: 'email', emoji: '📧', title: 'Email only', description: 'Alert sent via email' },
  { value: 'sms', emoji: '📱', title: 'SMS only', description: 'Alert sent via text message' },
  { value: 'both', emoji: '🔔', title: 'Email & SMS', description: 'Alert sent via both channels' },
];

interface AlertPreferencesProps {
  alertPreference: string;
  contactPhone: string | null;
  onUpdate: (updates: { alertPreference?: string; contactPhone?: string }) => void;
}

export const AlertPreferences: React.FC<AlertPreferencesProps> = ({
  alertPreference,
  contactPhone,
  onUpdate,
}) => {
  const [preference, setPreference] = useState(alertPreference || 'email');
  const [phone, setPhone] = useState(contactPhone || '');
  const showPhoneInput = preference === 'sms' || preference === 'both';
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handlePreferenceChange = (value: string) => {
    setPreference(value);
    onUpdate({ alertPreference: value });
    if (!(value === 'sms' || value === 'both')) {
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const handlePhoneSave = () => {
    if (!phone.trim()) {
      setSaveStatus('Please enter a phone number');
      return;
    }
    onUpdate({ alertPreference: preference, contactPhone: phone.trim() });
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        Alert Preferences
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        How should we contact your emergency contact if you miss check-ins?
      </p>

      <div className="space-y-2">
        {ALERT_OPTIONS.map((option) => (
          <button
            key={option.value}
            className="w-full flex items-center gap-3 rounded-md p-3 border transition-all text-left"
            style={{
              backgroundColor: preference === option.value ? 'var(--accent-subtle)' : 'var(--card)',
              borderColor: preference === option.value ? 'var(--accent)' : 'var(--gray-800)',
            }}
            onClick={() => handlePreferenceChange(option.value)}
          >
            <span className="text-xl">{option.emoji}</span>
            <div className="flex-1">
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {option.title}
              </div>
              <div className="text-xs" style={{ color: 'var(--gray-500)' }}>
                {option.description}
              </div>
            </div>
            {preference === option.value && (
              <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>✓</span>
            )}
          </button>
        ))}
      </div>

      {showPhoneInput && (
        <div className="mt-4">
          <label className="block text-sm mb-1" style={{ color: 'var(--gray-400)' }}>
            Contact&apos;s phone number
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="flex-1 px-3 py-2.5 rounded-lg text-base focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-light)',
                border: '1px solid var(--gray-700)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={handlePhoneSave}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)', color: 'var(--accent)' }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {saveStatus && (
        <p className="text-sm mt-2" style={{ color: 'var(--accent)' }}>{saveStatus}</p>
      )}
    </div>
  );
};
