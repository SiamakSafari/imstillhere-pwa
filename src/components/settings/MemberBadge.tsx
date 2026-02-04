'use client';

import React from 'react';

interface MemberBadgeProps {
  memberSince: string;
  streak: number;
  displayName: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const MemberBadge: React.FC<MemberBadgeProps> = ({ memberSince, streak, displayName }) => {
  const memberDate = new Date(memberSince);
  const formattedDate = memberDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysSince = Math.floor((Date.now() - memberDate.getTime()) / (1000 * 60 * 60 * 24));

  const handleShare = async () => {
    const text = `I've been an ImStillHere member since ${formattedDate}! ${streak} day streak 🔥`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        🏅 Member Badge
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        Share your ImStillHere membership badge.
      </p>
      <div
        className="rounded-lg p-6 text-center mb-4 border-2"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--accent-dark)' }}
      >
        <p className="text-sm font-bold tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
          IMSTILLHERE
        </p>
        <p className="text-4xl mb-4">✅</p>
        <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Member since</p>
        <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {formattedDate}
        </p>
        {streak > 0 && (
          <p className="font-semibold mb-1" style={{ color: 'var(--warning)' }}>
            🔥 {streak} day streak
          </p>
        )}
        {daysSince > 0 && (
          <p className="text-xs" style={{ color: 'var(--gray-600)' }}>
            {daysSince} days protected
          </p>
        )}
      </div>
      <button
        onClick={handleShare}
        className="w-full font-bold py-3 rounded-lg transition-all btn-press"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)', color: 'var(--accent)' }}
      >
        Share Badge
      </button>
    </div>
  );
};
