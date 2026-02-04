"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createClient();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        setMessage("Check your email for a confirmation link. Almost alive.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--card-border)',
    color: 'var(--text-primary)',
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: 'var(--bg)' }}>
      <Link href="/" className="flex items-center gap-3 mb-12">
        <Image
          src="/logo.png"
          alt="I'm Still Here"
          width={44}
          height={44}
          className="rounded-xl"
        />
        <span className="font-semibold text-lg tracking-tight">I&apos;m Still Here</span>
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2 tracking-tight">
          {isSignUp ? "Join the living" : "Still alive?"}
        </h1>
        <p className="text-center mb-8 text-sm font-light" style={{ color: 'var(--text-secondary)' }}>
          {isSignUp
            ? "Set up your daily proof of life"
            : "Prove it."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                What should we call you?
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name (or alias)"
                className="w-full px-4 py-3.5 rounded-xl text-[15px] focus:outline-none transition-all"
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3.5 rounded-xl text-[15px] focus:outline-none transition-all"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3.5 rounded-xl text-[15px] focus:outline-none transition-all"
              style={inputStyle}
            />
          </div>

          {error && (
            <div className="text-sm text-center rounded-xl p-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}
          {message && (
            <div className="text-sm text-center rounded-xl p-3" style={{ backgroundColor: 'rgba(74, 222, 128, 0.08)', color: 'var(--accent)' }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-4 rounded-xl transition-all btn-press disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg)',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
            }}
          >
            {loading ? "..." : isSignUp ? "Get started →" : "Sign in →"}
          </button>
        </form>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--gray-500)' }}>
          {isSignUp ? "Already proving it?" : "New here?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className="font-semibold transition-opacity hover:opacity-80"
            style={{ color: 'var(--accent)' }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </main>
  );
}
