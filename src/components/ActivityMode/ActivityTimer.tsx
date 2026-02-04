"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ActivityData } from "./ActivitySelector";

const GRACE_PERIOD_MS = 5 * 60 * 1000;

interface ActivityTimerProps {
  activity: ActivityData;
  onComplete: () => void;
  onExtend: (minutes: number) => void;
  onCancel: () => void;
  onGracePeriodExpired: () => void;
  contactName: string;
}

export default function ActivityTimer({
  activity,
  onComplete,
  onExtend,
  onCancel,
  onGracePeriodExpired,
  contactName,
}: ActivityTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isGracePeriod, setIsGracePeriod] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const graceStartTimeRef = useRef<number | null>(null);

  const updateTimeRemaining = useCallback(() => {
    const endTime = new Date(activity.expectedEndAt).getTime();
    const now = Date.now();
    const remaining = endTime - now;

    if (remaining <= 0 && !isGracePeriod) {
      setIsGracePeriod(true);
      graceStartTimeRef.current = now;
      setTimeRemaining(GRACE_PERIOD_MS);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
    } else if (remaining <= 0 && isGracePeriod) {
      const graceStart = graceStartTimeRef.current || endTime;
      const graceEnd = graceStart + GRACE_PERIOD_MS;
      const graceRemaining = graceEnd - now;
      if (graceRemaining <= 0) {
        onGracePeriodExpired();
        return;
      }
      setTimeRemaining(graceRemaining);
    } else {
      setTimeRemaining(remaining);
    }
  }, [activity.expectedEndAt, isGracePeriod, onGracePeriodExpired]);

  useEffect(() => {
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [updateTimeRemaining]);

  const formatTime = (ms: number): string => {
    if (ms <= 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0)
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    await onComplete();
  };

  const handleExtend = (minutes: number) => {
    setIsGracePeriod(false);
    graceStartTimeRef.current = null;
    onExtend(minutes);
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: isGracePeriod ? "color-mix(in srgb, var(--danger) 10%, var(--bg))" : "var(--card)",
        border: `1px solid ${isGracePeriod ? "var(--danger)" : "var(--gray-800)"}`,
      }}
    >
      <h3 className="text-lg font-bold text-center mb-4" style={{ color: "var(--text-primary)" }}>
        {isGracePeriod ? "⚠️ Check in now!" : activity.label}
      </h3>

      {/* Timer display */}
      <div className="flex flex-col items-center mb-6">
        <span
          className="text-5xl font-bold tabular-nums"
          style={{ color: isGracePeriod ? "var(--danger)" : "var(--accent)" }}
        >
          {formatTime(timeRemaining)}
        </span>
        <span className="text-sm mt-1" style={{ color: "var(--gray-500)" }}>
          {isGracePeriod ? "until alert sent" : "remaining"}
        </span>
      </div>

      {/* Grace period warning */}
      {isGracePeriod && (
        <div
          className="rounded-lg p-3 mb-4"
          style={{ backgroundColor: "color-mix(in srgb, var(--danger) 20%, var(--bg))" }}
        >
          <p className="text-sm text-center font-medium" style={{ color: "var(--danger)" }}>
            Timer expired! {contactName || "Your contact"} will be alerted in {formatTime(timeRemaining)}
          </p>
        </div>
      )}

      {/* I'm Back Safe button */}
      <button
        onClick={handleComplete}
        disabled={isCompleting}
        className="w-full py-4 rounded-xl text-lg font-bold mb-4 transition-all btn-press disabled:opacity-50"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--bg)",
        }}
      >
        {isCompleting ? "..." : "✅ I'm Back Safe"}
      </button>

      {/* Secondary actions */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => handleExtend(30)}
          className="flex-1 py-3 rounded-lg text-sm font-semibold text-center transition-colors btn-press"
          style={{
            backgroundColor: "var(--gray-800)",
            border: "1px solid var(--gray-700)",
            color: "var(--gray-300)",
          }}
        >
          + Add 30 min
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg text-sm font-semibold text-center transition-colors btn-press"
          style={{
            backgroundColor: "transparent",
            border: "1px solid var(--gray-700)",
            color: "var(--gray-400)",
          }}
        >
          End Early
        </button>
      </div>

      <p className="text-xs text-center" style={{ color: "var(--gray-600)", lineHeight: "18px" }}>
        {isGracePeriod
          ? 'Tap "I\'m Back Safe" to cancel the alert'
          : `If timer ends, ${contactName || "your contact"} will be notified`}
      </p>
    </div>
  );
}
