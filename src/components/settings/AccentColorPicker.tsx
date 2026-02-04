'use client';

import React from 'react';

const ACCENT_COLORS = [
  { id: 'green', label: 'Green', color: '#4ade80' },
  { id: 'blue', label: 'Blue', color: '#60a5fa' },
  { id: 'purple', label: 'Purple', color: '#a78bfa' },
  { id: 'orange', label: 'Orange', color: '#fb923c' },
  { id: 'pink', label: 'Pink', color: '#f472b6' },
];

interface AccentColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const AccentColorPicker: React.FC<AccentColorPickerProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {ACCENT_COLORS.map((accent) => (
        <button
          key={accent.id}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-md border-2 transition-all"
          style={{
            borderColor: value === accent.id ? accent.color : 'transparent',
            backgroundColor: value === accent.id ? accent.color + '20' : 'transparent',
          }}
          onClick={() => onChange(accent.id)}
        >
          <div
            className="w-7 h-7 rounded-full"
            style={{ backgroundColor: accent.color }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: value === accent.id ? accent.color : 'var(--gray-400)' }}
          >
            {accent.label}
          </span>
        </button>
      ))}
    </div>
  );
};
