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
