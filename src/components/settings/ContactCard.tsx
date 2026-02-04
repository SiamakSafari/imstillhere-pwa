'use client';

import React, { useState } from 'react';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
  emailVerified?: boolean;
}

interface ContactCardProps {
  contact: Contact;
  index: number;
  onUpdate: (updates: Partial<Contact>) => void;
  onDelete: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: contact.name,
    email: contact.email || '',
    phone: contact.phone || '',
  });

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-light)',
    border: '1px solid var(--gray-700)',
    color: 'var(--text-primary)',
  };

  if (isEditing) {
    return (
      <div
        className="rounded-md p-4 mb-2"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}
      >
        <p className="text-sm mb-3" style={{ color: 'var(--gray-400)' }}>Editing #{index}</p>
        <input
          type="text"
          value={editData.name}
          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          placeholder="Name"
          className="w-full px-3 py-2.5 rounded-lg text-base mb-2 focus:outline-none focus:ring-2"
          style={inputStyle}
        />
        <input
          type="email"
          value={editData.email}
          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
          placeholder="Email"
          className="w-full px-3 py-2.5 rounded-lg text-base mb-2 focus:outline-none focus:ring-2"
          style={inputStyle}
        />
        <input
          type="tel"
          value={editData.phone}
          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
          placeholder="Phone"
          className="w-full px-3 py-2.5 rounded-lg text-base mb-2 focus:outline-none focus:ring-2"
          style={inputStyle}
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold"
            style={{ color: 'var(--gray-400)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-sm font-bold"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-md p-4 mb-2"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--gray-500)' }}>#{index}</span>
        <div className="flex gap-3">
          <button onClick={() => setIsEditing(true)} className="text-base" aria-label="Edit contact">✏️</button>
          <button onClick={onDelete} className="text-base" aria-label="Delete contact">🗑️</button>
        </div>
      </div>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{contact.name}</p>
      {contact.email && (
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm">📧</span>
          <span className="text-sm" style={{ color: 'var(--gray-400)' }}>
            {contact.email}{contact.emailVerified && ' ✓'}
          </span>
        </div>
      )}
      {contact.phone && (
        <div className="flex items-center gap-2">
          <span className="text-sm">📱</span>
          <span className="text-sm" style={{ color: 'var(--gray-400)' }}>{contact.phone}</span>
        </div>
      )}
    </div>
  );
};
