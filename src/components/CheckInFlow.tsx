"use client";

import { useState, useEffect, useCallback } from "react";

type MoodValue = "great" | "good" | "okay" | "low" | "rough";

const MOODS: { value: MoodValue; label: string; cssVar: string }[] = [
  { value: "great", label: "Great", cssVar: "--mood-great" },
  { value: "good", label: "Good", cssVar: "--mood-good" },
  { value: "okay", label: "Okay", cssVar: "--mood-okay" },
  { value: "low", label: "Low", cssVar: "--mood-low" },
  { value: "rough", label: "Rough", cssVar: "--mood-rough" },
];

const MOOD_EMOJIS: Record<MoodValue, string> = {
  great: "😊",
  good: "🙂",
  okay: "😐",
  low: "😔",
  rough: "😞",
};

function sanitizeNote(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  return input.trim().slice(0, 500);
}

interface CheckInFlowProps {
  visible: boolean;
  onComplete: (data: { mood: MoodValue | null; note: string | null }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialMood?: MoodValue | null;
}

export default function CheckInFlow({
  visible,
  onComplete,
  onCancel,
  isSubmitting,
  initialMood = null,
}: CheckInFlowProps) {
  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(initialMood);
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"mood" | "note">("mood");

  useEffect(() => {
    if (visible) {
      setSelectedMood(initialMood);
      setNote("");
      setStep("mood");
    }
  }, [visible, initialMood]);

  const reset = useCallback(() => {
    setSelectedMood(null);
    setNote("");
    setStep("mood");
  }, []);

  const handleSubmit = () => {
    onComplete({ mood: selectedMood, note: sanitizeNote(note) });
    reset();
  };

  const handleSkip = () => {
    onComplete({ mood: null, note: null });
    reset();
  };

  const handleCancel = () => {
    onCancel();
    reset();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ backgroundColor: "var(--bg-overlay)" }}
        onClick={handleCancel}
      />

      {/* Modal sheet */}
      <div
        className="relative w-full max-w-lg rounded-t-xl p-6 pb-10 animate-fade-up"
        style={{ backgroundColor: "var(--bg-modal)" }}
      >
        {step === "mood" ? (
          <>
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <span
                  className="text-3xl font-extrabold"
                  style={{ color: "var(--bg)" }}
                >
                  ✓
                </span>
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                Checked in!
              </h2>
              <p style={{ color: "var(--gray-400)" }} className="text-base">How are you feeling today?</p>
            </div>

            {/* Mood grid */}
            <div className="flex justify-between gap-1 mb-6">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className="flex-1 flex flex-col items-center p-2 rounded-md border-2 transition-all"
                  style={{
                    borderColor: selectedMood === mood.value
                      ? `var(${mood.cssVar})`
                      : "transparent",
                    backgroundColor: selectedMood === mood.value
                      ? "var(--accent-subtle)"
                      : "transparent",
                  }}
                >
                  <span className="text-3xl mb-1">{MOOD_EMOJIS[mood.value]}</span>
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: selectedMood === mood.value
                        ? `var(${mood.cssVar})`
                        : "var(--gray-400)",
                    }}
                  >
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-3">
              <button
                onClick={handleSkip}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-md text-sm font-semibold transition-colors disabled:opacity-50" style={{ color: "var(--gray-400)" }}
              >
                Skip
              </button>
              <button
                onClick={() => setStep("note")}
                disabled={!selectedMood || isSubmitting}
                className="px-6 py-3 rounded-md text-sm font-bold transition-all btn-press disabled:opacity-40"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--bg)",
                }}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Note step header */}
            <div className="flex flex-col items-center mb-6">
              <button
                onClick={() => setStep("mood")}
                className="self-start mb-4 text-base font-semibold transition-colors" style={{ color: "var(--gray-400)" }}
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                Add a note
              </h2>
              <p style={{ color: "var(--gray-400)" }} className="text-base">Optional: capture any thoughts</p>
            </div>

            {/* Note input */}
            <div className="mb-6">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind today?"
                maxLength={500}
                rows={4}
                autoFocus
                className="w-full rounded-md p-4 text-base border border-gray-700 outline-none transition-colors resize-none"
                style={{
                  backgroundColor: "var(--gray-900)",
                  color: "var(--text-primary)",
                  minHeight: 120,
                }}
              />
              <p className="text-right text-xs mt-1" style={{ color: "var(--gray-600)" }}>
                {note.length}/500
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-3">
              <button
                onClick={() => {
                  onComplete({ mood: selectedMood, note: null });
                  reset();
                }}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-md text-sm font-semibold transition-colors disabled:opacity-50" style={{ color: "var(--gray-400)" }}
              >
                Skip note
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-md text-sm font-bold transition-all btn-press disabled:opacity-60"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--bg)",
                }}
              >
                {isSubmitting ? (
                  <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Done"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
