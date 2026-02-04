"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from "react";

const VACATION_OPTIONS = [
  { label: "3 days", days: 3 },
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
];

interface VacationModeProps {
  vacationUntil: string | null;
  onSetVacation: (until: string) => void;
  onCancelVacation: () => void;
}

function isOnVacation(vacationUntil: string | null): boolean {
  if (!vacationUntil) return false;
  return new Date(vacationUntil) > new Date();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function VacationMode({ vacationUntil, onSetVacation, onCancelVacation }: VacationModeProps) {
  const onVacation = isOnVacation(vacationUntil);

  const setVacation = (days: number) => {
    const until = new Date();
    until.setDate(until.getDate() + days);
    onSetVacation(until.toISOString());
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        🌴 Vacation Mode
      </h3>
      <p className="text-sm mb-3" style={{ color: "var(--gray-400)", lineHeight: "20px" }}>
        Pause check-in reminders while you&apos;re away.
      </p>

      {onVacation ? (
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--accent-dark)",
          }}
        >
          <p className="text-base font-semibold mb-3" style={{ color: "var(--accent)" }}>
            On vacation until {formatDate(vacationUntil!)}
          </p>
          <button
            onClick={onCancelVacation}
            className="w-full py-3 rounded-lg text-sm font-semibold text-center transition-colors btn-press"
            style={{ backgroundColor: "var(--gray-800)", color: "var(--gray-300)" }}
          >
            End Vacation
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {VACATION_OPTIONS.map((option) => (
            <button
              key={option.days}
              onClick={() => setVacation(option.days)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors btn-press"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--gray-700)",
                color: "var(--text-primary)",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
