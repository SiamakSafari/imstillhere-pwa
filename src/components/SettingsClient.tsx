"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Profile, EmergencyContact } from "@/lib/types";
import {
  AccentColorPicker,
  AlertPreferences,
  CheckInWindow,
  ConfirmationStatus,
  EmergencyContacts,
  ExportData,
  LocationSettings,
  MemberBadge,
  NotificationSettings,
  PetCard,
  ProofOfLife,
  ShareLinkManager,
  SmartHomeIntegration,
  SmsCheckIn,
  ThemeToggle,
} from "./settings";
import VacationMode from "./VacationMode";
import BottomNav from "./BottomNav";

interface Props {
  profile: Profile | null;
  contacts: EmergencyContact[];
}

export default function SettingsClient({ profile, contacts: initialContacts }: Props) {
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [checkinTime, setCheckinTime] = useState(profile?.checkin_time?.slice(0, 5) ?? "09:00");
  const [gracePeriod, setGracePeriod] = useState(profile?.grace_period_minutes ?? 120);
  const [timezone, setTimezone] = useState(
    profile?.timezone ?? (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "America/Los_Angeles")
  );
  const [contacts, setContacts] = useState(initialContacts);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Extended settings state (stored client-side for now, matching Expo AppData model)
  const [theme, setTheme] = useState<string>("system");
  const [accentColor, setAccentColor] = useState<string>("green");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false);
  const [proofOfLifeEnabled, setProofOfLifeEnabled] = useState(false);
  const [smsCheckinEnabled, setSmsCheckinEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [alertPreference, setAlertPreference] = useState("email");
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [checkInWindowStart, setCheckInWindowStart] = useState<string | null>(null);
  const [checkInWindowEnd, setCheckInWindowEnd] = useState<string | null>(null);
  const [petName] = useState("");
  const [petNotes, setPetNotes] = useState("");

  const router = useRouter();
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createClient();
  }, []);

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--gray-800)',
    color: 'var(--text-primary)',
  };

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await supabase!
      .from("profiles")
      .update({
        display_name: displayName,
        checkin_time: checkinTime + ":00",
        grace_period_minutes: gracePeriod,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile?.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleAddContact(contact: { name: string; email: string; phone: string | null }) {
    const { data, error } = await supabase!
      .from("emergency_contacts")
      .insert({
        user_id: profile?.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
      })
      .select()
      .single();

    if (!error && data) {
      setContacts([...contacts, data]);
    }
  }

  async function handleUpdateContact(id: string, updates: Partial<EmergencyContact>) {
    await supabase!.from("emergency_contacts").update(updates).eq("id", id);
    setContacts(contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }

  async function handleRemoveContact(id: string) {
    if (!confirm("Remove this contact?")) return;
    await supabase!.from("emergency_contacts").delete().eq("id", id);
    setContacts(contacts.filter((c) => c.id !== id));
  }

  const GRACE_OPTIONS = [
    { value: 30, label: "30 min" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 240, label: "4 hours" },
    { value: 480, label: "8 hours" },
  ];

  return (
    <main className="min-h-dvh px-4 py-6 pb-24 max-w-lg mx-auto" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="p-2 -ml-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-primary)' }}
          aria-label="Back to dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
      </header>

      {/* Profile Settings */}
      <form onSubmit={handleSaveProfile} className="space-y-6 mb-10">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>
            Your Profile
          </h2>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2"
              style={{ ...inputStyle, '--tw-ring-color': 'var(--accent-glow)' } as React.CSSProperties}
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>
            Check-in Schedule
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Daily check-in time
              </label>
              <input
                type="time"
                value={checkinTime}
                onChange={(e) => setCheckinTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': 'var(--accent-glow)' } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Grace period
              </label>
              <p className="text-xs mb-3" style={{ color: 'var(--gray-500)' }}>
                How long after your check-in time before your people get pinged
              </p>
              <div className="flex flex-wrap gap-2">
                {GRACE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGracePeriod(opt.value)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={
                      gracePeriod === opt.value
                        ? { backgroundColor: 'var(--accent)', color: 'var(--bg)' }
                        : { backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)', color: 'var(--text-secondary)' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2"
                style={{ ...inputStyle, '--tw-ring-color': 'var(--accent-glow)' } as React.CSSProperties}
              >
                {typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function"
                  ? Intl.supportedValuesOf("timeZone").map((tz) => (
                      <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                    ))
                  : <option value={timezone}>{timezone}</option>
                }
              </select>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full font-bold py-3.5 rounded-lg transition-all btn-press disabled:opacity-50"
          style={{
            backgroundColor: saved ? 'var(--accent-dark)' : 'var(--accent)',
            color: 'var(--bg)',
            boxShadow: '0 0 20px var(--accent-glow)',
          }}
        >
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Settings"}
        </button>
      </form>

      {/* Divider */}
      <hr className="mb-8" style={{ borderColor: 'var(--gray-800)' }} />

      {/* Theme */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>
          Theme
        </h2>
        <ThemeToggle value={theme} onChange={setTheme} />
      </section>

      {/* Accent Color */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>
          Accent Color
        </h2>
        <AccentColorPicker value={accentColor} onChange={setAccentColor} />
      </section>

      {/* Sound Effects */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>
          Sound Effects
        </h2>
        <div className="flex justify-between items-center py-2">
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            🔊 Enable haptics
          </span>
          <button
            role="switch"
            aria-checked={soundEnabled}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{ backgroundColor: soundEnabled ? 'var(--accent-dark)' : 'var(--gray-700)' }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
              style={{
                backgroundColor: soundEnabled ? 'var(--accent)' : 'var(--gray-400)',
                transform: soundEnabled ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
        </div>
      </section>

      <hr className="mb-8" style={{ borderColor: 'var(--gray-800)' }} />

      {/* Check-in Window */}
      <CheckInWindow
        checkInWindowStart={checkInWindowStart}
        checkInWindowEnd={checkInWindowEnd}
        onUpdate={(updates) => {
          if ('checkInWindowStart' in updates) setCheckInWindowStart(updates.checkInWindowStart ?? null);
          if ('checkInWindowEnd' in updates) setCheckInWindowEnd(updates.checkInWindowEnd ?? null);
        }}
      />

      {/* Alert Preferences */}
      <AlertPreferences
        alertPreference={alertPreference}
        contactPhone={contactPhone}
        onUpdate={(updates) => {
          if (updates.alertPreference) setAlertPreference(updates.alertPreference);
          if (updates.contactPhone) setContactPhone(updates.contactPhone);
        }}
      />

      {/* Emergency Contacts */}
      <EmergencyContacts
        contacts={contacts}
        onAddContact={handleAddContact}
        onUpdateContact={handleUpdateContact}
        onDeleteContact={handleRemoveContact}
      />

      {/* Push Notifications */}
      <NotificationSettings
        pushEnabled={pushEnabled}
        onUpdate={(updates) => setPushEnabled(updates.pushEnabled)}
      />

      {/* Location */}
      <LocationSettings
        locationSharingEnabled={locationSharingEnabled}
        onUpdate={(updates) => setLocationSharingEnabled(updates.locationSharingEnabled)}
      />

      {/* Proof of Life */}
      <ProofOfLife
        proofOfLifeEnabled={proofOfLifeEnabled}
        contactName={contacts[0]?.name || ""}
        onUpdate={(updates) => setProofOfLifeEnabled(updates.proofOfLifeEnabled)}
      />

      {/* SMS Check-in */}
      <SmsCheckIn
        phoneNumber={phoneNumber}
        smsCheckinEnabled={smsCheckinEnabled}
        onUpdate={(updates) => {
          if ('phoneNumber' in updates && updates.phoneNumber !== undefined) setPhoneNumber(updates.phoneNumber);
          if ('smsCheckinEnabled' in updates && updates.smsCheckinEnabled !== undefined) setSmsCheckinEnabled(updates.smsCheckinEnabled);
        }}
      />

      {/* Alert Status */}
      <ConfirmationStatus />

      {/* Pet Card */}
      <PetCard
        petName={petName}
        petNotes={petNotes}
        ownerName={displayName}
        onUpdate={(updates) => setPetNotes(updates.petNotes)}
      />

      {/* Family Dashboard */}
      <ShareLinkManager userId={profile?.id} />

      {/* Smart Home Integration */}
      <SmartHomeIntegration />

      {/* Member Badge */}
      <MemberBadge
        memberSince={profile?.created_at || new Date().toISOString()}
        streak={0}
        displayName={displayName}
      />

      {/* Export Data */}
      <ExportData profileId={profile?.id} />

      <hr className="mb-8" style={{ borderColor: 'var(--gray-800)' }} />

      {/* Vacation Mode */}
      <section className="mb-8">
        <VacationMode
          vacationUntil={null}
          onSetVacation={(until) => {
            console.log("Vacation set until:", until);
          }}
          onCancelVacation={() => {
            console.log("Vacation cancelled");
          }}
        />
      </section>

      {/* Pause / Resume */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>
          Account
        </h2>
        <button
          onClick={async () => {
            if (confirm("Pause your proof of life? Your contacts won't be alerted while paused.")) {
              await supabase!
                .from("profiles")
                .update({ is_active: !profile?.is_active })
                .eq("id", profile?.id);
              router.refresh();
            }
          }}
          className="w-full text-left px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}
        >
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {profile?.is_active ? "⏸ Pause proof of life" : "▶️ Resume proof of life"}
          </span>
          <p className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>
            {profile?.is_active
              ? "Temporarily stop alerting your contacts. Nobody will know."
              : "Your proof of life is currently paused"}
          </p>
        </button>
      </section>

      {/* Reset */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>
          Danger Zone
        </h2>
        <button
          onClick={() => {
            if (confirm("Reset all settings? This cannot be undone.")) {
              // Reset logic
              router.refresh();
            }
          }}
          className="w-full font-bold py-3 rounded-lg transition-all btn-press"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
        >
          Reset App
        </button>
      </section>

      {/* Legal */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
          Legal
        </h2>
        <p className="text-sm" style={{ color: 'var(--gray-600)' }}>ImStillHere v1.0.0</p>
      </section>

      <BottomNav active="settings" />
    </main>
  );
}
