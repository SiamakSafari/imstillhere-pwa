"use client";

import { useState, useMemo } from "react";
import type { CheckIn } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface HistoryCalendarProps {
  checkins: CheckIn[];
}

export default function HistoryCalendar({ checkins }: HistoryCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const checkInDates = useMemo(() => {
    const dates = new Set<string>();
    (checkins || []).forEach((entry) => {
      const date = new Date(entry.checked_in_at);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      dates.add(key);
    });
    return dates;
  }, [checkins]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: Array<{
      day: number | null;
      key: string;
      hasCheckIn: boolean;
      isToday: boolean;
    }> = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, key: `empty-${i}`, hasCheckIn: false, isToday: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month}-${day}`;
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      days.push({ day, key: dateKey, hasCheckIn: checkInDates.has(dateKey), isToday });
    }

    return days;
  }, [year, month, firstDay, daysInMonth, checkInDates]);

  const monthCheckIns = calendarDays.filter((d) => d.hasCheckIn).length;

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="text-3xl px-3 py-1 transition-colors"
          style={{ color: "var(--gray-400)" }}
        >
          ‹
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {MONTHS[month]} {year}
        </button>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="text-3xl px-3 py-1 transition-colors"
          style={{ color: "var(--gray-400)" }}
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold py-1"
            style={{ color: "var(--gray-500)" }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map(({ day, key, hasCheckIn, isToday }) => (
          <div
            key={key}
            className="flex flex-col items-center justify-center h-11"
            style={{
              backgroundColor: isToday ? "var(--gray-800)" : "transparent",
              borderRadius: isToday ? 8 : 0,
            }}
          >
            {day && (
              <>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isToday ? "var(--accent)" : "var(--gray-300)",
                    fontWeight: isToday ? 700 : 500,
                  }}
                >
                  {day}
                </span>
                {hasCheckIn && (
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-0.5"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div
        className="flex justify-center gap-10 mt-6 pt-6"
        style={{ borderTop: "1px solid var(--gray-800)" }}
      >
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold" style={{ color: "var(--accent)" }}>
            {monthCheckIns}
          </span>
          <span className="text-xs font-medium" style={{ color: "var(--gray-500)" }}>
            this month
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold" style={{ color: "var(--accent)" }}>
            {checkInDates.size}
          </span>
          <span className="text-xs font-medium" style={{ color: "var(--gray-500)" }}>
            total
          </span>
        </div>
      </div>
    </div>
  );
}
