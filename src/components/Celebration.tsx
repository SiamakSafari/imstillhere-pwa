"use client";

import { useEffect, useState } from "react";

const MILESTONES: Record<
  number,
  { label: string; title: string; message: string; emoji: string }
> = {
  7: {
    label: "Week One",
    title: "First Week!",
    message: "You've checked in for a whole week. You're building a healthy habit!",
    emoji: "🌱",
  },
  14: {
    label: "Two Weeks",
    title: "Two Weeks Strong!",
    message: "Two weeks of consistency. You're really committed to this!",
    emoji: "💪",
  },
  30: {
    label: "One Month",
    title: "One Month!",
    message: "A whole month! You've proven this habit is here to stay.",
    emoji: "🏅",
  },
  60: {
    label: "Two Months",
    title: "Two Months!",
    message: "60 days of showing up. You're an inspiration!",
    emoji: "🌟",
  },
  100: {
    label: "Century",
    title: "Century Club!",
    message: "100 days! You've joined an elite group of dedicated people.",
    emoji: "💯",
  },
  365: {
    label: "One Year",
    title: "One Full Year!",
    message: "365 days of checking in. This is truly remarkable!",
    emoji: "🏆",
  },
};

interface CelebrationProps {
  streak: number;
  onDismiss: () => void;
}

export default function Celebration({ streak, onDismiss }: CelebrationProps) {
  const [visible, setVisible] = useState(false);
  const milestone = MILESTONES[streak];

  useEffect(() => {
    if (!milestone) { onDismiss(); return; }
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [milestone, onDismiss]);

  if (!milestone) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      onClick={onDismiss}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Content */}
      <div
        className="relative w-full max-w-sm rounded-xl p-8 text-center border-2 transition-all duration-500"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--accent)",
          boxShadow: "0 0 40px var(--accent-glow)",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.8)",
        }}
      >
        <div className="text-6xl mb-4">{milestone.emoji}</div>
        <p
          className="text-sm uppercase tracking-widest mb-1"
          style={{ color: "var(--gray-400)" }}
        >
          {milestone.label}
        </p>
        <h2
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--accent)" }}
        >
          {milestone.title}
        </h2>
        <p className="text-lg font-semibold text-white mb-4">
          {streak} Day Streak
        </p>
        <p className="text-base text-gray-300 leading-6 mb-8">
          {milestone.message}
        </p>
        <button
          onClick={onDismiss}
          className="w-full py-4 rounded-md text-base font-bold transition-all btn-press"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--bg)",
          }}
        >
          Keep Going!
        </button>
      </div>
    </div>
  );
}
