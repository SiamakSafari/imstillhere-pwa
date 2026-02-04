"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Profile, EmergencyContact } from "@/lib/types";

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
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const { data, error } = await supabase!
      .from("emergency_contacts")
      .insert({
        user_id: profile?.id,
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || null,
      })
      .select()
      .single();

    if (!error && data) {
      setContacts([...contacts, data]);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
    }
  }

  async function handleRemoveContact(id: string) {
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
    <main className="min-h-dvh px-4 py-6 max-w-lg mx-auto" style={{ backgroundColor: 'var(--bg)' }}>
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

      {/* Emergency Contacts */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
          Emergency Contacts
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--gray-500)' }}>
          These people find out if you stop proving you&apos;re alive.
        </p>

        <div className="space-y-3 mb-6">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}
            >
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{contact.name}</p>
                <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{contact.email}{contact.phone ? ` · ${contact.phone}` : ''}</p>
              </div>
              <button
                onClick={() => handleRemoveContact(contact.id)}
                className="text-sm font-semibold transition-opacity hover:opacity-80 p-2"
                style={{ color: 'var(--danger)' }}
                aria-label={`Remove ${contact.name}`}
              >
                Remove
              </button>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="text-sm text-center py-8 rounded-lg" style={{ backgroundColor: 'var(--card)', color: 'var(--gray-500)' }}>
              No emergency contacts yet
            </div>
          )}
        </div>

        <form onSubmit={handleAddContact} className="space-y-3">
          <input
            type="text"
            placeholder="Contact name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--accent-glow)' } as React.CSSProperties}
          />
          <input
            type="email"
            placeholder="Contact email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--accent-glow)' } as React.CSSProperties}
          />
          <input
            type="tel"
            placeholder="Phone number (optional)"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2"
            style={{ ...inputStyle, '--tw-ring-color': 'var(--accent-glow)' } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={!newName.trim() || !newEmail.trim()}
            className="w-full font-bold py-3 rounded-lg transition-all btn-press disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)', color: 'var(--accent)' }}
          >
            + Add Contact
          </button>
        </form>
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
    </main>
  );
}
