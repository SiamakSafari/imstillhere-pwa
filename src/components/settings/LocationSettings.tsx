'use client';

import React, { useState } from 'react';

interface LocationSettingsProps {
  locationSharingEnabled: boolean;
  onUpdate: (updates: { locationSharingEnabled: boolean }) => void;
}

export const LocationSettings: React.FC<LocationSettingsProps> = ({
  locationSharingEnabled,
  onUpdate,
}) => {
  const [enabled, setEnabled] = useState(locationSharingEnabled);

  const handleToggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    onUpdate({ locationSharingEnabled: newVal });
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        📍 Location Sharing
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        Include your last known location when alerts are sent to your emergency contact.
      </p>
      <div className="flex justify-between items-center py-2">
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
          Share location with alerts
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
      {enabled && (
        <p className="text-xs mt-2" style={{ color: 'var(--gray-500)', lineHeight: '1.5' }}>
          Your location will only be captured when you check in, and only shared if an alert is sent.
        </p>
      )}
    </div>
  );
};
