"use client";

import { useState, useEffect, useMemo } from "react";

interface Step3WindowProps {
  checkInWindowStart: string | null;
  checkInWindowEnd: string | null;
  timezone: string;
  onUpdate: (updates: {
    checkInWindowStart: string | null;
    checkInWindowEnd: string | null;
    timezone: string;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function generateTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, "0");
      const minute = m.toString().padStart(2, "0");
      const value = `${hour}:${minute}`;
      const d = new Date(`2000-01-01T${value}`);
      const label = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      options.push({ value, label });
    }
  }
  return options;
}

export default function Step3Window({
  checkInWindowStart,
  checkInWindowEnd,
  timezone,
  onUpdate,
  onNext,
  onBack,
}: Step3WindowProps) {
  const [isEnabled, setIsEnabled] = useState(!!checkInWindowStart);
  const [startTime, setStartTime] = useState(checkInWindowStart || "08:00");
  const [endTime, setEndTime] = useState(checkInWindowEnd || "22:00");
  const timeOptions = useMemo(() => generateTimeOptions().filter((_, i) => i % 2 === 0), []);

  useEffect(() => {
    if (!timezone) {
      onUpdate({
        checkInWindowStart: isEnabled ? startTime : null,
        checkInWindowEnd: isEnabled ? endTime : null,
        timezone: getUserTimezone(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    onUpdate({
      checkInWindowStart: isEnabled ? startTime : null,
      checkInWindowEnd: isEnabled ? endTime : null,
      timezone: timezone || getUserTimezone(),
    });
    onNext();
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-10">
      <button
        onClick={onBack}
        className="mb-6 text-base font-semibold transition-colors"
        style={{ color: "var(--gray-400)" }}
      >
        ← Back
      </button>

      <h1 className="text-3xl font-extrabold mb-2" style={{ color: "var(--text-primary)" }}>
        Check-in Window
      </h1>
      <p className="text-base mb-8" style={{ color: "var(--gray-400)" }}>
        When do you want to be reminded to check in?
      </p>

      {/* Explainer box */}
      <div
        className="flex gap-4 rounded-md p-4 mb-8 border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--gray-800)",
        }}
      >
        <span className="text-2xl">⏰</span>
        <p className="flex-1 text-sm leading-5" style={{ color: "var(--gray-300)" }}>
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>How it works:</span> If you don&apos;t check in
          within your window, you&apos;ll get a reminder. If you still don&apos;t respond after 48
          hours, your emergency contact will be notified.
        </p>
      </div>

      {/* Toggle row */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Set a check-in window
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--gray-500)" }}>
            {isEnabled ? "Custom schedule" : "Using default (24hr window)"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          onClick={() => setIsEnabled(!isEnabled)}
          className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none"
          style={{
            backgroundColor: isEnabled ? "var(--accent-dark)" : "var(--gray-700)",
          }}
        >
          <span
            className="inline-block h-5 w-5 rounded-full transition-transform duration-200"
            style={{
              backgroundColor: isEnabled ? "var(--accent)" : "var(--gray-400)",
              transform: isEnabled ? "translateX(24px)" : "translateX(4px)",
            }}
          />
        </button>
      </div>

      {/* Time chips */}
      {isEnabled && (
        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            <label className="block text-base font-semibold" style={{ color: "var(--gray-300)" }}>
              Check in after
            </label>
            <div className="flex overflow-x-auto gap-2 pb-2 -mx-1 px-1">
              {timeOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setStartTime(value)}
                  className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-all"
                  style={{
                    backgroundColor: startTime === value
                      ? "var(--accent-subtle)"
                      : "var(--gray-800)",
                    borderColor: startTime === value
                      ? "var(--accent)"
                      : "var(--gray-700)",
                    color: startTime === value
                      ? "var(--accent)"
                      : "var(--gray-400)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-base font-semibold" style={{ color: "var(--gray-300)" }}>
              Check in before
            </label>
            <div className="flex overflow-x-auto gap-2 pb-2 -mx-1 px-1">
              {timeOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setEndTime(value)}
                  className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-all"
                  style={{
                    backgroundColor: endTime === value
                      ? "var(--accent-subtle)"
                      : "var(--gray-800)",
                    borderColor: endTime === value
                      ? "var(--accent)"
                      : "var(--gray-700)",
                    color: endTime === value
                      ? "var(--accent)"
                      : "var(--gray-400)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Default info */}
      {!isEnabled && (
        <div
          className="rounded-md p-4 mb-8 border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--gray-800)",
          }}
        >
          <p className="text-sm leading-5" style={{ color: "var(--gray-300)" }}>
            With the default setting, you just need to check in once every 24
            hours, any time that works for you.
          </p>
        </div>
      )}

      <button
        onClick={handleContinue}
        className="w-full py-4 rounded-md text-base font-bold transition-all btn-press"
        style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
      >
        Continue
      </button>
    </div>
  );
}
