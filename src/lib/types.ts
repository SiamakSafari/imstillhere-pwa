export interface Profile {
  id: string;
  display_name: string;
  checkin_time: string; // HH:MM:SS
  grace_period_minutes: number;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  checked_in_at: string;
  method: string;
}

export interface MissedAlert {
  id: string;
  user_id: string;
  alert_sent_at: string;
  contacts_notified: Array<{ name: string; email: string }>;
}

// Mood types (matching Expo app)
export type MoodValue = "great" | "good" | "okay" | "low" | "rough";

export interface CheckInEntry {
  date: string;
  mood: MoodValue | null;
  note: string | null;
}

export const MOODS: { value: MoodValue; label: string; color: string }[] = [
  { value: "great", label: "Great", color: "#7cb87c" },
  { value: "good", label: "Good", color: "#9fcdaa" },
  { value: "okay", label: "Okay", color: "#d4c36a" },
  { value: "low", label: "Low", color: "#d4a574" },
  { value: "rough", label: "Rough", color: "#c98a8a" },
];

export const MILESTONES = [7, 14, 30, 60, 100, 365];

export const MILESTONE_BADGES: Record<
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
