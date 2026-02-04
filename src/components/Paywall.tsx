"use client";

import { useState } from "react";
import Image from "next/image";

const FEATURES = [
  { icon: "🔔", text: "Unlimited emergency contacts" },
  { icon: "💬", text: "SMS & email alerts" },
  { icon: "👨‍👩‍👧", text: "Family dashboard access" },
  { icon: "📊", text: "Mood trends & insights" },
  { icon: "📸", text: "Photo proof-of-life" },
  { icon: "⚡", text: "Priority support" },
];

interface PaywallProps {
  onSubscribed: () => void;
  onSkip?: () => void;
}

export default function Paywall({ onSubscribed, onSkip }: PaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthlyPrice = "$4.99";
  const annualPrice = "$39.99";
  const annualMonthly = "$3.33";

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setError(null);
    try {
      // In PWA, redirect to Stripe checkout or show a payment form
      // For now, show placeholder
      setError("Web subscriptions coming soon! Download the app for premium features.");
    } catch {
      setError("Purchase failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="min-h-dvh px-5 py-10 max-w-lg mx-auto" style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
          <Image src="/logo.png" alt="ImStillHere" width={128} height={128} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
          ImStillHere
        </h1>
        <p className="text-base mt-1" style={{ color: "var(--gray-400)" }}>
          Peace of mind for people living alone
        </p>
      </div>

      {/* Features */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--gray-800)",
        }}
      >
        {FEATURES.map((feature, index) => (
          <div key={index} className="flex items-center gap-4 py-2">
            <span className="text-xl">{feature.icon}</span>
            <span className="text-base font-medium" style={{ color: "var(--gray-200)" }}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="space-y-3 mb-8">
        {/* Annual */}
        <button
          onClick={() => setSelectedPlan("annual")}
          className="w-full text-center rounded-2xl p-6 border-2 transition-all"
          style={{
            backgroundColor:
              selectedPlan === "annual" ? "var(--accent-subtle)" : "var(--card)",
            borderColor:
              selectedPlan === "annual" ? "var(--accent)" : "var(--gray-700)",
          }}
        >
          <span
            className="inline-block text-xs font-extrabold tracking-wider px-3 py-0.5 rounded-full mb-2"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--bg)",
            }}
          >
            BEST VALUE
          </span>
          <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Annual
          </p>
          <p className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            {annualPrice}
            <span className="text-base font-normal" style={{ color: "var(--gray-400)" }}>
              /year
            </span>
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--gray-400)" }}>
            {annualMonthly}/mo · Save 33%
          </p>
        </button>

        {/* Monthly */}
        <button
          onClick={() => setSelectedPlan("monthly")}
          className="w-full text-center rounded-2xl p-6 border-2 transition-all"
          style={{
            backgroundColor:
              selectedPlan === "monthly" ? "var(--accent-subtle)" : "var(--card)",
            borderColor:
              selectedPlan === "monthly" ? "var(--accent)" : "var(--gray-700)",
          }}
        >
          <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Monthly
          </p>
          <p className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            {monthlyPrice}
            <span className="text-base font-normal" style={{ color: "var(--gray-400)" }}>
              /month
            </span>
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--gray-400)" }}>
            Cancel anytime
          </p>
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-center mb-4" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      {/* CTA */}
      <div className="space-y-3 mb-6">
        <button
          onClick={handlePurchase}
          disabled={isPurchasing}
          className="w-full py-4 rounded-xl text-base font-bold transition-all btn-press disabled:opacity-50"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--bg)",
            boxShadow: "0 0 20px var(--accent-glow)",
          }}
        >
          {isPurchasing
            ? "Processing..."
            : `Subscribe ${selectedPlan === "annual" ? "Yearly" : "Monthly"}`}
        </button>
      </div>

      {/* Skip */}
      <button
        onClick={onSkip || onSubscribed}
        className="w-full py-3 text-sm font-semibold text-center mb-4"
        style={{ color: "var(--accent)" }}
      >
        Continue without subscribing →
      </button>

      {/* Legal */}
      <p className="text-xs text-center leading-relaxed" style={{ color: "var(--gray-600)" }}>
        Payment will be processed through Stripe. Subscription automatically
        renews unless canceled at least 24 hours before the end of the current
        period.
      </p>
    </div>
  );
}
