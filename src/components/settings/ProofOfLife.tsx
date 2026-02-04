'use client';

import React, { useState } from 'react';

interface ProofOfLifeProps {
  proofOfLifeEnabled: boolean;
  contactName: string;
  onUpdate: (updates: { proofOfLifeEnabled: boolean }) => void;
}

export const ProofOfLife: React.FC<ProofOfLifeProps> = ({
  proofOfLifeEnabled: initialEnabled,
  contactName,
  onUpdate,
}) => {
  const [enabled, setEnabled] = useState(initialEnabled);

  const handleToggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    onUpdate({ proofOfLifeEnabled: newVal });
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        ✉️ Proof of Life
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        Send {contactName || 'your contact'} a daily notification when you check in.
        No more &quot;just checking if you&apos;re okay&quot; texts.
      </p>
      <div className="flex justify-between items-center py-2">
        <span className="font-medium flex-1 mr-4" style={{ color: 'var(--text-primary)' }}>
          Send daily check-in confirmation
        </span>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          className="relative w-11 h-6 rounded-full transition-colors shrink-0"
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
        <div
          className="flex gap-2 rounded-lg p-3 mt-4"
          style={{ backgroundColor: 'var(--card)' }}
        >
          <span className="text-sm">ℹ️</span>
          <p className="text-sm flex-1" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
            {contactName || 'Your contact'} will receive a brief email each day you check in.
          </p>
        </div>
      )}
    </div>
  );
};
