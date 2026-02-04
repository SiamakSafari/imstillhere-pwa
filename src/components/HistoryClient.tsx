"use client";

import type { CheckIn } from "@/lib/types";
import HistoryCalendar from "./HistoryCalendar";
import BottomNav from "./BottomNav";

interface Props {
  checkins: CheckIn[];
}

export default function HistoryClient({ checkins }: Props) {
  return (
    <main
      className="min-h-dvh flex flex-col px-5 pt-5 pb-24 max-w-lg mx-auto"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <header className="mb-6 animate-fade-in-up">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Check-in History
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gray-500)" }}>
          Your daily check-in calendar
        </p>
      </header>

      <div
        className="rounded-2xl p-6 animate-fade-in-up stagger-1"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--gray-800)",
          opacity: 0,
        }}
      >
        <HistoryCalendar checkins={checkins} />
      </div>

      {/* Recent check-ins list */}
      <div className="mt-6 animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--gray-500)" }}>
          Recent Check-ins
        </h2>
        <div className="space-y-2">
          {checkins.slice(0, 10).map((checkin) => {
            const date = new Date(checkin.checked_in_at);
            return (
              <div
                key={checkin.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--gray-800)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base" style={{ color: "var(--accent)" }}>✓</span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {date.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <span className="text-xs" style={{ color: "var(--gray-500)" }}>
                  {date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            );
          })}
          {checkins.length === 0 && (
            <div
              className="text-center py-8 rounded-xl text-sm"
              style={{
                backgroundColor: "var(--card)",
                color: "var(--gray-500)",
              }}
            >
              No check-ins yet. Start your streak!
            </div>
          )}
        </div>
      </div>

      <BottomNav active="history" />
    </main>
  );
}
