"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Profile } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
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

const MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

function getNextMilestone(streak: number): number {
  return MILESTONES.find((m) => m > streak) ?? streak + 30;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Late night";
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function DashboardClient({
  profile,
  hasCheckedInToday: initialCheckedIn,
  lastCheckinAt,
  streak: initialStreak,
  contactCount,
}: Props) {
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn);
  const [streak, setStreak] = useState(initialStreak);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createClient();
  }, []);

  const name = profile?.display_name || "friend";
  const quote = useMemo(() => getQuoteForDate(new Date()), []);
  const nextMilestone = getNextMilestone(streak);
  const prevMilestone = [...MILESTONES].reverse().find((m) => m <= streak) ?? 0;
  const progress = nextMilestone > prevMilestone ? ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100 : 0;
  const earnedMilestones = MILESTONES.filter((m) => streak >= m);

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

  async function handleSignOut() {
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto" style={{ backgroundColor: 'var(--bg)' }}>
      <Confetti trigger={showConfetti} streak={streak} />

      {/* Header: Greeting + Avatar */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xl font-bold">
            {getGreeting()}, <span style={{ color: 'var(--accent)' }}>{name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold border-2 transition-colors"
            style={{
              backgroundColor: 'var(--accent-darker)',
              borderColor: 'var(--accent)',
              color: 'var(--text-primary)',
            }}
            aria-label="Settings"
          >
            {getInitials(name)}
          </Link>
        </div>
      </header>

      {/* No contacts warning */}
      {contactCount === 0 && (
        <Link
          href="/settings"
          className="block rounded-lg p-4 mb-4 text-sm"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--warning)' }}
        >
          <p className="font-semibold" style={{ color: 'var(--warning)' }}>⚠️ No emergency contacts</p>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Nobody will know if you miss a check-in. Fix that.
          </p>
        </Link>
      )}

      {/* === THE BUTTON === */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-4">
        <div className="relative mb-8" style={{ width: 240, height: 240 }}>
          {/* Pulse glow ring — only when not checked in */}
          {!checkedIn && (
            <div
              className="absolute rounded-full checkin-glow"
              style={{
                inset: 10,
                backgroundColor: 'var(--accent-glow)',
                opacity: 0.3,
              }}
            />
          )}

          {/* Progress ring track */}
          {streak > 0 && (
            <div
              className="absolute rounded-full"
              style={{
                width: 200,
                height: 200,
                margin: 'auto',
                inset: 0,
                border: '4px solid var(--gray-800)',
              }}
            />
          )}

          {/* The button itself — 180px circle */}
          <button
            onClick={handleCheckIn}
            disabled={checkedIn || loading}
            className="absolute rounded-full flex flex-col items-center justify-center transition-all btn-press"
            style={{
              width: 180,
              height: 180,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: checkedIn ? 'var(--gray-800)' : 'var(--accent)',
              border: checkedIn ? '2px solid var(--accent-dark)' : 'none',
              boxShadow: checkedIn ? 'none' : '0 0 40px var(--accent-glow)',
              cursor: checkedIn ? 'default' : 'pointer',
            }}
            aria-label={checkedIn ? "Proof of life recorded" : "Prove you're alive"}
          >
            {loading ? (
              <div
                className="w-8 h-8 border-[3px] rounded-full animate-spin"
                style={{ borderColor: 'var(--bg)', borderTopColor: 'transparent' }}
              />
            ) : checkedIn ? (
              <div className="text-center animate-fade-up">
                <span className="text-5xl font-extrabold block" style={{ color: 'var(--accent)', marginBottom: -4 }}>✓</span>
                <div className="w-8 h-2 rounded-full mx-auto mt-1" style={{ backgroundColor: 'var(--accent)' }} />
                <span className="text-sm font-bold mt-2 block" style={{ color: 'var(--accent)' }}>
                  Still alive ✅
                </span>
                {streak > 0 && (
                  <span className="text-xs font-medium block mt-0.5" style={{ color: 'var(--accent)', opacity: 0.7 }}>
                    Day {streak}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-center">
                <span className="text-[22px] font-extrabold leading-tight block" style={{ color: 'var(--bg)', letterSpacing: -0.5 }}>
                  I&apos;m still<br />alive
                </span>
                <span className="text-sm font-medium mt-1 block" style={{ color: 'rgba(10, 10, 10, 0.6)' }}>
                  Tap to prove it
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Status line */}
        {checkedIn ? (
          <div
            className="rounded-full px-4 py-2 mb-3 animate-fade-up"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.13)' }}
          >
            <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>🛡️ You&apos;re alive. Noted.</span>
          </div>
        ) : (
          <p className="text-sm mb-3" style={{ color: 'var(--gray-500)' }}>
            Tap to prove you&apos;re not dead
          </p>
        )}

        {/* Last proof of life */}
        {lastCheckinAt && (
          <p className="text-xs mb-6" style={{ color: 'var(--gray-500)' }}>
            🕐 Last proof of life: {formatDistanceToNow(new Date(lastCheckinAt), { addSuffix: true })}
          </p>
        )}
      </div>

      {/* Stats Card */}
      <div
        className="rounded-lg p-6 mb-4 cursor-pointer transition-colors"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}
        onClick={() => setShowStats(!showStats)}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🔥</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Streak</span>
          <span className="ml-auto text-base transition-transform duration-200" style={{ color: 'var(--gray-500)', transform: showStats ? 'rotate(180deg)' : 'none' }}>▾</span>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span
            className="text-5xl font-extrabold"
            style={{ color: checkedIn ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            {streak}
          </span>
          <span className="text-lg font-semibold" style={{ color: 'var(--gray-500)' }}>
            {streak === 1 ? "day alive" : "days alive"}
          </span>
        </div>

        {/* Progress bar to next milestone */}
        {streak > 0 && (
          <div className="mb-2">
            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--gray-800)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: 'var(--accent)' }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>
              {nextMilestone - streak} to next milestone
            </p>
          </div>
        )}

        {/* Earned milestone badges */}
        {earnedMilestones.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {earnedMilestones.map((m) => (
              <span
                key={m}
                className="text-xs font-bold px-2 py-0.5 rounded-sm"
                style={{ border: '1.5px solid var(--accent)', color: 'var(--accent)' }}
              >
                {m}d
              </span>
            ))}
          </div>
        )}

        {/* Expandable section */}
        {showStats && (
          <div className="mt-4 pt-4 animate-fade-up" style={{ borderTop: '1px solid var(--gray-800)' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Status</p>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{contactCount}</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--gray-500)' }}>
                  {contactCount === 1 ? "Contact" : "Contacts"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{streak > 7 ? 7 : streak}/7</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--gray-500)' }}>This week</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Daily Quote */}
      <div
        className="rounded-lg p-6 mb-4"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}
      >
        <span className="text-2xl block mb-2" style={{ color: 'var(--accent)', opacity: 0.5 }}>❝</span>
        <p className="text-base italic leading-relaxed" style={{ color: 'var(--gray-200, #e4e4e7)' }}>
          {quote.text}
        </p>
        {quote.author && (
          <p className="text-sm mt-2" style={{ color: 'var(--gray-500)' }}>— {quote.author}</p>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <Link
          href="/share"
          className="text-sm transition-opacity hover:opacity-80"
          style={{ color: 'var(--gray-500)' }}
        >
          Share proof of life →
        </Link>
        <button
          onClick={handleSignOut}
          className="text-xs transition-opacity hover:opacity-80"
          style={{ color: 'var(--gray-500)' }}
        >
          Sign out
        </button>
      </div>

      <PWAInstallPrompt />
    </main>
  );
}
