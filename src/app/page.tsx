import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex flex-col" style={{ backgroundColor: '#0a0a0a', color: 'var(--text-primary)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="ImStillHere" width={36} height={36} style={{ borderRadius: '10px' }} />
          <span className="font-semibold text-lg tracking-tight">I&apos;m Still Here</span>
        </div>
        <Link
          href="/auth"
          className="text-sm font-semibold px-5 py-2 rounded-lg transition-all hover:opacity-90"
          style={{ color: 'var(--accent)', backgroundColor: 'rgba(74, 222, 128, 0.08)' }}
        >
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-2xl mx-auto">
        <div className="animate-fade-in-up">
          {/* Logo mark */}
          <div className="mb-8 flex justify-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ boxShadow: '0 8px 40px rgba(34, 197, 94, 0.25)' }}
            >
              <Image
                src="/logo.png"
                alt="I'm Still Here"
                width={80}
                height={80}
                className="rounded-2xl"
              />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6">
            I&apos;m still{" "}
            <span style={{ color: 'var(--accent)' }}>alive.</span>
          </h1>
          <p className="text-xl leading-relaxed mb-12 max-w-md mx-auto font-light" style={{ color: 'var(--text-secondary)' }}>
            Prove it. One tap, every day.<br />
            Miss one? Your people find out.
          </p>

          <Link
            href="/auth"
            className="inline-block font-bold text-lg px-12 py-4 rounded-xl transition-all btn-press"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg)',
              boxShadow: '0 4px 30px rgba(34, 197, 94, 0.35)',
            }}
          >
            Prove it →
          </Link>

          <p className="text-sm mt-8 font-medium" style={{ color: 'var(--gray-500)' }}>
            60 seconds to set up · Free forever
          </p>
        </div>
      </section>

      {/* Viral hook */}
      <section className="px-6 py-20" style={{ borderTop: '1px solid var(--card-border)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--accent)' }}>
            You saw the trend
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight tracking-tight">
            Millions asked the question.<br />
            <span style={{ color: 'var(--accent)' }}>This is the answer.</span>
          </h2>
          <p className="max-w-md mx-auto text-base leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
            The &quot;Are You Dead?&quot; trend got millions thinking about what happens
            when you live alone. We turned the meme into a dead-simple system.
            One tap. Every day. That&apos;s it.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20" style={{ backgroundColor: 'var(--card)' }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-3" style={{ color: 'var(--accent)' }}>
            How it works
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-14 tracking-tight">
            Dead simple. Literally.
          </h2>
          <div className="grid gap-12 sm:grid-cols-3">
            {[
              { emoji: "⏰", title: "Pick your hour", desc: "Set when you want your daily \"prove you're alive\" reminder." },
              { emoji: "👆", title: "Tap the button", desc: "One big green button. Tap it. Done. Go live your life." },
              { emoji: "🚨", title: "Miss it? They know.", desc: "Skip your window and your emergency contacts get pinged. Automatically." },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl"
                  style={{ backgroundColor: 'rgba(74, 222, 128, 0.08)' }}
                >
                  {step.emoji}
                </div>
                <h3 className="font-bold text-lg mb-2.5 tracking-tight">{step.title}</h3>
                <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The screenshot moment */}
      <section className="px-6 py-20">
        <div className="max-w-sm mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-8" style={{ color: 'var(--accent)' }}>
            The daily flex
          </p>
          {/* Mock notification */}
          <div
            className="rounded-2xl p-6 mb-5 text-left card-hover"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--card-border)' }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <Image
                src="/logo.png"
                alt="I'm Still Here"
                width={20}
                height={20}
                className="rounded"
              />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>I&apos;m Still Here</span>
              <span className="text-xs ml-auto" style={{ color: 'var(--gray-500)' }}>now</span>
            </div>
            <p className="font-bold text-[15px]" style={{ color: 'var(--accent)' }}>I&apos;m still alive ✅</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Day 47 streak 🔥</p>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--gray-500)' }}>
            The notification you actually want to screenshot.
          </p>
        </div>
      </section>

      {/* Native app banner */}
      <section className="px-6 py-12" style={{ borderTop: '1px solid var(--card-border)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="inline-block rounded-2xl px-10 py-6"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--card-border)' }}
          >
            <p className="font-semibold text-[15px] mb-1.5" style={{ color: 'var(--accent)' }}>📱 Native app coming soon</p>
            <p className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>
              iOS & Android. For now, add this PWA to your home screen.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20" style={{ backgroundColor: 'var(--card)' }}>
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Still breathing?</h2>
          <p className="mb-10 font-light" style={{ color: 'var(--text-secondary)' }}>Prove it. Free. Private. No tracking.</p>
          <Link
            href="/auth"
            className="inline-block font-bold text-lg px-12 py-4 rounded-xl transition-all btn-press"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg)',
              boxShadow: '0 4px 30px rgba(34, 197, 94, 0.35)',
            }}
          >
            Prove it →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image
            src="/logo.png"
            alt="I'm Still Here"
            width={20}
            height={20}
            className="rounded opacity-50"
          />
          <span className="text-sm font-medium" style={{ color: 'var(--gray-500)' }}>
            I&apos;m Still Here
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--gray-600)' }}>
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </footer>
    </main>
  );
}
