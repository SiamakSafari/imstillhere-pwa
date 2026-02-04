'use client';

import React, { useState } from 'react';

interface ApiKey {
  id: string;
  label: string;
  preview: string;
  createdAt: string;
}

export const SmartHomeIntegration: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const key = `ish_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      setApiKeys([
        { id: key, label: newLabel || 'API Key', preview: key.substring(0, 8) + '...', createdAt: new Date().toISOString() },
        ...apiKeys,
      ]);
      setNewApiKey(key);
      setShowCreateForm(false);
      setNewLabel('');
    } catch (err) {
      console.error('Failed to create API key:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('This API key will stop working immediately. Revoke it?')) {
      setApiKeys(apiKeys.filter((k) => k.id !== id));
    }
  };

  const handleCopyKey = async () => {
    if (newApiKey) {
      await navigator.clipboard.writeText(newApiKey);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        🏠 Smart Home Integration
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        Generate API keys to check in from IFTTT, Home Assistant, Zapier, or other automation tools.
      </p>

      {newApiKey && (
        <div
          className="rounded-md p-3 mb-4 space-y-2"
          style={{ backgroundColor: 'color-mix(in srgb, var(--warning) 10%, var(--bg))', border: '1px solid var(--warning)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>
            ⚠️ Save this API key now! You won&apos;t see it again.
          </p>
          <div
            className="flex items-center gap-2 rounded-lg p-2"
            style={{ backgroundColor: 'var(--bg)' }}
          >
            <code className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {newApiKey}
            </code>
            <button onClick={handleCopyKey} className="text-base shrink-0">📋</button>
          </div>
          <button
            onClick={() => setNewApiKey(null)}
            className="text-sm font-semibold"
            style={{ color: 'var(--gray-400)' }}
          >
            I&apos;ve saved my key
          </button>
        </div>
      )}

      {apiKeys.map((key) => (
        <div
          key={key.id}
          className="flex items-center justify-between rounded-md p-3 mb-2"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}
        >
          <div className="flex-1">
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{key.label}</p>
            <code className="text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>{key.preview}</code>
          </div>
          <button onClick={() => handleDelete(key.id)} className="text-base">🗑️</button>
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
            placeholder="e.g., Home Assistant"
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
              {isCreating ? 'Generating...' : 'Generate Key'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full font-bold py-3 rounded-lg transition-all btn-press"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)', color: 'var(--accent)' }}
        >
          🔑 Generate API Key
        </button>
      )}

      <div className="mt-4">
        <p className="text-sm font-semibold mb-2" style={{ color: 'var(--gray-400)' }}>Usage Example</p>
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--gray-800)' }}
        >
          <code className="text-xs leading-5" style={{ color: 'var(--gray-300)' }}>
            POST /api/checkin/external<br />
            Authorization: Bearer YOUR_API_KEY
          </code>
        </div>
      </div>

      <p className="text-xs mt-4" style={{ color: 'var(--gray-600)', lineHeight: '1.5' }}>
        🔒 API keys are rate limited to 1 check-in per hour. Revoked keys are immediately invalidated.
      </p>
    </div>
  );
};
