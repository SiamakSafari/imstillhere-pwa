'use client';

import React, { useState } from 'react';
import { ContactCard } from './ContactCard';
import type { EmergencyContact } from '@/lib/types';

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
  onAddContact: (contact: { name: string; email: string; phone: string | null }) => void;
  onUpdateContact: (id: string, updates: Partial<EmergencyContact>) => void;
  onDeleteContact: (id: string) => void;
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-light)',
    border: '1px solid var(--gray-700)',
    color: 'var(--text-primary)',
  };

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    onAddContact({
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || null,
    });
    setShowAddForm(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        👥 Emergency Contacts
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        Add emergency contacts who will be notified if you miss check-ins.
      </p>

      {contacts.map((contact, i) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          index={i + 1}
          onUpdate={(updates) => onUpdateContact(contact.id, updates)}
          onDelete={() => onDeleteContact(contact.id)}
        />
      ))}

      {contacts.length === 0 && !showAddForm && (
        <div
          className="text-sm text-center py-8 rounded-lg mb-4"
          style={{ backgroundColor: 'var(--card)', color: 'var(--gray-500)' }}
        >
          No emergency contacts yet
        </div>
      )}

      {showAddForm ? (
        <div
          className="rounded-md p-4 mt-2"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)' }}
        >
          <p className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Add New Contact
          </p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Contact name *"
            className="w-full px-3 py-2.5 rounded-lg text-base mb-2 focus:outline-none focus:ring-2"
            style={inputStyle}
          />
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email *"
            className="w-full px-3 py-2.5 rounded-lg text-base mb-2 focus:outline-none focus:ring-2"
            style={inputStyle}
          />
          <input
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-3 py-2.5 rounded-lg text-base mb-2 focus:outline-none focus:ring-2"
            style={inputStyle}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold"
              style={{ color: 'var(--gray-400)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !newEmail.trim()}
              className="px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-30"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              Add Contact
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full font-bold py-3 rounded-lg transition-all btn-press"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)', color: 'var(--accent)' }}
        >
          + Add Emergency Contact
        </button>
      )}

      <p className="text-xs mt-4" style={{ color: 'var(--gray-600)', lineHeight: '1.5' }}>
        🛡️ Contacts are only notified when you miss check-ins.
      </p>
    </div>
  );
};
