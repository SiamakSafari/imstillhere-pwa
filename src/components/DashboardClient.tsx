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

/* ─── Theme constants (from Expo theme.ts) ─── */
const Colors = {
  bgDark: "#0a0a0a",
  bgCard: "#141414",
  bgCardHover: "#1a1a1a",
  accentPrimary: "#4ade80",
  accentDark: "#22c55e",
  accentDarker: "#16a34a",
  accentGlow: "rgba(74, 222, 128, 0.4)",
  gray200: "#e4e4e7",
  gray400: "#a1a1aa",
  gray500: "#71717a",
  gray700: "#3f3f46",
  gray800: "#27272a",
  white: "#ffffff",
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

      if (navigator.vibrate) navigator.vibrate(100);

      setTimeout(() => setShowConfetti(false), 4500);
      router.refresh();
    } catch (err) {
      console.error("Check-in failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-dvh flex flex-col px-5 pt-5 pb-8 max-w-lg mx-auto"
      style={{ backgroundColor: Colors.bgDark }}
    >
      <Confetti trigger={showConfetti} streak={streak} />

      {/* ===== TOP BAR: Avatar + Greeting + Settings ===== */}
      <header className="flex items-center justify-between mb-4 animate-fade-in-up">
        {/* Avatar — 44px, #16a34a bg, 2px solid #4ade80 border */}
        <div
          className="flex items-center justify-center font-bold"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: Colors.accentDarker,
            border: `2px solid ${Colors.accentPrimary}`,
            color: Colors.white,
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
          style={{ backgroundColor: Colors.bgCard }}
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
            style={{ color: Colors.gray400 }}
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </header>

      {/* ===== GREETING (Expo: Greeting.tsx) ===== */}
      {/* fontSize: 24 (FontSize.xl), fontWeight 700, marginBottom: 16 (Spacing.md) */}
      <div className="animate-fade-in-up stagger-1" style={{ marginBottom: 16 }}>
        <p
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: Colors.white,
          }}
        >
          {getGreeting()},{" "}
          <span style={{ color: Colors.accentPrimary }}>{name}</span>
        </p>
      </div>

      {/* ===== CHECK-IN BUTTON (Expo: CheckInButton.tsx) ===== */}
      {/* wrapper: 240x240, button: 180x180, glow ring: 220x220 */}
      <div
        className="flex flex-col items-center animate-fade-in-up stagger-2"
        style={{ marginBottom: 24, opacity: 0 }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ width: 240, height: 240 }}
        >
          {/* Glow ring — 220px, pulsing when not checked in */}
          {!checkedIn && (
            <div
              className="absolute animate-pulse-scale"
              style={{
                width: 220,
                height: 220,
                borderRadius: 110,
                backgroundColor: Colors.accentGlow,
                opacity: 0.3,
              }}
            />
          )}

          {/* Progress circle ring (streak > 0) — 200px, 4px border */}
          {streak > 0 && (
            <div
              className="absolute"
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                border: `4px solid ${Colors.gray800}`,
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
              backgroundColor: checkedIn ? Colors.gray800 : Colors.accentPrimary,
              border: checkedIn
                ? `2px solid ${Colors.accentDark}`
                : "none",
              boxShadow: checkedIn
                ? "none"
                : `0 0 20px ${Colors.accentPrimary}66`,
              cursor: checkedIn ? "default" : "pointer",
            }}
            aria-label={checkedIn ? "Already checked in" : "Check in"}
          >
            {loading ? (
              <div
                className="w-10 h-10 border-[3px] rounded-full animate-spin"
                style={{
                  borderColor: "rgba(10, 10, 10, 0.3)",
                  borderTopColor: Colors.bgDark,
                }}
              />
            ) : checkedIn ? (
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center">
                  {/* Checkmark: fontSize 52, fontWeight 800, marginBottom -4 */}
                  <span
                    style={{
                      fontSize: 52,
                      color: Colors.accentPrimary,
                      fontWeight: 800,
                      marginBottom: -4,
                      lineHeight: 1,
                    }}
                  >
                    ✓
                  </span>
                  {/* Checkmark bar: 32x8, borderRadius 4 */}
                  <div
                    style={{
                      width: 32,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: Colors.accentPrimary,
                    }}
                  />
                </div>
                {/* "Done" label: fontSize 16, fontWeight 600, marginTop 4 */}
                <span
                  style={{
                    fontSize: 16,
                    color: Colors.accentPrimary,
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  Done
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* "Check In": fontSize 32 (FontSize.xxl), fontWeight 800, letterSpacing -0.5 */}
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: Colors.bgDark,
                    letterSpacing: -0.5,
                  }}
                >
                  Check In
                </span>
                {/* "Tap to confirm": fontSize 14, color rgba(10,10,10,0.6), fontWeight 500, marginTop 4 */}
                <span
                  style={{
                    fontSize: 14,
                    color: "rgba(10, 10, 10, 0.6)",
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
      {/* card: bgCard, borderRadius 16, padding 24, border 1px gray800 */}
      <div
        className="animate-fade-in-up stagger-3"
        style={{ marginBottom: 24, opacity: 0 }}
      >
        <div
          className="cursor-pointer card-hover"
          onClick={() => setExpanded(!expanded)}
          style={{
            backgroundColor: Colors.bgCard,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${Colors.gray800}`,
          }}
        >
          {/* Header row: fire icon + "Streak" + expand chevron */}
          <div
            className="flex items-center"
            style={{ marginBottom: 8 }}
          >
            <span style={{ fontSize: 20, marginRight: 8 }}>🔥</span>
            <span
              className="flex-1"
              style={{
                fontSize: 14,
                color: Colors.gray400,
                fontWeight: 600,
              }}
            >
              Streak
            </span>
            <span
              style={{
                fontSize: 16,
                color: Colors.gray500,
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s ease",
                display: "inline-block",
              }}
            >
              ▾
            </span>
          </div>

          {/* Value row: streak number + "days" */}
          <div className="flex items-baseline" style={{ gap: 8 }}>
            <span
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: checkedIn ? Colors.accentPrimary : Colors.gray400,
              }}
            >
              {streak}
            </span>
            <span
              style={{
                fontSize: 18,
                color: Colors.gray500,
                fontWeight: 600,
              }}
            >
              days
            </span>
          </div>

          {/* Progress bar (streak > 0) */}
          {streak > 0 && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  height: 4,
                  backgroundColor: Colors.gray800,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: Colors.accentPrimary,
                    borderRadius: 2,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: Colors.gray500,
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
              {/* Divider */}
              <div
                style={{
                  height: 1,
                  backgroundColor: Colors.gray800,
                  marginBottom: 16,
                }}
              />
              <p
                style={{
                  fontSize: 14,
                  color: Colors.gray400,
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
                      color: Colors.white,
                    }}
                  >
                    {weeklySummary.daysCheckedIn}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: Colors.gray500,
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
                      color: Colors.white,
                    }}
                  >
                    {weeklySummary.avgMoodLabel}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: Colors.gray500,
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

        {/* Protected badge (after check-in) — Expo: protectedBadge */}
        {checkedIn && (
          <div className="flex justify-center" style={{ marginTop: 16 }}>
            <span
              style={{
                backgroundColor: Colors.accentDark + "20",
                borderRadius: 9999,
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 8,
                paddingBottom: 8,
                color: Colors.accentPrimary,
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
            <span style={{ color: Colors.gray500, fontSize: 12 }}>
              🕐 Last check-in: {lastCheckInFormatted}
            </span>
          </div>
        )}
      </div>

      {/* ===== DAILY QUOTE CARD (Expo: DailyQuote.tsx) ===== */}
      {/* In a card — bgCard, borderRadius 16, padding 24, border 1px gray800, marginBottom 24 */}
      <div
        className="animate-fade-in-up stagger-4"
        style={{
          backgroundColor: Colors.bgCard,
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${Colors.gray800}`,
          marginBottom: 24,
          opacity: 0,
        }}
      >
        {/* Quote icon: fontSize 24, accentPrimary, opacity 0.5, marginBottom 8 */}
        <span
          style={{
            fontSize: 24,
            color: Colors.accentPrimary,
            opacity: 0.5,
            display: "block",
            marginBottom: 8,
          }}
        >
          ❝
        </span>
        {/* Quote text: fontSize 16, gray200, italic, lineHeight 24 */}
        <p
          style={{
            fontSize: 16,
            color: Colors.gray200,
            fontStyle: "italic",
            lineHeight: "24px",
          }}
        >
          {quote.text}
        </p>
        {/* Author: fontSize 14, gray500, marginTop 8 */}
        {quote.author && (
          <p
            style={{
              fontSize: 14,
              color: Colors.gray500,
              marginTop: 8,
            }}
          >
            — {quote.author}
          </p>
        )}
      </div>

      {/* ===== EMERGENCY CONTACT CARD (Expo: ContactInfo.tsx) ===== */}
      {/* card: bgCard, borderRadius 16, padding 24, border 1px gray800 */}
      <div
        className="animate-fade-in-up stagger-5"
        style={{ marginBottom: 24, opacity: 0 }}
      >
        {(contactName || contactEmail || contactCount > 0) && (
          <div
            style={{
              backgroundColor: Colors.bgCard,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${Colors.gray800}`,
              marginBottom: 16,
            }}
          >
            {/* Header: icon + "EMERGENCY CONTACT" */}
            <div
              className="flex items-center"
              style={{ gap: 8, marginBottom: 8 }}
            >
              <span style={{ fontSize: 16 }}>👤</span>
              <span
                style={{
                  fontSize: 12,
                  color: Colors.gray500,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Emergency Contact
              </span>
            </div>
            {/* Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {contactName && (
                <span
                  style={{
                    fontSize: 16,
                    color: Colors.white,
                    fontWeight: 600,
                  }}
                >
                  {contactName}
                </span>
              )}
              {contactEmail && (
                <span style={{ fontSize: 14, color: Colors.gray400 }}>
                  {contactEmail}
                </span>
              )}
              {!contactName && !contactEmail && contactCount > 0 && (
                <span
                  style={{
                    fontSize: 14,
                    color: Colors.gray400,
                  }}
                >
                  {contactCount} contact{contactCount !== 1 ? "s" : ""} configured
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pet card (if petName provided) */}
        {petName && (
          <div
            style={{
              backgroundColor: Colors.bgCard,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${Colors.gray800}`,
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
                  color: Colors.gray500,
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
                color: Colors.white,
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
                backgroundColor: Colors.bgCard,
                borderRadius: 16,
                padding: 24,
                border: `1px solid ${Colors.gray800}`,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: Colors.gray400,
                  fontWeight: 500,
                }}
              >
                ⚠️ No emergency contacts set up yet.{" "}
                <span style={{ color: Colors.accentPrimary }}>Add one →</span>
              </p>
            </div>
          </Link>
        )}
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
            color: Colors.gray400,
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
            color: Colors.gray500,
          }}
        >
          Sign out
        </button>
      </div>

      <PWAInstallPrompt />

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
