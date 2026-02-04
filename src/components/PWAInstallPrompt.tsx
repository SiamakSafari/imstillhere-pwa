"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }

  if (!showPrompt) return null;

  return (
    <div
      className="pwa-install-prompt fixed bottom-4 left-4 right-4 max-w-lg mx-auto rounded-lg p-4 flex items-center gap-4 animate-fade-up z-50"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--gray-800)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div className="text-3xl">📱</div>
      <div className="flex-1">
        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Add to Home Screen</p>
        <p className="text-xs" style={{ color: 'var(--gray-500)' }}>One-tap access every morning</p>
      </div>
      <button
        onClick={handleInstall}
        className="text-sm font-bold px-4 py-2 rounded-lg transition-all btn-press"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
      >
        Install
      </button>
      <button
        onClick={() => setShowPrompt(false)}
        className="transition-opacity hover:opacity-80"
        style={{ color: 'var(--gray-500)' }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
