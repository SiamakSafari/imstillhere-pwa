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

  const inputClass = (field: string) =>
    `w-full rounded-md p-4 text-base text-white border outline-none transition-colors
     ${errors[field]
       ? "border-danger bg-gray-900"
       : "border-gray-700 bg-gray-900 focus:border-accent-dark"
     }`;

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-10">
      <button onClick={onBack} className="mb-6 text-gray-400 text-base font-semibold hover:text-gray-300 transition-colors">
        ← Back
      </button>

      <h1 className="text-3xl font-extrabold text-white mb-2">Emergency Contact</h1>
      <p className="text-base text-gray-400 mb-8">
        Who should we notify if you miss your check-in?
      </p>

      <div className="mb-5">
        <label className="block text-base text-gray-300 font-semibold mb-2">Contact name</label>
        <input
          type="text"
          value={contactName}
          onChange={(e) => { setContactName(e.target.value); setErrors(prev => ({ ...prev, contactName: "" })); }}
          placeholder="Mom, Partner, Friend..."
          autoFocus
          className={inputClass("contactName")}
          style={{ backgroundColor: "var(--gray-900)" }}
        />
        {errors.contactName && <p className="text-danger text-sm mt-1">{errors.contactName}</p>}
      </div>

      <div className="mb-5">
        <label className="block text-base text-gray-300 font-semibold mb-2">Their email address</label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => { setContactEmail(e.target.value); setErrors(prev => ({ ...prev, contactEmail: "" })); }}
          placeholder="email@example.com"
          autoComplete="email"
          className={inputClass("contactEmail")}
          style={{ backgroundColor: "var(--gray-900)" }}
        />
        {errors.contactEmail && <p className="text-danger text-sm mt-1">{errors.contactEmail}</p>}
      </div>

      <div className="mb-5">
        <label className="block text-base text-gray-300 font-semibold mb-2">
          Their phone number <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="+1 (555) 123-4567"
          autoComplete="tel"
          className="w-full rounded-md p-4 text-base text-white border border-gray-700 outline-none transition-colors focus:border-accent-dark"
          style={{ backgroundColor: "var(--gray-900)" }}
        />
        <p className="text-gray-500 text-xs mt-1">
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
        className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-400 transition-colors"
      >
        I&apos;ll add this later in settings
      </button>
    </div>
  );
}
