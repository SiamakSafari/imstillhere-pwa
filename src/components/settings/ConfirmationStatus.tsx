'use client';

import React from 'react';

export const ConfirmationStatus: React.FC = () => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        Alert Status
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        No alerts have been sent yet. Keep up the check-ins!
      </p>
      <div
        className="flex items-center gap-2 rounded-lg p-3"
        style={{ backgroundColor: 'var(--accent-subtle)' }}
      >
        <span>✅</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
          All good
        </span>
      </div>
    </div>
  );
};
