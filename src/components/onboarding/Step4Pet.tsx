"use client";

import { useState } from "react";

interface Step4PetProps {
  petName: string;
  petNotes: string;
  onUpdate: (updates: { petName: string; petNotes: string }) => void;
  onComplete: () => void;
  onBack: () => void;
}

export default function Step4Pet({
  petName: initialPetName,
  petNotes: initialPetNotes,
  onUpdate,
  onComplete,
  onBack,
}: Step4PetProps) {
  const [petName, setPetName] = useState(initialPetName || "");
  const [petNotes, setPetNotes] = useState(initialPetNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    onUpdate({ petName: petName.trim(), petNotes: petNotes.trim() });
    await onComplete();
    setIsSubmitting(false);
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    onUpdate({ petName: "", petNotes: "" });
    await onComplete();
    setIsSubmitting(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-10">
      <button
        onClick={onBack}
        disabled={isSubmitting}
        className="mb-6 text-base font-semibold transition-colors disabled:opacity-50"
        style={{ color: "var(--gray-400)" }}
      >
        ← Back
      </button>

      <h1 className="text-3xl font-extrabold mb-2" style={{ color: "var(--text-primary)" }}>
        Got a Pet?
      </h1>
      <p className="text-base mb-8" style={{ color: "var(--gray-400)" }}>
        Optional: Include pet care info in alerts
      </p>

      <div className="mb-5">
        <label className="block text-base font-semibold mb-2" style={{ color: "var(--gray-300)" }}>
          Pet&apos;s name
        </label>
        <input
          type="text"
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          placeholder="Fluffy, Max, Buddy..."
          autoFocus
          className="w-full rounded-md p-4 text-base border outline-none transition-colors"
          style={{
            backgroundColor: "var(--gray-900)",
            color: "var(--text-primary)",
            borderColor: "var(--gray-700)",
          }}
        />
      </div>

      {petName.trim().length > 0 && (
        <div className="mb-5">
          <label className="block text-base font-semibold mb-2" style={{ color: "var(--gray-300)" }}>
            Care notes (optional)
          </label>
          <textarea
            value={petNotes}
            onChange={(e) => setPetNotes(e.target.value)}
            placeholder="Feeding schedule, medications, vet info..."
            rows={3}
            className="w-full rounded-md p-4 text-base border outline-none transition-colors resize-none"
            style={{
              backgroundColor: "var(--gray-900)",
              color: "var(--text-primary)",
              borderColor: "var(--gray-700)",
              minHeight: 100,
            }}
          />
        </div>
      )}

      <div className="space-y-3 mt-6">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 rounded-md text-base font-bold transition-all btn-press disabled:opacity-60"
          style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
        >
          {isSubmitting ? (
            <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            petName.trim() ? "Complete Setup" : "Skip & Complete"
          )}
        </button>
        {petName.trim().length > 0 && (
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full py-3 text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ color: "var(--gray-500)" }}
          >
            Skip this step
          </button>
        )}
      </div>
    </div>
  );
}
