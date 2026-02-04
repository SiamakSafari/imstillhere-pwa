"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import Step1Name from "@/components/onboarding/Step1Name";
import Step2Contact from "@/components/onboarding/Step2Contact";
import Step3Window from "@/components/onboarding/Step3Window";
import Step4Pet from "@/components/onboarding/Step4Pet";

interface OnboardingData {
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  checkInWindowStart: string | null;
  checkInWindowEnd: string | null;
  timezone: string;
  petName: string;
  petNotes: string;
}

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createClient();
  }, []);

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    contactName: "",
    contactEmail: "",
    contactPhone: null,
    checkInWindowStart: null,
    checkInWindowEnd: null,
    timezone: typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC",
    petName: "",
    petNotes: "",
  });

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleComplete = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: data.name,
          timezone: data.timezone,
          checkin_time: data.checkInWindowStart
            ? `${data.checkInWindowStart}:00`
            : "09:00:00",
          is_active: true,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Add emergency contact if provided
      if (data.contactName && data.contactEmail) {
        const { error: contactError } = await supabase
          .from("emergency_contacts")
          .insert({
            user_id: user.id,
            name: data.contactName,
            email: data.contactEmail,
            phone: data.contactPhone,
            is_active: true,
          });

        if (contactError) throw contactError;
      }

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Onboarding save failed:", err);
    }
  }, [supabase, data, router]);

  return (
    <main
      className="min-h-dvh flex flex-col max-w-lg mx-auto"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

      <div className="flex-1 flex flex-col">
        {step === 0 && (
          <Step1Name
            name={data.name}
            onUpdate={updateData}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <Step2Contact
            contactName={data.contactName}
            contactEmail={data.contactEmail}
            contactPhone={data.contactPhone}
            onUpdate={updateData}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <Step3Window
            checkInWindowStart={data.checkInWindowStart}
            checkInWindowEnd={data.checkInWindowEnd}
            timezone={data.timezone}
            onUpdate={updateData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step4Pet
            petName={data.petName}
            petNotes={data.petNotes}
            onUpdate={updateData}
            onComplete={handleComplete}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </main>
  );
}
