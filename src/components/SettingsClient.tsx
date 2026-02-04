"use client";

import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile, EmergencyContact } from "@/lib/types";
import { useTheme } from "@/context/ThemeContext";
import {
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
} from "./settings";
import VacationMode from "./VacationMode";
import BottomNav from "./BottomNav";

// ─── Section config ──────────────────────────────────────────
interface SectionDef {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  getSubtitle: () => string;
}

// ─── Accordion Card ──────────────────────────────────────────
function AccordionCard({
  section,
  isOpen,
  onToggle,
  children,
}: {
  section: SectionDef;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: "#141414",
        border: isOpen ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isOpen ? "0 0 20px var(--accent-glow)" : "none",
      }}
    >
      {/* Header row — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        aria-expanded={isOpen}
      >
        {/* Icon badge */}
        <div
          className="shrink-0 flex items-center justify-center rounded-xl text-xl"
          style={{
            width: 44,
            height: 44,
            backgroundColor: section.iconBg,
          }}
        >
          {section.icon}
        </div>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
            {section.title}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--gray-400)" }}>
            {section.getSubtitle()}
          </p>
        </div>

        {/* Chevron */}
        <span
          className="shrink-0 text-sm transition-transform duration-300"
          style={{
            color: "var(--gray-500)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>

      {/* Expandable content */}
      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? "2000px" : "0px",
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
        }}
      >
        <div className="px-4 pb-5 pt-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Toggle Switch (reusable) ────────────────────────────────
function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className="relative w-[46px] h-[26px] rounded-full transition-colors disabled:opacity-50 shrink-0"
      style={{ backgroundColor: checked ? "var(--accent)" : "var(--gray-700)" }}
    >
      <span
        className="absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ─── Inline Theme Segmented Control ──────────────────────────
