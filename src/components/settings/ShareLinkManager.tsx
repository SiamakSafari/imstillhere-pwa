'use client';

import React, { useState } from 'react';

interface ShareLink {
  id: string;
  label: string;
  token: string;
  createdAt: string;
}

interface ShareLinkManagerProps {
  userId: string | undefined;
}

export const ShareLinkManager: React.FC<ShareLinkManagerProps> = ({ userId }) => {
  const [shares, setShares] = useState<ShareLink[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const token = `${userId || 'user'}-${Date.now().toString(36)}`;
      const newShare: ShareLink = {
        id: token,
        label: newLabel || 'Family Dashboard Link',
        token,
        createdAt: new Date().toISOString(),
      };
      setShares([newShare, ...shares]);
      setShowCreateForm(false);
      setNewLabel('');
      const url = `${window.location.origin}/share?token=${token}`;
      if (navigator.share) {
        try { await navigator.share({ url }); } catch { /* cancelled */ }
      } else {
        await navigator.clipboard.writeText(url);
      }
      setCopiedId(newShare.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to create share:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async (share: ShareLink) => {
    const url = `${window.location.origin}/share?token=${share.token}`;
    if (navigator.share) {
      try { await navigator.share({ url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
    }
    setCopiedId(share.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('This share link will stop working. Revoke it?')) {
      setShares(shares.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        👨‍👩‍👧‍👦 Family Dashboard
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        Share a read-only dashboard with family so they can check on you.
      </p>

      {shares.map((share) => (
        <div
          key={share.id}
          className="flex items-center justify-between rounded-md p-3 mb-2"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}
        >
          <div className="flex-1">
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{share.label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>
              Created {new Date(share.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleCopy(share)} className="text-base">
              {copiedId === share.id ? '✓' : '📋'}
            </button>
            <button onClick={() => handleDelete(share.id)} className="text-base">🗑️</button>
          </div>
        </div>
      ))}

      {showCreateForm ? (
        <div
          className="rounded-md p-4"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}
        >
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="e.g., Mom's link"
            maxLength={50}
            className="w-full px-3 py-2.5 rounded-lg text-base mb-3 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-light)',
              border: '1px solid var(--gray-700)',
              color: 'var(--text-primary)',
            }}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowCreateForm(false); setNewLabel(''); }}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold"
              style={{ color: 'var(--gray-400)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              {isCreating ? 'Creating...' : 'Create Link'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full font-bold py-3 rounded-lg transition-all btn-press"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)', color: 'var(--accent)' }}
        >
          🔗 Create Share Link
        </button>
      )}

      <p className="text-xs mt-4" style={{ color: 'var(--gray-600)', lineHeight: '1.5' }}>
        🔒 Shared dashboards only show your name, check-in status, and streak. Mood, notes, and location are never shared.
      </p>
    </div>
  );
};
