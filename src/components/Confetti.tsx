"use client";

import { useEffect, useState } from "react";

const COLORS = ['#4ade80', '#22c55e', '#60a5fa', '#fbbf24', '#ffffff'];
const PARTICLE_COUNT = 30;

interface Particle {
  id: number;
  x: number;
  targetX: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

export default function Confetti({ trigger, streak }: { trigger: boolean; streak: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: 50,
      targetX: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.3,
      duration: 2 + Math.random() * 1,
    }));

    setParticles(newParticles);
    setShowBadge(true);

    const timer = setTimeout(() => {
      setShowBadge(false);
      setParticles([]);
    }, 4000);

    return () => clearTimeout(timer);
  }, [trigger]);

  if (!trigger || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: '40%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.size / 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--target-x': `${p.targetX - p.x}vw`,
          } as React.CSSProperties}
        />
      ))}

      {/* Badge overlay */}
      {showBadge && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="animate-badge-pop rounded-xl p-8 text-center border-2"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--accent)',
              boxShadow: '0 0 40px var(--accent-glow)',
            }}
          >
            <div className="text-5xl mb-4">💀</div>
            <div className="text-xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
              {streak} days alive 🔥
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Still not dead. Impressive.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
