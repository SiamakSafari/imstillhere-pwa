'use client';

import React, { useState } from 'react';

interface SmsCheckInProps {
  phoneNumber: string | null;
  smsCheckinEnabled: boolean;
  onUpdate: (updates: { phoneNumber?: string; smsCheckinEnabled?: boolean }) => void;
}

export const SmsCheckIn: React.FC<SmsCheckInProps> = ({
  phoneNumber: initialPhone,
  smsCheckinEnabled: initialEnabled,
  onUpdate,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || '');
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleToggle = () => {
    if (!enabled && !phoneNumber.trim()) {
      setSaveStatus('Please enter your phone number first');
      return;
    }
    const newVal = !enabled;
    setEnabled(newVal);
    onUpdate({ smsCheckinEnabled: newVal });
  };

  const handlePhoneSave = () => {
    if (!phoneNumber.trim()) {
      setSaveStatus('Please enter a phone number');
      return;
    }
    onUpdate({ phoneNumber: phoneNumber.trim(), smsCheckinEnabled: enabled });
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        💬 SMS Check-in
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        Check in by texting &quot;OK&quot; to the ImStillHere number anytime. No need to open the app.
      </p>

      <div className="flex justify-between items-center py-2">
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
          Enable SMS check-in
        </span>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          className="relative w-11 h-6 rounded-full transition-colors"
          style={{ backgroundColor: enabled ? 'var(--accent-dark)' : 'var(--gray-700)' }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
            style={{
              backgroundColor: enabled ? 'var(--accent)' : 'var(--gray-400)',
              transform: enabled ? 'translateX(20px)' : 'translateX(0)',
            }}
          />
        </button>
      </div>

      <div className="mt-4">
        <label className="block text-sm mb-1" style={{ color: 'var(--gray-400)' }}>
          Your phone number
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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

      {saveStatus && (
        <p className="text-sm mt-2" style={{ color: 'var(--accent)' }}>{saveStatus}</p>
      )}

      {enabled && (
        <div
          className="flex gap-2 rounded-lg p-3 mt-4"
          style={{ backgroundColor: 'var(--card)' }}
        >
          <span className="text-sm">ℹ️</span>
          <p className="text-sm" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
            Text <strong style={{ color: 'var(--text-primary)' }}>OK</strong>,{' '}
            <strong style={{ color: 'var(--text-primary)' }}>YES</strong>, or{' '}
            <strong style={{ color: 'var(--text-primary)' }}>HERE</strong> to check in
          </p>
        </div>
      )}
    </div>
  );
};
