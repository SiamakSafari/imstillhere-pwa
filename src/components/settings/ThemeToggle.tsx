'use client';

import React from 'react';

const THEMES = [
  { value: 'system', label: 'Auto', emoji: '💡' },
  { value: 'dark', label: 'Dark', emoji: '🌙' },
  { value: 'light', label: 'Light', emoji: '☀️' },
];

interface ThemeToggleProps {
  value: string;
  onChange: (theme: string) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 mb-4">
      {THEMES.map((theme) => (
        <button
          key={theme.value}
          className="flex-1 flex flex-col items-center gap-1 py-3 rounded-md border-2 transition-all"
          style={{
            backgroundColor: value === theme.value ? 'var(--accent-subtle)' : 'var(--card)',
            borderColor: value === theme.value ? 'var(--accent)' : 'transparent',
          }}
          onClick={() => onChange(theme.value)}
        >
          <span className="text-xl">{theme.emoji}</span>
          <span
            className="text-sm font-semibold"
            style={{ color: value === theme.value ? 'var(--accent)' : 'var(--gray-400)' }}
          >
            {theme.label}
          </span>
        </button>
      ))}
    </div>
  );
};