function ThemeSegmented({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "Auto" },
  ];
  return (
    <div
      className="flex rounded-lg overflow-hidden"
      style={{ backgroundColor: "var(--gray-900)", border: "1px solid var(--gray-800)" }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="flex-1 py-2 text-sm font-semibold transition-all"
          style={{
            backgroundColor: value === o.value ? "var(--accent)" : "transparent",
            color: value === o.value ? "#000" : "var(--gray-400)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Inline Accent Dots ──────────────────────────────────────
const ACCENT_COLORS = [
  { id: "green", color: "#4ade80" },
  { id: "blue", color: "#60a5fa" },
  { id: "purple", color: "#a78bfa" },
  { id: "orange", color: "#fb923c" },
  { id: "pink", color: "#f472b6" },
];

function AccentDots({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex gap-3">
      {ACCENT_COLORS.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className="relative w-9 h-9 rounded-full transition-all"
          style={{
            backgroundColor: c.color,
            boxShadow: value === c.id ? `0 0 0 3px #141414, 0 0 0 5px ${c.color}` : "none",
          }}
        >
          {value === c.id && (
            <svg
              className="absolute inset-0 m-auto"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Row helper ──────────────────────────────────────────────
function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════
interface Props {
  profile: Profile | null;
  contacts: EmergencyContact[];
}

export default function SettingsClient({ profile, contacts: initialContacts }: Props) {
  // ── existing state (preserved) ──
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [checkinTime, setCheckinTime] = useState(profile?.checkin_time?.slice(0, 5) ?? "09:00");
  const [gracePeriod, setGracePeriod] = useState(profile?.grace_period_minutes ?? 120);
  const [timezone, setTimezone] = useState(
    profile?.timezone ?? (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "America/Los_Angeles")
  );
  const [contacts, setContacts] = useState(initialContacts);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { theme, setTheme, accentColor, setAccentColor } = useTheme();

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

  // ── accordion state ──
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = useCallback(
    (id: string) => setOpenSection((prev) => (prev === id ? null : id)),
    []
  );

  const router = useRouter();
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createClient();
  }, []);

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--gray-900)",
    border: "1px solid var(--gray-800)",
    color: "var(--text-primary)",
  };

  // ── handlers (preserved) ──
  async function handleSaveProfile(e?: React.FormEvent) {
    e?.preventDefault();
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
      .insert({ user_id: profile?.id, name: contact.name, email: contact.email, phone: contact.phone })
      .select()
      .single();
    if (!error && data) setContacts([...contacts, data]);
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

  const accentLabel = accentColor.charAt(0).toUpperCase() + accentColor.slice(1);
  const themeLabel = theme === "system" ? "Auto" : theme === "dark" ? "Dark" : "Light";

  // ── section definitions ──
  const sections: SectionDef[] = [
    {
      id: "account",
      icon: "👤",
      iconBg: "#5b5fc7",
      title: "Account",
      getSubtitle: () => `${displayName || "No name"} · ${profile?.id ? "Connected" : "Not signed in"}`,
    },
    {
      id: "appearance",
      icon: "🎨",
      iconBg: "#22c55e",
      title: "Appearance",
      getSubtitle: () => `${themeLabel} · ${accentLabel} accent`,
    },
    {
      id: "notifications",
      icon: "🔔",
      iconBg: "#eab308",
      title: "Notifications",
      getSubtitle: () => `Daily at ${checkinTime} · Reminders ${pushEnabled ? "on" : "off"}`,
    },
    {
      id: "safety",
      icon: "🛡️",
      iconBg: "#ef4444",
      title: "Safety & Privacy",
      getSubtitle: () => `Vacation off · Location ${locationSharingEnabled ? "on" : "off"}`,
    },
    {
      id: "subscription",
      icon: "💎",
      iconBg: "#22c55e",
      title: "Subscription",
      getSubtitle: () => "Free plan",
    },
    {
      id: "about",
      icon: "ℹ️",
      iconBg: "#6b7280",
      title: "About",
      getSubtitle: () => "v1.0.0 · Data & support",
    },
  ];

  // ═══════════════════════════════════════════════════════════
  return (
    <main className="min-h-dvh px-4 py-6 pb-24 max-w-lg mx-auto" style={{ backgroundColor: "var(--bg)" }}>
      {/* ─── Header ─── */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
          Settings
        </h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          aria-label="Close settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      {/* ─── Accordion Sections ─── */}
      <div className="flex flex-col gap-3">
        {/* ───────── 1. Account ───────── */}
        <AccordionCard section={sections[0]} isOpen={openSection === "account"} onToggle={() => toggle("account")}>
          <form
            onSubmit={handleSaveProfile}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--gray-400)" }}>
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ ...inputStyle, "--tw-ring-color": "var(--accent-glow)" } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--gray-400)" }}>
                Daily check-in time
              </label>
              <input
                type="time"
                value={checkinTime}
                onChange={(e) => setCheckinTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ ...inputStyle, "--tw-ring-color": "var(--accent-glow)" } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--gray-400)" }}>
                Grace period
              </label>
              <div className="flex flex-wrap gap-2">
                {GRACE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGracePeriod(opt.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={
                      gracePeriod === opt.value
                        ? { backgroundColor: "var(--accent)", color: "#000" }
                        : { backgroundColor: "var(--gray-900)", border: "1px solid var(--gray-800)", color: "var(--gray-400)" }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--gray-400)" }}>
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ ...inputStyle, "--tw-ring-color": "var(--accent-glow)" } as React.CSSProperties}
              >
                {typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function"
                  ? Intl.supportedValuesOf("timeZone").map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </option>
                    ))
                  : <option value={timezone}>{timezone}</option>}
              </select>
            </div>

            {/* Pause / Resume toggle */}
            <SettingRow label={profile?.is_active ? "⏸ Pause proof of life" : "▶️ Resume proof of life"}>
              <ToggleSwitch
                checked={!!profile?.is_active}
                onChange={async () => {
                  if (confirm("Toggle your proof of life status?")) {
                    await supabase!
                      .from("profiles")
                      .update({ is_active: !profile?.is_active })
                      .eq("id", profile?.id);
                    router.refresh();
                  }
                }}
              />
            </SettingRow>

            <button
              type="submit"
              disabled={saving}
              className="w-full font-bold py-3 rounded-lg transition-all text-sm disabled:opacity-50"
              style={{
                backgroundColor: saved ? "var(--accent-dark)" : "var(--accent)",
                color: "#000",
                boxShadow: "0 0 16px var(--accent-glow)",
              }}
            >
              {saved ? "✓ Saved!" : saving ? "Saving…" : "Save Profile"}
            </button>
          </form>
        </AccordionCard>

        {/* ───────── 2. Appearance ───────── */}
        <AccordionCard section={sections[1]} isOpen={openSection === "appearance"} onToggle={() => toggle("appearance")}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--gray-400)" }}>
                Theme
              </label>
              <ThemeSegmented value={theme} onChange={(t) => setTheme(t as "system" | "dark" | "light")} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--gray-400)" }}>
                Accent color
              </label>
              <AccentDots value={accentColor} onChange={(c) => setAccentColor(c as "green" | "blue" | "purple" | "orange" | "pink")} />
            </div>

            <SettingRow label="Sound effects">
              <ToggleSwitch checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
            </SettingRow>
          </div>
        </AccordionCard>

        {/* ───────── 3. Notifications ───────── */}
        <AccordionCard section={sections[2]} isOpen={openSection === "notifications"} onToggle={() => toggle("notifications")}>
          <div className="space-y-4">
            <NotificationSettings pushEnabled={pushEnabled} onUpdate={(u) => setPushEnabled(u.pushEnabled)} />

            <CheckInWindow
              checkInWindowStart={checkInWindowStart}
              checkInWindowEnd={checkInWindowEnd}
              onUpdate={(updates) => {
                if ("checkInWindowStart" in updates) setCheckInWindowStart(updates.checkInWindowStart ?? null);
                if ("checkInWindowEnd" in updates) setCheckInWindowEnd(updates.checkInWindowEnd ?? null);
              }}
            />

            <AlertPreferences
              alertPreference={alertPreference}
              contactPhone={contactPhone}
              onUpdate={(updates) => {
                if (updates.alertPreference) setAlertPreference(updates.alertPreference);
                if (updates.contactPhone) setContactPhone(updates.contactPhone);
              }}
            />

            <SmsCheckIn
              phoneNumber={phoneNumber}
              smsCheckinEnabled={smsCheckinEnabled}
              onUpdate={(updates) => {
                if ("phoneNumber" in updates && updates.phoneNumber !== undefined) setPhoneNumber(updates.phoneNumber);
                if ("smsCheckinEnabled" in updates && updates.smsCheckinEnabled !== undefined) setSmsCheckinEnabled(updates.smsCheckinEnabled);
              }}
            />
          </div>
        </AccordionCard>

        {/* ───────── 4. Safety & Privacy ───────── */}
        <AccordionCard section={sections[3]} isOpen={openSection === "safety"} onToggle={() => toggle("safety")}>
          <div className="space-y-4">
            <VacationMode
              vacationUntil={null}
              onSetVacation={(until) => console.log("Vacation set until:", until)}
              onCancelVacation={() => console.log("Vacation cancelled")}
            />

            <LocationSettings
              locationSharingEnabled={locationSharingEnabled}
              onUpdate={(u) => setLocationSharingEnabled(u.locationSharingEnabled)}
            />

            <ProofOfLife
              proofOfLifeEnabled={proofOfLifeEnabled}
              contactName={contacts[0]?.name || ""}
              onUpdate={(u) => setProofOfLifeEnabled(u.proofOfLifeEnabled)}
            />

            <EmergencyContacts
              contacts={contacts}
              onAddContact={handleAddContact}
              onUpdateContact={handleUpdateContact}
              onDeleteContact={handleRemoveContact}
            />

            <ConfirmationStatus />

            <PetCard
              petName={petName}
              petNotes={petNotes}
              ownerName={displayName}
              onUpdate={(u) => setPetNotes(u.petNotes)}
            />

            <ShareLinkManager userId={profile?.id} />

            <SmartHomeIntegration />
          </div>
        </AccordionCard>

        {/* ───────── 5. Subscription ───────── */}
        <AccordionCard section={sections[4]} isOpen={openSection === "subscription"} onToggle={() => toggle("subscription")}>
          <div className="space-y-3">
            <MemberBadge
              memberSince={profile?.created_at || new Date().toISOString()}
              streak={0}
              displayName={displayName}
            />
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--gray-900)", border: "1px solid var(--gray-800)" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                Free Plan
              </p>
              <p className="text-xs" style={{ color: "var(--gray-400)" }}>
                You&apos;re on the free tier. Premium features coming soon.
              </p>
            </div>
          </div>
        </AccordionCard>

        {/* ───────── 6. About ───────── */}
        <AccordionCard section={sections[5]} isOpen={openSection === "about"} onToggle={() => toggle("about")}>
          <div className="space-y-4">
            <ExportData profileId={profile?.id} />

            {/* Reset */}
            <button
              onClick={() => {
                if (confirm("Reset all settings? This cannot be undone.")) {
                  router.refresh();
                }
              }}
              className="w-full font-bold py-3 rounded-lg transition-all text-sm"
              style={{
                backgroundColor: "color-mix(in srgb, var(--danger) 10%, var(--bg))",
                border: "1px solid var(--danger)",
                color: "var(--danger)",
              }}
            >
              Reset App
            </button>

            {/* Legal / version */}
            <div className="text-center pt-2">
              <p className="text-xs" style={{ color: "var(--gray-600)" }}>
                ImStillHere v1.0.0
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--gray-700)" }}>
                Made with ❤️ for peace of mind
              </p>
            </div>
          </div>
        </AccordionCard>
      </div>

      <BottomNav active="settings" />
    </main>
  );
}
