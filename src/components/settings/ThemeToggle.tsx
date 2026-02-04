'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

const THEMES = [
  { value: 'system', label: 'Auto', emoji: '💡' },
  { value: 'dark', label: 'Dark', emoji: '🌙' },
  { value: 'light', label: 'Light', emoji: '☀️' },
] as const;

interface ThemeToggleProps {
  value?: string;
  onChange?: (theme: string) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ onChange: _onChange }) => {
  const { theme, setTheme } = useTheme();

  const handleChange = (mode: string) => {
    setTheme(mode as 'light' | 'dark' | 'system');
    _onChange?.(mode);
  };

  return (
    <div className="flex gap-2 mb-4">
      {THEMES.map((t) => (
        <button
          key={t.value}
          className="flex-1 flex flex-col items-center gap-1 py-3 rounded-md border-2 transition-all"
          style={{
            backgroundColor: theme === t.value ? 'var(--accent-subtle)' : 'var(--card)',
            borderColor: theme === t.value ? 'var(--accent)' : 'transparent',
          }}
          onClick={() => handleChange(t.value)}
        >
          <span className="text-xl">{t.emoji}</span>
          <span
            className="text-sm font-semibold"
            style={{ color: theme === t.value ? 'var(--accent)' : 'var(--gray-400)' }}
          >
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
};
