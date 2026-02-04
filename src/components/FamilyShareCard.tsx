"use client";

import { useState } from "react";

interface FamilyShareCardProps {
  userId: string | null;
}

export default function FamilyShareCard({ userId }: FamilyShareCardProps) {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!userId || isCreating) return;
    setIsCreating(true);
    try {
      const token = `${userId}-${Date.now().toString(36)}`;
      const url = `https://imstillhere.app/family/${token}`;
      setShareLink(url);

      // Try Web Share API, fallback to clipboard
      if (navigator.share) {
        await navigator.share({ text: `Check on my status: ${url}` });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if ((err as DOMException)?.name !== "AbortError") {
        console.error("Failed to create share:", err);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleShare = async () => {
    if (!shareLink) return;
    try {
      if (navigator.share) {
        await navigator.share({ text: `Check on my status: ${shareLink}` });
      } else {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--gray-800)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">👨‍👩‍👧‍👦</span>
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--gray-500)" }}
        >
          Family Dashboard
        </span>
      </div>

      <div className="space-y-2">
        {shareLink ? (
          <button
            onClick={handleShare}
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-center transition-all btn-press"
            style={{
              backgroundColor: copied ? "rgba(74, 222, 128, 0.1)" : "var(--gray-800)",
              border: `1px solid ${copied ? "var(--accent)" : "var(--gray-700)"}`,
              color: "var(--gray-300)",
            }}
          >
            {copied ? "✓ Copied!" : "📤 Share Link"}
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-center transition-all btn-press disabled:opacity-50"
            style={{
              backgroundColor: "var(--gray-800)",
              border: "1px solid var(--gray-700)",
              color: "var(--gray-300)",
            }}
          >
            {isCreating ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              "🔗 Create Share Link"
            )}
          </button>
        )}
        <p className="text-xs text-center" style={{ color: "var(--gray-600)" }}>
          Let family check on your status
        </p>
      </div>
    </div>
  );
}
