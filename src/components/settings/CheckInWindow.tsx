'use client';

import React, { useState } from 'react';

function generateTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const hour12 = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const label = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
      options.push({ value, label });
    }
  }
  return options;
}

interface CheckInWindowProps {
  checkInWindowStart: string | null;
  checkInWindowEnd: string | null;
  onUpdate: (updates: { checkInWindowStart?: string | null; checkInWindowEnd?: string | null }) => void;
}

export const CheckInWindow: React.FC<CheckInWindowProps> = ({
  checkInWindowStart,
  checkInWindowEnd,
  onUpdate,
}) => {
  const [isEnabled, setIsEnabled] = useState(!!checkInWindowStart);
  const [startTime, setStartTime] = useState(checkInWindowStart || '08:00');
  const [endTime, setEndTime] = useState(checkInWindowEnd || '22:00');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const timeOptions = generateTimeOptions();

  const handleToggle = () => {
    const newVal = !isEnabled;
    setIsEnabled(newVal);
    if (newVal) {
      onUpdate({ checkInWindowStart: startTime, checkInWindowEnd: endTime });
    } else {
      onUpdate({ checkInWindowStart: null, checkInWindowEnd: null });
    }
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartTime(value);
      if (isEnabled) onUpdate({ checkInWindowStart: value });
    } else {
      setEndTime(value);
      if (isEnabled) onUpdate({ checkInWindowEnd: value });
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        Check-in Window
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        Set your preferred check-in time. Reminders will be sent if you miss this window.
      </p>

      <div className="flex justify-between items-center py-2">
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
          Enable check-in window
        </span>
        <button
          role="switch"
          aria-checked={isEnabled}
          onClick={handleToggle}
          className="relative w-11 h-6 rounded-full transition-colors"
          style={{ backgroundColor: isEnabled ? 'var(--accent-dark)' : 'var(--gray-700)' }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
            style={{
              backgroundColor: isEnabled ? 'var(--accent)' : 'var(--gray-400)',
              transform: isEnabled ? 'translateX(20px)' : 'translateX(0)',
            }}
          />
        </button>
      </div>

      {isEnabled && (
        <div className="mt-4 space-y-4">
          {(['start', 'end'] as const).map((type) => (
            <div key={type}>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-400)' }}>
                {type === 'start' ? 'From' : 'To'}
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {timeOptions.map(({ value, label }) => {
                  const selected = type === 'start' ? startTime === value : endTime === value;
                  return (
                    <button
                      key={value}
                      className="shrink-0 px-3 py-1.5 rounded-full text-sm border transition-all"
                      style={{
                        backgroundColor: selected ? 'var(--accent-darker)' + '30' : 'var(--card)',
                        borderColor: selected ? 'var(--accent)' : 'var(--gray-700)',
                        color: selected ? 'var(--accent)' : 'var(--gray-400)',
                      }}
                      onClick={() => handleTimeChange(type, value)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {saveStatus && (
        <p className="text-sm mt-2" style={{ color: 'var(--accent)' }}>{saveStatus}</p>
      )}
    </div>
  );
};
