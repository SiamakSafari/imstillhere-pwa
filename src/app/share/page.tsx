import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SharePage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const shareText = "I prove I'm alive every day with I'm Still Here. Miss a day? My people find out. 💀";

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-sm w-full text-center">
        {user && (
          <Link
            href="/dashboard"
            className="inline-block text-sm mb-8 transition-opacity hover:opacity-80"
            style={{ color: 'var(--gray-500)' }}
          >
            ← Back to dashboard
          </Link>
        )}

        {/* Badge card — the shareable visual */}
        <div
          className="rounded-xl p-8 mb-8 border-2"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--accent)',
            boxShadow: '0 0 40px var(--accent-glow)',
          }}
        >
          <div className="text-5xl mb-4">💀</div>
          <h2 className="text-xl font-extrabold mb-1">I&apos;m still alive ✅</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            I prove it every day. If I stop, my people find out.
          </p>
          <div
            className="inline-block rounded-full px-4 py-1.5 text-xs font-bold"
            style={{ backgroundColor: 'var(--accent-darker)', color: 'var(--accent)' }}
          >
            imstillhere.app
          </div>
        </div>

        <p className="text-sm mb-6" style={{ color: 'var(--gray-500)' }}>
          Share your proof of life
        </p>

        <div className="flex justify-center gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent("https://imstillhere.app")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 text-sm font-bold rounded-lg transition-all btn-press"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg)' }}
          >
            Post on X
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText + " https://imstillhere.app")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 text-sm font-bold rounded-lg transition-all btn-press"
            style={{ backgroundColor: '#25D366', color: '#ffffff' }}
          >
            WhatsApp
          </a>
        </div>

        {!user && (
          <div className="mt-10">
            <Link
              href="/auth"
              className="inline-block font-bold px-8 py-3 rounded-lg transition-all btn-press"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg)',
                boxShadow: '0 0 20px var(--accent-glow)',
              }}
            >
              Prove it →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
