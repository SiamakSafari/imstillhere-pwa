"use client";

import { useState, useEffect, useCallback } from "react";
import ActivitySelector, { type ActivityData } from "./ActivitySelector";
import ActivityTimer from "./ActivityTimer";

const ACTIVITY_STORAGE_KEY = "imstillhere-activity";

interface ActivityModeProps {
  contactName: string;
}

export default function ActivityMode({ contactName }: ActivityModeProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [activeActivity, setActiveActivity] = useState<ActivityData | null>(null);

  // Load persisted activity on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (stored) {
        const activity = JSON.parse(stored) as ActivityData;
        const graceEnd = new Date(activity.expectedEndAt).getTime() + 5 * 60 * 1000;
        if (Date.now() < graceEnd) {
          setActiveActivity(activity);
        } else {
          localStorage.removeItem(ACTIVITY_STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    }
  }, []);

  // Persist activity changes
  useEffect(() => {
    if (activeActivity) {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activeActivity));
    } else {
      localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    }
  }, [activeActivity]);

  const handleStartActivity = useCallback((activityData: ActivityData) => {
    setActiveActivity(activityData);
    setShowSelector(false);
  }, []);

  const handleCompleteActivity = useCallback(async () => {
    setActiveActivity(null);
  }, []);

  const handleExtendActivity = useCallback(
    (minutes: number) => {
      if (!activeActivity) return;
      const newEndTime = new Date(activeActivity.expectedEndAt);
      newEndTime.setMinutes(newEndTime.getMinutes() + minutes);
      setActiveActivity({
        ...activeActivity,
        expectedEndAt: newEndTime.toISOString(),
        durationMinutes: activeActivity.durationMinutes + minutes,
      });
    },
    [activeActivity]
  );

  const handleCancelActivity = useCallback(() => {
    setActiveActivity(null);
  }, []);

  const handleGracePeriodExpired = useCallback(() => {
    setActiveActivity(null);
  }, []);

  if (activeActivity) {
    return (
      <ActivityTimer
        activity={activeActivity}
        onComplete={handleCompleteActivity}
        onExtend={handleExtendActivity}
        onCancel={handleCancelActivity}
        onGracePeriodExpired={handleGracePeriodExpired}
        contactName={contactName}
      />
    );
  }

  if (showSelector) {
    return (
      <ActivitySelector
        onStartActivity={handleStartActivity}
        onCancel={() => setShowSelector(false)}
        contactName={contactName}
      />
    );
  }

  return (
    <button
      onClick={() => setShowSelector(true)}
      className="w-full flex items-center gap-4 rounded-2xl p-5 transition-colors btn-press card-hover"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--gray-800)",
      }}
    >
      <span className="text-3xl">⏱️</span>
      <div className="flex-1 text-left">
        <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
          Start Activity
        </p>
        <p className="text-xs" style={{ color: "var(--gray-500)" }}>
          Timed check-in for runs, dates, etc.
        </p>
      </div>
    </button>
  );
}
