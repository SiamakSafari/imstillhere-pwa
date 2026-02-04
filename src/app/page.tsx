import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💀</span>
          <span className="font-bold text-lg">I&apos;m Still Here</span>
        </div>
        <Link
          href="/auth"
          className="text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: 'var(--accent)' }}
        >
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-2xl mx-auto">
        <div className="animate-fade-up">
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
            I&apos;m still alive.
          </h1>
          <p className="text-xl mb-10 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Prove it. One tap, every day.<br />
            Miss one? Your people find out.
          </p>

          <Link
            href="/auth"
            className="inline-block font-bold text-lg px-10 py-4 rounded-xl transition-all btn-press"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg)',
              boxShadow: '0 0 30px var(--accent-glow)',
            }}
          >
            Prove it →
          </Link>

          <p className="text-sm mt-6" style={{ color: 'var(--gray-500)' }}>
            60 seconds to set up. Free forever.
          </p>
        </div>
      </section>

      {/* Viral hook */}
      <section className="px-6 py-16" style={{ borderTop: '1px solid var(--gray-800)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
            You saw the trend
          </p>
          <h2 className="text-3xl font-bold mb-4">
            Millions asked the question.<br />
            <span style={{ color: 'var(--accent)' }}>This is the answer.</span>
          </h2>
          <p className="max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            The &quot;Are You Dead?&quot; trend got millions thinking about what happens
            when you live alone. We turned the meme into a dead-simple system.
            One tap. Every day. That&apos;s it.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16" style={{ backgroundColor: 'var(--card)' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            Dead simple. Literally.
          </h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              { emoji: "⏰", title: "Pick your hour", desc: "Set when you want your daily \"prove you're alive\" reminder." },
              { emoji: "👆", title: "Tap the button", desc: "One big green button. Tap it. Done. Go live your life." },
              { emoji: "🚨", title: "Miss it? They know.", desc: "Skip your window and your emergency contacts get pinged. Automatically." },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-4">{step.emoji}</div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The screenshot moment */}
      <section className="px-6 py-16">
        <div className="max-w-sm mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--accent)' }}>
            The daily flex
          </p>
          {/* Mock notification */}
          <div
            className="rounded-xl p-5 mb-4 text-left"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">💀</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>I&apos;m Still Here</span>
              <span className="text-xs ml-auto" style={{ color: 'var(--gray-500)' }}>now</span>
            </div>
            <p className="font-bold" style={{ color: 'var(--accent)' }}>I&apos;m still alive ✅</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Day 47 streak 🔥</p>
          </div>
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
            The notification you actually want to screenshot.
          </p>
        </div>
      </section>

      {/* Native app banner */}
      <section className="px-6 py-10" style={{ borderTop: '1px solid var(--gray-800)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block rounded-xl px-8 py-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}>
            <p className="font-semibold mb-1" style={{ color: 'var(--accent)' }}>📱 Native app coming soon</p>
            <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
              iOS & Android. For now, add this PWA to your home screen — works perfectly.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16" style={{ backgroundColor: 'var(--card)' }}>
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Still breathing?</h2>
          <p className="mb-8" style={{ color: 'var(--gray-500)' }}>Prove it. Free. Private. No tracking.</p>
          <Link
            href="/auth"
            className="inline-block font-bold text-lg px-10 py-4 rounded-xl transition-all btn-press"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg)',
              boxShadow: '0 0 30px var(--accent-glow)',
            }}
          >
            Prove it →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm" style={{ color: 'var(--gray-500)' }}>
        <p>© {new Date().getFullYear()} I&apos;m Still Here. Made with 💀</p>
      </footer>
    </main>
  );
}
