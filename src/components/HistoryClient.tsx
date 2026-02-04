"use client";

import type { CheckIn } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function HistoryClient({ checkins }: { checkins: CheckIn[] }) {
  return (
    <main className="min-h-dvh flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
      <p className="text-gray-400">History coming soon</p>
    </main>
  );
}
