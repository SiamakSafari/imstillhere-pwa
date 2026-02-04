"use client";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex justify-center gap-2 py-6">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-colors duration-300"
          style={{
            backgroundColor: i <= currentStep
              ? "var(--accent)"
              : "var(--gray-700)",
          }}
        />
      ))}
    </div>
  );
}
