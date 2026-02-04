"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Profile } from "@/lib/types";
import { getQuoteForDate } from "@/lib/quotes";
import PWAInstallPrompt from "./PWAInstallPrompt";
import Confetti from "./Confetti";

interface Props {
  profile: Profile | null;
  hasCheckedInToday: boolean;
  lastCheckinAt: string | null;
  streak: number;
  contactCount: number;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function getInitial(name: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function getWeekRange(): string {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(monday)} - ${fmt(sunday)}`;
}

export default function DashboardClient({
  profile,
  hasCheckedInToday: initialCheckedIn,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  lastCheckinAt,
  streak: initialStreak,
  contactCount,
}: Props) {
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn);
  const [streak, setStreak] = useState(initialStreak);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createClient();
  }, []);

  const name = profile?.display_name || "friend";
  const quote = useMemo(() => getQuoteForDate(new Date()), []);

  // Calculate days checked in this week (simple: streak capped at 7, or count)
  const weekDays = Math.min(streak, 7);

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
      className="min-h-dvh flex flex-col px-5 py-6 max-w-lg mx-auto"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <Confetti trigger={showConfetti} streak={streak} />

      {/* ===== TOP BAR ===== */}
      <header className="flex items-center justify-between mb-8">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold"
          style={{
            backgroundColor: "#16a34a",
            color: "#fff",
          }}
        >
          {getInitial(name)}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          <Link href="/settings" aria-label="Calendar">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--text-secondary)" }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </Link>
          <Link href="/settings" aria-label="Settings">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--text-secondary)" }}
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* No contacts warning */}
      {contactCount === 0 && (
        <Link
          href="/settings"
          className="block rounded-lg p-4 mb-6 text-sm"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--warning)",
          }}
        >
          <p className="font-semibold" style={{ color: "var(--warning)" }}>
            ⚠️ No emergency contacts
          </p>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Nobody will know if you miss a check-in. Fix that.
          </p>
        </Link>
      )}

      {/* ===== GREETING ===== */}
      <div className="text-center mb-10">
        <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
          {getGreeting()},{" "}
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>
            {name}
          </span>
        </p>
      </div>

      {/* ===== CHECK-IN BUTTON with radial glow ===== */}
      <div className="flex justify-center mb-12">
        <div className="relative" style={{ width: 300, height: 300 }}>
          {/* Radial glow behind the button */}
          {!checkedIn && (
            <div
              className="absolute checkin-radial-glow"
              style={{
                width: 340,
                height: 340,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(74, 222, 128, 0.25) 0%, rgba(74, 222, 128, 0.08) 40%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* The big circle button */}
          <button
            onClick={handleCheckIn}
            disabled={checkedIn || loading}
            className="absolute rounded-full flex flex-col items-center justify-center transition-all btn-press"
            style={{
              width: 260,
              height: 260,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background: checkedIn
                ? "linear-gradient(135deg, #1a2338 0%, #141B2D 100%)"
                : "linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)",
              border: checkedIn ? "2px solid var(--card-border)" : "none",
              cursor: checkedIn ? "default" : "pointer",
            }}
            aria-label={checkedIn ? "Already checked in" : "Check in"}
          >
            {loading ? (
              <div
                className="w-10 h-10 border-[3px] rounded-full animate-spin"
                style={{
                  borderColor: "var(--bg)",
                  borderTopColor: "transparent",
                }}
              />
            ) : checkedIn ? (
              <div className="text-center animate-fade-up">
                <span
                  className="text-5xl block mb-1"
                  style={{ color: "var(--accent)" }}
                >
                  ✅
                </span>
                <span
                  className="text-xl font-bold block"
                  style={{ color: "var(--accent)" }}
                >
                  Still alive
                </span>
                <span
                  className="text-sm block mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  See you tomorrow
                </span>
              </div>
            ) : (
              <div className="text-center">
                <span
                  className="text-3xl font-bold leading-tight block"
                  style={{ color: "#0B1120", letterSpacing: -0.5 }}
                >
                  Check In
                </span>
                <span
                  className="text-base font-medium mt-2 block"
                  style={{ color: "rgba(11, 17, 32, 0.6)" }}
                >
                  Tap to confirm
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* ===== STREAK CARD ===== */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--card-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🔥</span>
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--text-secondary)" }}
          >
            Streak
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="text-5xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            {streak}
          </span>
          <span
            className="text-lg font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            days
          </span>
        </div>
      </div>

      {/* ===== DAILY QUOTE ===== */}
      <div className="text-center mb-8 px-4">
        <span
          className="text-3xl block mb-2"
          style={{ color: "var(--accent)", opacity: 0.4 }}
        >
          ❝
        </span>
        <p
          className="text-lg italic leading-relaxed"
          style={{ color: "var(--accent)" }}
        >
          {quote.text}
        </p>
        {quote.author && (
          <p
            className="text-sm mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            — {quote.author}
          </p>
        )}
      </div>

      {/* ===== THIS WEEK CARD ===== */}
      <div
        className="rounded-xl p-5 mb-8"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--card-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📅</span>
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--text-secondary)" }}
          >
            This Week
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mb-3">
          {/* Days */}
          <div>
            <p
              className="text-3xl font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              {weekDays}
            </p>
            <p
              className="text-xs font-bold uppercase tracking-wider mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Days
            </p>
          </div>
          {/* Avg Mood */}
          <div>
            <p
              className="text-3xl font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              —
            </p>
            <p
              className="text-xs font-bold uppercase tracking-wider mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Mood
            </p>
          </div>
          {/* Streak */}
          <div>
            <p
              className="text-3xl font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              {streak}
            </p>
            <p
              className="text-xs font-bold uppercase tracking-wider mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Streak
            </p>
          </div>
        </div>

        <p
          className="text-xs text-center"
          style={{ color: "var(--gray-500)" }}
        >
          {getWeekRange()}
        </p>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between pt-2 pb-4 mt-auto">
        <Link
          href="/share"
          className="text-sm transition-opacity hover:opacity-80"
          style={{ color: "var(--gray-500)" }}
        >
          Share proof of life →
        </Link>
        <button
          onClick={async () => {
            await supabase?.auth.signOut();
            router.push("/");
            router.refresh();
          }}
          className="text-xs transition-opacity hover:opacity-80"
          style={{ color: "var(--gray-500)" }}
        >
          Sign out
        </button>
      </div>

      <PWAInstallPrompt />
    </main>
  );
}
