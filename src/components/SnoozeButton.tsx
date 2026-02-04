"use client";

import { useState } from "react";

const SNOOZE_OPTIONS = [1, 2, 4, 8, 24];

interface SnoozeButtonProps {
  snoozeUntil: string | null;
  onSnooze: (until: string) => void;
  onCancelSnooze: () => void;
}

export default function SnoozeButton({ snoozeUntil, onSnooze, onCancelSnooze }: SnoozeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isActive = snoozeUntil && new Date(snoozeUntil) > new Date();
  const snoozeEndTime = isActive ? new Date(snoozeUntil) : null;

  const handleSnooze = async (hours: number) => {
    setIsLoading(true);
    try {
      const until = new Date();
      until.setHours(until.getHours() + hours);
      onSnooze(until.toISOString());
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      onCancelSnooze();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isActive && snoozeEndTime) {
    return (
      <div
        className="flex items-center justify-between rounded-xl p-4"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--warning)",
        }}
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-base">😴</span>
          <span className="text-sm font-medium" style={{ color: "var(--warning)" }}>
            Alerts snoozed until {formatTime(snoozeEndTime)}
          </span>
        </div>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "var(--gray-800)", color: "var(--gray-300)" }}
        >
          {isLoading ? "..." : "Cancel"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full flex items-center gap-2 rounded-xl p-4 transition-colors btn-press"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--gray-800)",
        }}
      >
        <span className="text-base">😴</span>
        <span className="flex-1 text-left text-sm font-semibold" style={{ color: "var(--gray-300)" }}>
          Snooze Alerts
        </span>
        <span
          className="text-xs transition-transform"
          style={{
            color: "var(--gray-500)",
            transform: isOpen ? "rotate(180deg)" : "none",
          }}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          className="mt-1 rounded-xl p-2"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--gray-800)",
          }}
        >
          <p className="text-xs px-2 py-1.5 mb-1" style={{ color: "var(--gray-500)" }}>
            Delay alerts to your emergency contact
          </p>
          {SNOOZE_OPTIONS.map((hours) => (
            <button
              key={hours}
              onClick={() => handleSnooze(hours)}
              disabled={isLoading}
              className="w-full text-left px-3 py-3 rounded-lg transition-colors hover:bg-[var(--bg-card-hover)]"
            >
              <span className="text-base font-medium" style={{ color: "var(--text-primary)" }}>
                {hours === 1 ? "1 hour" : `${hours} hours`}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
