"use client";

import { useState } from "react";

const ACTIVITY_PRESETS = [
  { id: "run", label: "Run", emoji: "🏃", defaultMinutes: 60, color: "#7cb87c" },
  { id: "date", label: "Date", emoji: "💕", defaultMinutes: 120, color: "#e89b9b" },
  { id: "showing", label: "Showing", emoji: "🏠", defaultMinutes: 60, color: "#8bb8c4" },
  { id: "ride", label: "Ride", emoji: "🚗", defaultMinutes: 30, color: "#e4c36a" },
  { id: "walking", label: "Walking", emoji: "🚶", defaultMinutes: 30, color: "#9fcdaa" },
  { id: "meeting", label: "Meeting", emoji: "🤝", defaultMinutes: 60, color: "#b8a6d4" },
  { id: "nightout", label: "Night Out", emoji: "🌙", defaultMinutes: 180, color: "#d4a574" },
  { id: "custom", label: "Custom", emoji: "⚡", defaultMinutes: 60, color: "#a8a8a0" },
];

const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hrs" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
];

export interface ActivityData {
  type: string;
  label: string;
  durationMinutes: number;
  shareLocation: boolean;
  details: string | null;
  startedAt: string;
  expectedEndAt: string;
}

interface ActivitySelectorProps {
  onStartActivity: (activity: ActivityData) => void;
  onCancel: () => void;
  contactName: string;
}

export default function ActivitySelector({ onStartActivity, onCancel, contactName }: ActivitySelectorProps) {
  const [selectedActivity, setSelectedActivity] = useState<(typeof ACTIVITY_PRESETS)[0] | null>(null);
  const [duration, setDuration] = useState(60);
  const [customLabel, setCustomLabel] = useState("");
  const [shareLocation, setShareLocation] = useState(true);
  const [activityDetails, setActivityDetails] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const handleSelectActivity = (activity: (typeof ACTIVITY_PRESETS)[0]) => {
    setSelectedActivity(activity);
    setDuration(activity.defaultMinutes);
  };

  const handleStart = () => {
    if (!selectedActivity) return;
    setIsStarting(true);
    onStartActivity({
      type: selectedActivity.id,
      label: selectedActivity.id === "custom" ? customLabel || "Custom Activity" : selectedActivity.label,
      durationMinutes: duration,
      shareLocation,
      details: activityDetails || null,
      startedAt: new Date().toISOString(),
      expectedEndAt: new Date(Date.now() + duration * 60 * 1000).toISOString(),
    });
  };

  const getDetailsPlaceholder = () => {
    if (!selectedActivity) return "";
    switch (selectedActivity.id) {
      case "date": return "Person's name, where meeting...";
      case "showing": return "Property address, client name...";
      case "ride": return "Driver name, license plate...";
      case "meeting": return "Person's name, meeting location...";
      default: return "Any details to include in alert...";
    }
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--gray-800)",
      }}
    >
      <h3 className="text-lg font-bold text-center mb-4" style={{ color: "var(--text-primary)" }}>
        What are you doing?
      </h3>

      {/* Activity grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {ACTIVITY_PRESETS.map((activity) => (
          <button
            key={activity.id}
            onClick={() => handleSelectActivity(activity)}
            className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all"
            style={{
              backgroundColor:
                selectedActivity?.id === activity.id
                  ? activity.color + "20"
                  : "var(--bg-light)",
              borderColor:
                selectedActivity?.id === activity.id ? activity.color : "transparent",
            }}
          >
            <span className="text-2xl">{activity.emoji}</span>
            <span
              className="text-xs font-semibold mt-1"
              style={{
                color: selectedActivity?.id === activity.id ? activity.color : "var(--gray-400)",
              }}
            >
              {activity.label}
            </span>
          </button>
        ))}
      </div>

      {/* Custom label input */}
      {selectedActivity?.id === "custom" && (
        <input
          type="text"
          placeholder="What are you doing?"
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          maxLength={50}
          className="w-full px-4 py-3 rounded-lg text-base mb-4 focus:outline-none"
          style={{
            backgroundColor: "var(--bg-light)",
            border: "1px solid var(--gray-700)",
            color: "var(--text-primary)",
          }}
        />
      )}

      {selectedActivity && (
        <>
          {/* Duration chips */}
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--gray-400)" }}>
              Check back in:
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor:
                      duration === opt.value ? "var(--accent-subtle)" : "var(--bg-light)",
                    border: `1px solid ${duration === opt.value ? "var(--accent)" : "var(--gray-700)"}`,
                    color: duration === opt.value ? "var(--accent)" : "var(--gray-400)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Share location toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium" style={{ color: "var(--gray-300)" }}>
              📍 Share my location
            </span>
            <button
              onClick={() => setShareLocation(!shareLocation)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: shareLocation ? "var(--accent-dark)" : "var(--gray-700)",
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
                style={{
                  backgroundColor: shareLocation ? "var(--accent)" : "var(--gray-400)",
                  transform: shareLocation ? "translateX(22px)" : "translateX(2px)",
                }}
              />
            </button>
          </div>

          {/* Details input */}
          <textarea
            placeholder={getDetailsPlaceholder()}
            value={activityDetails}
            onChange={(e) => setActivityDetails(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full px-4 py-3 rounded-lg text-base mb-1 focus:outline-none resize-none"
            style={{
              backgroundColor: "var(--bg-light)",
              border: "1px solid var(--gray-700)",
              color: "var(--text-primary)",
            }}
          />
          <p className="text-xs mb-4" style={{ color: "var(--gray-600)" }}>
            Only shared if you don&apos;t check back in
          </p>

          {/* Actions */}
          <div className="flex gap-3 mb-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors btn-press"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--gray-700)",
                color: "var(--gray-400)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all btn-press disabled:opacity-50"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--bg)",
              }}
            >
              {isStarting ? "Starting..." : "Start Activity"}
            </button>
          </div>

          <p className="text-xs text-center" style={{ color: "var(--gray-600)" }}>
            If you don&apos;t check back in, {contactName || "your contact"} will be notified
          </p>
        </>
      )}
    </div>
  );
}
