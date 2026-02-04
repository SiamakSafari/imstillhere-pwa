"use client";

import { useState } from "react";

interface Step2ContactProps {
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  onUpdate: (updates: {
    contactName: string;
    contactEmail: string;
    contactPhone: string | null;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Step2Contact({
  contactName: initialName,
  contactEmail: initialEmail,
  contactPhone: initialPhone,
  onUpdate,
  onNext,
  onBack,
}: Step2ContactProps) {
  const [contactName, setContactName] = useState(initialName || "");
  const [contactEmail, setContactEmail] = useState(initialEmail || "");
  const [contactPhone, setContactPhone] = useState(initialPhone || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    const trimmedName = contactName.trim();
    const trimmedEmail = contactEmail.trim();
    if (!trimmedName) newErrors.contactName = "Please enter a contact name";
    if (!trimmedEmail) {
      newErrors.contactEmail = "Please enter an email address";
    } else if (!validateEmail(trimmedEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onUpdate({
      contactName: trimmedName,
      contactEmail: trimmedEmail,
      contactPhone: contactPhone.trim() || null,
    });
    onNext();
  };

  const handleSkip = () => {
    onUpdate({ contactName: "", contactEmail: "", contactPhone: null });
    onNext();
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    backgroundColor: "var(--gray-900)",
    color: "var(--text-primary)",
    borderColor: hasError ? "var(--danger)" : "var(--gray-700)",
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-10">
      <button
        onClick={onBack}
        className="mb-6 text-base font-semibold transition-colors"
        style={{ color: "var(--gray-400)" }}
      >
        ← Back
      </button>

      <h1 className="text-3xl font-extrabold mb-2" style={{ color: "var(--text-primary)" }}>
        Emergency Contact
      </h1>
      <p className="text-base mb-8" style={{ color: "var(--gray-400)" }}>
        Who should we notify if you miss your check-in?
      </p>

      <div className="mb-5">
        <label className="block text-base font-semibold mb-2" style={{ color: "var(--gray-300)" }}>
          Contact name
        </label>
        <input
          type="text"
          value={contactName}
          onChange={(e) => { setContactName(e.target.value); setErrors(prev => ({ ...prev, contactName: "" })); }}
          placeholder="Mom, Partner, Friend..."
          autoFocus
          className="w-full rounded-md p-4 text-base border outline-none transition-colors"
          style={inputStyle(!!errors.contactName)}
        />
        {errors.contactName && (
          <p className="text-sm mt-1" style={{ color: "var(--danger)" }}>{errors.contactName}</p>
        )}
      </div>

      <div className="mb-5">
        <label className="block text-base font-semibold mb-2" style={{ color: "var(--gray-300)" }}>
          Their email address
        </label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => { setContactEmail(e.target.value); setErrors(prev => ({ ...prev, contactEmail: "" })); }}
          placeholder="email@example.com"
          autoComplete="email"
          className="w-full rounded-md p-4 text-base border outline-none transition-colors"
          style={inputStyle(!!errors.contactEmail)}
        />
        {errors.contactEmail && (
          <p className="text-sm mt-1" style={{ color: "var(--danger)" }}>{errors.contactEmail}</p>
        )}
      </div>

      <div className="mb-5">
        <label className="block text-base font-semibold mb-2" style={{ color: "var(--gray-300)" }}>
          Their phone number{" "}
          <span style={{ color: "var(--gray-500)", fontWeight: "normal" }}>(optional)</span>
        </label>
        <input
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="+1 (555) 123-4567"
          autoComplete="tel"
          className="w-full rounded-md p-4 text-base border outline-none transition-colors"
          style={inputStyle(false)}
        />
        <p className="text-xs mt-1" style={{ color: "var(--gray-500)" }}>
          For SMS alerts (can be added later in settings)
        </p>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-4 rounded-md text-base font-bold transition-all btn-press mb-4"
        style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
      >
        Continue
      </button>

      <button
        onClick={handleSkip}
        className="w-full py-3 text-sm font-semibold transition-colors"
        style={{ color: "var(--gray-500)" }}
      >
        I&apos;ll add this later in settings
      </button>
    </div>
  );
}
