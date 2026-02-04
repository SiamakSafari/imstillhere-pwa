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
  return `${fmt(monday)} – ${fmt(sunday)}`;
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
      className="min-h-dvh flex flex-col px-5 pt-5 pb-8 max-w-lg mx-auto"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <Confetti trigger={showConfetti} streak={streak} />

      {/* ===== TOP BAR ===== */}
      <header className="flex items-center justify-between mb-10 animate-fade-in-up">
        {/* Avatar circle */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
          style={{
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            color: "#fff",
            boxShadow: "0 2px 12px rgba(34, 197, 94, 0.3)",
          }}
        >
          {getInitial(name)}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            aria-label="Calendar"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: "var(--card)" }}
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
              style={{ color: "var(--text-secondary)" }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: "var(--card)" }}
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
          className="block rounded-xl p-4 mb-6 text-sm animate-fade-in-up"
          style={{
            backgroundColor: "rgba(251, 191, 36, 0.06)",
            border: "1px solid rgba(251, 191, 36, 0.25)",
          }}
        >
          <p className="font-semibold" style={{ color: "var(--warning)" }}>
            ⚠️ No emergency contacts
          </p>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Nobody will know if you miss a check-in.
          </p>
        </Link>
      )}

      {/* ===== GREETING ===== */}
      <div className="text-center mb-10 animate-fade-in-up stagger-1">
        <p className="text-2xl font-light tracking-tight" style={{ color: "var(--text-secondary)" }}>
          {getGreeting()},{" "}
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {name}
          </span>
        </p>
      </div>

      {/* ===== CHECK-IN BUTTON with radial glow ===== */}
      <div className="flex justify-center mb-14 animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
        <div className="relative" style={{ width: 300, height: 300 }}>
          {/* Outer radial glow — light emanating from button */}
          {!checkedIn && (
            <div
              className="absolute checkin-radial-glow"
              style={{
                width: 380,
                height: 380,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(74, 222, 128, 0.2) 0%, rgba(74, 222, 128, 0.1) 30%, rgba(74, 222, 128, 0.03) 55%, transparent 75%)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* The big circle button */}
          <button
            onClick={handleCheckIn}
            disabled={checkedIn || loading}
            className="absolute rounded-full flex flex-col items-center justify-center transition-all duration-300 btn-press"
            style={{
              width: 270,
              height: 270,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background: checkedIn
                ? "linear-gradient(145deg, #1a2338 0%, #141B2D 100%)"
                : "linear-gradient(145deg, #5eead4 0%, #4ade80 25%, #22c55e 60%, #16a34a 100%)",
              border: checkedIn ? "1.5px solid var(--card-border)" : "none",
              boxShadow: checkedIn
                ? "inset 0 1px 3px rgba(0,0,0,0.3)"
                : "0 8px 40px rgba(34, 197, 94, 0.35), 0 2px 8px rgba(0,0,0,0.2)",
              cursor: checkedIn ? "default" : "pointer",
            }}
            aria-label={checkedIn ? "Already checked in" : "Check in"}
          >
            {loading ? (
              <div
                className="w-10 h-10 border-[3px] rounded-full animate-spin"
                style={{
                  borderColor: "rgba(11, 17, 32, 0.3)",
                  borderTopColor: "var(--bg)",
                }}
              />
            ) : checkedIn ? (
              <div className="text-center animate-fade-up">
                <span className="text-6xl block mb-2">✅</span>
                <span
                  className="text-xl font-bold block"
                  style={{ color: "var(--accent)" }}
                >
                  Still alive
                </span>
                <span
                  className="text-sm block mt-1.5 font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  See you tomorrow
                </span>
              </div>
            ) : (
              <div className="text-center">
                <span
                  className="text-[28px] font-bold leading-tight block"
                  style={{ color: "#0B1120" }}
                >
                  Check In
                </span>
                <span
                  className="text-[15px] font-medium mt-2 block"
                  style={{ color: "rgba(11, 17, 32, 0.55)" }}
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
        className="rounded-2xl p-6 mb-5 card-hover animate-fade-in-up stagger-3"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--card-border)",
          opacity: 0,
        }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-xl">🔥</span>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Streak
          </span>
        </div>
        <div className="flex items-baseline gap-3">
          <span
            className="text-6xl font-extrabold tracking-tight"
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
      <div className="text-center mb-8 px-6 animate-fade-in-up stagger-4" style={{ opacity: 0 }}>
        <span
          className="text-3xl block mb-3"
          style={{ color: "var(--accent)", opacity: 0.35 }}
        >
          ❝
        </span>
        <p
          className="text-[17px] italic leading-relaxed font-light"
          style={{ color: "var(--accent)", opacity: 0.9 }}
        >
          {quote.text}
        </p>
        {quote.author && (
          <p
            className="text-sm mt-3 font-medium"
            style={{ color: "var(--text-secondary)", opacity: 0.7 }}
          >
            — {quote.author}
          </p>
        )}
      </div>

      {/* ===== THIS WEEK CARD ===== */}
      <div
        className="rounded-2xl p-6 mb-10 card-hover animate-fade-in-up stagger-5"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--card-border)",
          opacity: 0,
        }}
      >
        <div className="flex items-center gap-2.5 mb-5">
          <span className="text-xl">📅</span>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "var(--text-secondary)" }}
          >
            This Week
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <p
              className="text-4xl font-extrabold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {weekDays}
            </p>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.12em] mt-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Days
            </p>
          </div>
          <div
            style={{ borderLeft: "1px solid var(--card-border)", borderRight: "1px solid var(--card-border)" }}
          >
            <p
              className="text-4xl font-extrabold tracking-tight"
              style={{ color: "var(--text-secondary)" }}
            >
              —
            </p>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.12em] mt-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Mood
            </p>
          </div>
          <div>
            <p
              className="text-4xl font-extrabold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {streak}
            </p>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.12em] mt-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Streak
            </p>
          </div>
        </div>

        <p
          className="text-xs text-center font-medium"
          style={{ color: "var(--gray-500)" }}
        >
          {getWeekRange()}
        </p>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between pt-2 pb-4 mt-auto animate-fade-in-up stagger-6" style={{ opacity: 0 }}>
        <Link
          href="/share"
          className="text-sm font-medium transition-all hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          Share proof of life →
        </Link>
        <button
          onClick={async () => {
            await supabase?.auth.signOut();
            router.push("/");
            router.refresh();
          }}
          className="text-xs font-medium transition-all hover:opacity-80"
          style={{ color: "var(--gray-500)" }}
        >
          Sign out
        </button>
      </div>

      <PWAInstallPrompt />

      {/* Preload logo for other pages */}
      <Image src="/logo.png" alt="" width={1} height={1} className="hidden" priority />
    </main>
  );
}
