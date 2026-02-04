"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Profile } from "@/lib/types";
import { getQuoteForDate } from "@/lib/quotes";
import PWAInstallPrompt from "./PWAInstallPrompt";
import Confetti from "./Confetti";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import SnoozeButton from "./SnoozeButton";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ActivityMode from "./ActivityMode";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import FamilyShareCard from "./FamilyShareCard";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import BottomNav from "./BottomNav";
import CheckInFlow from "./CheckInFlow";
import Celebration from "./Celebration";

/* ─── Types (from Expo types.ts) ─── */
type MoodValue = "great" | "good" | "okay" | "low" | "rough";

const MILESTONES = [7, 14, 30, 60, 100, 365];

const MILESTONE_BADGES: Record<
  number,
  { label: string; fullLabel: string; color: string }
> = {
  7: { label: "1W", fullLabel: "Week One", color: "#22c55e" },
  14: { label: "2W", fullLabel: "Two Weeks", color: "#16a34a" },
  30: { label: "1M", fullLabel: "One Month", color: "#c0c0c0" },
  60: { label: "2M", fullLabel: "Two Months", color: "#fbbf24" },
  100: { label: "100", fullLabel: "Century", color: "#60a5fa" },
  365: { label: "1Y", fullLabel: "One Year", color: "#f59e0b" },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOOD_VALUES: Record<MoodValue, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  rough: 1,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VALUE_TO_LABEL: Record<number, string> = {
  5: "Great",
  4: "Good",
  3: "Okay",
  2: "Low",
  1: "Rough",
};

/* ─── Helpers (from Expo utils/time.ts) ─── */
interface Props {
  profile: Profile | null;
  hasCheckedInToday: boolean;
  lastCheckinAt: string | null;
  streak: number;
  contactCount: number;
  contactName?: string;
  contactEmail?: string;
  petName?: string;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function getNextMilestone(streak: number): number {
  return MILESTONES.find((m) => m > streak) || streak + 100;
}

function formatLastCheckIn(lastCheckIn: string | null): string | null {
  if (!lastCheckIn) return null;
  const date = new Date(lastCheckIn);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

/* ─── Component ─── */
export default function DashboardClient({
  profile,
  hasCheckedInToday: initialCheckedIn,
  lastCheckinAt,
  streak: initialStreak,
  contactCount,
  contactName,
  contactEmail,
  petName,
}: Props) {
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn);
  const [streak, setStreak] = useState(
    typeof initialStreak === "number" && !isNaN(initialStreak)
      ? initialStreak
      : 0
  );
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(lastCheckinAt);
  const [showCheckInFlow, setShowCheckInFlow] = useState(false);
  const [checkInSubmitting, setCheckInSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createClient();
  }, []);

  const name = profile?.display_name || "friend";
  const quote = useMemo(() => getQuoteForDate(new Date()), []);

  const nextMilestone = getNextMilestone(streak);
  const prevMilestone = MILESTONES.filter((m) => m <= streak).pop() || 0;
  const progressInSegment = streak - prevMilestone;
  const segmentSize = nextMilestone - prevMilestone;
  const progress =
    segmentSize > 0 ? (progressInSegment / segmentSize) * 100 : 0;
  const earnedMilestones = MILESTONES.filter((m) => streak >= m);
  const lastCheckInFormatted = formatLastCheckIn(lastCheckIn);

  // Weekly summary (simplified — no mood data from server yet)
  const weeklySummary = useMemo(() => {
    return { daysCheckedIn: Math.min(streak, 7), avgMoodLabel: "—" };
  }, [streak]);

  async function handleCheckIn() {
    if (checkedIn || loading) return;
    setLoading(true);

    try {
      const { error } = await supabase!.from("checkins").insert({
        user_id: profile?.id,
        method: "manual",
      });
      if (error) throw error;

      const newStreak = initialStreak + 1;
      setCheckedIn(true);
      setStreak(newStreak);
      setLastCheckIn(new Date().toISOString());
      setShowConfetti(true);
      setShowCheckInFlow(true);

      if (navigator.vibrate) navigator.vibrate(100);

      setTimeout(() => setShowConfetti(false), 4500);
      router.refresh();
    } catch (err) {
      console.error("Check-in failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckInFlowComplete(data: { mood: string | null; note: string | null }) {
    setCheckInSubmitting(true);
    try {
      // Save mood/note if provided
      if (data.mood || data.note) {
        await supabase?.from("checkins")
          .update({ mood: data.mood, note: data.note })
          .eq("user_id", profile?.id)
          .order("checked_in_at", { ascending: false })
          .limit(1);
      }
    } catch (err) {
      console.error("Failed to save mood/note:", err);
    } finally {
      setCheckInSubmitting(false);
      setShowCheckInFlow(false);
      // Check for milestone celebration
      const milestones = [7, 14, 30, 60, 100, 365];
      if (milestones.includes(streak)) {
        setShowCelebration(true);
      }
    }
  }

  return (
    <main
      className="min-h-dvh flex flex-col px-5 pt-5 pb-24 max-w-lg mx-auto"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <Confetti trigger={showConfetti} streak={streak} />
      <CheckInFlow
        visible={showCheckInFlow}
        onComplete={handleCheckInFlowComplete}
        onCancel={() => setShowCheckInFlow(false)}
        isSubmitting={checkInSubmitting}
      />
      {showCelebration && (
        <Celebration
          streak={streak}
          onDismiss={() => setShowCelebration(false)}
        />
      )}

      {/* ===== TOP BAR: Avatar + Greeting + Settings ===== */}
      <header className="flex items-center justify-between mb-4 animate-fade-in-up">
        {/* Avatar — 44px */}
        <div
          className="flex items-center justify-center font-bold"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "var(--accent-darker)",
            border: "2px solid var(--accent)",
            color: "var(--bg)",
            fontSize: 16,
          }}
        >
          {getInitials(name)}
        </div>

        {/* Settings icon */}
        <Link
          href="/settings"
          aria-label="Settings"
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--gray-400)" }}
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </header>

      {/* ===== 💀 BRAND TAGLINE ===== */}
      <div className="animate-fade-in-up" style={{ marginBottom: 20, opacity: 0 }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 36, lineHeight: 1 }}>☠️</span>
          <div>
            <p
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              I&apos;m Still Here
            </p>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginTop: 2,
              }}
            >
              Proof of life · Daily
            </p>
          </div>
        </div>
      </div>

      {/* ===== GREETING ===== */}
      <div className="animate-fade-in-up stagger-1" style={{ marginBottom: 16 }}>
        <p
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {getGreeting()},{" "}
          <span style={{ color: "var(--accent)" }}>{name}</span>
        </p>
      </div>

      {/* ===== CHECK-IN BUTTON (Expo: CheckInButton.tsx) ===== */}
      <div
        className="flex flex-col items-center animate-fade-in-up stagger-2"
        style={{ marginBottom: 24, opacity: 0 }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ width: 240, height: 240 }}
        >
          {/* Glow ring */}
          {!checkedIn && (
            <div
              className="absolute animate-pulse-scale"
              style={{
                width: 220,
                height: 220,
                borderRadius: 110,
                backgroundColor: "var(--accent-glow)",
                opacity: 0.3,
              }}
            />
          )}

          {/* Progress circle ring */}
          {streak > 0 && (
            <div
              className="absolute"
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                border: "4px solid var(--gray-800)",
              }}
            />
          )}

          {/* The main button — 180x180 */}
          <button
            onClick={handleCheckIn}
            disabled={checkedIn || loading}
            className="relative rounded-full flex flex-col items-center justify-center transition-all duration-300 btn-press"
            style={{
              width: 180,
              height: 180,
              backgroundColor: checkedIn ? "var(--gray-800)" : "var(--accent)",
              border: checkedIn
                ? "2px solid var(--accent-dark)"
                : "none",
              boxShadow: checkedIn
                ? "none"
                : "0 0 20px var(--accent-glow)",
              cursor: checkedIn ? "default" : "pointer",
            }}
            aria-label={checkedIn ? "Already checked in" : "Check in"}
          >
            {loading ? (
              <div
                className="w-10 h-10 border-[3px] rounded-full animate-spin"
                style={{
                  borderColor: "color-mix(in srgb, var(--bg) 30%, transparent)",
                  borderTopColor: "var(--bg)",
                }}
              />
            ) : checkedIn ? (
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center">
                  <span
                    style={{
                      fontSize: 52,
                      color: "var(--accent)",
                      fontWeight: 800,
                      marginBottom: -4,
                      lineHeight: 1,
                    }}
                  >
                    ✓
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "var(--accent)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 16,
                    color: "var(--accent)",
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  Done
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "var(--bg)",
                    letterSpacing: -0.5,
                  }}
                >
                  Check In
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--bg)",
                    opacity: 0.6,
                    fontWeight: 500,
                    marginTop: 4,
                  }}
                >
                  Tap to confirm
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* ===== STREAK CARD (Expo: Stats.tsx) ===== */}
      <div
        className="animate-fade-in-up stagger-3"
        style={{ marginBottom: 24, opacity: 0 }}
      >
        <div
          className="cursor-pointer card-hover"
          onClick={() => setExpanded(!expanded)}
          style={{
            backgroundColor: "var(--bg-card)",
            borderRadius: 16,
            padding: 24,
            border: "1px solid var(--gray-800)",
          }}
        >
          {/* Header row */}
          <div
            className="flex items-center"
            style={{ marginBottom: 8 }}
          >
            <span style={{ fontSize: 20, marginRight: 8 }}>🔥</span>
            <span
              className="flex-1"
              style={{
                fontSize: 14,
                color: "var(--gray-400)",
                fontWeight: 600,
              }}
            >
              Streak
            </span>
            <span
              style={{
                fontSize: 16,
                color: "var(--gray-500)",
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s ease",
                display: "inline-block",
              }}
            >
              ▾
            </span>
          </div>

          {/* Value row */}
          <div className="flex items-baseline" style={{ gap: 8 }}>
            <span
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: checkedIn ? "var(--accent)" : "var(--gray-400)",
              }}
            >
              {streak}
            </span>
            <span
              style={{
                fontSize: 18,
                color: "var(--gray-500)",
                fontWeight: 600,
              }}
            >
              days
            </span>
          </div>

          {/* Progress bar */}
          {streak > 0 && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  height: 4,
                  backgroundColor: "var(--gray-800)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: "var(--accent)",
                    borderRadius: 2,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--gray-500)",
                  marginTop: 4,
                }}
              >
                {nextMilestone - streak} to next milestone
              </p>
            </div>
          )}

          {/* Earned milestone badges */}
          {earnedMilestones.length > 0 && (
            <div
              className="flex flex-wrap"
              style={{ gap: 8, marginTop: 16 }}
            >
              {earnedMilestones.map((m) => (
                <div
                  key={m}
                  style={{
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    borderColor: MILESTONE_BADGES[m].color,
                    borderRadius: 8,
                    paddingLeft: 8,
                    paddingRight: 8,
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: MILESTONE_BADGES[m].color,
                    }}
                  >
                    {MILESTONE_BADGES[m].label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Expanded: weekly section */}
          {expanded && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  height: 1,
                  backgroundColor: "var(--gray-800)",
                  marginBottom: 16,
                }}
              />
              <p
                style={{
                  fontSize: 14,
                  color: "var(--gray-400)",
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                This Week
              </p>
              <div className="flex" style={{ gap: 32 }}>
                <div className="flex flex-col items-center">
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {weeklySummary.daysCheckedIn}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--gray-500)",
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    Days
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {weeklySummary.avgMoodLabel}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--gray-500)",
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    Mood
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Protected badge */}
        {checkedIn && (
          <div className="flex justify-center" style={{ marginTop: 16 }}>
            <span
              style={{
                backgroundColor: "var(--accent-subtle)",
                borderRadius: 9999,
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 8,
                paddingBottom: 8,
                color: "var(--accent)",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              🛡️ Protected
            </span>
          </div>
        )}

        {/* Last check-in time */}
        {lastCheckInFormatted && (
          <div className="flex justify-center" style={{ marginTop: 8 }}>
            <span style={{ color: "var(--gray-500)", fontSize: 12 }}>
              🕐 Last check-in: {lastCheckInFormatted}
            </span>
          </div>
        )}
      </div>

      {/* ===== DAILY QUOTE CARD ===== */}
      <div
        className="animate-fade-in-up stagger-4"
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: 16,
          padding: 24,
          border: "1px solid var(--gray-800)",
          marginBottom: 24,
          opacity: 0,
        }}
      >
        <span
          style={{
            fontSize: 24,
            color: "var(--accent)",
            opacity: 0.5,
            display: "block",
            marginBottom: 8,
          }}
        >
          ❝
        </span>
        <p
          style={{
            fontSize: 16,
            color: "var(--gray-200)",
            fontStyle: "italic",
            lineHeight: "24px",
          }}
        >
          {quote.text}
        </p>
        {quote.author && (
          <p
            style={{
              fontSize: 14,
              color: "var(--gray-500)",
              marginTop: 8,
            }}
          >
            — {quote.author}
          </p>
        )}
      </div>

      {/* ===== EMERGENCY CONTACT CARD ===== */}
      <div
        className="animate-fade-in-up stagger-5"
        style={{ marginBottom: 24, opacity: 0 }}
      >
        {(contactName || contactEmail || contactCount > 0) && (
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: 16,
              padding: 24,
              border: "1px solid var(--gray-800)",
              marginBottom: 16,
            }}
          >
            <div
              className="flex items-center"
              style={{ gap: 8, marginBottom: 8 }}
            >
              <span style={{ fontSize: 16 }}>👤</span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--gray-500)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Emergency Contact
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {contactName && (
                <span
                  style={{
                    fontSize: 16,
                    color: "var(--text-primary)",
                    fontWeight: 600,
                  }}
                >
                  {contactName}
                </span>
              )}
              {contactEmail && (
                <span style={{ fontSize: 14, color: "var(--gray-400)" }}>
                  {contactEmail}
                </span>
              )}
              {!contactName && !contactEmail && contactCount > 0 && (
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--gray-400)",
                  }}
                >
                  {contactCount} contact{contactCount !== 1 ? "s" : ""} configured
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pet card */}
        {petName && (
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: 16,
              padding: 24,
              border: "1px solid var(--gray-800)",
              marginBottom: 16,
            }}
          >
            <div
              className="flex items-center"
              style={{ gap: 8, marginBottom: 8 }}
            >
              <span style={{ fontSize: 16 }}>🐾</span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--gray-500)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Pet
              </span>
            </div>
            <span
              style={{
                fontSize: 16,
                color: "var(--text-primary)",
                fontWeight: 600,
              }}
            >
              {petName}
            </span>
          </div>
        )}

        {/* No contacts warning */}
        {contactCount === 0 && (
          <Link href="/settings">
            <div
              style={{
                backgroundColor: "var(--bg-card)",
                borderRadius: 16,
                padding: 24,
                border: "1px solid var(--gray-800)",
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: "var(--gray-400)",
                  fontWeight: 500,
                }}
              >
                ⚠️ No emergency contacts set up yet.{" "}
                <span style={{ color: "var(--accent)" }}>Add one →</span>
              </p>
            </div>
          </Link>
        )}
      </div>

      {/* ===== SNOOZE BUTTON ===== */}
      <div className="animate-fade-in-up stagger-5" style={{ marginBottom: 16, opacity: 0 }}>
        <SnoozeButton
          snoozeUntil={null}
          onSnooze={(until) => {
            console.log("Snoozed until:", until);
          }}
          onCancelSnooze={() => {
            console.log("Snooze cancelled");
          }}
        />
      </div>

      {/* ===== ACTIVITY MODE ===== */}
      <div className="animate-fade-in-up stagger-5" style={{ marginBottom: 24, opacity: 0 }}>
        <ActivityMode contactName={contactName || ""} />
      </div>

      {/* ===== FAMILY SHARE CARD ===== */}
      <div className="animate-fade-in-up stagger-6" style={{ marginBottom: 24, opacity: 0 }}>
        <FamilyShareCard userId={profile?.id ?? null} />
      </div>

      {/* Bottom actions */}
      <div
        className="flex items-center justify-between pt-2 pb-4 mt-auto animate-fade-in-up stagger-6"
        style={{ opacity: 0 }}
      >
        <Link
          href="/share"
          className="transition-all hover:opacity-80"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--gray-400)",
          }}
        >
          Share proof of life →
        </Link>
        <button
          onClick={async () => {
            await supabase?.auth.signOut();
            router.push("/");
            router.refresh();
          }}
          className="transition-all hover:opacity-80"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--gray-500)",
          }}
        >
          Sign out
        </button>
      </div>

      <PWAInstallPrompt />
      <BottomNav active="dashboard" />

      {/* Preload logo for other pages */}
      <Image
        src="/logo.png"
        alt=""
        width={1}
        height={1}
        className="hidden"
        priority
      />
    </main>
  );
}
